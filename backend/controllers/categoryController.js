const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../utils/cloudinary');

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory } = req.body;
  let image = '';

  // Upload image if provided
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'categories'
    });
    image = result.secure_url;
  }

  const category = await Category.create({
    name,
    description,
    image,
    parentCategory: parentCategory || null
  });

  // If this is a subcategory, add it to parent's subcategories
  if (parentCategory) {
    await Category.findByIdAndUpdate(parentCategory, {
      $push: { subCategories: category._id }
    });
  }

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ parentCategory: null })
    .populate({
      path: 'subCategories',
      select: 'name description image isActive'
    });

  res.json({
    success: true,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate({
      path: 'subCategories',
      select: 'name description image isActive'
    });

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive, parentCategory } = req.body;
  let image = '';

  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  // Upload new image if provided
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'categories'
    });
    image = result.secure_url;
  }

  // Handle parent category change
  if (parentCategory !== undefined && parentCategory !== category.parentCategory) {
    // Remove from old parent's subcategories if exists
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(category.parentCategory, {
        $pull: { subCategories: category._id }
      });
    }
    // Add to new parent's subcategories if exists
    if (parentCategory) {
      await Category.findByIdAndUpdate(parentCategory, {
        $push: { subCategories: category._id }
      });
    }
  }

  category.name = name || category.name;
  category.description = description || category.description;
  category.isActive = isActive !== undefined ? isActive : category.isActive;
  category.parentCategory = parentCategory || category.parentCategory;
  if (image) category.image = image;

  const updatedCategory = await category.save();

  res.json({
    success: true,
    data: updatedCategory
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  // Remove from parent's subcategories if exists
  if (category.parentCategory) {
    await Category.findByIdAndUpdate(category.parentCategory, {
      $pull: { subCategories: category._id }
    });
  }

  // Remove all subcategories
  await Category.deleteMany({ parentCategory: category._id });

  await category.remove();

  res.json({
    success: true,
    message: 'Category removed'
  });
}); 