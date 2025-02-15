const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { Color } = require('./models/Product');
const defaultColors = require('./data/colors');

// Load env vars from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Bağlantı URI'sini kontrol et
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const seedColors = async () => {
  try {
    console.log('Deleting existing colors...');
    await Color.deleteMany();
    
    console.log('Adding new colors...');
    await Color.insertMany(defaultColors);
    
    console.log('Colors seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding colors:', error);
    process.exit(1);
  }
};

// Eğer direkt bu dosya çalıştırılıyorsa
if (require.main === module) {
  seedColors();
}

module.exports = seedColors; 