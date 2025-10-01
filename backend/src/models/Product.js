import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  nameAr: {
    type: String,
    required: [true, 'Arabic product name is required'],
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
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
  meatTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeatType'
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
