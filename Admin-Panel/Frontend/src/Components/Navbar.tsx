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
        <div className=" p-4  flex items-center justify-between w-full bg-gray-100">
            <SignedIn>
               
                <div className="flex font-bold text-2xl">
                    {user ? (
                        <h1>Welcome, {user?.fullName || user?.username || "User"}!</h1>
                    ) : (
                        <h1 className="text-xl">Loading...</h1>
                    )}
                </div>
                <div className="flex">
                    <SearchBar />
                </div>
                <div className="flex ">
                    <button onClick={toggleNotification} className="text-3xl cursor-pointer">
                    <AiFillBell />
                    </button>
                    {showNotification && (
                        <div className="absolute right-10 top-20 bg-white shadow-lg p-4 rounded-lg">
                            <h2 className=" flex justify-center items-center font-bold">Notifications</h2>
                            <ul className="p-4">
                                <li className="border-b py-2">🔔 Notification 1</li>
                                <li className="border-b py-2">📢 Notification 2</li>
                                <li className="py-2">✅ Notification 3</li>
                            </ul>
                        </div>
                    )}
                </div>
                <div className="flex">
                    <UserButton />
                </div>
            </SignedIn>
        </div>
    </>
  )
}

export default Navbar