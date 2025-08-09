/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useCallback, useMemo } from 'react';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

interface BrandShowGsapProps {
  className?: string;
  text?: string;
  count?: number;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
  colors?: string;
  spacing?: 'tight' | 'normal' | 'loose';
  animationSpeed?: 'slow' | 'normal' | 'fast';
  startTrigger?: string;
  endTrigger?: string;
  scrubValue?: number;
  enableFloating?: boolean;
}

const BrandShowGsap: React.FC<BrandShowGsapProps> = ({
  className = '',
  text = 'CUSTOM',
  count = 3,
  fontSize = 'lg',
  colors = 'from-emerald-400 via-cyan-400 to-blue-400',
  spacing = 'loose',
  animationSpeed = 'fast',
  startTrigger = 'top 75%',
  endTrigger = 'bottom 25%',
  scrubValue = 0.8,
  enableFloating = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<any>(null);
  const gsapLoadedRef = useRef(false);
  const animationInitializedRef = useRef(false);

  const config = useMemo(() => ({
    fontSizeClasses: {
      sm: 'text-2xl sm:text-3xl md:text-4xl',
      md: 'text-4xl sm:text-5xl md:text-6xl',
      lg: 'text-6xl sm:text-7xl md:text-8xl',
      xl: 'text-8xl sm:text-9xl',
      responsive: 'text-brand-responsive'
    },
    spacingClasses: {
      tight: 'space-y-4',
      normal: 'space-y-8 md:space-y-12',
      loose: 'space-y-12 md:space-y-16 lg:space-y-20'
    },
    speedValues: {
      slow: { duration: 2.4, stagger: 0.8 },
      normal: { duration: 1.8, stagger: 0.6 },
      fast: { duration: 1.2, stagger: 0.4 }
    }
  }), []);

  const textElements = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  const initAnimations = useCallback(() => {
    if (!window.gsap || !window.ScrollTrigger || !containerRef.current || animationInitializedRef.current) return;
    
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    const texts = textRefs.current.filter(Boolean);
    if (texts.length === 0) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const speedConfig = config.speedValues[animationSpeed];

    gsap.set(texts, {
      x: () => window.innerWidth + 1200,
      opacity: 0,
      scale: 0.9,
      rotationY: 45,
      transformOrigin: "center center",
      force3D: true,
      willChange: "transform, opacity"
    });

    timelineRef.current = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: startTrigger,
        end: endTrigger,
        scrub: scrubValue,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        refreshPriority: 1
      }
    });

    timelineRef.current.to(texts, {
      x: 0,
      opacity: 1,
      scale: 1,
      rotationY: 0,
      duration: speedConfig.duration,
      stagger: {
        amount: speedConfig.stagger,
        ease: "power2.out"
      },
      ease: "expo.out",
      force3D: true
    });

    if (enableFloating) {
      texts.forEach((text, index) => {
        if (text) {
          gsap.to(text, {
            y: () => -8 - (index * 1.5),
            duration: 2.2 + (index * 0.15),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: index * 0.08,
            force3D: true
          });
        }
      });
    }

    animationInitializedRef.current = true;
  }, [config.speedValues, animationSpeed, startTrigger, endTrigger, scrubValue, enableFloating]);

  const loadGSAP = useCallback(async () => {
    if (gsapLoadedRef.current) {
      initAnimations();
      return;
    }

    try {
      if (document.querySelector('script[src*="gsap"]')) {
        gsapLoadedRef.current = true;
        initAnimations();
        return;
      }

      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const existingScript = document.querySelector(`script[src="${src}"]`);
          if (existingScript) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.head.appendChild(script);
        });
      };

      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js');

      gsapLoadedRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(initAnimations);
      });
      
    } catch (error) {
      console.error('Failed to load GSAP:', error);
    }
  }, [initAnimations]);

  useEffect(() => {
    loadGSAP();

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
      }
      animationInitializedRef.current = false;
    };
  }, [loadGSAP]);

  const setTextRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    textRefs.current[index] = el;
  }, []);

  return (
    <>
      <div 
        ref={containerRef}
        className={`flex flex-col items-center h-full justify-center w-full overflow-hidden ${config.spacingClasses[spacing]} ${className}`}
      >
        {textElements.map((index) => (
          <div
            key={index}
            ref={setTextRef(index)}
            className={`
              ${config.fontSizeClasses[fontSize]}
              font-black 
              bg-gradient-to-r ${colors} 
              bg-clip-text text-transparent 
              font-serif italic 
              transform-gpu 
              cursor-pointer 
              hover:scale-105 
              transition-transform duration-200 ease-out 
              whitespace-nowrap 
              select-none
            `}
            style={{
              
            }}
          >
            {text}
          </div>
        ))}
      </div>

      <link
        rel="preload"
        href="https://fonts.gstatic.com/s/dancingscript/v24/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSoHTeB9ptDqpw.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
};

export default BrandShowGsap;