import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, CreditCard, ShieldCheck, Smartphone, Landmark } from 'lucide-react';
import { cn } from '../utils/cn';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
  price: string;
  onSuccess: (method: string) => void;
}

const paymentMethods = [
  { id: 'mpesa', name: 'M-PESA', icon: Smartphone, color: 'bg-green-500' },
  { id: 'airtel', name: 'AIRTEL MONEY', icon: Smartphone, color: 'bg-red-500' },
  { id: 'tcash', name: 'T-CASH', icon: Smartphone, color: 'bg-blue-500' },
  { id: 'equity', name: 'EQUITY', icon: Landmark, color: 'bg-orange-500' },
  { id: 'card', name: 'VISA / MASTERCARD', icon: CreditCard, color: 'bg-earth-800' },
];

export default function PaymentModal({ isOpen, onClose, tier, price, onSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(selectedMethod);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-earth-900/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-earth-50 p-6 border-b border-earth-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-black text-earth-900 uppercase tracking-tight">Complete Payment</h3>
                <p className="text-xs text-earth-500 font-bold uppercase tracking-widest">Upgrade to {tier.toUpperCase()}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-earth-200 rounded-xl transition-all text-earth-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              {/* Amount Summary */}
              <div className="flex items-center justify-between p-5 bg-primary-50 rounded-2xl border border-primary-100">
                <div>
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Total to Pay</p>
                  <p className="text-2xl font-black text-earth-900">{price} KSH</p>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl text-[10px] font-black text-primary-600 uppercase tracking-widest border border-primary-200">
                  Monthly Billing
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-4">Select Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left group",
                        selectedMethod === method.id 
                          ? "border-primary-500 bg-primary-50/50" 
                          : "border-earth-100 hover:border-earth-200"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg", method.color)}>
                        <method.icon size={20} />
                      </div>
                      <span className={cn("text-xs font-black uppercase tracking-widest", selectedMethod === method.id ? "text-primary-700" : "text-earth-600")}>
                        {method.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedMethod !== 'card' ? (
                  <div>
                    <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Phone Number / Account ID</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold"
                      placeholder="e.g. 0712 345 678"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                    />
                    <p className="mt-2 text-[10px] text-earth-400 font-medium">You will receive a prompt on your device to authorize the payment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Card Number</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          className="w-full px-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold"
                          placeholder="0000 0000 0000 0000"
                        />
                        <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 text-earth-300" size={20} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold"
                        placeholder="MM / YY"
                      />
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold"
                        placeholder="CVC"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-5 bg-primary-500 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-primary-600 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Lock size={20} />
                      Pay {price} KSH
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 bg-earth-50 border-t border-earth-100 flex flex-col items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-black text-earth-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-500" />
                Secure SSL Encrypted Payment
              </div>
              <div className="flex gap-4 opacity-40 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
