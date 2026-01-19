/**
 * Generate dummy menu data
 * @param {Array} categoryIds - Array of category ObjectIds
 * @returns {Array} Array of menu objects with category references
 */
function generateMenus(categoryIds) {
  const menuNames = [
    'Breakfast Menu',
    'Lunch Menu',
    'Dinner Menu',
    'Brunch Specials',
    'Happy Hour Menu',
    'Kids Menu',
    'Vegetarian Menu',
    'Vegan Options',
    'Gluten-Free Menu',
    'Chef Specials',
    'Weekend Specials',
    'Holiday Menu',
    'Appetizer Menu',
    'Dessert Menu',
    'Beverage Menu',
    'Wine List',
    'Cocktail Menu',
    'Coffee & Tea',
    'Seasonal Menu',
    'Signature Dishes',
  ];

  const imageUrls = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
  ];

  const menus = [];
  const usedNames = new Set();

  // Generate 2-4 menus per category
  const menusPerCategory = Math.floor(Math.random() * 3) + 2;

  categoryIds.forEach((categoryId) => {
    const numMenus = Math.floor(Math.random() * menusPerCategory) + 1;

    for (let i = 0; i < numMenus; i++) {
      let name;
      let attempts = 0;
      do {
        name = menuNames[Math.floor(Math.random() * menuNames.length)];
        attempts++;
        if (attempts > 50) {
          name = `${menuNames[Math.floor(Math.random() * menuNames.length)]} ${usedNames.size + 1}`;
          break;
        }
      } while (usedNames.has(name));
      usedNames.add(name);

      const image = imageUrls[Math.floor(Math.random() * imageUrls.length)];

      menus.push({
        name,
        category: categoryId,
        image,
        isDeleted: false,
      });
    }
  });

  return menus;
}

module.exports = { generateMenus };
