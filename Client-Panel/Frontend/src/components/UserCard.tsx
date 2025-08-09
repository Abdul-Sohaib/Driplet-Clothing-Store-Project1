import { useNavigate } from "react-router-dom";
import { RiLogoutCircleRFill } from "react-icons/ri";
import { FaUser, FaBoxOpen, FaExchangeAlt } from "react-icons/fa";

interface UserCardProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
  onClose: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onLogout, onClose }) => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    onClose();
    // Replace with actual login route when implemented
    navigate("/login"); // Placeholder route
  };

  return (
    <div
      className="absolute right-0 top-[11vh] bg-[#F5F5DC] rounded-md shadow-lg p-4 text-sm z-50 w-[18vw] border-2 border-[#101A13] flex flex-col items-center justify-center font-bold navfonts gap-4"
      onMouseLeave={onClose}
    >
      {user ? (
        <>
          <button
            onClick={() => {
              onClose();
              navigate("/account");
            }}
            className="relative group bg-transparent outline-none cursor-pointer uppercase w-full"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
            <div className="relative flex items-center justify-between py-3 px-6 text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
              <span className="select-none text-xs navfonts font-semibold">Account</span>
              <FaUser className="w-5 transition duration-250 group-hover:-translate-x-1" />
            </div>
          </button>
          <button
            onClick={() => {
              onClose();
              navigate("/orders");
            }}
            className="relative group bg-transparent outline-none cursor-pointer uppercase w-full"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
            <div className="relative flex items-center justify-between py-3 px-6 text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
              <span className="select-none text-xs navfonts font-semibold">My Orders</span>
              <FaBoxOpen className="w-5 transition duration-250 group-hover:-translate-x-1" />
            </div>
          </button>
          <button
            onClick={() => {
              onClose();
              navigate("/return-exchange");
            }}
            className="relative group bg-transparent outline-none cursor-pointer uppercase w-full"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
            <div className="relative flex items-center justify-between py-3 px-6 text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
              <span className="select-none text-xs navfonts font-semibold">Return/Exchange</span>
              <FaExchangeAlt className="w-5 transition duration-250 group-hover:-translate-x-1" />
            </div>
          </button>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="relative group bg-transparent outline-none cursor-pointer uppercase w-full"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
            <div className="relative flex items-center justify-between py-3 px-6 text-lg text-white rounded-lg transform -translate-y-1 bg-red-500 gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
              <span className="select-none text-xs navfonts font-semibold">Logout</span>
              <RiLogoutCircleRFill className="w-5 transition duration-250 group-hover:-translate-x-1" />
            </div>
          </button>
        </>
      ) : (
        <div className="navfonts uppercase flex flex-col gap-6 justify-center items-center">
          <p className="text-black text-xl font-semibold">Please log in</p>
          <button
            onClick={handleLoginRedirect}
            className="relative group bg-transparent outline-none cursor-pointer uppercase w-full"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-purple-300 bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
            <div className="relative flex items-center justify-center py-3 px-6 text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-purple-300 hover:border-purple-500 active:border-purple-700">
              <span className="select-none text-xs navfonts font-semibold">Go to Login</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserCard;