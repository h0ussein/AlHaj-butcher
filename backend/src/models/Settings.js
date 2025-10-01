import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  exchangeRateUSDToLBP: {
    type: Number,
    default: 90000, // 1 USD = 90,000 LBP (when converting USD to LBP)
    min: [1, 'Exchange rate must be positive']
  },
  exchangeRateLBPToUSD: {
    type: Number,
    default: 89000, // 89,000 LBP = 1 USD (when converting LBP to USD)
    min: [1, 'Exchange rate must be positive']
  },
  // Keep the old field for backward compatibility
  exchangeRate: {
    type: Number,
    default: 89000, // 1 USD = 89,000 LBP (legacy field)
    min: [1, 'Exchange rate must be positive']
  },
  minOrderAmountLBP: {
    type: Number,
    default: 200000, // Minimum 200,000 LBP
    min: [0, 'Minimum order amount cannot be negative']
  },
  minOrderAmountUSD: {
    type: Number,
    default: 3, // Minimum 3 USD
    min: [0, 'Minimum order amount cannot be negative']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

export default mongoose.model('Settings', settingsSchema);
