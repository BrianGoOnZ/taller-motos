import { useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/": "Inicio",
  "/inventory": "Inventario de Refacciones",
  "/reception": "Recepción y Control de Taller",
};

function Topbar() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "Orden de Servicio";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
    </header>
  );
}

export default Topbar;
