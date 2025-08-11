// src/components/SplashScreen.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SplashAnimation.css"; // Import the animation CSS

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home"); // Redirect after animation
    }, 9000); // Show for 9 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black splashscreenback flex items-center justify-center z-50">
      <div className="text-center slpeshtext">
        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
          <span className="loading-text-words text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-10xl text-[#f9f6f0] font-bold">D</span>
          <span className="loading-text-words text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-10xl text-[#f9f6f0] font-bold">R</span>
          <span className="loading-text-words text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-10xl text-[#f9f6f0] font-bold">I</span>
          <span className="loading-text-words text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-10xl text-[#f9f6f0] font-bold">P</span>
          <span className="loading-text-words text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-10xl text-[#f9f6f0] font-bold">L</span>
          <span className="loading-text-words text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-10xl text-[#f9f6f0] font-bold">E</span>
          <span className="loading-text-words text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-10xl text-[#f9f6f0] font-bold">T</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
