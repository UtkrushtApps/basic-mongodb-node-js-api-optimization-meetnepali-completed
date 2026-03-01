// Basic, lightweight schema-like helpers for query validation/normalization.
// These are intentionally simple and can be used to support features like pagination.

const productQuerySchema = {
  page: {
    type: 'number',
    min: 1,
    default: 1,
  },
  limit: {
    type: 'number',
    min: 1,
    max: 100,
    default: 50,
  },
};

function normalizePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (Number.isNaN(page) || page < productQuerySchema.page.min) {
    page = productQuerySchema.page.default;
  }

  if (
    Number.isNaN(limit) ||
    limit < productQuerySchema.limit.min ||
    limit > productQuerySchema.limit.max
  ) {
    limit = productQuerySchema.limit.default;
  }

  return { page, limit };
}

module.exports = {
  productQuerySchema,
  normalizePagination,
};
