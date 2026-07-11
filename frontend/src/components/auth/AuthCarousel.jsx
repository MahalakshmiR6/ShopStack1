import { useState, useEffect } from 'react';

const slides = [
  {
    image: '/images/carousel_marketplace.png',
    title: 'Seamless Online Shopping',
    description: 'Explore thousands of premium products from verified vendors.',
  },
  {
    image: '/images/carousel_security.png',
    title: 'Secure Payments & Escrow',
    description: 'Every transaction is encrypted and protected by enterprise security.',
  },
  {
    image: '/images/carousel_experience.png',
    title: 'Swift & Reliable Delivery',
    description: 'Experience prompt fulfillment and tracking to your doorstep.',
  },
];

export default function AuthCarousel({ className = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className={`absolute inset-0 w-full h-full overflow-hidden flex flex-col justify-end p-12 text-white group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Slides */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              idx === activeIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transition-transform duration-[4500ms] ease-out transform group-hover:scale-105"
            />
            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-indigo-950/20" />
          </div>
        ))}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col justify-end">
        {/* Caption */}
        <div className="min-h-[80px] mb-4">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`transition-all duration-500 ease-out transform ${
                idx === activeIndex 
                  ? 'block opacity-100 translate-y-0' 
                  : 'hidden opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <h3 className="text-xl font-bold text-white mb-1.5 tracking-tight">
                {slide.title}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed max-w-[280px]">
                {slide.description}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex gap-2 items-center">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex 
                  ? 'w-5 bg-indigo-400' 
                  : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
