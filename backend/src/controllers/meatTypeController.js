import MeatType from '../models/MeatType.js';
import Product from '../models/Product.js';

// Get all meat types for a product
export const getMeatTypesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const meatTypes = await MeatType.find({ 
      product: productId, 
      isActive: true 
    }).sort({ createdAt: 1 });

    res.json(meatTypes);
  } catch (error) {
    console.error('Get meat types error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create meat type (Admin only)
export const createMeatType = async (req, res) => {
  try {
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      priceUSD,
      priceLBP,
      productId
    } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: 'Product not found' });
    }

    // Check if product already has 3 meat types
    const existingMeatTypes = await MeatType.countDocuments({ 
      product: productId, 
      isActive: true 
    });
    if (existingMeatTypes >= 3) {
      return res.status(400).json({ message: 'Product can have maximum 3 meat types' });
    }

    const meatType = new MeatType({
      name,
      nameAr,
      description,
      descriptionAr,
      priceUSD,
      priceLBP,
      product: productId
    });

    await meatType.save();

    // Add meat type to product
    product.meatTypes.push(meatType._id);
    await product.save();

    res.status(201).json(meatType);
  } catch (error) {
    console.error('Create meat type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update meat type (Admin only)
export const updateMeatType = async (req, res) => {
  try {
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      priceUSD,
      priceLBP
    } = req.body;

    const meatType = await MeatType.findById(req.params.id);
    if (!meatType) {
      return res.status(404).json({ message: 'Meat type not found' });
    }

    // Update fields
    if (name) meatType.name = name;
    if (nameAr) meatType.nameAr = nameAr;
    if (description !== undefined) meatType.description = description;
    if (descriptionAr !== undefined) meatType.descriptionAr = descriptionAr;
    if (priceUSD !== undefined) meatType.priceUSD = priceUSD;
    if (priceLBP !== undefined) meatType.priceLBP = priceLBP;

    await meatType.save();

    res.json(meatType);
  } catch (error) {
    console.error('Update meat type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete meat type (Admin only)
export const deleteMeatType = async (req, res) => {
  try {
    const meatType = await MeatType.findById(req.params.id);
    if (!meatType) {
      return res.status(404).json({ message: 'Meat type not found' });
    }

    // Remove from product
    await Product.findByIdAndUpdate(
      meatType.product,
      { $pull: { meatTypes: meatType._id } }
    );

    // Soft delete meat type
    meatType.isActive = false;
    await meatType.save();

    res.json({ message: 'Meat type deleted successfully' });
  } catch (error) {
    console.error('Delete meat type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
