const { ORDER_STATUS, ORDER_PAYMENT_METHOD } = require('../../models/Order.model');

/**
 * Generate dummy order data spread across the previous year
 * @param {Array} tableIds - Array of table ObjectIds
 * @param {Array} products - Array of product objects with _id
 * @returns {Array} Array of order objects with table and product references
 */
function generateOrders(tableIds, products) {
  const customerNames = [
    'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Edward Norton',
    'Fiona Apple', 'George Clooney', 'Helen Mirren', 'Ian McKellen', 'Julia Roberts',
    'Kevin Spacey', 'Laura Linney', 'Morgan Freeman', 'Natalie Portman', 'Oscar Isaac',
    'Penelope Cruz', 'Quentin Tarantino', 'Rachel Weisz', 'Samuel Jackson', 'Tom Hanks',
    'Uma Thurman', 'Viggo Mortensen', 'Winona Ryder', 'Xavier Dolan', 'Yara Shahidi',
    'Zoe Saldana', 'Adam Sandler', 'Ben Affleck', 'Cate Blanchett', 'Daniel Day-Lewis',
    'Emma Stone', 'Forest Whitaker', 'Gary Oldman', 'Halle Berry', 'Idris Elba',
    'Jennifer Lawrence', 'Kate Winslet', 'Leonardo DiCaprio', 'Meryl Streep', 'Nicole Kidman',
  ];

  const orders = [];
  
  // Get the start and end of the previous year
  const now = new Date();
  const currentYear = now.getFullYear();
  const previousYear = currentYear - 1;
  const startOfYear = new Date(previousYear, 0, 1);
  const endOfYear = new Date(previousYear, 11, 31, 23, 59, 59);
  
  // Generate orders spread across the year
  // More orders on weekends and evenings
  const numOrders = Math.floor(Math.random() * 2000) + 1500; // 1500-3500 orders for the year
  
  let orderNumber = 1000;

  for (let i = 0; i < numOrders; i++) {
    // Random date within the previous year
    const randomTime = startOfYear.getTime() + Math.random() * (endOfYear.getTime() - startOfYear.getTime());
    const orderDate = new Date(randomTime);
    
    // Adjust for more orders during peak hours (lunch 11-14, dinner 18-21)
    const hour = orderDate.getHours();
    let timeWeight = 1;
    if ((hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 21)) {
      timeWeight = 1.5; // More likely during peak hours
    }
    
    // Skip some orders based on time weight (simulate fewer orders during off-peak)
    if (Math.random() > timeWeight * 0.3) {
      continue;
    }

    // Random table (some orders might not have a table - takeout/delivery)
    const hasTable = Math.random() > 0.2; // 80% have tables
    const table = hasTable ? tableIds[Math.floor(Math.random() * tableIds.length)] : null;

    // Random customer
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];

    // Generate 1-5 products per order
    const numProducts = Math.floor(Math.random() * 5) + 1;
    const orderProducts = [];
    const usedProductIds = new Set();

    for (let j = 0; j < numProducts; j++) {
      let product;
      let attempts = 0;
      do {
        product = products[Math.floor(Math.random() * products.length)];
        attempts++;
        if (attempts > 100) break;
      } while (usedProductIds.has(product._id.toString()));
      
      if (product) {
        usedProductIds.add(product._id.toString());
        const quantity = Math.floor(Math.random() * 4) + 1; // 1-4 items
        
        orderProducts.push({
          product: product._id,
          quantity,
          productSnapshot: {
            name: product.name,
            description: product.description,
            image: product.image,
            productNumber: product.productNumber,
            price: product.price,
            menu: product.menu, // Already an ObjectId
          },
        });
      }
    }

    if (orderProducts.length === 0) continue;

    // Calculate prices
    let price = 0;
    orderProducts.forEach((item) => {
      price += item.productSnapshot.price * item.quantity;
    });

    // Tax (8-12%)
    const taxRate = Math.random() * 0.04 + 0.08;
    const tax = Math.round(price * taxRate * 100) / 100;

    // Tip (10-20% of price, not total)
    const tipRate = Math.random() * 0.1 + 0.1;
    const tip = Math.round(price * tipRate * 100) / 100;

    const total_price = Math.round((price + tax + tip) * 100) / 100;

    // Status distribution: 70% completed, 25% in process, 5% cancelled
    const statusRand = Math.random();
    let status;
    if (statusRand < 0.7) {
      status = ORDER_STATUS.COMPLETED;
    } else if (statusRand < 0.95) {
      status = ORDER_STATUS.IN_PROCESS;
    } else {
      status = ORDER_STATUS.CANCELLED;
    }

    // Payment method (only if completed)
    let payment_method = null;
    if (status === ORDER_STATUS.COMPLETED) {
      const paymentRand = Math.random();
      if (paymentRand < 0.4) {
        payment_method = ORDER_PAYMENT_METHOD.CARD;
      } else if (paymentRand < 0.7) {
        payment_method = ORDER_PAYMENT_METHOD.CASH_ON_DELIVERY;
      } else {
        payment_method = ORDER_PAYMENT_METHOD.ONLINE_TRANSFER;
      }
    }

    orders.push({
      orderNumber: orderNumber++,
      table,
      products: orderProducts,
      price: Math.round(price * 100) / 100,
      tax,
      total_price,
      customer: {
        name: customerName,
      },
      status,
      payment_method,
      tip,
      date: orderDate,
      isDeleted: false,
    });
  }

  // Sort orders by date
  orders.sort((a, b) => a.date - b.date);

  return orders;
}

module.exports = { generateOrders };
