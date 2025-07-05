const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../../.env') });

const RatingFactor = require('../models/RatingFactor');
const RateTable = require('../models/RateTable');
const connectDB = require('./db');

const seedRatingFactors = async () => {
  try {
    // Clear existing data
    await RatingFactor.deleteMany({});
    await RateTable.deleteMany({});

    // Sample Rating Factors for Auto Insurance
    const autoRatingFactors = [
      {
        name: 'Driver Age',
        code: 'DRIVER_AGE',
        description: 'Driver age factor for auto insurance',
        factorType: 'multiplier',
        dataType: 'number',
        ranges: [
          { min: 16, max: 19, factor: 2.5, label: '16-19 years' },
          { min: 20, max: 24, factor: 2.0, label: '20-24 years' },
          { min: 25, max: 29, factor: 1.5, label: '25-29 years' },
          { min: 30, max: 39, factor: 1.2, label: '30-39 years' },
          { min: 40, max: 49, factor: 1.0, label: '40-49 years' },
          { min: 50, max: 64, factor: 0.9, label: '50-64 years' },
          { min: 65, max: 100, factor: 1.1, label: '65+ years' }
        ],
        required: true,
        applicableProducts: ['Auto'],
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Driving Record',
        code: 'DRIVING_RECORD',
        description: 'Driving record factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'clean', label: 'Clean Record (0 points)', factor: 1.0 },
          { value: 'minor', label: 'Minor Violations (1-3 points)', factor: 1.2 },
          { value: 'moderate', label: 'Moderate Violations (4-6 points)', factor: 1.5 },
          { value: 'major', label: 'Major Violations (7+ points)', factor: 2.0 }
        ],
        required: true,
        applicableProducts: ['Auto'],
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Vehicle Type',
        code: 'VEHICLE_TYPE',
        description: 'Vehicle type factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'sedan', label: 'Sedan', factor: 1.0 },
          { value: 'suv', label: 'SUV', factor: 1.1 },
          { value: 'truck', label: 'Truck', factor: 1.2 },
          { value: 'sports', label: 'Sports Car', factor: 1.4 },
          { value: 'luxury', label: 'Luxury Vehicle', factor: 1.3 },
          { value: 'hybrid', label: 'Hybrid Vehicle', factor: 0.9 },
          { value: 'electric', label: 'Electric Vehicle', factor: 0.95 }
        ],
        required: true,
        applicableProducts: ['Auto'],
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Annual Mileage',
        code: 'ANNUAL_MILEAGE',
        description: 'Annual mileage factor',
        factorType: 'multiplier',
        dataType: 'number',
        ranges: [
          { min: 0, max: 5000, factor: 0.8, label: '0-5,000 miles' },
          { min: 5001, max: 10000, factor: 1.0, label: '5,001-10,000 miles' },
          { min: 10001, max: 15000, factor: 1.1, label: '10,001-15,000 miles' },
          { min: 15001, max: 20000, factor: 1.2, label: '15,001-20,000 miles' },
          { min: 20001, max: 999999, factor: 1.4, label: '20,000+ miles' }
        ],
        required: true,
        applicableProducts: ['Auto'],
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Coverage Level',
        code: 'COVERAGE_LEVEL',
        description: 'Coverage level factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'basic', label: 'Basic Coverage', factor: 0.8 },
          { value: 'standard', label: 'Standard Coverage', factor: 1.0 },
          { value: 'premium', label: 'Premium Coverage', factor: 1.3 },
          { value: 'comprehensive', label: 'Comprehensive Coverage', factor: 1.6 }
        ],
        required: true,
        applicableProducts: ['Auto'],
        displayOrder: 5,
        isActive: true
      },
      {
        name: 'Credit Score',
        code: 'CREDIT_SCORE',
        description: 'Credit score factor for auto insurance',
        factorType: 'multiplier',
        dataType: 'number',
        ranges: [
          { min: 300, max: 579, factor: 1.3, label: 'Poor (300-579)' },
          { min: 580, max: 669, factor: 1.15, label: 'Fair (580-669)' },
          { min: 670, max: 739, factor: 1.05, label: 'Good (670-739)' },
          { min: 740, max: 799, factor: 0.95, label: 'Very Good (740-799)' },
          { min: 800, max: 850, factor: 0.85, label: 'Excellent (800-850)' }
        ],
        required: false,
        applicableProducts: ['Auto'],
        displayOrder: 6,
        isActive: true
      },
      {
        name: 'Claims History',
        code: 'CLAIMS_HISTORY',
        description: 'Previous claims history factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'none', label: 'No Claims (0 claims)', factor: 0.9 },
          { value: 'minor', label: 'Minor Claims (1-2 claims)', factor: 1.1 },
          { value: 'moderate', label: 'Moderate Claims (3-4 claims)', factor: 1.3 },
          { value: 'high', label: 'High Claims (5+ claims)', factor: 1.6 }
        ],
        required: false,
        applicableProducts: ['Auto'],
        displayOrder: 7,
        isActive: true
      },
      {
        name: 'Vehicle Age',
        code: 'VEHICLE_AGE',
        description: 'Vehicle age factor',
        factorType: 'multiplier',
        dataType: 'number',
        ranges: [
          { min: 0, max: 2, factor: 1.2, label: '0-2 years (New)' },
          { min: 3, max: 5, factor: 1.1, label: '3-5 years' },
          { min: 6, max: 10, factor: 1.0, label: '6-10 years' },
          { min: 11, max: 15, factor: 0.95, label: '11-15 years' },
          { min: 16, max: 999, factor: 0.9, label: '16+ years (Old)' }
        ],
        required: false,
        applicableProducts: ['Auto'],
        displayOrder: 8,
        isActive: true
      },
      {
        name: 'Safety Features',
        code: 'SAFETY_FEATURES',
        description: 'Vehicle safety features factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'basic', label: 'Basic Safety Features', factor: 1.0 },
          { value: 'standard', label: 'Standard Safety Package', factor: 0.95 },
          { value: 'advanced', label: 'Advanced Safety Package', factor: 0.9 },
          { value: 'premium', label: 'Premium Safety Package', factor: 0.85 }
        ],
        required: false,
        applicableProducts: ['Auto'],
        displayOrder: 9,
        isActive: true
      },
      {
        name: 'Garaging Location',
        code: 'GARAGING_LOCATION',
        description: 'Where vehicle is primarily parked',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'garage', label: 'Garage', factor: 0.9 },
          { value: 'driveway', label: 'Driveway', factor: 1.0 },
          { value: 'street', label: 'Street Parking', factor: 1.1 },
          { value: 'parking_lot', label: 'Parking Lot', factor: 1.05 }
        ],
        required: false,
        applicableProducts: ['Auto'],
        displayOrder: 10,
        isActive: true
      }
    ];

    // Sample Rating Factors for Home Insurance
    const homeRatingFactors = [
      {
        name: 'Home Age',
        code: 'HOME_AGE',
        description: 'Home age factor',
        factorType: 'multiplier',
        dataType: 'number',
        ranges: [
          { min: 0, max: 5, factor: 1.0, label: '0-5 years' },
          { min: 6, max: 15, factor: 1.1, label: '6-15 years' },
          { min: 16, max: 30, factor: 1.2, label: '16-30 years' },
          { min: 31, max: 50, factor: 1.3, label: '31-50 years' },
          { min: 51, max: 999, factor: 1.5, label: '50+ years' }
        ],
        required: true,
        applicableProducts: ['Home'],
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Home Type',
        code: 'HOME_TYPE',
        description: 'Home type factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'single_family', label: 'Single Family Home', factor: 1.0 },
          { value: 'townhouse', label: 'Townhouse', factor: 0.9 },
          { value: 'condo', label: 'Condominium', factor: 0.8 },
          { value: 'apartment', label: 'Apartment', factor: 0.7 },
          { value: 'mobile_home', label: 'Mobile Home', factor: 1.2 },
          { value: 'duplex', label: 'Duplex', factor: 0.95 }
        ],
        required: true,
        applicableProducts: ['Home'],
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Coverage Amount',
        code: 'COVERAGE_AMOUNT',
        description: 'Coverage amount factor',
        factorType: 'multiplier',
        dataType: 'number',
        ranges: [
          { min: 100000, max: 200000, factor: 0.8, label: '$100k-$200k' },
          { min: 200001, max: 400000, factor: 1.0, label: '$200k-$400k' },
          { min: 400001, max: 600000, factor: 1.2, label: '$400k-$600k' },
          { min: 600001, max: 1000000, factor: 1.4, label: '$600k-$1M' },
          { min: 1000001, max: 9999999, factor: 1.6, label: '$1M+' }
        ],
        required: true,
        applicableProducts: ['Home'],
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Construction Type',
        code: 'CONSTRUCTION_TYPE',
        description: 'Home construction material factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'frame', label: 'Wood Frame', factor: 1.0 },
          { value: 'brick', label: 'Brick', factor: 0.9 },
          { value: 'stone', label: 'Stone', factor: 0.95 },
          { value: 'stucco', label: 'Stucco', factor: 0.95 },
          { value: 'metal', label: 'Metal', factor: 1.1 },
          { value: 'concrete', label: 'Concrete', factor: 0.85 }
        ],
        required: false,
        applicableProducts: ['Home'],
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Roof Type',
        code: 'ROOF_TYPE',
        description: 'Roof material and age factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'asphalt_new', label: 'Asphalt Shingles (New)', factor: 0.9 },
          { value: 'asphalt_old', label: 'Asphalt Shingles (Old)', factor: 1.1 },
          { value: 'metal', label: 'Metal Roof', factor: 0.85 },
          { value: 'tile', label: 'Tile Roof', factor: 0.9 },
          { value: 'slate', label: 'Slate Roof', factor: 0.95 },
          { value: 'flat', label: 'Flat Roof', factor: 1.2 }
        ],
        required: false,
        applicableProducts: ['Home'],
        displayOrder: 5,
        isActive: true
      },
      {
        name: 'Security System',
        code: 'SECURITY_SYSTEM',
        description: 'Home security system factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'none', label: 'No Security System', factor: 1.0 },
          { value: 'basic', label: 'Basic Alarm System', factor: 0.95 },
          { value: 'monitored', label: 'Monitored Alarm System', factor: 0.9 },
          { value: 'smart', label: 'Smart Home Security', factor: 0.85 }
        ],
        required: false,
        applicableProducts: ['Home'],
        displayOrder: 6,
        isActive: true
      },
      {
        name: 'Fire Protection',
        code: 'FIRE_PROTECTION',
        description: 'Distance to fire station factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'close', label: 'Within 1 mile', factor: 0.9 },
          { value: 'medium', label: '1-5 miles', factor: 1.0 },
          { value: 'far', label: '5-10 miles', factor: 1.1 },
          { value: 'very_far', label: '10+ miles', factor: 1.2 }
        ],
        required: false,
        applicableProducts: ['Home'],
        displayOrder: 7,
        isActive: true
      },
      {
        name: 'Deductible',
        code: 'DEDUCTIBLE',
        description: 'Insurance deductible factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: '500', label: '$500 Deductible', factor: 1.1 },
          { value: '1000', label: '$1,000 Deductible', factor: 1.0 },
          { value: '2500', label: '$2,500 Deductible', factor: 0.9 },
          { value: '5000', label: '$5,000 Deductible', factor: 0.8 }
        ],
        required: false,
        applicableProducts: ['Home'],
        displayOrder: 8,
        isActive: true
      }
    ];

    // Sample Rating Factors for Life Insurance
    const lifeRatingFactors = [
      {
        name: 'Age',
        code: 'AGE',
        description: 'Applicant age factor for life insurance',
        factorType: 'multiplier',
        dataType: 'number',
        ranges: [
          { min: 18, max: 25, factor: 0.8, label: '18-25 years' },
          { min: 26, max: 35, factor: 0.9, label: '26-35 years' },
          { min: 36, max: 45, factor: 1.0, label: '36-45 years' },
          { min: 46, max: 55, factor: 1.3, label: '46-55 years' },
          { min: 56, max: 65, factor: 1.8, label: '56-65 years' },
          { min: 66, max: 75, factor: 2.5, label: '66-75 years' },
          { min: 76, max: 999, factor: 3.5, label: '76+ years' }
        ],
        required: true,
        applicableProducts: ['Life'],
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Health Status',
        code: 'HEALTH_STATUS',
        description: 'Overall health status factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'excellent', label: 'Excellent Health', factor: 0.8 },
          { value: 'very_good', label: 'Very Good Health', factor: 0.9 },
          { value: 'good', label: 'Good Health', factor: 1.0 },
          { value: 'fair', label: 'Fair Health', factor: 1.3 },
          { value: 'poor', label: 'Poor Health', factor: 2.0 }
        ],
        required: true,
        applicableProducts: ['Life'],
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Smoking Status',
        code: 'SMOKING_STATUS',
        description: 'Tobacco use factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'never', label: 'Never Smoked', factor: 1.0 },
          { value: 'former', label: 'Former Smoker (Quit 5+ years)', factor: 1.2 },
          { value: 'recent', label: 'Former Smoker (Quit 1-5 years)', factor: 1.4 },
          { value: 'current', label: 'Current Smoker', factor: 2.0 }
        ],
        required: true,
        applicableProducts: ['Life'],
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Term Length',
        code: 'TERM_LENGTH',
        description: 'Policy term length factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: '10', label: '10 Year Term', factor: 0.8 },
          { value: '15', label: '15 Year Term', factor: 0.9 },
          { value: '20', label: '20 Year Term', factor: 1.0 },
          { value: '25', label: '25 Year Term', factor: 1.1 },
          { value: '30', label: '30 Year Term', factor: 1.3 }
        ],
        required: true,
        applicableProducts: ['Life'],
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Coverage Amount',
        code: 'COVERAGE_AMOUNT_LIFE',
        description: 'Life insurance coverage amount factor',
        factorType: 'multiplier',
        dataType: 'number',
        ranges: [
          { min: 50000, max: 100000, factor: 1.1, label: '$50k-$100k' },
          { min: 100001, max: 250000, factor: 1.0, label: '$100k-$250k' },
          { min: 250001, max: 500000, factor: 0.95, label: '$250k-$500k' },
          { min: 500001, max: 1000000, factor: 0.9, label: '$500k-$1M' },
          { min: 1000001, max: 9999999, factor: 0.85, label: '$1M+' }
        ],
        required: true,
        applicableProducts: ['Life'],
        displayOrder: 5,
        isActive: true
      },
      {
        name: 'Occupation',
        code: 'OCCUPATION',
        description: 'Occupation risk factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'low_risk', label: 'Low Risk (Office, Professional)', factor: 1.0 },
          { value: 'medium_risk', label: 'Medium Risk (Sales, Service)', factor: 1.1 },
          { value: 'high_risk', label: 'High Risk (Construction, Mining)', factor: 1.4 },
          { value: 'very_high_risk', label: 'Very High Risk (Military, Firefighter)', factor: 1.8 }
        ],
        required: false,
        applicableProducts: ['Life'],
        displayOrder: 6,
        isActive: true
      },
      {
        name: 'Family History',
        code: 'FAMILY_HISTORY',
        description: 'Family medical history factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'excellent', label: 'Excellent Family History', factor: 0.9 },
          { value: 'good', label: 'Good Family History', factor: 1.0 },
          { value: 'fair', label: 'Fair Family History', factor: 1.1 },
          { value: 'poor', label: 'Poor Family History', factor: 1.3 }
        ],
        required: false,
        applicableProducts: ['Life'],
        displayOrder: 7,
        isActive: true
      },
      {
        name: 'Hobbies',
        code: 'HOBBIES',
        description: 'High-risk hobbies factor',
        factorType: 'multiplier',
        dataType: 'select',
        options: [
          { value: 'none', label: 'No High-Risk Hobbies', factor: 1.0 },
          { value: 'low', label: 'Low-Risk Hobbies', factor: 1.05 },
          { value: 'medium', label: 'Medium-Risk Hobbies', factor: 1.15 },
          { value: 'high', label: 'High-Risk Hobbies', factor: 1.3 }
        ],
        required: false,
        applicableProducts: ['Life'],
        displayOrder: 8,
        isActive: true
      }
    ];

    // Create rating factors
    await RatingFactor.insertMany([...autoRatingFactors, ...homeRatingFactors, ...lifeRatingFactors]);

    // Sample Rate Tables
    const rateTables = [
      {
        name: 'Auto Insurance Rate Table 2024',
        code: 'AUTO_2024',
        description: 'Standard auto insurance rates for 2024',
        productType: 'Auto',
        baseRates: [
          {
            coverageLevel: 'basic',
            baseAmount: 500,
            currency: 'USD',
            effectiveDate: new Date('2024-01-01')
          },
          {
            coverageLevel: 'standard',
            baseAmount: 800,
            currency: 'USD',
            effectiveDate: new Date('2024-01-01')
          },
          {
            coverageLevel: 'premium',
            baseAmount: 1200,
            currency: 'USD',
            effectiveDate: new Date('2024-01-01')
          },
          {
            coverageLevel: 'comprehensive',
            baseAmount: 1600,
            currency: 'USD',
            effectiveDate: new Date('2024-01-01')
          }
        ],
        rateFactors: [
          {
            factorCode: 'DRIVER_AGE',
            factorName: 'Driver Age',
            values: [
              { key: '16-19', factor: 2.5 },
              { key: '20-24', factor: 2.0 },
              { key: '25-29', factor: 1.5 },
              { key: '30-39', factor: 1.2 },
              { key: '40-49', factor: 1.0 },
              { key: '50-64', factor: 0.9 },
              { key: '65+', factor: 1.1 }
            ]
          }
        ],
        adjustments: [
          {
            name: 'Multi-Car Discount',
            type: 'discount',
            value: 10,
            valueType: 'percentage',
            conditions: { multiCar: true },
            maxAmount: 200
          },
          {
            name: 'Safe Driver Discount',
            type: 'discount',
            value: 15,
            valueType: 'percentage',
            conditions: { safeDriver: true },
            maxAmount: 300
          },
          {
            name: 'New Driver Surcharge',
            type: 'surcharge',
            value: 25,
            valueType: 'percentage',
            conditions: { newDriver: true }
          }
        ],
        geographicFactors: [
          { region: 'CA', factor: 1.3, description: 'California' },
          { region: 'NY', factor: 1.4, description: 'New York' },
          { region: 'TX', factor: 1.1, description: 'Texas' },
          { region: 'FL', factor: 1.2, description: 'Florida' },
          { region: 'IL', factor: 1.1, description: 'Illinois' }
        ],
        version: 1,
        isActive: true,
        effectiveDate: new Date('2024-01-01')
      },
      {
        name: 'Home Insurance Rate Table 2024',
        code: 'HOME_2024',
        description: 'Standard home insurance rates for 2024',
        productType: 'Home',
        baseRates: [
          {
            coverageLevel: 'basic',
            baseAmount: 800,
            currency: 'USD',
            effectiveDate: new Date('2024-01-01')
          },
          {
            coverageLevel: 'standard',
            baseAmount: 1200,
            currency: 'USD',
            effectiveDate: new Date('2024-01-01')
          },
          {
            coverageLevel: 'premium',
            baseAmount: 1800,
            currency: 'USD',
            effectiveDate: new Date('2024-01-01')
          }
        ],
        rateFactors: [
          {
            factorCode: 'HOME_AGE',
            factorName: 'Home Age',
            values: [
              { key: '0-5', factor: 1.0 },
              { key: '6-15', factor: 1.1 },
              { key: '16-30', factor: 1.2 },
              { key: '31-50', factor: 1.3 },
              { key: '50+', factor: 1.5 }
            ]
          }
        ],
        adjustments: [
          {
            name: 'Security System Discount',
            type: 'discount',
            value: 10,
            valueType: 'percentage',
            conditions: { securitySystem: true },
            maxAmount: 150
          },
          {
            name: 'Bundling Discount',
            type: 'discount',
            value: 15,
            valueType: 'percentage',
            conditions: { bundled: true },
            maxAmount: 200
          }
        ],
        geographicFactors: [
          { region: 'CA', factor: 1.4, description: 'California (High Risk)' },
          { region: 'TX', factor: 1.2, description: 'Texas (Storm Risk)' },
          { region: 'FL', factor: 1.3, description: 'Florida (Hurricane Risk)' },
          { region: 'NY', factor: 1.1, description: 'New York' },
          { region: 'IL', factor: 1.0, description: 'Illinois' }
        ],
        version: 1,
        isActive: true,
        effectiveDate: new Date('2024-01-01')
      },
      {
        name: 'Life Insurance Rate Table 2024',
        code: 'LIFE_2024',
        description: 'Standard life insurance rates for 2024',
        productType: 'Life',
        baseRates: [
          {
            coverageLevel: 'basic',
            baseAmount: 300,
            currency: 'USD',
            effectiveDate: new Date('2024-01-01')
          },
          {
            coverageLevel: 'standard',
            baseAmount: 500,
            currency: 'USD',
            effectiveDate: new Date('2024-01-01')
          },
          {
            coverageLevel: 'premium',
            baseAmount: 800,
            currency: 'USD',
            effectiveDate: new Date('2024-01-01')
          }
        ],
        rateFactors: [
          {
            factorCode: 'AGE',
            factorName: 'Age',
            values: [
              { key: '18-25', factor: 0.8 },
              { key: '26-35', factor: 0.9 },
              { key: '36-45', factor: 1.0 },
              { key: '46-55', factor: 1.3 },
              { key: '56-65', factor: 1.8 },
              { key: '66-75', factor: 2.5 },
              { key: '76+', factor: 3.5 }
            ]
          }
        ],
        adjustments: [
          {
            name: 'Non-Smoker Discount',
            type: 'discount',
            value: 20,
            valueType: 'percentage',
            conditions: { smokingStatus: 'never' },
            maxAmount: 200
          },
          {
            name: 'Excellent Health Discount',
            type: 'discount',
            value: 15,
            valueType: 'percentage',
            conditions: { healthStatus: 'excellent' },
            maxAmount: 150
          },
          {
            name: 'High-Risk Occupation Surcharge',
            type: 'surcharge',
            value: 50,
            valueType: 'percentage',
            conditions: { occupation: 'very_high_risk' }
          }
        ],
        geographicFactors: [
          { region: 'CA', factor: 1.1, description: 'California' },
          { region: 'NY', factor: 1.2, description: 'New York' },
          { region: 'TX', factor: 1.0, description: 'Texas' },
          { region: 'FL', factor: 1.05, description: 'Florida' },
          { region: 'IL', factor: 1.0, description: 'Illinois' }
        ],
        version: 1,
        isActive: true,
        effectiveDate: new Date('2024-01-01')
      }
    ];

    // Create rate tables
    await RateTable.insertMany(rateTables);

    console.log('✅ Rating factors and rate tables seeded successfully!');
    console.log(`📊 Created ${autoRatingFactors.length + homeRatingFactors.length + lifeRatingFactors.length} rating factors`);
    console.log(`📊 Created ${rateTables.length} rate tables`);

  } catch (error) {
    console.error('❌ Error seeding rating data:', error);
  }
};

// Run seeder if called directly
if (require.main === module) {
  console.log('🌱 Starting rating data seeder...');
  console.log('📡 Connecting to database...');
  
  connectDB()
    .then(() => {
      console.log('✅ Database connected successfully!');
      return seedRatingFactors();
    })
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedRatingFactors;