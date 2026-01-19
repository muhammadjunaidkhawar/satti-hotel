import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/menu") return "Menu";
    if (path === "/staff") return "Staff";
    if (path === "/inventory") return "Inventory";
    if (path === "/order") return "Orders";
    if (path === "/table") return "Table";
    if (path === "/reservation") return "Reservation";
    if (path === "/profile") return "Profile";
    if (path === "/notification") return "Notifications";
    if (path === "/settings") return "Settings";
    if (path === "/addnewcategory") return "Add Category";
    if (path === "/addmenuitem") return "Add Menu Item";
    return "Page";
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg mb-6 shadow">
      <div className="flex items-center gap-3">
        {/* Hamburger menu for mobile */}
        <button
          onClick={onMenuToggle}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#FF9500] transition"
        >
          <i className="fa-solid fa-bars text-white"></i>
        </button>

        <button
          onClick={() => navigate(-1)}
          className="hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#FF9500] transition"
        >
          <i className="fa-solid fa-chevron-left text-white"></i>
        </button>
        <h1 className="text-lg sm:text-xl font-semibold">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative">
          <i
            className="fa-solid fa-bell text-lg sm:text-xl text-white cursor-pointer"
            onClick={() => navigate("/notification")}
          ></i>
        </div>
        <div className="w-px h-6 bg-white/30"></div>
        <Link to="/profile">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Profile"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#FF9500] cursor-pointer"
          />
        </Link>
      </div>
    </div>
  );
}
