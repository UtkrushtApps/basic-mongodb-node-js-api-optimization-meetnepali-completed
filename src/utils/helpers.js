// Helper functions for product data processing.

// Compute the average rating for a list of review subdocuments.
function computeAverageRating(reviews) {
  if (!reviews || reviews.length === 0) {
    return 0;
  }
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  return sum / reviews.length;
}

// Serialize a product object with an added averageRating field.
function serializeProduct(product, averageRating) {
  return { ...product, averageRating };
}

module.exports = {
  computeAverageRating,
  serializeProduct,
};
