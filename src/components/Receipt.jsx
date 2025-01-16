import React from 'react';

const Receipt = React.forwardRef(({ sale, cart, total, storeDetails = {}, user }, ref) => {
  const today = new Date();
  const saleId = `TM${Math.floor(Math.random() * 100000)}`;
  const transactionId = sale?.transactionId || `TA${Math.floor(Math.random() * 10000000)}`;

  // Default store details matching the image
  const defaultStoreDetails = {
    name: "TOUCHMART SUPERMARKET",
    address: "MURRAM, GATUNDU ROAD",
    poBox: "P.O. Box 37498-00100 KIAMBU",
    phone: "0704463366",
    pin: "P05174935PC",
    tillNumber: "752104"
  };

  // Merge provided store details with defaults
  const store = { ...defaultStoreDetails, ...storeDetails };

  // Format cart items to ensure proper number handling
  const formattedCart = cart.map(item => ({
    ...item,
    unit_price: Number(item.unit_price),
    quantity: Number(item.quantity)
  }));

  return (
    <div ref={ref} className="p-4 bg-white max-w-[300px] mx-auto text-sm font-mono leading-tight">
      {/* Store Header */}
      <div className="text-center mb-4">
        <h2 className="font-bold text-base">{store.name}</h2>
        <p className="text-xs">{store.address}</p>
        <p className="text-xs">{store.poBox}</p>
        <p className="text-xs">Tel: {store.phone}</p>
        <p className="text-xs">PIN: {store.pin}</p>
        <p className="text-xs">BUY GOODS: {store.tillNumber}</p>
      </div>

      {/* Barcode Section */}
      <div className="text-center mb-4">
        <div className="h-8 w-48 mx-auto bg-gray-800"></div>
      </div>

      {/* Sale Info */}
      <div className="border-t border-dotted pt-2 mb-4 text-xs">
        <div className="flex justify-between">
          <span>SALE #: {saleId}</span>
          <span>TILL: TILL1</span>
        </div>
        <div className="flex justify-between">
          <span>Date: {today.toLocaleString()}</span>
          <span>Client: </span>
        </div>
      </div>

      {/* Items Header */}
      <div className="border-t border-dotted pt-2">
        <div className="flex justify-between text-xs">
          <span>ITEM [QTY]</span>
          <span>PRICE</span>
          <span>TOTAL</span>
        </div>
      </div>

      {/* Items List */}
      <div className="mb-4">
        {formattedCart.map((item, index) => (
          <div key={index} className="flex justify-between text-xs">
            <div className="flex-1">
              {item.name}
              <div>1 pcs x {item.unit_price.toFixed(2)}</div>
            </div>
            <span className="ml-4">{(item.unit_price * item.quantity).toFixed(2)} $</span>
          </div>
        ))}

        {/* Totals */}
        <div className="border-t border-dotted mt-2 pt-2">
          <div className="flex justify-between text-xs">
            <span>Item(s): {formattedCart.length}</span>
            <span>TOTAL:</span>
            <span>{total.toFixed(2)}</span>
          </div>
          {sale.paymentMethod === 'M-Pesa' && (
            <div className="flex justify-between text-xs">
              <span></span>
              <span>MPESA:</span>
              <span>{total.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details */}
      <div className="border-t border-dotted pt-2 mb-4">
        <p className="text-center text-xs mb-2">*****Transaction Details*****</p>
        <div className="text-xs">
          <div className="flex justify-between">
            <span>PAY MODE:</span>
            <span>{sale.paymentMethod || 'Mobile Payment'}</span>
          </div>
          <div className="flex justify-between">
            <span>PAID BY:</span>
            <span>{transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span>TRANS NO:</span>
            <span>{transactionId}</span>
          </div>
        </div>
      </div>

      {/* VAT Section */}
      <div className="border-t border-dotted pt-2 mb-4">
        <div className="flex justify-between text-xs">
         {/* <span>TAX CODE</span>
          <span>B.VAT</span>
          <span>VATABLE AMT</span>
          <span>VAT AMT</span>*/}
        </div>
        <div className="flex justify-between text-xs">
          <span>[S]</span>
          <span>{total.toFixed(2)}</span>
          <span>{(total * 0.86).toFixed(2)}</span>
          <span>{(total * 0.14).toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs space-y-1">
        <p>YOU WERE SERVED BY:{user?.name || 'TRACYVERL'}</p>
        <p>GOODS ONCE SOLD ARE NOT RETURNABLE</p>
        <p>SHOPPING WITH A TOUCH</p>
        <div className="text-[10px] mt-4">
          <p>Developed by: Tech Bros</p>
          <p>For Software Queries: 0797557110</p>
        </div>
      </div>

      {/* QR Code Placeholder */}
      <div className="mt-4 flex justify-center">
        <div className="h-24 w-24 bg-gray-800"></div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;