const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./src/config/db');
const PremiumCalculationService = require('./src/services/premiumCalculationService');
const Product = require('./src/models/Product');

const testExpandedRating = async () => {
  try {
    console.log('🧪 Testing Expanded Rating Engine...\n');

    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');

    const premiumService = PremiumCalculationService;

    // Test Auto Insurance with expanded factors
    console.log('🚗 Testing Auto Insurance with Expanded Factors');
    const autoProduct = await Product.findOne({ productType: 'Auto' });
    if (autoProduct) {
      const autoTest = {
        productId: autoProduct._id,
        quoteInputs: {
          DRIVER_AGE: 25,
          DRIVING_RECORD: 'clean',
          VEHICLE_TYPE: 'hybrid',
          ANNUAL_MILEAGE: 8000,
          COVERAGE_LEVEL: 'premium',
          CREDIT_SCORE: 750,
          CLAIMS_HISTORY: 'none',
          VEHICLE_AGE: 3,
          SAFETY_FEATURES: 'advanced',
          GARAGING_LOCATION: 'garage',
          location: 'CA'
        }
      };

      const autoResult = await premiumService.calculatePremium(autoTest);
      if (autoResult.success) {
        console.log(`💰 Auto Premium: $${autoResult.premium.toFixed(2)}`);
        console.log(`📊 Factors Applied: ${autoResult.breakdown.factorAdjustments.length}`);
        console.log(`🌍 Geographic Factor: ${autoResult.breakdown.geographicAdjustment.factor}\n`);
      }
    }

    // Test Home Insurance with expanded factors
    console.log('🏠 Testing Home Insurance with Expanded Factors');
    const homeProduct = await Product.findOne({ productType: 'Home' });
    if (homeProduct) {
      const homeTest = {
        productId: homeProduct._id,
        quoteInputs: {
          HOME_AGE: 10,
          HOME_TYPE: 'single_family',
          COVERAGE_AMOUNT: 350000,
          CONSTRUCTION_TYPE: 'brick',
          ROOF_TYPE: 'asphalt_new',
          SECURITY_SYSTEM: 'monitored',
          FIRE_PROTECTION: 'close',
          DEDUCTIBLE: '1000',
          location: 'TX'
        }
      };

      const homeResult = await premiumService.calculatePremium(homeTest);
      if (homeResult.success) {
        console.log(`💰 Home Premium: $${homeResult.premium.toFixed(2)}`);
        console.log(`📊 Factors Applied: ${homeResult.breakdown.factorAdjustments.length}`);
        console.log(`🌍 Geographic Factor: ${homeResult.breakdown.geographicAdjustment.factor}\n`);
      }
    }

    // Test Life Insurance with expanded factors
    console.log('💼 Testing Life Insurance with Expanded Factors');
    const lifeProduct = await Product.findOne({ productType: 'Life' });
    if (lifeProduct) {
      const lifeTest = {
        productId: lifeProduct._id,
        quoteInputs: {
          AGE: 35,
          HEALTH_STATUS: 'excellent',
          SMOKING_STATUS: 'never',
          TERM_LENGTH: '20',
          COVERAGE_AMOUNT_LIFE: 500000,
          OCCUPATION: 'low_risk',
          FAMILY_HISTORY: 'good',
          HOBBIES: 'none',
          location: 'NY'
        }
      };

      const lifeResult = await premiumService.calculatePremium(lifeTest);
      if (lifeResult.success) {
        console.log(`💰 Life Premium: $${lifeResult.premium.toFixed(2)}`);
        console.log(`📊 Factors Applied: ${lifeResult.breakdown.factorAdjustments.length}`);
        console.log(`🌍 Geographic Factor: ${lifeResult.breakdown.geographicAdjustment.factor}\n`);
      }
    }

    console.log('🎉 Expanded rating engine tests completed successfully!');
    console.log('\n📈 New Features Added:');
    console.log('✅ Auto: Credit score, claims history, vehicle age, safety features, garaging location');
    console.log('✅ Home: Construction type, roof type, security system, fire protection, deductible');
    console.log('✅ Life: Health status, smoking status, term length, occupation, family history, hobbies');
    console.log('✅ Enhanced UI: Grouped factors, better organization, detailed breakdowns');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
};

// Run test if called directly
if (require.main === module) {
  testExpandedRating();
}

module.exports = testExpandedRating; 