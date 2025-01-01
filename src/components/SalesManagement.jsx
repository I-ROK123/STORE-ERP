import React, { useState } from 'react';

import { Search, ShoppingCart, Printer, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const SalesManagement = () => {
  const [cart, setCart] = useState([]);
  const [products] = useState([
    { id: 1, barcode: 'MLK001', name: 'Molo Milk', price: 120, stock: 50 },
    { id: 2, barcode: 'YGT001', name: 'Brookside Yoghurt', price: 85, stock: 30 }
  ]);
  const [recentSales] = useState([
    { id: 1, time: '10:30 AM', total: 450, items: 3, payment: 'M-Pesa' },
    { id: 2, time: '10:15 AM', total: 320, items: 2, payment: 'Cash' }
  ]);

  const addToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* POS Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex gap-4">
          <Input 
            placeholder="Scan barcode or search product..." 
            className="flex-1"
          />
          <Button>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <Card className="h-96 overflow-y-auto">
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(product => (
                <div 
                  key={product.id}
                  className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">KSH {product.price}</div>
                  <div className="text-sm text-gray-500">Stock: {product.stock}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Current Sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">KSH {item.price} x {item.quantity}</div>
                    </div>
                    <div className="font-medium">KSH {item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>KSH {total}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button className="w-full bg-blue-600">
                  <CreditCard className="w-4 h-4 mr-2" />
                  M-Pesa
                </Button>
                <Button className="w-full">
                  Cash
                </Button>
              </div>

              <Button className="w-full bg-gray-100 text-gray-700">
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">KSH {sale.total}</div>
                    <div className="text-sm text-gray-500">{sale.items} items - {sale.time}</div>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {sale.payment}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesManagement;