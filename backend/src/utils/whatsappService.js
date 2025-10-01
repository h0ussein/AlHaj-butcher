// WhatsApp service using Twilio API
import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendWhatsAppMessage = async (to, message) => {
  try {
    // Use the specific sender number +96176878301
    const senderNumber = '+96176878301';
    
    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`[WhatsApp Debug] Twilio not configured. Message from ${senderNumber} to ${to}: ${message}`);
      return { success: true, message: 'WhatsApp message logged (Twilio not configured)' };
    }

    // Format the phone number for WhatsApp
    const formattedNumber = formatLebaneseNumber(to);
    
    console.log(`[WhatsApp Debug] Sending message from ${senderNumber} to ${formattedNumber}: ${message}`);
    
    // Send WhatsApp message via Twilio
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${senderNumber}`,
      to: `whatsapp:${formattedNumber}`
    });
    
    console.log(`[WhatsApp Debug] Message sent successfully from ${senderNumber}. SID: ${result.sid}`);
    return { success: true, message: 'WhatsApp message sent successfully', sid: result.sid };
  } catch (error) {
    console.error('[WhatsApp Error]:', error);
    // Fallback to console log if Twilio fails
    console.log(`[WhatsApp Fallback] Message from +96176878301 to ${to}: ${message}`);
    return { success: false, message: 'WhatsApp message failed, logged to console', error: error.message };
  }
};

// Message templates for different order statuses
export const getOrderMessageTemplate = (status, orderData) => {
  const { customerName, orderId, totalAmountUSD, totalAmountLBP, deliveryApplied } = orderData;
  
  const templates = {
    confirmed: `🍖 *Order Confirmed!* 🍖

Hello ${customerName}! 

Your order #${orderId} has been confirmed and is being prepared.

💰 *Total Amount:*
• $${totalAmountUSD} USD
• ${totalAmountLBP.toLocaleString()} LBP${deliveryApplied ? '\n• Delivery fee included' : ''}

⏰ We'll notify you when your order is ready for pickup.

Thank you for choosing our butcher shop! 🥩

---
*From: +96176878301*`,

    ready: `✅ *Order Ready for Pickup!* ✅

Hello ${customerName}!

Your order #${orderId} is ready for pickup.

💰 *Total Amount:*
• $${totalAmountUSD} USD
• ${totalAmountLBP.toLocaleString()} LBP${deliveryApplied ? '\n• Delivery fee included' : ''}

📍 Please come to our shop to collect your order.

Thank you for your patience! 🥩

---
*From: +96176878301*`,

    out_for_delivery: `🚚 *Out for Delivery!* 🚚

Hello ${customerName}!

Your order #${orderId} is now out for delivery and on its way to you.

💰 *Total Amount:*
• $${totalAmountUSD} USD
• ${totalAmountLBP.toLocaleString()} LBP

📱 Our delivery person will contact you shortly.

Thank you for choosing our butcher shop! 🥩

---
*From: +96176878301*`,

    completed: `🎉 *Order Delivered!* 🎉

Hello ${customerName}!

Your order #${orderId} has been successfully delivered.

💰 *Total Amount:*
• $${totalAmountUSD} USD
• ${totalAmountLBP.toLocaleString()} LBP

We hope you enjoy your fresh meat! Please rate our service.

Thank you for choosing our butcher shop! 🥩

---
*From: +96176878301*`,

    rejected: `❌ *Order Rejected!* ❌

Hello ${customerName}!

Unfortunately, your order #${orderId} has been rejected.

Reason: ${orderData.rejectionReason || 'No reason provided by the admin.'}

💰 *Total Amount:*
• $${totalAmountUSD} USD
• ${totalAmountLBP.toLocaleString()} LBP${deliveryApplied ? '\n• Delivery fee included' : ''}

We apologize for any inconvenience. Please contact us for more details.

---
*From: +96176878301*`
  };

  return templates[status] || `Order #${orderId} status updated to: ${status}`;
};

// Send order status update via WhatsApp
export const sendOrderStatusUpdate = async (customerPhone, status, orderData) => {
  try {
    const message = getOrderMessageTemplate(status, orderData);
    return await sendWhatsAppMessage(customerPhone, message);
  } catch (error) {
    console.error('Error sending order status update:', error);
    throw error;
  }
};

// Format Lebanese phone number for WhatsApp
export const formatLebaneseNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle different Lebanese number formats
  if (cleaned.startsWith('961')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+961${cleaned.substring(1)}`;
  } else if (cleaned.length === 8) {
    return `+961${cleaned}`;
  }
  
  return phoneNumber; // Return as-is if format is unclear
};
