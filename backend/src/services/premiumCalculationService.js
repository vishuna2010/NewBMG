const RatingFactor = require('../models/RatingFactor');
const RateTable = require('../models/RateTable');
const Product = require('../models/Product');

class PremiumCalculationService {
  constructor() {
    this.calculationCache = new Map();
  }

  /**
   * Calculate premium for a quote
   * @param {Object} quoteData - Quote data including product and inputs
   * @returns {Object} Calculation result with breakdown
   */
  async calculatePremium(quoteData) {
    try {
      let { product, productId, quoteInputs, customer } = quoteData;
      // Fetch product if only productId is provided
      if (!product && productId) {
        product = await Product.findById(productId);
        if (!product) {
          throw new Error(`Product not found for ID: ${productId}`);
        }
      }
      if (!product) {
        throw new Error('Product information is required for premium calculation.');
      }
      
      // Get the active rate table for this product type
      const rateTable = await RateTable.getActiveRateTable(product.productType);
      if (!rateTable) {
        throw new Error(`No active rate table found for product type: ${product.productType}`);
      }

      // Get applicable rating factors
      const ratingFactors = await RatingFactor.find({
        applicableProducts: product.productType,
        isActive: true
      }).sort({ displayOrder: 1 });

      // Calculate base premium
      const basePremium = this.calculateBasePremium(rateTable, quoteInputs);
      
      // Apply rating factors
      const factorAdjustments = await this.applyRatingFactors(ratingFactors, quoteInputs, basePremium);
      
      // Apply discounts and surcharges
      const adjustments = this.applyAdjustments(rateTable.adjustments, quoteInputs, basePremium);
      
      // Apply geographic factors
      const geographicAdjustment = this.applyGeographicFactors(rateTable.geographicFactors, quoteInputs);
      
      // Calculate final premium
      const finalPremium = this.calculateFinalPremium(
        basePremium, 
        factorAdjustments, 
        adjustments, 
        geographicAdjustment
      );

      // Prepare calculation breakdown
      const breakdown = {
        basePremium,
        factorAdjustments,
        adjustments,
        geographicAdjustment,
        finalPremium,
        calculationDetails: {
          rateTable: rateTable.code,
          ratingFactors: ratingFactors.map(f => f.code),
          timestamp: new Date(),
        }
      };

      return {
        success: true,
        premium: finalPremium,
        breakdown,
        currency: rateTable.baseRates[0]?.currency || 'USD'
      };

    } catch (error) {
      console.error('Premium calculation error:', error);
      return {
        success: false,
        error: error.message,
        premium: 0,
        breakdown: null
      };
    }
  }

  /**
   * Calculate base premium from rate table
   */
  calculateBasePremium(rateTable, quoteInputs) {
    const coverageLevel = quoteInputs.coverageLevel || 'standard';
    const baseRate = rateTable.baseRates.find(rate => 
      rate.coverageLevel === coverageLevel
    );

    if (!baseRate) {
      throw new Error(`No base rate found for coverage level: ${coverageLevel}`);
    }

    return baseRate.baseAmount;
  }

  /**
   * Apply rating factors to the premium
   */
  async applyRatingFactors(ratingFactors, quoteInputs, basePremium) {
    const adjustments = [];

    for (const factor of ratingFactors) {
      const inputValue = quoteInputs[factor.code];
      if (inputValue === undefined || inputValue === null) {
        if (factor.required) {
          throw new Error(`Required rating factor missing: ${factor.code}`);
        }
        continue;
      }

      const factorValue = this.getFactorValue(factor, inputValue);
      if (factorValue === null) continue;

      let adjustment = 0;
      switch (factor.factorType) {
        case 'multiplier':
          adjustment = basePremium * (factorValue - 1);
          break;
        case 'additive':
          adjustment = factorValue;
          break;
        case 'percentage':
          adjustment = basePremium * (factorValue / 100);
          break;
        case 'fixed':
          adjustment = factorValue;
          break;
      }

      adjustments.push({
        factorCode: factor.code,
        factorName: factor.name,
        inputValue,
        factorValue,
        adjustment,
        type: factor.factorType
      });
    }

    return adjustments;
  }

  /**
   * Get the factor value based on input value and factor configuration
   */
  getFactorValue(factor, inputValue) {
    switch (factor.dataType) {
      case 'select':
        const option = factor.options.find(opt => opt.value === inputValue);
        return option ? option.factor : null;

      case 'number':
        // Check if input falls within any defined ranges
        if (factor.ranges && factor.ranges.length > 0) {
          const range = factor.ranges.find(r => 
            inputValue >= r.min && inputValue <= r.max
          );
          return range ? range.factor : factor.defaultValue;
        }
        return factor.defaultValue || inputValue;

      case 'boolean':
        return inputValue ? 1 : 0;

      case 'string':
        // For string inputs, try to match with options
        if (factor.options && factor.options.length > 0) {
          const option = factor.options.find(opt => 
            opt.value.toLowerCase() === inputValue.toLowerCase()
          );
          return option ? option.factor : factor.defaultValue;
        }
        return factor.defaultValue;

      default:
        return factor.defaultValue;
    }
  }

