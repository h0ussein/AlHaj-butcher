import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { sendOrderConfirmationEmail, sendOrderRejectionEmail } from '../utils/emailService.js';
import { sendWhatsAppMessage, sendOrderStatusUpdate } from '../utils/whatsappService.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const {
      orderType,
      items,
      customMessage,
      deliveryInfo,
      deliveryApplied
    } = req.body;

    console.log('Creating order with data:', { orderType, items, customMessage });

    let totalAmountUSD = 0;
    let totalAmountLBP = 0;
    const processedItems = [];

    // Get settings for validation
    const settings = await Settings.getSettings();

    if (orderType === 'product' && items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.product} not found` });
        }

        if (!product.isAvailable) {
          return res.status(400).json({ message: `Product ${product.name} is not available` });
        }

        let itemAmountUSD = 0;
        let itemAmountLBP = 0;

        if (item.amountUSD) {
          // Order by USD amount - convert to LBP using USD to LBP rate
          itemAmountUSD = Math.round(item.amountUSD);
          itemAmountLBP = itemAmountUSD * (settings.exchangeRateUSDToLBP || settings.exchangeRate);
        } else if (item.amountLBP) {
          // Order by LBP amount - convert to USD using LBP to USD rate
          itemAmountLBP = item.amountLBP;
          itemAmountUSD = itemAmountLBP / (settings.exchangeRateLBPToUSD || settings.exchangeRate);
        } else if (item.quantity) {
          // Order by quantity - use meat type price if available
          let priceUSD = product.priceUSD;
          let priceLBP = product.priceLBP;
          
          if (item.meatType) {
            const MeatType = (await import('../models/MeatType.js')).default;
            const meatType = await MeatType.findById(item.meatType);
            if (meatType) {
              priceUSD = meatType.priceUSD;
              priceLBP = meatType.priceLBP;
            }
          }
          
          itemAmountUSD = Math.round(item.quantity * priceUSD);
          itemAmountLBP = item.quantity * priceLBP;
        } else {
          return res.status(400).json({ 
            message: 'Each item must have either quantity, amountUSD, or amountLBP' 
          });
        }

        // Validate minimum amounts
        if (item.amountUSD && itemAmountUSD < settings.minOrderAmountUSD) {
          return res.status(400).json({ 
            message: `Minimum USD order amount is $${settings.minOrderAmountUSD}` 
          });
        }
        
        if (item.amountLBP && itemAmountLBP < settings.minOrderAmountLBP) {
          return res.status(400).json({ 
            message: `Minimum LBP order amount is ${settings.minOrderAmountLBP.toLocaleString()} LBP` 
          });
        }

        totalAmountUSD += itemAmountUSD;
        totalAmountLBP += itemAmountLBP;

        processedItems.push({
          product: product._id,
          meatType: item.meatType || null,
          quantity: item.quantity,
          amountUSD: itemAmountUSD,
          amountLBP: itemAmountLBP
        });
      }
    }

    // Apply delivery fee if requested
    let deliveryFeeLBP = 0;
    if (deliveryApplied) {
      deliveryFeeLBP = 100000;
      totalAmountLBP += deliveryFeeLBP;
      
      // Convert delivery fee to USD and add to total USD
      const deliveryFeeUSD = deliveryFeeLBP / (settings.exchangeRateLBPToUSD || settings.exchangeRate);
      totalAmountUSD += deliveryFeeUSD;
    }

    // Handle cents properly for USD
    const cents = (totalAmountUSD % 1) * 100;
    if (cents > 30) {
      // If more than 30 cents, round up to next dollar
      totalAmountUSD = Math.ceil(totalAmountUSD);
    } else {
      // If 30 cents or less, clear the cents
      totalAmountUSD = Math.floor(totalAmountUSD);
    }

    const order = new Order({
      customer: req.user._id,
      orderType,
      items: processedItems,
      customMessage,
      totalAmountUSD,
      totalAmountLBP,
      deliveryInfo,
      deliveryApplied: !!deliveryApplied,
      deliveryFeeLBP
    });

    await order.save();
    await order.populate('customer', 'firstName lastName fatherName email mobile');
    await order.populate('items.product', 'name nameAr priceUSD priceLBP');

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name nameAr priceUSD priceLBP')
      .populate('items.meatType', 'name nameAr priceUSD priceLBP')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'firstName lastName fatherName email mobile')
      .populate('items.product', 'name nameAr priceUSD priceLBP')
      .populate('items.meatType', 'name nameAr priceUSD priceLBP')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName fatherName email mobile')
      .populate('items.product', 'name nameAr priceUSD priceLBP')
      .populate('items.meatType', 'name nameAr priceUSD priceLBP');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can access this order
    if (req.user.role !== 'admin' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes, isDeliveryAssigned, rejectionReason } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'ready', 'out_for_delivery', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName fatherName email mobile');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status;
    if (notes) order.notes = notes;
    if (typeof isDeliveryAssigned === 'boolean') {
      order.isDeliveryAssigned = isDeliveryAssigned;
    }
    if (status === 'rejected' && rejectionReason) {
      order.rejectionReason = rejectionReason;
    } else if (status !== 'rejected') {
      order.rejectionReason = undefined; // Clear if not rejected
    }

    await order.save();

    // Send notifications when order is confirmed
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      try {
        // Send email confirmation
        if (!order.isEmailSent) {
          await sendOrderConfirmationEmail(order.customer.email, {
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
            orderId: order._id,
            totalUSD: order.totalAmountUSD,
            totalLBP: order.totalAmountLBP,
            status: order.status
          });
          order.isEmailSent = true;
        }

        // Send WhatsApp message to customer
        if (!order.isWhatsAppSent) {
          await sendOrderStatusUpdate(order.customer.mobile, 'confirmed', {
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
            orderId: order._id,
            totalAmountUSD: order.totalAmountUSD,
            totalAmountLBP: order.totalAmountLBP,
            deliveryApplied: order.deliveryApplied
          });
          order.isWhatsAppSent = true;
        }

        await order.save();
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't fail the order update if notifications fail
      }
    }

    // Notify when order is ready
    if (status === 'ready' && oldStatus !== 'ready') {
      try {
        await sendOrderStatusUpdate(order.customer.mobile, 'ready', {
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
          orderId: order._id,
          totalAmountUSD: order.totalAmountUSD,
          totalAmountLBP: order.totalAmountLBP,
          deliveryApplied: order.deliveryApplied
        });
      } catch (e) { console.error('Notification error:', e); }
    }

    // Out for delivery
    if (status === 'out_for_delivery' && oldStatus !== 'out_for_delivery') {
      try {
        await sendOrderStatusUpdate(order.customer.mobile, 'out_for_delivery', {
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
          orderId: order._id,
          totalAmountUSD: order.totalAmountUSD,
          totalAmountLBP: order.totalAmountLBP,
          deliveryApplied: order.deliveryApplied
        });
      } catch (e) { console.error('Notification error:', e); }
    }

    // Send WhatsApp to customer when order is completed
    if (status === 'completed' && oldStatus !== 'completed') {
      try {
        await sendOrderStatusUpdate(order.customer.mobile, 'completed', {
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
          orderId: order._id,
          totalAmountUSD: order.totalAmountUSD,
          totalAmountLBP: order.totalAmountLBP,
          deliveryApplied: order.deliveryApplied
        });
      } catch (e) { console.error('Notification error:', e); }
    }

    // Send notifications when order is rejected
    if (status === 'rejected' && oldStatus !== 'rejected') {
      try {
        const customerName = `${order.customer.firstName} ${order.customer.lastName}`;
        const orderData = {
          customerName,
          orderId: order._id,
          totalAmountUSD: order.totalAmountUSD,
          totalAmountLBP: order.totalAmountLBP,
          deliveryApplied: order.deliveryApplied,
          rejectionReason: order.rejectionReason
        };

        // Send email notification
        await sendOrderRejectionEmail(order.customer.email, orderData);
        
        // Send WhatsApp notification
        await sendOrderStatusUpdate(order.customer.mobile, 'rejected', orderData);
      } catch (notificationError) {
        console.error('Rejection notification error:', notificationError);
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete order (Admin only) - Only for rejected orders
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow deletion of rejected orders
    if (order.status !== 'rejected') {
      return res.status(400).json({ message: 'Only rejected orders can be deleted' });
    }

    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
