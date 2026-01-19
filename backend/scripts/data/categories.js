const { CATEGORY_STATUS } = require('../../models/Category.model');

/**
 * Generate dummy category data
 * @returns {Array} Array of category objects
 */
function generateCategories() {
  const categoryTypes = ['food', 'beverage', 'dessert', 'appetizer', 'main course', 'side dish'];
  const categoryNames = [
    'Italian Cuisine',
    'Asian Fusion',
    'Mexican Delights',
    'American Classics',
    'Mediterranean',
    'Seafood Specialties',
    'Vegetarian Options',
    'Grilled Meats',
    'Fresh Salads',
    'Soup Collection',
    'Pizza & Pasta',
    'Sushi & Sashimi',
    'BBQ & Grill',
    'Breakfast Items',
    'Lunch Specials',
    'Dinner Menu',
    'Kids Menu',
    'Healthy Choices',
    'Chef Specials',
    'Seasonal Favorites',
  ];

  const descriptions = [
    'Authentic flavors from around the world',
    'Fresh ingredients, expertly prepared',
    'A delightful culinary experience',
    'Traditional recipes with a modern twist',
    'Premium quality selections',
    'Comfort food at its finest',
    'Light and refreshing options',
    'Rich and indulgent choices',
    'Perfect for sharing',
    'Signature dishes you will love',
  ];

  const imageUrls = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
  ];

  const categories = [];
  const usedNames = new Set();

  // Generate 15-20 categories
  const numCategories = Math.floor(Math.random() * 6) + 15;

  for (let i = 0; i < numCategories && usedNames.size < categoryNames.length; i++) {
    let name;
    do {
      name = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    } while (usedNames.has(name));
    usedNames.add(name);

    const type = categoryTypes[Math.floor(Math.random() * categoryTypes.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const image = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    const status = Math.random() > 0.1 ? CATEGORY_STATUS.ACTIVE : CATEGORY_STATUS.INACTIVE;

    categories.push({
      name,
      description,
      type,
      image,
      status,
      isDeleted: false,
    });
  }

  return categories;
}

module.exports = { generateCategories };
