// MongoDB initialization script executed by the official mongo Docker image.
// This script creates the utkrusht_store database, a basic application user, and
// seeds a products collection with embedded reviews. The data volume is
// intentionally large enough to expose simple performance issues when queries
// load all documents and all fields.

// Create/read the application database
var appDb = db.getSiblingDB('utkrusht_store');

// Create application user with readWrite role (credentials are used by the Node.js app)
appDb.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [{ role: 'readWrite', db: 'utkrusht_store' }],
});

// Drop existing products collection if present
appDb.products.drop();

var categories = ['electronics', 'books', 'clothing', 'home'];

function makeLongText(base, repeat) {
  var text = '';
  for (var i = 0; i < repeat; i++) {
    text += base + ' ';
  }
  return text;
}

// Seed products with many embedded reviews to simulate heavier documents.
for (var c = 0; c < categories.length; c++) {
  var category = categories[c];
  for (var i = 1; i <= 50; i++) {
    var reviews = [];
    for (var r = 0; r < 80; r++) {
      reviews.push({
        authorName: 'User ' + r,
        rating: (r % 5) + 1,
        comment: makeLongText('Review comment for ' + category + ' item ' + i, 4),
        createdAt: new Date(),
      });
    }

    appDb.products.insertOne({
      name: category + ' product ' + i,
      sku: category.substring(0, 3).toUpperCase() + '-' + i,
      category: category,
      price: 10 + i,
      imageUrl: 'https://example.com/images/' + category + '/' + i + '.jpg',
      description: makeLongText(
        'Detailed description for ' + category + ' product ' + i,
        10
      ),
      stock: (i * 3) % 100,
      reviews: reviews,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

print('[seed_database] Seeded utkrusht_store.products with sample data');
