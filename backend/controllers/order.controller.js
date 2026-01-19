const { Order, Table, Product, ORDER_STATUS } = require('../models');
const { sendResponse, validationError, isMongoID } = require('../utils');
const { createOrderSchema, updateOrderStatusSchema, payOrderSchema } = require('../validations/order.validation');

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.aggregate([
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: 'tables',
            localField: 'table',
            foreignField: '_id',
            as: 'tableData',
          },
        },
        {
          $unwind: {
            path: '$tableData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            orderNumber: 1,
            table: {
              _id: '$tableData._id',
              number: '$tableData.number',
              floor: '$tableData.floor',
              capacity: '$tableData.capacity',
              status: '$tableData.status',
            },
            products: 1,
            price: 1,
            tax: 1,
            total_price: 1,
            customer: 1,
            status: 1,
            payment_method: 1,
            tip: 1,
            date: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Order.countDocuments({ isDeleted: false }),
    ]);

    return sendResponse(res, 'success', 200, 'Orders retrieved successfully', {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving orders', null);
  }
};

const addOrder = async (req, res) => {
  const { error, value } = createOrderSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const table = await Table.findOne({ _id: value.table, isDeleted: false });
    if (!table) {
      return sendResponse(res, 'fail', 404, 'Table not found');
    }

    const productIds = value.products.map((p) => p.product);
    const products = await Product.find({ _id: { $in: productIds }, isDeleted: false });

    if (products.length !== productIds.length) {
      return sendResponse(res, 'fail', 404, 'One or more products not found');
    }

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const productsWithSnapshot = value.products.map((item) => {
      const product = productMap.get(item.product.toString());
      return {
        product: item.product,
        quantity: item.quantity,
        productSnapshot: {
          name: product.name,
          description: product.description,
          image: product.image,
          productNumber: product.productNumber,
          price: product.price,
          menu: product.menu,
        },
      };
    });

    const lastOrder = await Order.findOne({ isDeleted: false }).sort({ orderNumber: -1 });
    const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

    const order = new Order({
      orderNumber,
      table: value.table,
      products: productsWithSnapshot,
      customer: value.customer,
      status: ORDER_STATUS.IN_PROCESS,
      price: 0,
      tax: 0,
      total_price: 0,
      tip: 0,
      date: new Date(),
    });

    const savedOrder = await order.save();

    const populatedOrder = await Order.aggregate([
      { $match: { _id: savedOrder._id } },
      {
        $lookup: {
          from: 'tables',
          localField: 'table',
          foreignField: '_id',
          as: 'tableData',
        },
      },
      {
        $unwind: {
          path: '$tableData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          orderNumber: 1,
          table: {
            _id: '$tableData._id',
            number: '$tableData.number',
            floor: '$tableData.floor',
            capacity: '$tableData.capacity',
            status: '$tableData.status',
          },
          products: 1,
          price: 1,
          tax: 1,
          total_price: 1,
          customer: 1,
          status: 1,
          payment_method: 1,
          tip: 1,
          date: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return sendResponse(res, 'success', 201, 'Order created successfully', populatedOrder[0]);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error creating order', null);
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;

  if (!isMongoID(id)) {
    return sendResponse(res, 'fail', 400, 'Invalid order ID');
  }

  const { error, value } = updateOrderStatusSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) {
      return sendResponse(res, 'fail', 404, 'Order not found');
    }

    order.status = value.status;
    const updatedOrder = await order.save();

    const populatedOrder = await Order.aggregate([
      { $match: { _id: updatedOrder._id } },
      {
        $lookup: {
          from: 'tables',
          localField: 'table',
          foreignField: '_id',
          as: 'tableData',
        },
      },
      {
        $unwind: {
          path: '$tableData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          orderNumber: 1,
          table: {
            _id: '$tableData._id',
            number: '$tableData.number',
            floor: '$tableData.floor',
            capacity: '$tableData.capacity',
            status: '$tableData.status',
          },
          products: 1,
          price: 1,
          tax: 1,
          total_price: 1,
          customer: 1,
          status: 1,
          payment_method: 1,
          tip: 1,
          date: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return sendResponse(res, 'success', 200, 'Order status updated successfully', populatedOrder[0]);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error updating order status', null);
  }
};

const payOrder = async (req, res) => {
  const { id } = req.params;

  if (!isMongoID(id)) {
    return sendResponse(res, 'fail', 400, 'Invalid order ID');
  }

  const { error, value } = payOrderSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) {
      return sendResponse(res, 'fail', 404, 'Order not found');
    }

    order.price = value.price;
    order.tax = value.tax;
    order.total_price = value.total_price;
    order.payment_method = value.payment_method;
    order.tip = value.tip || 0;
    order.date = value.date;

    const updatedOrder = await order.save();

    const populatedOrder = await Order.aggregate([
      { $match: { _id: updatedOrder._id } },
      {
        $lookup: {
          from: 'tables',
          localField: 'table',
          foreignField: '_id',
          as: 'tableData',
        },
      },
      {
        $unwind: {
          path: '$tableData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          orderNumber: 1,
          table: {
            _id: '$tableData._id',
            number: '$tableData.number',
            floor: '$tableData.floor',
            capacity: '$tableData.capacity',
            status: '$tableData.status',
          },
          products: 1,
          price: 1,
          tax: 1,
          total_price: 1,
          customer: 1,
          status: 1,
          payment_method: 1,
          tip: 1,
          date: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return sendResponse(res, 'success', 200, 'Order payment updated successfully', populatedOrder[0]);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error updating order payment', null);
  }
};

const getOrderStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [todayStats, monthStats] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            isDeleted: false,
            status: ORDER_STATUS.COMPLETED,
            date: {
              $gte: startOfToday,
              $lte: endOfToday,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total_price' },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            isDeleted: false,
            status: ORDER_STATUS.COMPLETED,
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total_price' },
          },
        },
      ]),
    ]);

    const todaySales = todayStats[0]?.total || 0;
    const monthSales = monthStats[0]?.total || 0;

    return sendResponse(res, 'success', 200, 'Order stats retrieved successfully', {
      todaySales,
      monthSales,
    });
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving order stats', null);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    
    // Calculate date ranges
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfTodayForMonth = new Date(now);
    endOfTodayForMonth.setHours(23, 59, 59, 999);

    // 1. Current day total sales (completed orders only)
    const todaySalesResult = await Order.aggregate([
      {
        $match: {
          isDeleted: false,
          status: ORDER_STATUS.COMPLETED,
          date: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_price' },
        },
      },
    ]);
    const todaySales = todaySalesResult[0]?.total || 0;

    // 2. Monthly revenue (from start of month to current date, completed orders only)
    const monthlyRevenueResult = await Order.aggregate([
      {
        $match: {
          isDeleted: false,
          status: ORDER_STATUS.COMPLETED,
          date: {
            $gte: startOfMonth,
            $lte: endOfTodayForMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_price' },
        },
      },
    ]);
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    // 3. Total number of tables
    const totalTables = await Table.countDocuments({ isDeleted: false });

    // 4. Tables with "in process" orders
    const tablesWithInProcessOrders = await Order.distinct('table', {
      isDeleted: false,
      status: ORDER_STATUS.IN_PROCESS,
    });
    const totalTablesInProcess = tablesWithInProcessOrders.length;

    // 5. Top 4 popular products (based on total quantity sold in completed orders)
    const popularProductsResult = await Order.aggregate([
      {
        $match: {
          isDeleted: false,
          status: ORDER_STATUS.COMPLETED,
        },
      },
      {
        $unwind: '$products',
      },
      {
        $group: {
          _id: '$products.product',
          totalQuantity: { $sum: '$products.quantity' },
          totalRevenue: {
            $sum: {
              $multiply: [
                '$products.quantity',
                { $ifNull: ['$products.productSnapshot.price', 0] },
              ],
            },
          },
          productName: { $first: '$products.productSnapshot.name' },
          productImage: { $first: '$products.productSnapshot.image' },
          productPrice: { $first: '$products.productSnapshot.price' },
          productDescription: { $first: '$products.productSnapshot.description' },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: 4,
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: {
          path: '$productDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: {
            $ifNull: ['$productName', '$productDetails.name'],
          },
          image: {
            $ifNull: ['$productImage', '$productDetails.image'],
          },
          price: {
            $ifNull: ['$productPrice', '$productDetails.price'],
          },
          description: {
            $ifNull: ['$productDescription', '$productDetails.description'],
          },
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Format popular products
    const popularProducts = popularProductsResult.map((product) => ({
      _id: product._id,
      name: product.name || 'Unknown Product',
      image: product.image || '',
      price: product.price || 0,
      description: product.description || '',
      totalQuantity: product.totalQuantity || 0,
      totalRevenue: product.totalRevenue || 0,
    }));

    return sendResponse(
      res,
      'success',
      200,
      'Dashboard stats retrieved successfully',
      {
        todaySales,
        monthlyRevenue,
        totalTables,
        totalTablesInProcess,
        popularProducts,
      }
    );
  } catch (error) {
    console.error('Error retrieving dashboard stats:', error);
    return sendResponse(res, 'fail', 500, 'Error retrieving dashboard stats', null);
  }
};

const getSalesChartData = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query; // 'daily', 'weekly', 'monthly'
    const now = new Date();
    let startDate, endDate, groupFormat;
    const filledData = [];

    // Set date ranges and grouping based on period
    if (period === 'daily') {
      // Last 30 days
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };

      // Create map of all dates
      const dateMap = new Map();
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const displayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateMap.set(dateStr, { name: displayName, sales: 0, orders: 0, dateStr });
      }

      // Aggregate sales data
      const salesData = await Order.aggregate([
        {
          $match: {
            isDeleted: false,
            status: ORDER_STATUS.COMPLETED,
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: groupFormat,
            totalSales: { $sum: '$total_price' },
            count: { $sum: 1 },
          },
        },
      ]);

      // Update map with actual data
      salesData.forEach((item) => {
        if (dateMap.has(item._id)) {
          const existing = dateMap.get(item._id);
          existing.sales = item.totalSales || 0;
          existing.orders = item.count || 0;
        }
      });

      // Convert map to array and sort
      filledData.push(...Array.from(dateMap.values()));

    } else if (period === 'weekly') {
      // Last 12 weeks - including current week
      // Calculate current week's Monday
      const currentDayOfWeek = now.getDay();
      const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      const currentWeekMonday = new Date(now);
      currentWeekMonday.setDate(now.getDate() - daysToMonday);
      currentWeekMonday.setHours(0, 0, 0, 0);

      // Go back 11 weeks from current week (12 weeks total including current)
      startDate = new Date(currentWeekMonday);
      startDate.setDate(startDate.getDate() - 77); // 11 weeks * 7 days
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      // Create week map with proper week start dates (from oldest to newest)
      const weekMap = new Map();
      for (let i = 0; i < 12; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        // Format: "Jan 1 - 7" or "Dec 25 - Jan 1" for cross-month weeks
        const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const displayName = weekStart.getMonth() === weekEnd.getMonth() 
          ? `${weekStart.toLocaleDateString('en-US', { month: 'short' })} ${weekStart.getDate()} - ${weekEnd.getDate()}`
          : `${startMonth} - ${endMonth}`;
        
        const weekKey = weekStart.toISOString().split('T')[0];
        weekMap.set(weekKey, { 
          name: displayName, 
          sales: 0, 
          orders: 0, 
          weekKey,
          weekStart: new Date(weekStart),
          weekEnd: new Date(weekEnd),
          sortKey: weekKey
        });
      }

      // Aggregate sales data - calculate week start for each order date
      // Using $subtract with milliseconds to calculate Monday of the week
      const salesData = await Order.aggregate([
        {
          $match: {
            isDeleted: false,
            status: ORDER_STATUS.COMPLETED,
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $project: {
            total_price: 1,
            date: 1,
            // Calculate days to subtract to get to Monday (0 = Monday, 6 = Sunday)
            dayOfWeek: {
              $subtract: [
                { $dayOfWeek: '$date' },
                1
              ]
            },
          },
        },
        {
          $project: {
            total_price: 1,
            date: 1,
            // Calculate Monday by subtracting days in milliseconds
            daysToSubtract: {
              $cond: {
                if: { $eq: ['$dayOfWeek', 0] }, // If Sunday (dayOfWeek = 0 after subtraction)
                then: 6,
                else: '$dayOfWeek'
              }
            }
          }
        },
        {
          $project: {
            total_price: 1,
            weekStart: {
              $subtract: [
                '$date',
                { $multiply: ['$daysToSubtract', 24 * 60 * 60 * 1000] }
              ]
            }
          }
        },
        {
          $project: {
            total_price: 1,
            weekStartDate: {
              $dateToString: { format: '%Y-%m-%d', date: '$weekStart' }
            }
          }
        },
        {
          $group: {
            _id: '$weekStartDate',
            totalSales: { $sum: '$total_price' },
            count: { $sum: 1 },
          },
        },
      ]);

      // Update map with actual data
      salesData.forEach((item) => {
        if (weekMap.has(item._id)) {
          const existing = weekMap.get(item._id);
          existing.sales = item.totalSales || 0;
          existing.orders = item.count || 0;
        }
      });

      // Convert to array and sort by week key
      const sortedWeeks = Array.from(weekMap.values()).sort((a, b) => {
        return a.sortKey.localeCompare(b.sortKey);
      });
      filledData.push(...sortedWeeks);

    } else {
      // Monthly - Last 12 months (including current month)
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Create month map - properly create new date objects for each month
      const monthMap = new Map();
      for (let i = 11; i >= 0; i--) {
        // Go back i months from current month
        const targetMonth = currentMonth - i;
        let year = currentYear;
        let month = targetMonth;
        
        // Handle year rollover
        if (month < 0) {
          month += 12;
          year -= 1;
        }
        
        // Create a new date object for each month
        const date = new Date(year, month, 1);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const displayName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthMap.set(monthStr, { name: displayName, sales: 0, orders: 0, monthStr, sortKey: monthStr });
      }

      // Calculate start and end dates for query
      const firstMonthKey = Array.from(monthMap.keys()).sort()[0];
      const [firstYear, firstMonth] = firstMonthKey.split('-').map(Number);
      startDate = new Date(firstYear, firstMonth - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      // Aggregate sales data
      const salesData = await Order.aggregate([
        {
          $match: {
            isDeleted: false,
            status: ORDER_STATUS.COMPLETED,
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$date' }
            },
            totalSales: { $sum: '$total_price' },
            count: { $sum: 1 },
          },
        },
      ]);

      // Update map with actual data
      salesData.forEach((item) => {
        if (monthMap.has(item._id)) {
          const existing = monthMap.get(item._id);
          existing.sales = item.totalSales || 0;
          existing.orders = item.count || 0;
        }
      });

      // Convert map to array and ensure proper chronological order
      const sortedMonths = Array.from(monthMap.values()).sort((a, b) => {
        return a.sortKey.localeCompare(b.sortKey);
      });
      filledData.push(...sortedMonths);
    }

    return sendResponse(res, 'success', 200, 'Sales chart data retrieved successfully', filledData);
  } catch (error) {
    console.error('Error retrieving sales chart data:', error);
    return sendResponse(res, 'fail', 500, 'Error retrieving sales chart data', null);
  }
};

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

module.exports = {
  getAllOrders,
  addOrder,
  updateOrderStatus,
  payOrder,
  getOrderStats,
  getDashboardStats,
  getSalesChartData,
};
