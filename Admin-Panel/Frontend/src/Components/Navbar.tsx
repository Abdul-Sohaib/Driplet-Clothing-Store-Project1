import { UserButton, SignedIn, useUser } from "@clerk/clerk-react"
import SearchBar from "./Searchbar"
import { AiFillBell } from "react-icons/ai";
import { useState } from "react";

const Navbar = () => {
    const { user } = useUser();
    const [showNotification, setShowNotification] = useState(false);

    const toggleNotification = () => {
        setShowNotification((prev) => !prev);
    };

  return (
    <>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full bg-gray-100 gap-4 sm:gap-0">
            <SignedIn>
               
                <div className="flex font-bold text-lg sm:text-xl lg:text-2xl">
                    {user ? (
                        <h1>Welcome, {user?.fullName || user?.username || "User"}!</h1>
                    ) : (
                        <h1 className="text-lg sm:text-xl">Loading...</h1>
                    )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="w-full sm:w-auto">
                        <SearchBar />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button 
                                onClick={toggleNotification} 
                                className="text-2xl sm:text-3xl cursor-pointer p-2 rounded-lg hover:bg-gray-200 transition-colors"
                                aria-label="Toggle notifications"
                            >
                                <AiFillBell />
                            </button>
                            {showNotification && (
                                <div className="absolute right-0 sm:right-auto sm:left-0 top-12 sm:top-10 bg-white shadow-lg p-4 rounded-lg border border-gray-200 min-w-64 z-50">
                                    <h2 className="flex justify-center items-center font-bold text-sm sm:text-base mb-3">Notifications</h2>
                                    <ul className="space-y-2">
                                        <li className="border-b border-gray-100 py-2 text-sm">🔔 Notification 1</li>
                                        <li className="border-b border-gray-100 py-2 text-sm">📢 Notification 2</li>
                                        <li className="py-2 text-sm">✅ Notification 3</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex">
                            <UserButton />
                        </div>
                    </div>
                </div>
            </SignedIn>
        </div>
    </>
  )
}

export default Navbar