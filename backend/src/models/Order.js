import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  orderType: {
    type: String,
    enum: ['product', 'custom'],
    required: [true, 'Order type is required']
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    meatType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MeatType'
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative']
    },
    amountUSD: {
      type: Number,
      min: [0, 'Amount cannot be negative']
    },
    amountLBP: {
      type: Number,
      min: [0, 'Amount cannot be negative']
    },
    customDescription: {
      type: String,
      trim: true
    }
  }],
  customMessage: {
    type: String,
    trim: true
  },
  totalAmountUSD: {
    type: Number,
    default: 0
  },
  totalAmountLBP: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'out_for_delivery', 'completed', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  deliveryApplied: {
    type: Boolean,
    default: false
  },
  deliveryFeeLBP: {
    type: Number,
    default: 0
  },
  deliveryInfo: {
    address: String,
    phone: String,
    preferredTime: String
  },
  isDeliveryAssigned: {
    type: Boolean,
    default: false
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  isWhatsAppSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
