const UserActivity = require('../models/UserActivity');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

class UserActivityService {
  // Kullanıcı aktivitesi oluştur veya getir
  async getOrCreateActivity(userId) {
    let activity = await UserActivity.findOne({ user: userId });
    if (!activity) {
      activity = new UserActivity({ user: userId });
      await activity.save();
    }
    return activity;
  }

  // Ürün görüntüleme kaydı
  async trackProductView(userId, productId) {
    const activity = await this.getOrCreateActivity(userId);
    await activity.incrementProductView(productId);
  }

  // Kategori görüntüleme kaydı
  async trackCategoryView(userId, categoryId) {
    const activity = await this.getOrCreateActivity(userId);
    await activity.incrementCategoryView(categoryId);
  }

  // Marka görüntüleme kaydı
  async trackBrandView(userId, brandId) {
    const activity = await this.getOrCreateActivity(userId);
    await activity.incrementBrandView(brandId);
  }

  // Arama kaydı
  async trackSearch(userId, query) {
    const activity = await this.getOrCreateActivity(userId);
    await activity.addSearchQuery(query);
  }

  // Sepete ekleme kaydı
  async trackAddToCart(userId, productId) {
    const activity = await this.getOrCreateActivity(userId);
    await activity.addToCartHistory(productId);
  }

  // Satın alma kaydı
  async trackPurchase(userId, categoryId) {
    const activity = await this.getOrCreateActivity(userId);
    await activity.addPurchaseCategory(categoryId);
  }

  // Aktivite takibi için loglama
  async trackActivity(type, itemId) {
    console.log('=== Track Activity ===');
    console.log('Type:', type);
    console.log('Item ID:', itemId);
    
    // İşlem sonucunu logla
    console.log('Activity Result:', result);
    console.log('=== End Track Activity ===');
  }

  // Kişiselleştirilmiş öneriler
  async getPersonalizedRecommendations(userId) {
    console.log('=== Get Personalized Recommendations ===');
    console.log('User ID:', userId);
    
    const activity = await UserActivity.findOne({ user: userId })
      .populate('viewedProducts.product')
      .populate('viewedCategories.category')
      .populate('viewedBrands.brand')
      .populate('favorites')
      .populate('cartHistory.product')
      .populate('purchaseCategories.category');

    if (!activity) {
      return {
        recentlyViewedProducts: [],
        recommendedProducts: [],
        favoriteCategories: [],
        similarProducts: [],
        trendingInInterests: [],
        recommendedBrands: []
      };
    }

    // Son görüntülenen ürünler
    const recentlyViewedProducts = activity.viewedProducts
      .sort((a, b) => b.lastViewed - a.lastViewed)
      .slice(0, 10)
      .map(item => item.product);

    // En çok görüntülenen kategoriler
    const topCategories = activity.viewedCategories
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map(item => item.category._id);

    // En çok görüntülenen markalar
    const topBrands = activity.viewedBrands
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map(item => item.brand._id);

    // Benzer ürünler (son görüntülenen ürünlerin kategorilerinden)
    const recentCategories = [...new Set(recentlyViewedProducts.map(p => p.category))];
    const similarProducts = await Product.find({
      category: { $in: recentCategories },
      _id: { $nin: recentlyViewedProducts.map(p => p._id) }
    }).limit(10);

    // İlgi alanlarındaki trend ürünler
    const trendingInInterests = await Product.find({
      $or: [
        { category: { $in: topCategories } },
        { brand: { $in: topBrands } }
      ],
      _id: { $nin: recentlyViewedProducts.map(p => p._id) }
    })
    .sort({ viewCount: -1 })
    .limit(10);

    // Önerilen markalar
    const recommendedBrands = await Brand.find({
      _id: { $in: topBrands }
    }).limit(5);

    const recommendations = {
      recentlyViewed: recentlyViewedProducts,
      recommended: similarProducts,
      similarProducts,
      favoriteCategories: topCategories,
      trendingInInterests,
      recommendedBrands
    };

    // Önerileri logla
    console.log('Recommendations:', {
      recentlyViewed: recommendations.recentlyViewed?.length || 0,
      recommended: recommendations.recommended?.length || 0,
      similarProducts: recommendations.similarProducts?.length || 0
    });
    console.log('=== End Recommendations ===');

    return recommendations;
  }

  // Kullanıcı tercihlerini güncelle
  async updatePreferences(userId, preferences) {
    const activity = await this.getOrCreateActivity(userId);
    activity.preferences = { ...activity.preferences, ...preferences };
    await activity.save();
    return activity.preferences;
  }

  // Kullanıcı aktivite özetini getir
  async getActivitySummary(userId) {
    const activity = await UserActivity.findOne({ user: userId });
    if (!activity) return null;

    return {
      totalProductViews: activity.viewedProducts.reduce((sum, item) => sum + item.viewCount, 0),
      totalCategoryViews: activity.viewedCategories.reduce((sum, item) => sum + item.viewCount, 0),
      totalBrandViews: activity.viewedBrands.reduce((sum, item) => sum + item.viewCount, 0),
      totalSearches: activity.searchHistory.length,
      totalFavorites: activity.favorites.length,
      totalCartAdds: activity.cartHistory.length,
      lastActive: activity.lastActive
    };
  }
}

module.exports = new UserActivityService(); 