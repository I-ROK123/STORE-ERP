// components/PaymentDialog.jsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { CreditCard, Banknote, Printer } from 'lucide-react';
  
  const PaymentDialog = ({ 
    open, 
    onOpenChange, 
    onPaymentComplete, 
    total 
  }) => {
    const handlePayment = async (method) => {
      await onPaymentComplete(method);
      
      // Show receipt confirmation
      if (confirm('Would you like to print a receipt?')) {
        // Trigger receipt printing
        onOpenChange(false);
      } else {
        onOpenChange(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center text-lg font-bold mb-4">
              Total: KSH {total.toFixed(2)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="w-full h-24 text-lg"
                onClick={() => handlePayment('M-Pesa')}
              >
                <div className="flex flex-col items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  M-Pesa
                </div>
              </Button>
              <Button 
                className="w-full h-24 text-lg"
                onClick={() => handlePayment('Cash')}
                variant="outline"
              >
                <div className="flex flex-col items-center gap-2">
                  <Banknote className="w-6 h-6" />
                  Cash
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default PaymentDialog;