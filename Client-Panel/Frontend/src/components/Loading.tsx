import React from "react";
import loading from '@/assets/load.gif'

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[60vh]">
      <div className="relative flex flex-col gap-1">
        <img src={loading} alt="" className="w-52" />
      </div>
    </div>
  );
};

export default Loading;