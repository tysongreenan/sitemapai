import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out the platform",
      features: [
        "3 sitemaps",
        "Basic AI generation",
        "Standard export formats",
        "Community support"
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      highlighted: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "For professionals and small teams",
      features: [
        "Unlimited sitemaps",
        "Advanced AI features",
        "All export formats",
        "Priority support",
        "Collaboration tools",
        "Version history"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "primary" as const,
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with advanced needs",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom AI training",
        "API access",
        "SSO authentication",
        "Advanced analytics"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "secondary" as const,
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-lg overflow-hidden transition-all duration-300 ${
                plan.highlighted 
                  ? 'shadow-xl ring-2 ring-indigo-500 scale-105 z-10' 
                  : 'shadow-md hover:shadow-lg'
              }`}
            >
              <div className={`p-8 ${plan.highlighted ? 'bg-indigo-50' : 'bg-white'}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-end mb-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600 ml-1">{plan.period}</span>}
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <Button 
                  variant={plan.buttonVariant} 
                  className="w-full mb-6"
                >
                  {plan.buttonText}
                </Button>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}