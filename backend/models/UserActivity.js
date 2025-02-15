const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Görüntülenen ürünler ve görüntüleme sayıları
  viewedProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    viewCount: {
      type: Number,
      default: 1
    },
    lastViewed: {
      type: Date,
      default: Date.now
    }
  }],
  // Görüntülenen kategoriler ve görüntüleme sayıları
  viewedCategories: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    viewCount: {
      type: Number,
      default: 1
    },
    lastViewed: {
      type: Date,
      default: Date.now
    }
  }],
  // Görüntülenen markalar ve görüntüleme sayıları
  viewedBrands: [{
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand'
    },
    viewCount: {
      type: Number,
      default: 1
    },
    lastViewed: {
      type: Date,
      default: Date.now
    }
  }],
  // Arama geçmişi
  searchHistory: [{
    query: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Favori ürünler
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // Sepete eklenen ürünler geçmişi
  cartHistory: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Satın alınan ürünler kategorileri
  purchaseCategories: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    count: {
      type: Number,
      default: 1
    }
  }],
  // Kullanıcının tercihleri
  preferences: {
    preferredCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    preferredBrands: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand'
    }],
    priceRange: {
      min: Number,
      max: Number
    }
  },
  // Son etkileşim zamanı
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Görüntüleme sayısını artırma metodu
userActivitySchema.methods.incrementProductView = async function(productId) {
  const productIndex = this.viewedProducts.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (productIndex > -1) {
    this.viewedProducts[productIndex].viewCount += 1;
    this.viewedProducts[productIndex].lastViewed = new Date();
  } else {
    this.viewedProducts.push({
      product: productId,
      viewCount: 1,
      lastViewed: new Date()
    });
  }

  await this.save();
};

// Kategori görüntüleme sayısını artırma metodu
userActivitySchema.methods.incrementCategoryView = async function(categoryId) {
  const categoryIndex = this.viewedCategories.findIndex(
    item => item.category.toString() === categoryId.toString()
  );

  if (categoryIndex > -1) {
    this.viewedCategories[categoryIndex].viewCount += 1;
    this.viewedCategories[categoryIndex].lastViewed = new Date();
  } else {
    this.viewedCategories.push({
      category: categoryId,
      viewCount: 1,
      lastViewed: new Date()
    });
  }

  await this.save();
};

// Marka görüntüleme sayısını artırma metodu
userActivitySchema.methods.incrementBrandView = async function(brandId) {
  const brandIndex = this.viewedBrands.findIndex(
    item => item.brand.toString() === brandId.toString()
  );

  if (brandIndex > -1) {
    this.viewedBrands[brandIndex].viewCount += 1;
    this.viewedBrands[brandIndex].lastViewed = new Date();
  } else {
    this.viewedBrands.push({
      brand: brandId,
      viewCount: 1,
      lastViewed: new Date()
    });
  }

  await this.save();
};

// Arama geçmişine ekleme metodu
userActivitySchema.methods.addSearchQuery = async function(query) {
  this.searchHistory.push({
    query,
    timestamp: new Date()
  });

  // Sadece son 50 aramayı tut
  if (this.searchHistory.length > 50) {
    this.searchHistory = this.searchHistory.slice(-50);
  }

  await this.save();
};

// Favori ekleme/çıkarma metodu
userActivitySchema.methods.toggleFavorite = async function(productId) {
  const index = this.favorites.indexOf(productId);
  if (index > -1) {
    this.favorites.splice(index, 1);
  } else {
    this.favorites.push(productId);
  }

  await this.save();
};

// Sepet geçmişine ekleme metodu
userActivitySchema.methods.addToCartHistory = async function(productId) {
  this.cartHistory.push({
    product: productId,
    addedAt: new Date()
  });

  // Sadece son 100 ürünü tut
  if (this.cartHistory.length > 100) {
    this.cartHistory = this.cartHistory.slice(-100);
  }

  await this.save();
};

// Satın alma kategorisi ekleme/güncelleme metodu
userActivitySchema.methods.addPurchaseCategory = async function(categoryId) {
  const categoryIndex = this.purchaseCategories.findIndex(
    item => item.category.toString() === categoryId.toString()
  );

  if (categoryIndex > -1) {
    this.purchaseCategories[categoryIndex].count += 1;
  } else {
    this.purchaseCategories.push({
      category: categoryId,
      count: 1
    });
  }

  await this.save();
};

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity; 