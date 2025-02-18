import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Printer, CreditCard, Loader2, Banknote } from 'lucide-react';
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6" style={{ height: "calc(100vh - 2rem)" }}>
      {/* Products Section */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex gap-4">
          <Input 
            placeholder="Scan barcode or search product..." 
            className="flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button>
            <Search className="w-4 h-4" />
          </Button>
        </div>
        
  
        <Card className="flex-1 min-h-0">
          <CardHeader className="border-b">
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)] overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div 
                    key={`product-${product.product_id}`}
                    className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => product.stock_quantity > 0 && addToCart(product)}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      KSH {Number(product.unit_price).toFixed(2)}
                    </div>
                    <div className={`text-sm ${product.stock_quantity === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      Stock: {product.stock_quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  
      {/* Cart and Recent Sales Section */}
      <div className="flex flex-col space-y-6">
        {/* Cart Card */}
        <Card className="flex-1 h-64">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Current Sale
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <div className="space-y-4">
              <div className=" h-64 overflow-y-auto" >
                {cart.map((item, index) => (
                  <div 
                    key={`cart-${item.product_id}-${index}`}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        KSH {Number(item.unit_price).toFixed(2)} x 
                        <input
                          type="number"
                          min="1"
                          max={item.stock_quantity}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                          className="w-16 ml-2 px-1 border rounded"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-medium">
                        KSH {(Number(item.unit_price) * Number(item.quantity)).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(index)}
                        className="text-red-500"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
  
              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>KSH {total.toFixed(2)}</span>
                </div>
              </div>

              {/* check out button*/}
              <Button 
                className="w-full h-12 text-lg bg-blue-600"
                onClick={() => setShowPayment(true)}
                disabled={cart.length === 0}
              >
                Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
  
        {/* Recent Sales Card */}
        <Card className="flex-1 min-h-0">
          <CardHeader className="border-b">
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)] overflow-auto">
            <div className="space-y-2">
              {recentSales.map((sale) => {
                const itemsCount = Array.isArray(sale.items) 
                  ? sale.items.length 
                  : (typeof sale.items === 'string' 
                    ? JSON.parse(sale.items).length 
                    : 0);
  
                return (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => viewSaleDetails(sale)}
                  >
                    <div>
                      <div className="font-medium">KSH {Number(sale.total).toFixed(2)}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(sale.created_at).toLocaleString()} • {itemsCount} items
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm px-2 py-1 rounded ${
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
                );
              })}
            </div>
          </CardContent>
        </Card>
  
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
    </div>
  );
};

export default SalesManagement;