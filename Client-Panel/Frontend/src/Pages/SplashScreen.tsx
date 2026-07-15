// src/components/SplashScreen.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SplashAnimation.css"; // Import the animation CSS

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home"); // Redirect after animation
    }, 9000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading splashscreenback">
      <div className="loading-text slpeshtext  ">
        <span className="loading-text-words">D</span>
        <span className="loading-text-words">R</span>
        <span className="loading-text-words">I</span>
        <span className="loading-text-words">P</span>
        <span className="loading-text-words">L</span>
        <span className="loading-text-words">E</span>
        <span className="loading-text-words">T</span>
      </div>
    </div>
  );
};

export default SplashScreen;
