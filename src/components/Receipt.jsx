import React from 'react';

const Receipt = React.forwardRef(({ sale, cart, total, storeDetails = {}, user }, ref) => {
  const today = new Date();
  const saleId = `SALE#${Math.floor(Math.random() * 100000)}`;
  const transactionId = `TA${Math.floor(Math.random() * 10000000)}`;
  
  // Default store details
  const defaultStoreDetails = {
    name: "STORE ERP SUPERMARKET",
    address: "MOMBASA ROAD",
    poBox: "P.O. BOX 123, NAIROBI",
    phone: "0712345678",
    pin: "P051234567Z",
    tillNumber: "654321"
  };

  // Merge provided store details with defaults
  const store = { ...defaultStoreDetails, ...storeDetails };

  // Ensure price values are numbers
  const formattedCart = cart.map(item => ({
    ...item,
    price: Number(item.price),
    quantity: Number(item.quantity)
  }));

  return (
    <div ref={ref} className="p-8 bg-white max-w-[300px] mx-auto text-sm font-mono">
      {/* Store Header */}
      <div className="text-center mb-4">
        <h2 className="font-bold text-lg">{store.name}</h2>
        <p>{store.address}</p>
        <p>{store.poBox}</p>
        <p>Tel: {store.phone}</p>
        <p>PIN: {store.pin}</p>
        {sale.paymentMethod === 'M-Pesa' && (
          <p>BUY GOODS {store.tillNumber}</p>
        )}
      </div>

      {/* Sale Info */}
      <div className="border-t border-b border-dashed py-2 mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span>{saleId}</span>
          <span>{today.toLocaleString()}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="mb-4">
        <div className="flex justify-between font-bold mb-2 text-xs">
          <span>ITEM (QTY)</span>
          <span>PRICE</span>
          <span>TOTAL</span>
        </div>

        {formattedCart.map((item, index) => (
          <div key={index} className="flex justify-between mb-1 text-xs">
            <span className="flex-1">{item.name} ({item.quantity})</span>
            <span className="w-20 text-right">{Number(item.price).toFixed(2)}</span>
            <span className="w-20 text-right">
              {(Number(item.price) * Number(item.quantity)).toFixed(2)}
            </span>
          </div>
        ))}

        {/* Totals */}
        <div className="border-t border-dashed mt-2 pt-2">
          <div className="flex justify-between font-bold">
            <span>Item(s): {formattedCart.reduce((sum, item) => sum + Number(item.quantity), 0)}</span>
            <span>TOTAL: {Number(total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="border-t border-b border-dashed py-2 mb-4">
        <div className="font-bold mb-1">Transaction Details</div>
        <div className="flex justify-between text-xs">
          <span>PAY MODE:</span>
          <span>{sale.paymentMethod}</span>
        </div>
        {sale.paymentMethod === 'M-Pesa' && (
          <>
            <div className="flex justify-between text-xs">
              <span>TRANS NO:</span>
              <span>{transactionId}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs">
        <p>YOU WERE SERVED BY: {user?.name || 'ADMIN'}</p>
        <p className="mt-4">Thank you for shopping with us!</p>
        <p className="text-[10px] mt-2">Powered by Store ERP</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;