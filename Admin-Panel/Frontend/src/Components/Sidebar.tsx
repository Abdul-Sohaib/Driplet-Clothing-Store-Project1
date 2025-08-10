import { Link } from 'react-router-dom';
import logo from '../assets/DRIPLET.svg';
import {
  MdDashboardCustomize,
  MdCategory,
  MdSell,
  MdLocalShipping ,
} from "react-icons/md";
import { AiFillProduct } from "react-icons/ai";
import { RiCustomerServiceFill } from "react-icons/ri";
import { IoSettingsSharp } from "react-icons/io5";

// Sidebar menu configuration
const menuItems = [
  { label: 'Dashboard', icon: <MdDashboardCustomize className='text-xl' />, path: '/' },
  { label: 'Products', icon: <AiFillProduct className='text-2xl' />, path: '/products' },
  { label: 'Packing And Shipping', icon: <MdLocalShipping className='text-3xl' />, path: '/Packing_and_shipping' },
  { label: 'Categories', icon: <MdCategory className='text-2xl' />, path: '/categories' },
  { label: 'Sales', icon: <MdSell className='text-2xl' />, path: '/sales' },
  { label: 'Support', icon: <RiCustomerServiceFill className='text-2xl' />, path: '/support' },
  { label: 'Settings', icon: <IoSettingsSharp className='text-2xl' />, path: '/site-settings' },
];

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className='flex flex-col items-center gap-6 text-black w-64 lg:w-72 border-r border-gray-200 h-full bg-white shadow-lg lg:shadow-none'>
      <div className='flex flex-col justify-around items-center h-full p-4 w-full'>
        {/* Logo */}
        <img src={logo} alt="Driplet Logo" className='w-32 lg:w-36' />

        {/* Menu Buttons */}
        <div className='flex flex-col h-fit justify-between items-center gap-4 lg:gap-5 w-full'>
          {menuItems.map(({ label, icon, path }) => (
            <Link to={path} key={label} onClick={handleLinkClick} className="w-full">
              <button className='flex gap-2 items-center justify-center text-white px-4 lg:px-5 py-2 rounded-lg shadow-md transition-all duration-300 w-full cursor-pointer button-50 hover:scale-105'>
                {icon}
                <span className='font-bold text-sm'>{label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
