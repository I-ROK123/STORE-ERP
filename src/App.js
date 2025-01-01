import React from 'react';
import { useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { LayoutDashboard, Package, Receipt, Users, Settings } from 'lucide-react';
import InventoryManagement from './components/InventoryManagement';
import SalesManagement from './components/SalesManagement';


const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryManagement />;
      case 'sales':
        return <SalesManagement />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold">Total Sales</h2>
                  <p className="text-3xl mt-2">KSH 45,678</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold">Products</h2>
                  <p className="text-3xl mt-2">234</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold">Low Stock</h2>
                  <p className="text-3xl mt-2 text-red-600">12</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-6">Store ERP</h1>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 w-full p-2 rounded ${
                activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 w-full p-2 rounded ${
                activeTab === 'inventory' ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <Package className="w-5 h-5" />
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 w-full p-2 rounded ${
                activeTab === 'sales' ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <Receipt className="w-5 h-5" />
              Sales
            </button>
            <button
              className="flex items-center gap-2 w-full p-2 rounded"
            >
              <Users className="w-5 h-5" />
              Users
            </button>
            <button
              className="flex items-center gap-2 w-full p-2 rounded"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;