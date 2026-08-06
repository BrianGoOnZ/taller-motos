import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Wrench,
  LogOut,
} from "lucide-react";
import useAuthStore from "../store/authStore";

// TODO: reemplazar cuando definas el nombre comercial del software
const APP_NAME = "TallerPro";

const NAV_ITEMS = [
  { to: "/", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/inventory", label: "Inventario", icon: Package },
  { to: "/reception", label: "Recepción", icon: ClipboardList },
];

function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-60 shrink-0 bg-asphalt text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
        <Wrench size={20} className="text-ember" />
        <span className="font-semibold text-white tracking-tight">
          {APP_NAME}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition border-l-2 ${
                isActive
                  ? "bg-white/5 border-ember text-white"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 mb-2">
          <p className="text-sm text-white truncate">{user?.fullName}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
