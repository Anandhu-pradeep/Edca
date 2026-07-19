"use client";

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Software Engineer at Google",
    content: "The AI interviewer was incredibly realistic. It asked the exact system design questions I faced in my actual Google onsite. Highly recommended!",
    avatar: "S"
  },
  {
    name: "Michael Chen",
    role: "Product Manager at Stripe",
    content: "The facial and emotion tracking helped me realize I wasn't making enough eye contact when explaining complex metrics. Changed my entire approach.",
    avatar: "M"
  },
  {
    name: "Emily Rodriguez",
    role: "Recent CS Graduate",
    content: "Edca's resume intelligence matched me with behavioral questions I hadn't even thought of. I felt 100% prepared and landed my dream job.",
    avatar: "E"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Removed heavy glow background for performance */}
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <div>
            <h2 className="text-4xl font-bold font-heading mb-4 text-foreground">Loved by Candidates</h2>
            <p className="text-muted-foreground">Join thousands who have successfully landed their dream roles.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={t.name}>
              <Card className="h-full bg-card border-border hover:bg-muted transition-all duration-300">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-lg text-foreground mb-8 flex-1 leading-relaxed">"{t.content}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-lg shadow-inner border border-border">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground font-medium">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
