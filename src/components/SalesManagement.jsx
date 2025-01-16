import React, { useState, useEffect } from 'react';
import {  Search, ShoppingCart, Printer, CreditCard, Loader2, Banknote, 
  TrendingUp, Package2, Users, CircleDollarSign, ArrowUpRight  } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import ReactDOM from 'react-dom';
import Receipt from './Receipt';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

const SalesManagement = () => {
  // State declarations
  const [recentSales, setRecentSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSale, setLastSale] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const [phoneError, setPhoneError] = useState('');


// SalesManagement.jsx
const validateAndFormatPhone = (phone) => {
  // Remove any non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Kenyan phone number
  if (cleaned.length === 9) {
    cleaned = '0' + cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Valid format already
  } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
    cleaned = '0' + cleaned.slice(3);
  } else {
    return false;
  }
  
  return cleaned;
};
const handleMpesaPayment = async () => {
  try {
    const formattedPhone = validateAndFormatPhone(phoneNumber);
    if (!formattedPhone) {
      setPhoneError('Please enter a valid phone number (e.g., 0712345678)');
      return;
    }
    setPhoneError('');
    setIsProcessingPayment(true);

    const response = await fetch('http://localhost:5000/api/mpesa/stkpush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        amount: total,
        orderId: Date.now().toString()
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.details || 'Payment failed');
    }

    alert('Please check your phone for the STK push notification');
    await completeSale('M-Pesa');
    setShowMpesaDialog(false);
    setShowReceiptDialog(true);
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed: ' + error.message);
  } finally {
    setIsProcessingPayment(false);
  }
};





  // Functions
  const fetchRecentSales = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sales');
      if (!response.ok) {
        throw new Error('Failed to fetch recent sales');
      }
      const data = await response.json();
      setRecentSales(data);
    } catch (err) {
      console.error('Error fetching recent sales:', err);
    }
  };

  const viewSaleDetails = (sale) => {
    try {
      const items = typeof sale.items === 'string' 
        ? JSON.parse(sale.items) 
        : sale.items;
      
      setSelectedSale({
        ...sale,
        items
      });
    } catch (err) {
      console.error('Error parsing sale items:', err);
    }
  };

  const printPastSale = (sale) => {
    try {
      const items = typeof sale.items === 'string' 
        ? JSON.parse(sale.items) 
        : sale.items;
      
      const saleData = {
        paymentMethod: sale.payment_method,
        transactionId: sale.id,
        timestamp: sale.created_at,
        items
      };
      
      printReceipt(saleData);
    } catch (err) {
      console.error('Error printing past sale:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchRecentSales();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      console.log('Fetched products:', data);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) return;

    const existingItem = cart.find(item => item.product_id === product.product_id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) return;
      
      setCart(cart.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        ...product,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    const updatedCart = [...cart];
    const product = products.find(p => p.product_id === updatedCart[index].product_id);
    
    if (newQuantity > 0 && newQuantity <= product.stock_quantity) {
      updatedCart[index].quantity = newQuantity;
      setCart(updatedCart);
    }
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const completeSale = async (paymentMethod) => {
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.product_id,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.unit_price)
        })),
        total: parseFloat(total),
        paymentMethod
      };
  
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete sale');
      }
  
      setLastSale({
        paymentMethod,
        transactionId: data.id,
        timestamp: new Date().toISOString()
      });
  
      setCart([]);
      await fetchProducts(); // Refresh products
      await fetchRecentSales(); // Refresh sales list
      
      return true; // Indicate success
    } catch (err) {
      console.error('Sale error details:', err);
      throw err; // Propagate error to be handled by caller
    }
  };

  const printReceipt = () => {
    if (!lastSale) return;

    const printWindow = window.open('', '_blank');
    const printContent = document.createElement('div');
    
    printContent.innerHTML = `
      <style>
        @page { 
          margin: 0; 
          size: 80mm 297mm;
        }
        body { 
          margin: 0.5cm;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }
        @media print {
          * { print-color-adjust: exact; }
        }
      </style>
    `;

    const tempContainer = document.createElement('div');
    const receiptComponent = React.createElement(Receipt, {
      sale: lastSale,
      cart: cart,
      total: total,
      user: {
        name: 'ADMIN'
      }
    });
    
    ReactDOM.render(receiptComponent, tempContainer);
    printContent.appendChild(tempContainer);
    printWindow.document.body.appendChild(printContent);
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = cart.reduce((sum, item) => {
    return sum + (parseFloat(item.unit_price) * parseInt(item.quantity));
  }, 0);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error loading products: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section with Stats */}
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <CircleDollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
                <p className="text-gray-500">Manage transactions and track sales</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-700">Live Updates</span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Package2 className="w-4 h-4 mr-2" />
              Manage Products
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Sales</p>
                  <h3 className="text-2xl font-bold text-gray-900">KSH {total.toFixed(2)}</h3>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>12% from yesterday</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Cart</p>
                  <h3 className="text-2xl font-bold text-gray-900">{cart.length} items</h3>
                  <p className="text-sm text-indigo-600">KSH {total.toFixed(2)} total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-purple-800" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Recent Sales</p>
                  <h3 className="text-2xl font-bold text-gray-900">{recentSales.length}</h3>
                  <p className="text-sm text-purple-800">Last 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <Package2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Products</p>
                  <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
                  <p className="text-sm text-green-600">{products.filter(p => p.stock_quantity > 0).length} in stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-4">
              <Input 
                placeholder="Search products or scan barcode..." 
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>

            <Card className="bg-white shadow-sm">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-semibold">Available Products</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                      <div 
                        key={`product-${product.product_id}`}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          product.stock_quantity > 0 
                            ? 'border-gray-200 hover:border-blue-400 cursor-pointer'
                            : 'border-red-200 opacity-50'
                        }`}
                        onClick={() => product.stock_quantity > 0 && addToCart(product)}
                      >
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-lg font-bold text-blue-900">
                          KSH {Number(product.unit_price).toFixed(2)}
                        </div>
                        <div className={`text-sm mt-2 ${
                          product.stock_quantity === 0 
                            ? 'text-red-500' 
                            : product.stock_quantity < 10 
                              ? 'text-orange-500'
                              : 'text-green-600'
                        }`}>
                          {product.stock_quantity === 0 
                            ? 'Out of Stock'
                            : `${product.stock_quantity} in stock`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart and Recent Sales Section */}
          <div className="space-y-6">
            {/* Current Cart */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <ShoppingCart className="w-5 h-5" />
                  Current Sale
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto divide-y">
                    {cart.map((item, index) => (
                      <div 
                        key={`cart-${item.product_id}-${index}`}
                        className="py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              KSH {Number(item.unit_price).toFixed(2)} × 
                              <input
                                type="number"
                                min="1"
                                max={item.stock_quantity}
                                value={item.quantity}
                                onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                                className="w-16 ml-2 px-2 py-1 border rounded"
                              />
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="font-medium text-gray-900">
                              KSH {(Number(item.unit_price) * Number(item.quantity)).toFixed(2)}
                            </div>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-750">KSH {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
        className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-black shadow-md
                   transition-all duration-200 relative overflow-hidden group"
        onClick={() => setShowPayment(true)}
        disabled={cart.length === 0}
      >
        <span className="flex items-center justify-center gap-2">
          {cart.length === 0 ? (
            'Add items to cart'
          ) : (
            <>
              Complete Sale
              <span className="text-sm opacity-75">
                (KSH {total.toFixed(2)})
              </span>
            </>
          )}
        </span>
      </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => viewSaleDetails(sale)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            KSH {Number(sale.total).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(sale.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            sale.payment_method === 'M-Pesa' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {sale.payment_method}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              printPastSale(sale);
                            }}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  
        {/* Payment Dialog */}

<Dialog open={showPayment} onOpenChange={setShowPayment}>
  <DialogContent className="bg-white max-w-sm">
    <DialogHeader>
      <DialogTitle className="text-xl text-center">Select Payment Method</DialogTitle>
    </DialogHeader>
    <div className="pt-4">
      <div className="text-center text-2xl font-bold mb-8">
        Total: KSH {total.toFixed(2)}
      </div>
      <div className="flex flex-col gap-4">
    {/*}  <Input
    type="tel"
    placeholder="Enter M-Pesa phone number"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
  />*/}
        <Button 
          className="w-full py-8 text-lg bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-600"
          onClick={()=> {
              setShowPayment(false);
              setShowMpesaDialog(true);
            }}          
        >
          <div className="flex items-center justify-center gap-3">
            <CreditCard className="w-6 h-6" />
            M-Pesa
          </div>
        </Button>

        <Button 
          className="w-full py-8 text-lg bg-white border-2 border-green-600 hover:bg-green-50 text-green-600"
          onClick={async () => {
            try {
              await completeSale('Cash');
              setShowPayment(false);
              setShowReceiptDialog(true);
            } catch (error) {
              alert('Payment failed: ' + error.message);
            }
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <Banknote className="w-6 h-6" />
            Cash
          </div>
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
  
        {/* Receipt Dialog */}
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Print Receipt</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center mb-6">Would you like to print a receipt for this transaction?</p>
              <DialogFooter>
                <div className="flex gap-4 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowReceiptDialog(false)}
                  >
                    No, Skip
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      printReceipt();
                      setShowReceiptDialog(false);
                    }}
                  >
                    Yes, Print
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
        {/* Sale Details Dialog */}
<Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
  <DialogContent className="bg-white">
    <DialogHeader>
      <DialogTitle>Sale Details</DialogTitle>
    </DialogHeader>
    {selectedSale && (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Date:</span>
          <span>{new Date(selectedSale.created_at).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Payment Method:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            selectedSale.payment_method === 'M-Pesa' 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-green-100 text-green-600'
          }`}>
            {selectedSale.payment_method}
          </span>
        </div>
        <div className="border-t pt-2">
          <div className="font-medium mb-2">Items:</div>
          <div className="space-y-2">
            {selectedSale.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>KSH {(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t pt-2 flex justify-between items-center font-bold">
          <span>Total:</span>
          <span>KSH {Number(selectedSale.total).toFixed(2)}</span>
        </div>
        <Button 
          className="w-full"
          onClick={() => printPastSale(selectedSale)}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Receipt
        </Button>
      </div>
    )}
  </DialogContent>
</Dialog>

{/* M-Pesa Payment Dialog */}
<Dialog open={showMpesaDialog} onOpenChange={setShowMpesaDialog}>
  <DialogContent className="bg-white max-w-sm">
    <DialogHeader>
      <DialogTitle className="text-xl text-center text-blue-500">M-Pesa Payment</DialogTitle>
    </DialogHeader>
    <div className="pt-4">
      <div className="text-center text-2xl font-bold mb-8">
        Total: KSH {total.toFixed(2)}
      </div>
      <div className="space-y-4">
      <div>
    <label className="text-sm font-medium">Enter M-Pesa Phone Number</label>
    <Input
      type="tel"
      placeholder="e.g., 0712345678"
      value={phoneNumber}
      onChange={(e) => {
        setPhoneNumber(e.target.value);
        setPhoneError('');
      }}
      className={`mt-1 ${phoneError ? 'border-red-500' : ''}`}
    />
    {phoneError && (
      <p className="text-sm text-red-500 mt-1">{phoneError}</p>
    )}
  </div>
        <Button 
          className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700 text-black"
          onClick={handleMpesaPayment}
          disabled={!phoneNumber || isProcessingPayment}
        >

          {isProcessingPayment ? 'Processing Payment...' : 'Pay Now'}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
      
    </div>
  );
};

export default SalesManagement;