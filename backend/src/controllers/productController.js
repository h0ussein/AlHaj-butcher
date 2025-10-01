import Product from '../models/Product.js';
import Category from '../models/Category.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { category, available } = req.query;
    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }
    if (available !== undefined) {
      filter.isAvailable = available === 'true';
    }

    const products = await Product.find(filter)
      .populate('category', 'name nameAr')
      .populate('meatTypes')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name nameAr')
      .populate('meatTypes');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      category,
      priceUSD,
      priceLBP,
      images
    } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const product = new Product({
      name,
      nameAr,
      description,
      descriptionAr,
      category,
      priceUSD,
      priceLBP,
      images: images || []
    });

    await product.save();
    await product.populate('category', 'name nameAr');

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      category,
      priceUSD,
      priceLBP,
      isAvailable,
      images
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    if (name) product.name = name;
    if (nameAr) product.nameAr = nameAr;
    if (description !== undefined) product.description = description;
    if (descriptionAr !== undefined) product.descriptionAr = descriptionAr;
    if (category) product.category = category;
    if (priceUSD !== undefined) product.priceUSD = priceUSD;
    if (priceLBP !== undefined) product.priceLBP = priceLBP;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (images) product.images = images;

    await product.save();
    await product.populate('category', 'name nameAr');

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Attempt to delete associated image files from disk
    if (Array.isArray(product.images) && product.images.length > 0) {
      for (const imageEntry of product.images) {
        try {
          // Derive filename from possible full URL or relative path
          let filename = '';
          if (typeof imageEntry === 'string' && imageEntry.startsWith('http')) {
            const urlPathname = new URL(imageEntry).pathname; // e.g. /uploads/abc.jpg
            filename = path.basename(urlPathname);
          } else if (typeof imageEntry === 'string') {
            // Could be /uploads/abc.jpg or abc.jpg
            const base = imageEntry.includes('/uploads/') ? imageEntry.split('/uploads/')[1] : imageEntry;
            filename = path.basename(base);
          }

          if (filename) {
            const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
            if (fs.existsSync(filePath)) {
              await fs.promises.unlink(filePath);
            }
          }
        } catch (err) {
          // Log and continue; don't block deletion on file errors
          console.error('Error deleting product image:', err);
        }
      }
    }

    // Soft delete the product but clear image references
    product.images = [];
    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle product availability (Admin only)
export const toggleProductAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.json({
      message: `Product ${product.isAvailable ? 'made available' : 'made unavailable'}`,
      product
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
