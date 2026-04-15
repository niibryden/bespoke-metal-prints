import { Shield, Lock, CreditCard, Truck, RefreshCw } from 'lucide-react';

export function TrustBadgesCheckout() {
  const badges = [
    {
      icon: Shield,
      title: '100% Secure',
      description: 'SSL Encrypted',
    },
    {
      icon: Lock,
      title: 'Privacy Protected',
      description: 'Your data is safe',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Stripe powered',
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders $100+',
    },
    {
      icon: RefreshCw,
      title: '30-Day Returns',
      description: '100% satisfaction',
    },
  ];

  return (
    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
      <h3 className="text-white font-semibold mb-4 text-center [data-theme='light']_&:text-gray-900">
        Safe & Secure Checkout
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center gap-2 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]/50 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-200"
          >
            <div className="w-10 h-10 bg-[#ff6b35]/10 rounded-full flex items-center justify-center">
              <badge.icon className="w-5 h-5 text-[#ff6b35]" />
            </div>
            <div>
              <p className="text-white text-xs font-medium [data-theme='light']_&:text-gray-900">
                {badge.title}
              </p>
              <p className="text-gray-500 text-[10px] [data-theme='light']_&:text-gray-600">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional trust signals */}
      <div className="mt-4 pt-4 border-t border-[#2a2a2a] [data-theme='light']_&:border-gray-200">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            <span>Stripe Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
