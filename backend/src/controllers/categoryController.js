import Category from '../models/Category.js';

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single category
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create category (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, nameAr, description, descriptionAr, image } = req.body;

    const category = new Category({
      name,
      nameAr,
      description,
      descriptionAr,
      image
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { name, nameAr, description, descriptionAr, image } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name;
    if (nameAr) category.nameAr = nameAr;
    if (description !== undefined) category.description = description;
    if (descriptionAr !== undefined) category.descriptionAr = descriptionAr;
    if (image !== undefined) category.image = image;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = false;
    await category.save();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
