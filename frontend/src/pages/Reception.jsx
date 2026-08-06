import { useState, useEffect, useCallback } from "react";
import { Plus, ArrowRight, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";
import ReceptionFormModal from "../components/ReceptionFormModal";

const STATUS_FLOW = ["EN_ESPERA", "EN_PROCESO", "LISTO", "ENTREGADO"];

const STATUS_LABELS = {
  EN_ESPERA: "En espera",
  EN_PROCESO: "En proceso",
  LISTO: "Listo",
  ENTREGADO: "Entregado",
};

const STATUS_COLORS = {
  EN_ESPERA: "bg-slate-100 text-slate-600",
  EN_PROCESO: "bg-amber-100 text-amber-700",
  LISTO: "bg-emerald-100 text-emerald-700",
  ENTREGADO: "bg-slate-200 text-slate-500",
};

function Reception() {
  const [receptions, setReceptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReceptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/reception");
      setReceptions(response.data.receptions);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la recepción del taller",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceptions();
  }, [fetchReceptions]);

  const handleCreate = async (payload) => {
    try {
      await api.post("/reception", payload);
      Swal.fire({
        icon: "success",
        title: "Recepción registrada",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsModalOpen(false);
      fetchReceptions();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
        text: error.response?.data?.message || "Error inesperado",
      });
    }
  };

  const handleAdvanceStatus = async (reception) => {
    const currentIndex = STATUS_FLOW.indexOf(reception.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    if (!nextStatus) return;

    const result = await Swal.fire({
      icon: "question",
      title: `¿Cambiar a "${STATUS_LABELS[nextStatus]}"?`,
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await api.patch(`/reception/${reception.id}/status`, {
        status: nextStatus,
      });
      fetchReceptions();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar",
        text: error.response?.data?.message || "Error inesperado",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-ember text-white px-4 py-2 rounded hover:bg-ember-dark transition"
        >
          <Plus size={18} /> Nueva recepción
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Motocicleta</th>
              <th className="px-4 py-3 text-left">Falla reportada</th>
              <th className="px-4 py-3 text-left">Ingreso</th>
              <th className="px-4 py-3 text-left">Estatus</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && receptions.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Sin recepciones registradas
                </td>
              </tr>
            )}
            {!isLoading &&
              receptions.map((reception) => {
                const customer = reception.Motorcycle?.Customer;
                const moto = reception.Motorcycle;
                const canAdvance = reception.status !== "ENTREGADO";
                return (
                  <tr
                    key={reception.id}
                    className="hover:bg-slate-50 align-top"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">
                        {customer?.fullName}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {customer?.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-600">
                        {moto?.brand} {moto?.model}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {moto?.licensePlate}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">
                      {reception.reportedFailure}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                      {new Date(reception.entryDate).toLocaleString("es-MX")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[reception.status]}`}
                      >
                        {STATUS_LABELS[reception.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/service-orders/${reception.id}`}
                          className="flex items-center gap-1 text-steel hover:text-slate-800 text-xs"
                        >
                          <ClipboardList size={14} /> Orden
                        </Link>
                        {canAdvance && (
                          <button
                            onClick={() => handleAdvanceStatus(reception)}
                            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs"
                          >
                            Avanzar <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <ReceptionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

export default Reception;
