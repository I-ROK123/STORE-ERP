import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  Settings,
  Bell
} from 'lucide-react';

const ERPSystem = () => {
  const [notifications] = useState([
    { id: 1, message: 'Low stock alert: Molo Milk' },
    { id: 2, message: 'Daily sales target achieved' }
  ]);

  const salesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 4890 }
  ];

  const inventoryData = [
    { name: 'Milk', stock: 150 },
    { name: 'Yoghurt', stock: 80 },
    { name: 'Powder', stock: 40 }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Store ERP</h1>
          <div className="flex gap-4 items-center">
            <Bell className="text-gray-600" />
            <div className="relative">
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {notifications.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-lg p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <LayoutDashboard className="text-blue-600" />
              <span className="font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-2 p-2">
              <Package />
              <span>Inventory</span>
            </div>
            <div className="flex items-center gap-2 p-2">
              <Receipt />
              <span>Sales</span>
            </div>
            <div className="flex items-center gap-2 p-2">
              <Users />
              <span>Users</span>
            </div>
            <div className="flex items-center gap-2 p-2">
              <Settings />
              <span>Settings</span>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Line type="monotone" dataKey="sales" stroke="#3b82f6" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={inventoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="stock" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ERPSystem;