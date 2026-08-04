import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { LogOut } from "lucide-react";
import Login from "./pages/Login.jsx";
import Inventory from "./pages/Inventory.jsx";
import Reception from "./pages/Reception.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import useAuthStore from "./store/authStore";

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Taller de Motocicletas - Panel Administrativo
            </h1>
            <p className="text-slate-500 mt-1">Hola, {user?.fullName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800"
          >
            <LogOut size={18} /> Salir
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/inventory"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-slate-800">Inventario</h2>
            <p className="text-sm text-slate-500 mt-1">
              Catálogo de refacciones
            </p>
          </Link>
          <Link
            to="/reception"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-slate-800">Recepción</h2>
            <p className="text-sm text-slate-500 mt-1">
              Control de entrada/salida del taller
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reception" element={<Reception />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
