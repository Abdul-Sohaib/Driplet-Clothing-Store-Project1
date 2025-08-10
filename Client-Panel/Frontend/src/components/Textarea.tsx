import { motion } from "framer-motion";
import { useState } from "react";

const Textarea = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const quotes = [
    `"Dress like you mean it, live like you love it."`,
    `'Style is a way to say who you are without speaking.'`,
    `"Drip so loud, you can hear my outfit."`,
  ];

  const animations = [
    { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 }, delay: 0 },
    { initial: { opacity: 0 }, animate: { opacity: 1 }, delay: 0.4 },
    { initial: { x: 100, opacity: 0 }, animate: { x: 0, opacity: 1 }, delay: 0.2 },
  ];

  const backgroundImages = ["quotebg1","quotebg2","quotebg3"];

  const cardStyles = (index: number) => {
    const base =
      " w-full h-full flex justify-center items-center rounded-2xl sm:rounded-3xl border-2 transition-transform duration-300 transform cursor-pointer shadow-[rgba(0,0,0,0.2)_0px_20px_30px,-8px_0px_30px_#ffd70040]";

    const scale =
      hoveredIndex === null
        ? "scale-100"
        : hoveredIndex === index
        ? "scale-[1.05]"
        : "scale-95";

    const position =
      index === 0
        ? "sm:-translate-x-6 sm:-translate-y-4 sm:-rotate-9 sm:relative sm:left-16"
      : index === 1
        ? "translate-x-0 translate-y-0 sm:relative sm:rotate-1"
        : index === 2
        ? "sm:translate-x-6 sm:-translate-y-4 sm:rotate-9 sm:relative sm:right-16"
        : "";

    const background = `bg-cover bg-center ${backgroundImages[index]}`;

    return `${base} ${scale} ${position} ${background}`;
  };

  return (
    <div className="flex flex-col items-center w-full px-3 sm:px-4">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold textheading uppercase mt-6 sm:mt-8 md:mt-10 text-center">This ain't fashion. It's Driplet</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full h-[40vh] sm:h-[50vh] md:h-[60vh] mt-10 sm:mt-15 md:mt-20 mb-3 sm:mb-5 justify-center items-center">
        {quotes.map((quote, index) => (
          <motion.div
            key={index}
            className={cardStyles(index)}
            initial={animations[index].initial}
            whileInView={animations[index].animate}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: animations[index].delay,
            }}
            viewport={{ once: true, amount: 0.3 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className="uppercase text-sm sm:text-base md:text-lg lg:text-xl px-3 sm:px-4 md:px-6 text-white font-extrabold tracking-wider navheading text-center">
              {quote}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Textarea;