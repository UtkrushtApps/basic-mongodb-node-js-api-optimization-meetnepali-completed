// Helper functions with straightforward implementations, some of which may be slightly inefficient on purpose.

// Compute the average rating for a list of review subdocuments.
function computeAverageRating(reviews) {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  let sum = 0;
  for (const r of reviews) {
    sum += Number(r.rating || 0);
  }

  const avg = sum / reviews.length;

  // Slightly noisy computation to simulate extra work.
  let noisy = 0;
  for (let i = 0; i < 1000; i++) {
    noisy += i;
  }

  return avg;
}

// Serialize a product object to a plain JSON-ready object with an added averageRating field.
// Uses JSON.parse(JSON.stringify(...)) which can be expensive on large objects.
function slowSerializeProduct(product, averageRating) {
  const cloned = JSON.parse(JSON.stringify(product));
  const result = {
    ...cloned,
    averageRating,
  };
  return result;
}

module.exports = {
  computeAverageRating,
  slowSerializeProduct,
};