  /**
   * Apply discounts and surcharges
   */
  applyAdjustments(adjustments, quoteInputs, basePremium) {
    const appliedAdjustments = [];

    for (const adjustment of adjustments) {
      if (this.shouldApplyAdjustment(adjustment, quoteInputs)) {
        let amount = 0;
        
        if (adjustment.valueType === 'percentage') {
          amount = basePremium * (adjustment.value / 100);
          
          // Apply min/max limits
          if (adjustment.maxAmount && amount > adjustment.maxAmount) {
            amount = adjustment.maxAmount;
          }
          if (adjustment.minAmount && amount < adjustment.minAmount) {
            amount = adjustment.minAmount;
          }
        } else {
          amount = adjustment.value;
        }

        appliedAdjustments.push({
          name: adjustment.name,
          type: adjustment.type,
          value: adjustment.value,
          valueType: adjustment.valueType,
          amount,
          conditions: adjustment.conditions
        });
      }
    }

    return appliedAdjustments;
  }

  /**
   * Check if an adjustment should be applied based on conditions
   */
  shouldApplyAdjustment(adjustment, quoteInputs) {
    if (!adjustment.conditions) return true;

    // Simple condition checking - can be enhanced with more complex logic
    for (const [key, value] of Object.entries(adjustment.conditions)) {
      if (quoteInputs[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Apply geographic factors
   */
  applyGeographicFactors(geographicFactors, quoteInputs) {
    const location = quoteInputs.location || quoteInputs.state || quoteInputs.region;
    if (!location) return { factor: 1, amount: 0 };

    const geoFactor = geographicFactors.find(gf => 
      gf.region.toLowerCase() === location.toLowerCase()
    );

    if (!geoFactor) return { factor: 1, amount: 0 };

    return {
      factor: geoFactor.factor,
      amount: 0, // Will be calculated in final premium
      region: geoFactor.region,
      description: geoFactor.description
    };
  }

  /**
   * Calculate final premium
   */
  calculateFinalPremium(basePremium, factorAdjustments, adjustments, geographicAdjustment) {
    let finalPremium = basePremium;

    // Apply factor adjustments
    for (const adjustment of factorAdjustments) {
      finalPremium += adjustment.adjustment;
    }

    // Apply geographic factor
    finalPremium *= geographicAdjustment.factor;

    // Apply discounts and surcharges
    for (const adjustment of adjustments) {
      if (adjustment.type === 'discount') {
        finalPremium -= adjustment.amount;
      } else {
        finalPremium += adjustment.amount;
      }
    }

    // Ensure minimum premium
    finalPremium = Math.max(finalPremium, 0);

    return Math.round(finalPremium * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Validate quote inputs against rating factors
   */
  async validateQuoteInputs(productType, quoteInputs) {
    const ratingFactors = await RatingFactor.find({
      applicableProducts: productType,
      isActive: true
    });

    const errors = [];

    for (const factor of ratingFactors) {
      const inputValue = quoteInputs[factor.code];

      // Check required fields
      if (factor.required && (inputValue === undefined || inputValue === null || inputValue === '')) {
        errors.push(`Required field missing: ${factor.name} (${factor.code})`);
        continue;
      }

      if (inputValue !== undefined && inputValue !== null) {
        // Validate data type
        if (!this.validateDataType(factor, inputValue)) {
          errors.push(`Invalid data type for ${factor.name}: expected ${factor.dataType}`);
          continue;
        }

        // Validate ranges
        if (factor.validation) {
          const validationError = this.validateInput(factor, inputValue);
          if (validationError) {
            errors.push(validationError);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate data type
   */
  validateDataType(factor, value) {
    switch (factor.dataType) {
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'string':
        return typeof value === 'string';
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return !isNaN(Date.parse(value));
      case 'select':
        return factor.options.some(opt => opt.value === value);
      default:
        return true;
    }
  }

  /**
   * Validate input against validation rules
   */
  validateInput(factor, value) {
    if (factor.validation.min !== undefined && value < factor.validation.min) {
      return `${factor.name} must be at least ${factor.validation.min}`;
    }
    if (factor.validation.max !== undefined && value > factor.validation.max) {
      return `${factor.name} must be at most ${factor.validation.max}`;
    }
    if (factor.validation.pattern && !new RegExp(factor.validation.pattern).test(value)) {
      return `${factor.name} format is invalid`;
    }
    return null;
  }

  /**
   * Get calculation cache key
   */
  getCacheKey(quoteData) {
    return JSON.stringify({
      productType: quoteData.product.productType,
      coverageLevel: quoteData.quoteInputs.coverageLevel,
      inputs: quoteData.quoteInputs
    });
  }

  /**
   * Clear calculation cache
   */
  clearCache() {
    this.calculationCache.clear();
  }
}

module.exports = new PremiumCalculationService(); 