require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const { MONGO_URI } = require('../constants');
const { Category, Menu, Product, Order, Table, Staff } = require('../models');

// Import data generators
const { generateCategories } = require('./data/categories');
const { generateMenus } = require('./data/menus');
const { generateProducts } = require('./data/products');
const { generateTables } = require('./data/tables');
const { generateStaff } = require('./data/staff');
const { generateOrders } = require('./data/orders');

/**
 * Main function to seed the database with dummy data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Database connected successfully!\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await Menu.deleteMany({});
    await Product.deleteMany({});
    await Table.deleteMany({});
    await Staff.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Existing data cleared!\n');

    // Step 1: Generate and insert Categories
    console.log('📦 Step 1: Generating categories...');
    const categoryData = generateCategories();
    const insertedCategories = await Category.insertMany(categoryData);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);
    console.log(`   Category IDs: ${insertedCategories.map((c) => c._id.toString()).slice(0, 3).join(', ')}...\n`);

    // Step 2: Generate and insert Menus (with category references)
    console.log('📦 Step 2: Generating menus...');
    const categoryIds = insertedCategories.map((c) => c._id);
    const menuData = generateMenus(categoryIds);
    const insertedMenus = await Menu.insertMany(menuData);
    console.log(`✅ Inserted ${insertedMenus.length} menus`);
    console.log(`   Menu IDs: ${insertedMenus.map((m) => m._id.toString()).slice(0, 3).join(', ')}...\n`);

    // Step 3: Generate and insert Products (with menu references)
    console.log('📦 Step 3: Generating products...');
    const menuIds = insertedMenus.map((m) => m._id);
    const productData = generateProducts(menuIds);
    const insertedProducts = await Product.insertMany(productData);
    console.log(`✅ Inserted ${insertedProducts.length} products`);
    console.log(`   Product IDs: ${insertedProducts.map((p) => p._id.toString()).slice(0, 3).join(', ')}...\n`);

    // Step 4: Generate and insert Tables
    console.log('📦 Step 4: Generating tables...');
    const tableData = generateTables();
    const insertedTables = await Table.insertMany(tableData);
    console.log(`✅ Inserted ${insertedTables.length} tables`);
    console.log(`   Table IDs: ${insertedTables.map((t) => t._id.toString()).slice(0, 3).join(', ')}...\n`);

    // Step 5: Generate and insert Staff
    console.log('📦 Step 5: Generating staff...');
    const staffData = generateStaff();
    const insertedStaff = await Staff.insertMany(staffData);
    console.log(`✅ Inserted ${insertedStaff.length} staff members`);
    console.log(`   Staff IDs: ${insertedStaff.map((s) => s._id.toString()).slice(0, 3).join(', ')}...\n`);

    // Step 6: Generate and insert Orders (with table and product references, spread across previous year)
    console.log('📦 Step 6: Generating orders (this may take a moment)...');
    const tableIds = insertedTables.map((t) => t._id);
    // Get all products for order generation
    const allProducts = await Product.find({});
    const orderData = generateOrders(tableIds, allProducts);
    
    // Insert orders in batches to avoid memory issues
    const batchSize = 500;
    let totalInserted = 0;
    
    for (let i = 0; i < orderData.length; i += batchSize) {
      const batch = orderData.slice(i, i + batchSize);
      await Order.insertMany(batch);
      totalInserted += batch.length;
      process.stdout.write(`\r   Progress: ${totalInserted}/${orderData.length} orders inserted...`);
    }
    
    console.log(`\n✅ Inserted ${totalInserted} orders`);
    console.log(`   Orders spread across the previous year (${new Date().getFullYear() - 1})\n`);

    // Summary
    console.log('📊 Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Categories: ${insertedCategories.length}`);
    console.log(`   Menus:      ${insertedMenus.length}`);
    console.log(`   Products:   ${insertedProducts.length}`);
    console.log(`   Tables:     ${insertedTables.length}`);
    console.log(`   Staff:      ${insertedStaff.length}`);
    console.log(`   Orders:     ${totalInserted}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Database seeding completed successfully!');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
