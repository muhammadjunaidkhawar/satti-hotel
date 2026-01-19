import React, { useState } from 'react';
import CategoryManagement from '../components/settings/CategoryManagement';
import MenuManagement from '../components/settings/MenuManagement';
import TableManagement from '../components/settings/TableManagement';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('category');

  const tabs = [
    { id: 'category', label: 'Category', icon: 'fa-list' },
    { id: 'menu', label: 'Menu', icon: 'fa-utensils' },
    { id: 'table', label: 'Tables', icon: 'fa-table' },
  ];

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === tab.id ? 'text-[#FF9500] border-b-2 border-[#FF9500]' : 'text-gray-400 hover:text-white'}`}
          >
            <i className={`fa-solid ${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'category' && <CategoryManagement />}
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'table' && <TableManagement />}
      </div>
    </div>
  );
}
