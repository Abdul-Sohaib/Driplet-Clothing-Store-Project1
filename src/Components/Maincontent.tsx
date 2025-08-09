import type { ReactNode } from "react";

const MainContent = ({ children }: { children: ReactNode }) => {
  return (
    <>
    <main className="flex-1 justify-center items-center bg-black text-white">
      {children}
    </main>
    </>
  );
};

export default MainContent;
