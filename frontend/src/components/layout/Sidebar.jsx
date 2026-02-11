import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { removeToken } from '../../utils/auth';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    removeToken();
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar - Fixed with full height */}
      <div
        className={`
          fixed md:fixed
          top-0 left-0 h-screen
          w-28 rounded-r-3xl bg-[#2a2a2a] 
          flex flex-col py-4 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex flex-col items-center px-2 mb-4">
          <h1 className="text-sm font-semibold text-[#FF9500] text-center mb-2">7E POS</h1>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-white hover:text-[#FF9500] mb-2">
            <i className="fa-solid fa-times text-base"></i>
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-2 sidebar-scroll">
          <NavLink
            to="/dashboard"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 px-2 py-3 rounded-md text-white transition-colors duration-300 ${isActive ? 'bg-[#FF9500] text-black' : 'hover:bg-[#FF9500]/20'}`
            }
          >
            <i className="fa-solid fa-chart-line text-sm text-[#FF9500] bg-white rounded-full p-2"></i>
            <span className="text-xs text-center">Dashboard</span>
          </NavLink>

          <NavLink
            to="/menu"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 px-2 py-3 rounded-md text-white transition-colors duration-300 ${isActive ? 'bg-[#FF9500] text-black' : 'hover:bg-[#FF9500]/20'}`
            }
          >
            <i className="fa-solid fa-utensils text-sm text-[#FF9500] bg-white rounded-full p-2"></i>
            <span className="text-xs text-center">Menu</span>
          </NavLink>

          <NavLink
            to="/staff"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 px-2 py-3 rounded-md text-white transition-colors duration-300 ${isActive ? 'bg-[#FF9500] text-black' : 'hover:bg-[#FF9500]/20'}`
            }
          >
            <i className="fa-solid fa-user-group text-sm text-[#FF9500] bg-white rounded-full p-2"></i>
            <span className="text-xs text-center">Staff</span>
          </NavLink>
          <NavLink
            to="/order"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 px-2 py-3 rounded-md text-white transition-colors duration-300 ${isActive ? 'bg-[#FF9500] text-black' : 'hover:bg-[#FF9500]/20'}`
            }
          >
            <i className="fa-solid fa-chair text-sm text-[#FF9500] bg-white rounded-full p-2"></i>
            <span className="text-xs text-center">Order</span>
          </NavLink>

          <NavLink
            to="/reservation"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 px-2 py-3 rounded-md text-white transition-colors duration-300 ${isActive ? 'bg-[#FF9500] text-black' : 'hover:bg-[#FF9500]/20'}`
            }
          >
            <i className="fa-solid fa-calendar-check text-sm text-[#FF9500] bg-white rounded-full p-2"></i>
            <span className="text-xs text-center">Reservation</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 px-2 py-3 rounded-md text-white transition-colors duration-300 ${isActive ? 'bg-[#FF9500] text-black' : 'hover:bg-[#FF9500]/20'}`
            }
          >
            <i className="fa-solid fa-sliders text-sm text-[#FF9500] bg-white rounded-full p-2"></i>

            <span className="text-xs text-center">Customization</span>
          </NavLink>
        </nav>

        {/* Fixed Logout Button at Bottom */}
        <div className="mt-auto pt-4 border-t border-white/10 flex justify-center">
          <button onClick={handleLogout} className="flex flex-col items-center text-white hover:text-[#FF9500] transition-colors">
            <i className="fa-solid fa-right-from-bracket text-sm text-[#FF9500] bg-white rounded-full p-2 hover:bg-[#FF9500] hover:text-white transition-colors"></i>
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
