import { Link } from "react-router-dom";
import { Package, ClipboardList } from "lucide-react";
import useAuthStore from "../store/authStore";

function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <p className="text-slate-500 mb-6">
        Bienvenido de vuelta,{" "}
        <span className="font-medium text-slate-700">{user?.fullName}</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/inventory"
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-ember/40 transition"
        >
          <Package className="text-ember mb-3" size={24} />
          <h2 className="font-semibold text-slate-800">Inventario</h2>
          <p className="text-sm text-slate-500 mt-1">Catálogo de refacciones</p>
        </Link>
        <Link
          to="/reception"
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-ember/40 transition"
        >
          <ClipboardList className="text-ember mb-3" size={24} />
          <h2 className="font-semibold text-slate-800">Recepción</h2>
          <p className="text-sm text-slate-500 mt-1">
            Control de entrada/salida del taller
          </p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
