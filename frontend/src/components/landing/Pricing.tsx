"use client";

import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for students starting their interview preparation journey.",
    features: [
      "Basic AI Resume Analysis",
      "5 Mock Interviews per month",
      "Standard Confidence Meter",
      "Community Support"
    ],
    button: "Get Started Free",
    variant: "outline"
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "Advanced AI tools for serious candidates wanting the edge.",
    features: [
      "Deep Resume Intelligence",
      "Unlimited Mock Interviews",
      "Advanced Emotion & Facial Tracking",
      "Detailed Performance Reports",
      "Priority Email Support"
    ],
    button: "Start Free Trial",
    variant: "default",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For universities, bootcamps, and recruitment agencies.",
    features: [
      "Organization Dashboard",
      "Unlimited Candidate Seats",
      "Custom Interview Scenarios",
      "API Access & Integrations",
      "Dedicated Success Manager"
    ],
    button: "Contact Sales",
    variant: "outline"
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-background relative z-10">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-foreground">
              Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Invest in your career with AI-powered preparation that pays for itself.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={cn("h-full", plan.popular ? "md:-mt-8 md:mb-8" : "")}
            >
              <Card 
                className={cn(
                  "relative flex flex-col h-full transition-all duration-500",
                  plan.popular 
                  ? "bg-muted border-primary/50 shadow-2xl scale-105 z-10" 
                  : "bg-card border-border hover:bg-muted hover:shadow-xl"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    <Star className="w-3 h-3 fill-primary-foreground" />
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="p-8 pb-6">
                  <h3 className="text-2xl font-bold font-heading mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold font-heading text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          plan.popular ? "bg-primary/20 text-primary" : "bg-card border border-border text-muted-foreground"
                        )}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-foreground leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={cn(
                      "w-full h-12 rounded-xl font-semibold transition-all",
                      plan.popular 
                      ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md"
                      : "bg-card border border-border hover:bg-muted text-foreground"
                    )}
                  >
                    {plan.button}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
