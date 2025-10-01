import mongoose from 'mongoose';

const meatTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Meat type name is required'],
    trim: true
  },
  nameAr: {
    type: String,
    required: [true, 'Arabic meat type name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  descriptionAr: {
    type: String,
    trim: true
  },
  priceUSD: {
    type: Number,
    required: [true, 'Price in USD is required'],
    min: [0, 'Price cannot be negative']
  },
  priceLBP: {
    type: Number,
    required: [true, 'Price in LBP is required'],
    min: [0, 'Price cannot be negative']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('MeatType', meatTypeSchema);
