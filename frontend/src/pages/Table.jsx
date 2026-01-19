import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Table() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/tables');
      setTables(res.data || []);
    } catch (err) {
      console.error('fetch tables error:', err);
      // Mock data for development
      setTables([
        { _id: '1', tableNumber: 1, status: 'Available', capacity: 4 },
        { _id: '2', tableNumber: 2, status: 'Occupied', capacity: 2 },
        { _id: '3', tableNumber: 3, status: 'Reserved', capacity: 6 },
        { _id: '4', tableNumber: 4, status: 'Available', capacity: 4 },
        { _id: '5', tableNumber: 5, status: 'Occupied', capacity: 2 },
        { _id: '6', tableNumber: 6, status: 'Available', capacity: 8 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'Occupied':
        return 'bg-red-500';
      case 'Reserved':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Available':
        return 'text-green-400';
      case 'Occupied':
        return 'text-red-400';
      case 'Reserved':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="p-6">
      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-white py-8">
            Loading tables...
          </div>
        ) : tables.length === 0 ? (
          <div className="col-span-full text-center text-white py-8">
            No tables found
          </div>
        ) : (
          tables.map((table) => (
            <div
              key={table._id}
              className={`bg-[#2a2a2a] rounded-xl p-6 cursor-pointer hover:bg-[#3a3a3a] transition-colors border-2 ${
                table.status === 'Available'
                  ? 'border-green-500'
                  : table.status === 'Occupied'
                  ? 'border-red-500'
                  : 'border-yellow-500'
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full ${getStatusColor(
                    table.status
                  )} flex items-center justify-center mb-3`}
                >
                  <i className="fa-solid fa-table text-white text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Table {table.tableNumber}
                </h3>
                <p
                  className={`text-sm font-medium mb-2 ${getStatusTextColor(
                    table.status
                  )}`}
                >
                  {table.status}
                </p>
                <p className="text-xs text-gray-400">
                  Capacity: {table.capacity} guests
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Tables</p>
              <p className="text-white text-2xl font-bold">
                {tables.length}
              </p>
            </div>
            <i className="fa-solid fa-table text-[#FF9500] text-2xl"></i>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Available</p>
              <p className="text-green-400 text-2xl font-bold">
                {tables.filter((t) => t.status === 'Available').length}
              </p>
            </div>
            <i className="fa-solid fa-check-circle text-green-400 text-2xl"></i>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Occupied</p>
              <p className="text-red-400 text-2xl font-bold">
                {tables.filter((t) => t.status === 'Occupied').length}
              </p>
            </div>
            <i className="fa-solid fa-times-circle text-red-400 text-2xl"></i>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Reserved</p>
              <p className="text-yellow-400 text-2xl font-bold">
                {tables.filter((t) => t.status === 'Reserved').length}
              </p>
            </div>
            <i className="fa-solid fa-clock text-yellow-400 text-2xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
