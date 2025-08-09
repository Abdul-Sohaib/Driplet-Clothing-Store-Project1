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
      " w-full h-full flex justify-center items-center rounded-3xl border-2  transition-transform duration-300 transform cursor-pointer shadow-[rgba(0,0,0,0.2)_0px_20px_30px,-8px_0px_30px_#ffd70040]";

    const scale =
      hoveredIndex === null
        ? "scale-100"
        : hoveredIndex === index
        ? "scale-[1.05]"
        : "scale-95";

    const position =
      index === 0
        ? "-translate-x-6 -translate-y-4 -rotate-9 relative left-16"
      : index === 1
        ? "translate-x-0 translate-y-0 relative rotate-1"
        : index === 2
        ? "translate-x-6 -translate-y-4 rotate-9 relative right-16"
        : "";

    const background = `bg-cover bg-center ${backgroundImages[index]}`;

    return `${base} ${scale} ${position} ${background}`;
  };

  return (
    <div className="flex flex-col items-center w-full ">
      <h2 className="text-5xl font-extrabold textheading uppercase mt-10">This ain’t fashion. It’s Driplet</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-full h-[60vh] mt-20 mb-5 justify-center items-center">
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
            <span className="uppercase text-xl px-6 text-white font-extrabold tracking-wider navheading text-center">
              {quote}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Textarea;