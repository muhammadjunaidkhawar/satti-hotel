import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { saveAs } from 'file-saver';
import { useDashboardStatsQuery, useSalesChartDataQuery } from '../api/order.api';
import { API_BASE_URL } from '../constants/env';
import { useNavigate } from 'react-router-dom';


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Monthly');
  const [exportOpen, setExportOpen] = useState(false);
  const [miniCard, setMiniCard] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();


  // Fetch dashboard stats
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardStatsQuery();
  const stats = dashboardData?.result || {
    todaySales: 0,
    monthlyRevenue: 0,
    totalTables: 0,
    totalTablesInProcess: 0,
    popularProducts: [],
  };

  const openMiniCard = (type) => {
    setMiniCard(type);
  };

  // Map activeTab to API period parameter
  const getPeriodParam = () => {
    const periodMap = {
      Monthly: 'monthly',
      Weekly: 'weekly',
      Daily: 'daily',
    };
    return periodMap[activeTab] || 'monthly';
  };

  // Fetch chart data based on active tab
  const { data: chartDataResponse, isLoading: chartLoading } = useSalesChartDataQuery(getPeriodParam(), {
    enabled: true,
    refetchOnWindowFocus: false,
  });

  const chartData = chartDataResponse?.result || [];

  // Format currency
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'Rs0';
    if (value >= 1000) return `Rs${(value / 1000).toFixed(1)}k`;
    return `Rs${value.toFixed(2)}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get current date for display
  const currentDate = formatDate(new Date());

  // Get month range for display
  const getMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${startOfMonth.getDate()} ${startOfMonth.toLocaleDateString('en-US', { month: 'short' })} - ${endOfMonth.getDate()} ${endOfMonth.toLocaleDateString('en-US', { month: 'short' })}`;
  };

  const handleExport = (type) => {
    setExportOpen(false);

    if (type === 'CSV') {
      exportToCSV();
    } else {
      // PDF and EXCEL can be implemented later
      alert(`${type} export will be implemented soon`);
    }
  };

  const exportToCSV = () => {
    if (!chartData || chartData.length === 0) {
      alert('No data available to export');
      return;
    }

    // Get period label based on active tab
    const periodLabel = activeTab === 'Daily' ? 'Date' : activeTab === 'Weekly' ? 'Week' : 'Month';

    // Create CSV content
    const headers = [periodLabel, 'Total Sales ($)'];
    const rows = chartData.map((item) => [item.name, item.sales.toFixed(2)]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `sales-report-${activeTab.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName);
  };

  return (
    <div>
      <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-xl">
        {/* Slider Wrapper */}
        <div className="absolute top-0 left-0 w-[300%] h-full flex animate-slide-pause">
          {/* Three images in a row */}
          {[
            "https://images.pexels.com/photos/2725744/pexels-photo-2725744.jpeg?cs=srgb&dl=pexels-enginakyurt-2725744.jpg&fm=jpg",
            "https://images.pexels.com/photos/2725744/pexels-photo-2725744.jpeg?cs=srgb&dl=pexels-enginakyurt-2725744.jpg&fm=jpg",
            "https://images.pexels.com/photos/2725744/pexels-photo-2725744.jpeg?cs=srgb&dl=pexels-enginakyurt-2725744.jpg&fm=jpg",
          ].map((url, i) => (
            <div
              key={i}
              className="w-full flex-shrink-0 h-full bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
          <h1 className="text-3xl md:text-5xl font-bold text-[#FF9500] mb-2">Welcome to POS Dashboard</h1>
          <p className="text-gray-300 text-lg md:text-xl mb-6">Manage sales, tables, and products efficiently</p>
        </div>
      </div>

      {/* Add this CSS in your global CSS or tailwind config */}
      <style>
        {`
  @keyframes slidePause {
    0% { transform: translateX(0%); }
    20% { transform: translateX(0%); }      /* stay on first image */
    33% { transform: translateX(-100%); }   /* move to second */
    53% { transform: translateX(-100%); }   /* stay on second image */
    66% { transform: translateX(-200%); }   /* move to third */
    86% { transform: translateX(-200%); }   /* stay on third image */
    100% { transform: translateX(0%); }     /* loop back to first */
  }
  .animate-slide-pause {
    animation: slidePause 15s ease-in-out infinite;
  }
`}
      </style>


      {miniCard && (
        <div
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 
      ${isClosing ? 'animate-fade-out' : 'animate-fade'}`}
        >
          <div
            className={`bg-[#1E1E1E] p-6 rounded-xl shadow-xl w-[400px] border-2 border-[#FF9500]
        ${isClosing ? 'animate-pop-out' : 'animate-pop'}`}
          >
            <h2 className="text-xl font-semibold mb-4 text-white">
              {miniCard === 'daily' && 'Daily Sales Details'}
              {miniCard === 'monthly' && 'Monthly Revenue Details'}
              {miniCard === 'table' && 'Table Occupancy Details'}
            </h2>

            {/* TABLE DESIGN */}
            <table className="w-full text-left text-gray-300 text-sm mb-4">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {miniCard === 'daily' && (
                  <>
                    <tr>
                      <td className="py-2">Sales Today</td>
                      <td>{formatCurrency(stats.todaySales)}</td>
                    </tr>
                    <tr>
                      <td className="py-2">Date</td>
                      <td>{currentDate}</td>
                    </tr>
                  </>
                )}

                {miniCard === 'monthly' && (
                  <>
                    <tr>
                      <td className="py-2">Total Revenue</td>
                      <td>{formatCurrency(stats.monthlyRevenue)}</td>
                    </tr>
                    <tr>
                      <td className="py-2">Period</td>
                      <td>{getMonthRange()}</td>
                    </tr>
                  </>
                )}

                {miniCard === 'table' && (
                  <>
                    <tr>
                      <td className="py-2">Occupied Tables</td>
                      <td>{stats.totalTablesInProcess}</td>
                    </tr>
                    <tr>
                      <td className="py-2">Total Tables</td>
                      <td>{stats.totalTables}</td>
                    </tr>
                    <tr>
                      <td className="py-2">Available Tables</td>
                      <td>{stats.totalTables - stats.totalTablesInProcess}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            <button
              onClick={() => {
                setIsClosing(true);
                setTimeout(() => {
                  setMiniCard(null);
                  setIsClosing(false);
                }, 250); // same as animation duration
              }}
              className="w-full bg-[#FF9500] py-2 rounded-lg font-bold text-black hover:bg-[#e88a00]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Top Stats -> now buttons with inline sparkline */}
      {/* Add mt-10 to add spacing from landing page */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-10">
        {/* Daily Sales */}
        <button
          onClick={() => openMiniCard('daily')}
          className="bg-[#1E1E1E] rounded-xl p-6 shadow flex justify-between items-start hover:bg-[#252525] transition duration-300"
        >
          {/* Left info */}
          <div className="text-left">
            <h3 className="text-[#FF9500] text-sm font-medium">Daily Sales</h3>
            <p className="text-3xl md:text-4xl font-bold mt-2 text-white">
              {dashboardLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : formatCurrency(stats.todaySales)}
            </p>
            <p className="text-xs text-gray-400 mt-2">{currentDate}</p>
          </div>


          {/* Right icon & mini bars */}
          <div className="flex flex-col items-center">
            <div className="bg-[#FF9500] text-black p-3 rounded-full mb-2 text-xl flex items-center justify-center">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
            <div className="grid grid-cols-6 gap-1 mt-4">
              {[3, 5, 4, 6, 7, 8].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded bg-green-400"
                  style={{ height: `${h * 4}px` }}
                ></div>
              ))}
            </div>
          </div>
        </button>

        {/* Monthly Revenue */}
        <button
          onClick={() => openMiniCard('monthly')}
          className="bg-[#1E1E1E] rounded-xl p-6 shadow flex justify-between items-start hover:bg-[#252525] transition duration-300"
        >
          <div className="text-left">
            <h3 className="text-[#FF9500] text-sm font-medium">Monthly Revenue</h3>
            <p className="text-3xl md:text-4xl font-bold mt-2 text-white">
              {dashboardLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : formatCurrency(stats.monthlyRevenue)}
            </p>
            <p className="text-xs text-gray-400 mt-2">{getMonthRange()}</p>
          </div>


          <div className="flex flex-col items-center">
            <div className="bg-[#FF9500] text-black p-3 rounded-full mb-2 text-xl flex items-center justify-center">
              <i className="fa-solid fa-money-bill-wave"></i>
            </div>
            <div className="grid grid-cols-6 gap-1 mt-4">
              {[4, 6, 5, 7, 8, 9].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded bg-green-400"
                  style={{ height: `${h * 4}px` }}
                ></div>
              ))}
            </div>
          </div>
        </button>

        {/* Table Occupancy */}
        <button
          onClick={() => openMiniCard('table')}
          className="bg-[#1E1E1E] rounded-xl p-6 shadow flex justify-between items-start hover:bg-[#252525] transition duration-300"
        >
          <div className="text-left">
            <h3 className="text-[#FF9500] text-sm font-medium">Table Occupancy</h3>
            <p className="text-xl md:text-2xl font-bold mt-2 text-white">
              {dashboardLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : `${stats.totalTablesInProcess}/${stats.totalTables} Tables`}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {stats.totalTables > 0
                ? `${Math.round((stats.totalTablesInProcess / stats.totalTables) * 100)}% Occupied`
                : 'No tables'}
            </p>
          </div>


          <div className="flex flex-col items-center">
            <div className="bg-[#FF9500] text-black p-3 rounded-full mb-2 text-xl flex items-center justify-center">
              <i className="fa-solid fa-utensils"></i>
            </div>
            <div className="grid grid-cols-6 gap-1 mt-4">
              {[2, 4, 3, 5, 7, 8].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded bg-green-400"
                  style={{ height: `${h * 4}px` }}
                ></div>
              ))}
            </div>
          </div>
        </button>
      </div>


      {/* Popular Products - Single Card with 2 products per row */}
      <div className="mb-6">
        <div className="p-4 bg-[#2a2a2a] rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Popular Products</h3>
            <a href="#" className="text-[#FF9500] text-sm hover:underline">
              See All
            </a>
          </div>

          {dashboardLoading ? (
            <div className="flex items-center justify-center py-12">
              <i className="fa-solid fa-spinner fa-spin text-2xl text-[#FF9500]"></i>
            </div>
          ) : stats.popularProducts && stats.popularProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.popularProducts.map((product) => (
                <div key={product._id} onClick={() => navigate('/menu')} className="flex justify-between items-center p-3 bg-[#1a1a1a] rounded-lg border border-gray-700 hover:border-[#FF9500]/50 transition-colors">
                  {/* Product image + name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={
                        product.image
                          ? product.image.startsWith('http')
                            ? product.image
                            : `${API_BASE_URL}/uploads/${product.image}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'Product')}&background=FF9500&color=000&size=64`
                      }
                      alt={product.name}
                      className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'Product')}&background=FF9500&color=000&size=64`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{product.name}</div>
                      <div className="text-xs text-gray-400">Sold: {product.totalQuantity} units</div>
                      <div className="text-xs text-[#FF9500] font-medium">Revenue: {formatCurrency(product.totalRevenue)}</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right ml-3">
                    <div className="text-sm font-semibold text-white">{formatCurrency(product.price)}</div>
                    <div className="text-xs text-gray-400">per unit</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <i className="fa-solid fa-box-open text-3xl mb-2"></i>
              <p>No popular products available</p>
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-4 bg-[#2a2a2a] rounded-xl shadow relative">
        <div className="flex justify-between items-center mb-4">
          <div className="space-x-2">
            {['Monthly', 'Daily', 'Weekly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-sm ${activeTab === tab ? 'bg-[#FF9500] text-white' : 'bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Export with dropdown */}
          <div className="relative">
            <button onClick={() => setExportOpen((p) => !p)} className="text-sm bg-[#FF9500] px-3 py-1 rounded-md hover:bg-orange-600">
              Export
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-2 bg-[#2a2a2a] border border-gray-700 rounded shadow z-20 w-40">
                <button onClick={() => handleExport('CSV')} className="w-full text-left px-4 py-2 hover:bg-white/5">
                  CSV
                </button>
                <button onClick={() => handleExport('PDF')} className="w-full text-left px-4 py-2 hover:bg-white/5">
                  PDF
                </button>
                <button onClick={() => handleExport('EXCEL')} className="w-full text-left px-4 py-2 hover:bg-white/5">
                  EXCEL
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        {chartLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-[#FF9500]"></i>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-gray-400">
            <div className="text-center">
              <i className="fa-solid fa-chart-line text-4xl mb-2"></i>
              <p>No sales data available for this period</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="name"
                stroke="#aaa"
                tick={{ fill: '#aaa', fontSize: 11 }}
                angle={activeTab === 'Daily' ? -45 : -30}
                textAnchor="end"
                height={activeTab === 'Daily' ? 80 : 60}
                interval={activeTab === 'Daily' ? 2 : 0}
              />
              <YAxis
                stroke="#aaa"
                tick={{ fill: '#aaa', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
                  return `$${value}`;
                }}
                width={80}
                label={{
                  value: 'Sales ($)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#aaa', fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '10px',
                }}
                formatter={(value, name) => {
                  if (name === 'sales') {
                    return [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Total Sales'];
                  }
                  return [value, name];
                }}
                labelStyle={{ color: '#FF9500', fontWeight: 'bold', marginBottom: '5px' }}
              />
              <Legend wrapperStyle={{ color: '#aaa', paddingTop: '20px' }} iconType="line" formatter={(value) => <span style={{ color: '#aaa' }}>{value}</span>} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#FF9500"
                strokeWidth={3}
                dot={{ fill: '#FF9500', r: 4, strokeWidth: 2, stroke: '#1a1a1a' }}
                activeDot={{ r: 7, stroke: '#FF9500', strokeWidth: 2 }}
                name="Total Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
