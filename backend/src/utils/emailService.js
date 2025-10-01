import nodemailer from 'nodemailer';

// Helper: minimal, safe env logging (never prints the actual password)
const logEmailEnv = (context) => {
  try {
    const emailUser = process.env.EMAIL_USER || 'undefined';
    const passLen = process.env.EMAIL_PASS ? String(process.env.EMAIL_PASS).length : 0;
    const clientUrl = process.env.CLIENT_URL || 'undefined';
    console.log(`[EmailDebug:${context}]`, {
      emailUser,
      hasPassword: !!process.env.EMAIL_PASS,
      passwordLength: passLen,
      clientUrl
    });
  } catch (err) {
    console.log('[EmailDebug] Failed to read env for context:', context, err?.message);
  }
};

// Create transporter (configure with your email service)
const createTransporter = () => {
  const useSecure = true; // port 465
  const config = {
    service: 'gmail',
    port: useSecure ? 465 : 587,
    secure: useSecure,
    pool: true,
    auth: {
      user: process.env.EMAIL_USER || 'houssein.ibrahim.3@gmail.com',
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    logger: true,
    debug: true
  };
  
  console.log('Email config:', {
    user: config.auth.user,
    hasPassword: !!config.auth.pass,
    service: config.service
  });
  
  const transporter = nodemailer.createTransport(config);
  return transporter;
};

// Send verification email
export const sendVerificationEmail = async (email, token) => {
  try {
    logEmailEnv('sendVerificationEmail:before-check');
    // For development, allow sending without EMAIL_PASS (will use console log)
    if (!process.env.EMAIL_PASS) {
      console.log('EMAIL_PASS not set. Logging verification link instead of sending email.');
      console.log(`Verification URL for ${email}: ${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`);
      return { success: true, messageId: 'console-log' };
    }

    const transporter = createTransporter();
    
    // Test connection first
    try {
      await transporter.verify();
      console.log('[EmailDebug] transporter.verify() OK');
    } catch (verifyErr) {
      console.error('[EmailDebug] transporter.verify() FAILED:', verifyErr?.message);
      throw verifyErr;
    }
    
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;

    const mailOptions = {
      from: `"Butcher Shop" <${process.env.EMAIL_USER || 'houssein.ibrahim.3@gmail.com'}>`,
      to: email,
      subject: 'Verify Your Email - Butcher Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Welcome to Our Butcher Shop!</h2>
          <p style="font-size: 16px; line-height: 1.5;">Thank you for registering. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email</a>
          </div>
          <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #888; word-break: break-all;">${verificationUrl}</p>
          <p style="font-size: 14px; color: #666;">This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; text-align: center;">This email was sent from houssein.ibrahim.3@gmail.com</p>
        </div>
      `
    };

    let result;
    try {
      result = await transporter.sendMail(mailOptions);
      console.log('[EmailDebug] sendMail OK:', { messageId: result?.messageId, response: result?.response });
    } catch (sendErr) {
      console.error('[EmailDebug] sendMail FAILED:', sendErr?.message);
      throw sendErr;
    }
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Resend verification email
export const resendVerificationEmail = async (email, token) => {
  try {
    logEmailEnv('resendVerificationEmail:before-check');
    // For development, allow sending without EMAIL_PASS (will use console log)
    if (!process.env.EMAIL_PASS) {
      console.log('EMAIL_PASS not set. Logging verification link instead of sending email.');
      console.log(`Verification URL for ${email}: ${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`);
      return { success: true, messageId: 'console-log' };
    }

    const transporter = createTransporter();
    try {
      await transporter.verify();
      console.log('[EmailDebug] transporter.verify() OK (resend)');
    } catch (verifyErr) {
      console.error('[EmailDebug] transporter.verify() FAILED (resend):', verifyErr?.message);
      throw verifyErr;
    }
    
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;

    const mailOptions = {
      from: `"Butcher Shop" <${process.env.EMAIL_USER || 'houssein.ibrahim.3@gmail.com'}>`,
      to: email,
      subject: 'Resend: Verify Your Email - Butcher Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Email Verification - Butcher Shop</h2>
          <p style="font-size: 16px; line-height: 1.5;">You requested to resend the verification email. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email</a>
          </div>
          <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #888; word-break: break-all;">${verificationUrl}</p>
          <p style="font-size: 14px; color: #666;">This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; text-align: center;">This email was sent from houssein.ibrahim.3@gmail.com</p>
        </div>
      `
    };

    let result;
    try {
      result = await transporter.sendMail(mailOptions);
      console.log('[EmailDebug] resend sendMail OK:', { messageId: result?.messageId, response: result?.response });
    } catch (sendErr) {
      console.error('[EmailDebug] resend sendMail FAILED:', sendErr?.message);
      throw sendErr;
    }
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error resending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (email, orderDetails) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Order Confirmation - Butcher Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmed!</h2>
          <p>Dear ${orderDetails.customerName},</p>
          <p>Your order has been confirmed and is being prepared.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Total Amount:</strong> $${orderDetails.totalUSD} USD / ${orderDetails.totalLBP} LBP</p>
            <p><strong>Status:</strong> ${orderDetails.status}</p>
          </div>
          <p>We'll notify you when your order is ready for pickup.</p>
          <p>Thank you for choosing our butcher shop!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send order rejection email
export const sendOrderRejectionEmail = async (email, orderDetails) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Butcher Shop" <${process.env.EMAIL_USER || 'houssein.ibrahim.3@gmail.com'}>`,
      to: email,
      subject: 'Order Rejected - Butcher Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Order Rejected!</h2>
          <p>Dear ${orderDetails.customerName},</p>
          <p>Unfortunately, your order <strong>#${orderDetails.orderId}</strong> has been rejected.</p>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 4px; margin: 20px 0; border: 1px solid #fecaca;">
            <h3>Rejection Details:</h3>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Reason:</strong> ${orderDetails.rejectionReason || 'No reason provided by the admin.'}</p>
            <p><strong>Total Amount:</strong> $${orderDetails.totalAmountUSD} USD / ${orderDetails.totalAmountLBP.toLocaleString()} LBP</p>
          </div>
          <p>We apologize for any inconvenience. Please contact us for more details.</p>
          <p>Thank you for your understanding.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log('Order rejection email sent successfully');
  } catch (error) {
    console.error('Error sending order rejection email:', error);
    throw error;
  }
};
