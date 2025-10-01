import Settings from '../models/Settings.js';

// Get current settings
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update exchange rate (Admin only)
export const updateExchangeRate = async (req, res) => {
  try {
    const { exchangeRate } = req.body;

    if (!exchangeRate || exchangeRate <= 0) {
      return res.status(400).json({ message: 'Valid exchange rate is required' });
    }

    const settings = await Settings.getSettings();
    settings.exchangeRate = exchangeRate;
    settings.lastUpdated = new Date();
    await settings.save();

    res.json({
      message: 'Exchange rate updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update exchange rate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update dual exchange rates (Admin only)
export const updateExchangeRates = async (req, res) => {
  try {
    const { exchangeRateUSDToLBP, exchangeRateLBPToUSD } = req.body;

    if (!exchangeRateUSDToLBP || exchangeRateUSDToLBP <= 0) {
      return res.status(400).json({ message: 'Valid USD to LBP exchange rate is required' });
    }

    if (!exchangeRateLBPToUSD || exchangeRateLBPToUSD <= 0) {
      return res.status(400).json({ message: 'Valid LBP to USD exchange rate is required' });
    }

    const settings = await Settings.getSettings();
    settings.exchangeRateUSDToLBP = exchangeRateUSDToLBP;
    settings.exchangeRateLBPToUSD = exchangeRateLBPToUSD;
    settings.lastUpdated = new Date();
    await settings.save();

    res.json({
      message: 'Exchange rates updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update exchange rates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update minimum order amount (Admin only)
export const updateMinOrderAmount = async (req, res) => {
  try {
    const { minOrderAmountLBP, minOrderAmountUSD } = req.body;

    const settings = await Settings.getSettings();
    
    if (minOrderAmountLBP !== undefined) {
      if (minOrderAmountLBP < 0) {
        return res.status(400).json({ message: 'Valid minimum LBP amount is required' });
      }
      settings.minOrderAmountLBP = minOrderAmountLBP;
    }
    
    if (minOrderAmountUSD !== undefined) {
      if (minOrderAmountUSD < 0) {
        return res.status(400).json({ message: 'Valid minimum USD amount is required' });
      }
      settings.minOrderAmountUSD = minOrderAmountUSD;
    }
    
    settings.lastUpdated = new Date();
    await settings.save();

    res.json({
      message: 'Minimum order amounts updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update minimum order amount error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
