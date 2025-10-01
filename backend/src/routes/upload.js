import express from 'express';
import upload from '../middlewares/upload.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Upload single image
router.post('/image', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Return the full URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Upload multiple images
router.post('/images', authenticateToken, requireAdmin, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    // Return the full URLs
    const imageUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
    
    res.json({
      message: 'Images uploaded successfully',
      imageUrls: imageUrls,
      filenames: req.files.map(file => file.filename)
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading images' });
  }
});

export default router;
