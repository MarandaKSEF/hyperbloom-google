import React from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { cn } from '../utils/cn';

interface PricingCardProps {
  tier: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  onUpgrade: (tier: string) => void;
}

export default function PricingCard({ tier, price, features, isPopular, onUpgrade }: PricingCardProps) {
  const getIcon = () => {
    switch (tier.toLowerCase()) {
      case 'free': return <Zap size={24} className="text-earth-400" />;
      case 'pro': return <Star size={24} className="text-primary-500" />;
      case 'elite': return <Crown size={24} className="text-accent-500" />;
      default: return <Zap size={24} />;
    }
  };

  const getColor = () => {
    switch (tier.toLowerCase()) {
      case 'free': return 'from-earth-50 to-earth-100 border-earth-200';
      case 'pro': return 'from-primary-50 to-primary-100 border-primary-200';
      case 'elite': return 'from-accent-50 to-accent-100 border-accent-200';
      default: return 'from-earth-50 to-earth-100 border-earth-200';
    }
  };

  return (
    <div className={cn(
      "relative flex flex-col p-8 rounded-[3rem] border-2 transition-all hover:scale-[1.02] hover:shadow-2xl",
      isPopular ? "bg-white border-primary-500 shadow-xl scale-105 z-10" : "bg-white border-earth-100 shadow-sm",
      isPopular && "after:content-['MOST_POPULAR'] after:absolute after:-top-4 after:left-1/2 after:-translate-x-1/2 after:px-4 after:py-1 after:bg-primary-500 after:text-white after:text-[10px] after:font-black after:rounded-full after:tracking-widest"
    )}>
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br", getColor())}>
        {getIcon()}
      </div>
      
      <h3 className="text-2xl font-black text-earth-900 mb-2 capitalize">{tier}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-black text-earth-900">{price}</span>
        <span className="text-sm font-bold text-earth-400 uppercase tracking-widest">KSH / Month</span>
      </div>

      <div className="space-y-4 mb-10 flex-1">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Check size={12} className="text-green-600" />
            </div>
            <span className="text-sm font-medium text-earth-600 leading-tight">{feature}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => onUpgrade(tier.toLowerCase())}
        className={cn(
          "w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg",
          isPopular 
            ? "bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/20" 
            : "bg-earth-900 text-white hover:bg-earth-800 shadow-earth-900/10"
        )}
      >
        {tier.toLowerCase() === 'free' ? 'Current Plan' : `Upgrade to ${tier}`}
      </button>
    </div>
  );
}
