const mongoose = require('mongoose');

const UnderwritingRuleSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    ruleName: {
      type: String,
      required: [true, 'Please add a rule name'],
      trim: true,
      maxlength: [150, 'Rule name can not be more than 150 characters'],
    },
    condition: {
      // For simplicity, storing as a string. Could be a JSON object for more complex evaluations.
      // Example: "age < 18", "customer.address.state === 'CA'", "vehicle.year < 2005"
      // More complex: { field: "age", operator: "lt", value: 18 }
      type: String,
      required: [true, 'Please specify the condition for the rule'],
    },
    action: {
      type: String,
      required: [true, 'Please specify the action for the rule'],
      enum: ['REJECT', 'FLAG_FOR_REVIEW', 'AUTO_APPROVE', 'REFER_TO_UNDERWRITER'],
      default: 'FLAG_FOR_REVIEW',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description can not be more than 500 characters'],
    },
    priority: {
      type: Number,
      default: 100, // Lower numbers could mean higher priority
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      // required: true, // Depends on if anonymous rule creation is allowed
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexing for performance, especially when querying rules by product
UnderwritingRuleSchema.index({ productId: 1, isActive: 1 });
UnderwritingRuleSchema.index({ priority: 1 });


// TODO: Add any pre-save hooks, virtuals, or methods if needed later.
// For example, a method to evaluate the rule against a given data object.
/*
UnderwritingRuleSchema.methods.evaluate = function(dataContext) {
  // This is a placeholder for a more sophisticated evaluation engine.
  // For string conditions, this could become very complex and potentially unsafe if using eval().
  // A structured condition object would be safer and easier to parse.
  // Example for structured condition:
  // if (this.condition.operator === 'lt') {
  //   return dataContext[this.condition.field] < this.condition.value;
  // }
  // ...
  console.warn(`Evaluation for rule '${this.ruleName}' needs to be implemented.`);
  return false;
};
*/

module.exports = mongoose.model('UnderwritingRule', UnderwritingRuleSchema);
