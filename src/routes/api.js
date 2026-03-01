const express = require('express');
const router = express.Router();

const { Product } = require('../models/models');
const { computeAverageRating, slowSerializeProduct } = require('../utils/helpers');

// Health check endpoint used by run.sh
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/products
// Returns all products with additional computed data.
// This implementation is intentionally straightforward but not optimized for large datasets.
router.get('/products', async (req, res, next) => {
  try {
    // Fetch all products without any field selection or pagination
    const products = await Product.find({});

    const detailedProducts = [];

    // For each product, perform a second database lookup and some extra processing
    for (const product of products) {
      // Re-fetch the same product document (demonstrates a redundant query pattern)
      const freshProduct = await Product.findById(product._id);

      const avgRating = computeAverageRating(freshProduct.reviews || []);
      const serialized = slowSerializeProduct(freshProduct.toObject(), avgRating);
      detailedProducts.push(serialized);
    }

    res.json({
      data: detailedProducts,
      total: detailedProducts.length,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/category/:category
// Lists products belonging to a given category.
// This implementation fetches all products and filters them in Node.js code.
router.get('/products/category/:category', async (req, res, next) => {
  try {
    const categoryParam = req.params.category || '';

    // Fetch all products, even though only a subset is needed.
    const allProducts = await Product.find({});

    const filtered = allProducts.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      return cat === categoryParam.toLowerCase();
    });

    res.json({
      data: filtered,
      total: filtered.length,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/search?q=term
// Very simple search over name and description, implemented by loading the entire collection.
router.get('/products/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toLowerCase();

    // If no query is provided, return all products as-is.
    const allProducts = await Product.find({});

    if (!q) {
      return res.json({ data: allProducts, total: allProducts.length });
    }

    const results = allProducts.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });

    res.json({
      data: results,
      total: results.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
