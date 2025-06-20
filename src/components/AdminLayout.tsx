import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Optional: install lucide-react for icons

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Top Bar for Mobile */}
      <div className="lg:hidden bg-gray-800 text-white flex justify-between items-center px-4 py-3">
        <h2 className="text-xl font-bold">Admin</h2>
        <button onClick={toggleSidebar}>
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white p-4 space-y-4 lg:w-64
        ${isSidebarOpen ? "block" : "hidden"} lg:block`}
      >
        <h2 className="text-xl font-bold hidden lg:block">Admin</h2>
        <nav className="space-y-2">
          <Link to="/dashboard" className="block hover:underline">Dashboard</Link>
          <Link to="/products" className="block pt-2 hover:underline">Products</Link>
          <Link to="/low-stock" className="block pt-2 hover:underline">Low Stock</Link>
          <Link to="/report" className="block pt-2 hover:underline">Report</Link>
          <Link to="/receipts" className="block pt-2 hover:underline">Receipts</Link>
          <button
            onClick={handleLogout}
            className="block text-red-400 pt-2 hover:underline mt-4 cursor-pointer"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
