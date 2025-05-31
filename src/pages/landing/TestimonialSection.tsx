import React from 'react';
import { Star } from 'lucide-react';

export default function TestimonialSection() {
  const testimonials = [
    {
      quote: "SiteMapAI saved us weeks of planning and made our website redesign process incredibly smooth. The AI suggestions were spot on!",
      author: "Sarah Johnson",
      role: "Product Manager at TechCorp",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
      stars: 5
    },
    {
      quote: "As a freelance developer, this tool has become essential for my client projects. I can quickly generate professional sitemaps that impress my clients.",
      author: "Michael Chen",
      role: "Freelance Web Developer",
      avatar: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150",
      stars: 5
    },
    {
      quote: "The visual editor is intuitive and powerful. It's helped our team collaborate better and keep our site architecture organized as we scale.",
      author: "Emily Rodriguez",
      role: "UX Designer at CreativeStudio",
      avatar: "https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=150",
      stars: 4
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-100 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Designers & Developers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our users have to say about how SiteMapAI has transformed their workflow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-lg shadow-md"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author} 
                  className="h-12 w-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}