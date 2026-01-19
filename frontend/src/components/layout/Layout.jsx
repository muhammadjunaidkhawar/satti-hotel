import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content - Fixed height and scrollable */}
      <div className="flex-1 w-full md:ml-28 h-screen overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Navbar onMenuToggle={toggleSidebar} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
