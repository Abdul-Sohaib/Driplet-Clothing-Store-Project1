import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { VscRunAll } from "react-icons/vsc";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const AdContainer1 = () => {
  const [banners, setBanners] = useState<string[]>([]);
  const [current, setCurrent] = useState(1); // Start at first real banner
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch section1 banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_BASE}/site-settings`);
        const section1 = res.data?.banners?.section1 || [];
        if (section1.length > 0) {
          setBanners(section1);
          setCurrent(1); // Start at first real banner
        }
      } catch (err) {
        console.error("Failed to fetch section1 banners", err);
      }
    };
    fetchBanners();
  }, []);

  // Handle visibility state to pause/resume carousel when tab is active/inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setIsPaused(false);
      } else {
        setIsPaused(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Auto-slide every 3 seconds when not paused and tab is active
  useEffect(() => {
    if (banners.length <= 1 || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => prev + 1);
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners.length, isPaused]);

  // Handle seamless loop transitions
  useEffect(() => {
    if (banners.length <= 1) return;

    const handleTransitionEnd = () => {
      if (current === banners.length + 1) {
        // Jump from cloned last banner to first real banner
        setIsTransitioning(false);
        setCurrent(1);
      } else if (current === 0) {
        // Jump from cloned first banner to last real banner
        setIsTransitioning(false);
        setCurrent(banners.length);
      } else {
        setIsTransitioning(true);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("transitionend", handleTransitionEnd);
      return () => container.removeEventListener("transitionend", handleTransitionEnd);
    }
  }, [current, banners.length]);

  // Reset transition after non-transitioned jump
  useEffect(() => {
    if (!isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  // Handle pause on hover or button click
  const handleInteraction = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 1000); // Resume auto-slide after 1 second
  };

  // Handle navigation
  const handlePrev = () => {
    setCurrent((prev) => prev - 1);
    handleInteraction();
  };

  const handleNext = () => {
    setCurrent((prev) => prev + 1);
    handleInteraction();
  };

  if (!banners.length) return null;

  // Clone banners for seamless looping
  const loopedBanners = [banners[banners.length - 1], ...banners, banners[0]];

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] bg-gradient-to-br from-[#131313] via-[#1a1a1a] to-[#2b2b2b] rounded-3xl overflow-hidden">
      {/* Carousel Container */}
      <div
        className="w-full h-full cursor-pointer"
        onMouseEnter={handleInteraction}
        onMouseLeave={() => {
          if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
          setIsPaused(false);
        }}
      >
        <div
          ref={containerRef}
          className={`flex w-full h-full ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {loopedBanners.map((url, idx) => (
            <div
              key={idx}
              className="w-full h-full flex-shrink-0 relative"
            >
              <img
                src={url}
                alt={`Banner ${idx}`}
                className="w-full h-fit object-contain object-center"
                loading="lazy"
              />

              {/* Previous Button inside image */}
              {idx === current && (
                <>
                  <button
                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 bg-transparent transition-colors p-1 sm:p-2 rounded-full cursor-pointer z-10"
                    onClick={handlePrev}
                    aria-label="Previous banner"
                  >
                    <VscRunAll className="text-lg sm:text-2xl scale-x-[-1]" />
                  </button>
                  <button
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 bg-transparent transition-colors p-1 sm:p-2 rounded-full cursor-pointer z-10"
                    onClick={handleNext}
                    aria-label="Next banner"
                  >
                    <VscRunAll className="text-lg sm:text-2xl" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-1 w-full flex justify-center gap-2 sm:gap-3 z-20">
          {banners.map((_, idx) => {
            const isActive = current === idx + 1;
            return (
              <button
                key={idx}
                className={`
                  w-2 sm:w-3 
                  rounded-full 
                  transition-all duration-300 
                  border-2 
                  ${isActive ? "bg-gradient-to-br from-[#0b0b0b] via-[#1a1a1a] to-[#2e2e2e] border-black scale-110 shadow-lg" : "bg-gray-300 border-gray-400 hover:scale-105 hover:border-black"}
                `}
                onClick={() => {
                  setCurrent(idx + 1);
                  handleInteraction();
                }}
                aria-label={`Go to banner ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdContainer1;