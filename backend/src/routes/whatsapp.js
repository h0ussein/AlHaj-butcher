import express from 'express';
import { sendWhatsAppMessage } from '../utils/whatsappService.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Test WhatsApp message endpoint
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ message: 'Phone number and message are required' });
    }

    const result = await sendWhatsAppMessage(phoneNumber, message);
    
    res.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      result
    });
  } catch (error) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send WhatsApp message',
      error: error.message 
    });
  }
});

export default router;
