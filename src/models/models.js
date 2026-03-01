const { mongoose } = require('../database');

// Review subdocument schema (embedded directly in products)
const ReviewSchema = new mongoose.Schema(
  {
    authorName: { type: String },
    rating: { type: Number },
    comment: { type: String },
    createdAt: { type: Date },
  },
  { _id: false }
);

// Product schema with embedded reviews
// Intentionally kept simple with no explicit indexes to expose basic optimization opportunities
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    description: { type: String },
    stock: { type: Number, default: 0 },
    reviews: [ReviewSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'products',
  }
);

const Product = mongoose.model('Product', ProductSchema);

module.exports = {
  Product,
};
