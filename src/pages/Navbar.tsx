import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, LayoutDashboard, CheckSquare } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.sub);
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      {/* LEFT: Logo & Links */}
      <div className="flex items-center gap-8">
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          {/* Add more links here later (e.g. Profile, Settings) */}
        </div>
      </div>

      {/* RIGHT: User Profile & Logout */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-700 capitalize">
            {username || "Guest"}
          </p>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition font-medium"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
