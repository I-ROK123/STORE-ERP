import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

import { Plus, Search, Filter, Download } from 'lucide-react';

import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const InventoryManagement = () => {
  const [inventory] = useState([
    { id: 1, barcode: 'MLK001', category: 'Dairy', subCategory: 'Milk', brand: 'Molo', quantity: 50, threshold: 20, price: 120 },
    { id: 2, barcode: 'YGT001', category: 'Dairy', subCategory: 'Yoghurt', brand: 'Brookside', quantity: 30, threshold: 15, price: 85 }
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Button className="bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input placeholder="Search products..." className="flex-1" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select className="w-full p-2 border rounded">
                <option>All Categories</option>
                <option>Dairy</option>
                <option>Beverages</option>
              </select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select className="w-full p-2 border rounded">
                <option>All Brands</option>
                <option>Molo</option>
                <option>Brookside</option>
              </select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Button className="w-full bg-gray-100 text-gray-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Barcode</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sub-Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Brand</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Threshold</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price (KSH)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{item.barcode}</td>
                    <td className="px-4 py-3 text-sm">{item.category}</td>
                    <td className="px-4 py-3 text-sm">{item.subCategory}</td>
                    <td className="px-4 py-3 text-sm">{item.brand}</td>
                    <td className={`px-4 py-3 text-sm ${item.quantity <= item.threshold ? 'text-red-600' : ''}`}>
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.threshold}</td>
                    <td className="px-4 py-3 text-sm">{item.price}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-sm ${
                        item.quantity <= item.threshold ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.quantity <= item.threshold ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;