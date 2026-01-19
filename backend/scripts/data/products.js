/**
 * Generate dummy product data
 * @param {Array} menuIds - Array of menu ObjectIds
 * @returns {Array} Array of product objects with menu references
 */
function generateProducts(menuIds) {
  const productNames = [
    // Main Courses
    'Grilled Salmon',
    'Beef Tenderloin',
    'Chicken Parmesan',
    'Vegetable Stir Fry',
    'Margherita Pizza',
    'Spaghetti Carbonara',
    'Fish and Chips',
    'BBQ Ribs',
    'Chicken Caesar Salad',
    'Beef Burger',
    'Veggie Burger',
    'Chicken Wings',
    'Pasta Primavera',
    'Seafood Paella',
    'Lamb Chops',
    'Duck Confit',
    'Risotto',
    'Lasagna',
    'Tacos',
    'Sushi Platter',
    // Appetizers
    'Bruschetta',
    'Mozzarella Sticks',
    'Spring Rolls',
    'Nachos',
    'Chicken Satay',
    'Shrimp Cocktail',
    'Onion Rings',
    'Garlic Bread',
    'Soup of the Day',
    'Caesar Salad',
    // Desserts
    'Chocolate Cake',
    'Cheesecake',
    'Tiramisu',
    'Ice Cream Sundae',
    'Apple Pie',
    'Brownie',
    'Creme Brulee',
    'Fruit Salad',
    'Chocolate Mousse',
    'Lava Cake',
    // Beverages
    'Fresh Orange Juice',
    'Iced Tea',
    'Coffee',
    'Espresso',
    'Cappuccino',
    'Latte',
    'Soda',
    'Mineral Water',
    'Fresh Lemonade',
    'Smoothie',
  ];

  const descriptions = [
    'Fresh and delicious',
    'Made with premium ingredients',
    'Chef recommended',
    'House specialty',
    'Award-winning recipe',
    'Locally sourced ingredients',
    'Perfectly seasoned',
    'Mouth-watering flavors',
    'Comfort food classic',
    'Gourmet preparation',
    'Healthy and nutritious',
    'Rich and flavorful',
    'Light and refreshing',
    'Indulgent and satisfying',
    'Traditional recipe',
  ];

  const imageUrls = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    'https://images.unsplash.com/photo-1563379091339-03246963d19a?w=400',
  ];

  const products = [];
  let productNumberCounter = 1000;

  // Generate 3-8 products per menu
  menuIds.forEach((menuId) => {
    const numProducts = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < numProducts; i++) {
      const name = productNames[Math.floor(Math.random() * productNames.length)];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const image = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      const productNumber = `PROD-${productNumberCounter++}`;
      
      // Price between $5 and $50, rounded to 2 decimals
      const price = Math.round((Math.random() * 45 + 5) * 100) / 100;

      products.push({
        name,
        description,
        image,
        productNumber,
        price,
        menu: menuId,
        isDeleted: false,
      });
    }
  });

  return products;
}

module.exports = { generateProducts };
