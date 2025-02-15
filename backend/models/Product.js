const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function(value) {
        return !value || value < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  countInStock: {
    type: Number,
    required: [true, 'Please add count in stock'],
    min: [0, 'Stock cannot be negative']
  },
  images: [{
    type: String,
    required: [true, 'Please add at least one image']
  }],
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  colors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color'
  }],
  sizes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Size'
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isSponsored: {
    type: Boolean,
    default: false
  },
  sponsorshipEnd: Date,
  billboard: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

// Middleware'ler
ProductSchema.pre('remove', async function(next) {
  // Ürün silindiğinde ilgili yorumları da sil
  await this.model('Review').deleteMany({ product: this._id });
  next();
});

// Populate middleware'leri
ProductSchema.pre(/^find/, function(next) {
  // Eğer lean() kullanılmışsa veya select belirtilmişse populate yapma
  if (this._mongooseOptions.lean || this._fields) {
    return next();
  }

  this.populate('brand', 'name')
    .populate('categories', 'name')
    .populate('subcategories', 'name')
    .populate('colors', 'name code')
    .populate('sizes', 'name')
    .populate('store', 'name');
  
  next();
});

// Post-save middleware to create request for new products
ProductSchema.post('save', async function(doc) {
  try {
    // Sadece yeni ürün oluşturulduğunda ve status pending ise request oluştur
    if (doc.status === 'pending') {
      const Request = mongoose.model('Request');
      
      // Önce bu ürün için zaten bir request var mı kontrol et
      const existingRequest = await Request.findOne({ 
        'product': doc._id,
        'type': 'NEW_PRODUCT'
      });

      if (!existingRequest) {
        // Store'u populate et
        const populatedProduct = await doc.populate('store');
        
        // Request oluştur
        await Request.create({
          type: 'NEW_PRODUCT',
          sender: populatedProduct.store.owner,
          store: doc.store,
          product: doc._id,
          description: `طلب مراجعة منتج جديد: ${doc.name}`,
          status: 'pending'
        });
      }
    }
  } catch (error) {
    console.error('Error creating product request:', error);
  }
});

module.exports = mongoose.model('Product', ProductSchema); 