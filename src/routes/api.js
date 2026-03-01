const express = require('express');
const router = express.Router();

const { Product } = require('../models/models');
const { computeAverageRating, serializeProduct } = require('../utils/helpers');
const { normalizePagination } = require('../schemas/schemas');

// ---------------------------------------------------------------------------
// Simple in-memory cache with a 60-second TTL.
// Keyed by a string that encodes the endpoint + all relevant query params.
// ---------------------------------------------------------------------------
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Field projection used across list endpoints.
// Fetches only rating from reviews (enough to compute averageRating).
// Keeps large fields like full review comments out of the payload.
const LIST_PROJECTION = 'name sku category price imageUrl stock description createdAt reviews.rating';

// ---------------------------------------------------------------------------
// Health check endpoint used by run.sh
// ---------------------------------------------------------------------------
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// GET /api/products
// Returns a paginated list of products.
// ---------------------------------------------------------------------------
router.get('/products', async (req, res, next) => {
  try {
    const { page, limit } = normalizePagination(req.query);
    const skip = (page - 1) * limit;
    const cacheKey = `products:${page}:${limit}`;

    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    // Run the data query and count in parallel to avoid sequential round-trips.
    const [products, total] = await Promise.all([
      Product.find({}, LIST_PROJECTION).skip(skip).limit(limit).lean(),
      Product.countDocuments(),
    ]);

    const data = products.map((p) => serializeProduct(p, computeAverageRating(p.reviews)));

    const result = { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/products/category/:category
// Uses the category index for DB-level filtering instead of loading everything.
// ---------------------------------------------------------------------------
router.get('/products/category/:category', async (req, res, next) => {
  try {
    const category = (req.params.category || '').trim();
    const { page, limit } = normalizePagination(req.query);
    const skip = (page - 1) * limit;
    const cacheKey = `category:${category.toLowerCase()}:${page}:${limit}`;

    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    // Case-insensitive match while still benefiting from the category index.
    const query = { category: new RegExp(`^${category}$`, 'i') };

    const [products, total] = await Promise.all([
      Product.find(query, LIST_PROJECTION).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    const data = products.map((p) => serializeProduct(p, computeAverageRating(p.reviews)));

    const result = { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/products/search?q=term
// Uses the compound text index on (name, description) for DB-level search.
// ---------------------------------------------------------------------------
router.get('/products/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const { page, limit } = normalizePagination(req.query);
    const skip = (page - 1) * limit;
    const cacheKey = `search:${q}:${page}:${limit}`;

    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    // When no query is given, return all products (paginated).
    const query = q ? { $text: { $search: q } } : {};

    const [products, total] = await Promise.all([
      Product.find(query, LIST_PROJECTION).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    const data = products.map((p) => serializeProduct(p, computeAverageRating(p.reviews)));

    const result = { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
