import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Trash2, Search } from "lucide-react";
import Swal from "sweetalert2";
import api from "../services/api";

function ServiceOrderPage() {
  const { receptionId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [laborCost, setLaborCost] = useState("");
  const [notes, setNotes] = useState("");
  const [partSearch, setPartSearch] = useState("");
  const [partResults, setPartResults] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/service-orders/reception/${receptionId}`,
      );
      setOrder(response.data.order);
      setLaborCost(response.data.order.laborCost);
      setNotes(response.data.order.notes || "");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la orden de servicio",
      });
    } finally {
      setIsLoading(false);
    }
  }, [receptionId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const isClosed = order?.status === "CERRADA";

  const handleSaveLabor = async () => {
    try {
      const response = await api.put(`/service-orders/${order.id}`, {
        laborCost,
        notes,
      });
      setOrder(response.data.order);
      Swal.fire({
        icon: "success",
        title: "Guardado",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.response?.data?.message,
      });
    }
  };

  const handlePartSearch = async () => {
    if (!partSearch.trim()) return;
    const response = await api.get("/inventory", {
      params: { search: partSearch },
    });
    setPartResults(response.data.parts);
  };

  const handleAddPart = async () => {
    if (!selectedPart) return;
    try {
      const response = await api.post(`/service-orders/${order.id}/parts`, {
        motorcyclePartId: selectedPart.id,
        quantityUsed: Number(quantity),
      });
      setOrder(response.data.order);
      setSelectedPart(null);
      setPartSearch("");
      setPartResults([]);
      setQuantity(1);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo agregar",
        text: error.response?.data?.message,
      });
    }
  };

  const handleRemovePart = async (lineId) => {
    try {
      const response = await api.delete(
        `/service-orders/${order.id}/parts/${lineId}`,
      );
      setOrder(response.data.order);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo quitar",
        text: error.response?.data?.message,
      });
    }
  };

  const handleCloseOrder = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Cerrar orden de servicio?",
      text: "Esto descontará el stock de las refacciones usadas. No se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar orden",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.post(`/service-orders/${order.id}/close`);
      setOrder(response.data.order);
      Swal.fire({
        icon: "success",
        title: "Orden cerrada",
        text: "El stock fue descontado correctamente.",
      });
    } catch (error) {
      if (error.response?.status === 409) {
        const parts = error.response.data.parts || [];
        const list = parts
          .map(
            (p) =>
              `${p.description}: disponible ${p.available}, requerido ${p.required}`,
          )
          .join("\n");
        Swal.fire({
          icon: "error",
          title: "Stock insuficiente",
          text: list || "Revisa el stock de las refacciones",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "No se pudo cerrar",
          text: error.response?.data?.message,
        });
      }
    }
  };

  if (isLoading || !order) {
    return <div className="text-center text-slate-400 py-12">Cargando...</div>;
  }

  const reception = order.ServiceReception;
  const moto = reception?.Motorcycle;
  const customer = moto?.Customer;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/reception" className="text-slate-500 hover:text-slate-700">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-semibold text-slate-800">
          Orden de Servicio #{order.id}
        </h2>
        {isClosed && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-500">
            Cerrada
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
        <p className="font-medium text-slate-700">
          {customer?.fullName} —{" "}
          <span className="font-mono">{customer?.phone}</span>
        </p>
        <p className="text-slate-600">
          {moto?.brand} {moto?.model} (
          <span className="font-mono">{moto?.licensePlate}</span>)
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Falla reportada: {reception?.reportedFailure}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
        <h3 className="font-semibold text-slate-800 mb-3">
          Refacciones utilizadas
        </h3>

        {!isClosed && (
          <div className="flex gap-2 mb-4">
            <input
              value={partSearch}
              onChange={(e) => setPartSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handlePartSearch();
                }
              }}
              placeholder="Buscar refacción por código o descripción..."
              className="flex-1 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ember/40"
            />
            <button
              type="button"
              onClick={handlePartSearch}
              className="px-3 py-2 bg-slate-100 rounded hover:bg-slate-200"
            >
              <Search size={18} />
            </button>
          </div>
        )}

        {partResults.length > 0 && !selectedPart && (
          <div className="border border-slate-200 rounded divide-y divide-slate-100 mb-4">
            {partResults.map((part) => (
              <button
                type="button"
                key={part.id}
                onClick={() => setSelectedPart(part)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex justify-between"
              >
                <span>
                  {part.description}{" "}
                  <span className="font-mono text-slate-400">
                    ({part.partCode})
                  </span>
                </span>
                <span className="text-slate-400 text-sm font-mono">
                  Stock: {part.stockQuantity}
                </span>
              </button>
            ))}
          </div>
        )}

        {selectedPart && (
          <div className="flex items-center gap-2 mb-4 bg-slate-50 p-3 rounded">
            <span className="flex-1 text-sm">{selectedPart.description}</span>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-20 border border-slate-300 rounded px-2 py-1 font-mono"
            />
            <button
              onClick={handleAddPart}
              className="px-3 py-1 bg-ember text-white rounded text-sm hover:bg-ember-dark"
            >
              Agregar
            </button>
            <button
              onClick={() => setSelectedPart(null)}
              className="text-slate-400 text-sm"
            >
              Cancelar
            </button>
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left py-2">Refacción</th>
              <th className="text-right py-2">Cantidad</th>
              <th className="text-right py-2">Precio unit.</th>
              <th className="text-right py-2">Subtotal</th>
              {!isClosed && <th></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {(!order.ServiceOrderParts ||
              order.ServiceOrderParts.length === 0) && (
              <tr>
                <td
                  colSpan={5}
                  className="py-4 text-center text-slate-400 font-sans"
                >
                  Sin refacciones agregadas
                </td>
              </tr>
            )}
            {order.ServiceOrderParts?.map((line) => (
              <tr key={line.id}>
                <td className="py-2 font-sans">
                  {line.MotorcyclePart?.description}
                </td>
                <td className="py-2 text-right">{line.quantityUsed}</td>
                <td className="py-2 text-right">
                  ${Number(line.unitPrice).toFixed(2)}
                </td>
                <td className="py-2 text-right">
                  ${(Number(line.unitPrice) * line.quantityUsed).toFixed(2)}
                </td>
                {!isClosed && (
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleRemovePart(line.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
        <h3 className="font-semibold text-slate-800 mb-3">
          Mano de obra y notas
        </h3>
        <div className="mb-3">
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Costo de mano de obra
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)}
            disabled={isClosed}
            className="w-full border border-slate-300 rounded px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-ember/40 disabled:bg-slate-50"
          />
        </div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Notas / observaciones
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isClosed}
          rows={2}
          className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ember/40 disabled:bg-slate-50"
        />
        {!isClosed && (
          <button
            onClick={handleSaveLabor}
            className="mt-3 px-4 py-2 bg-slate-100 rounded hover:bg-slate-200 text-sm"
          >
            Guardar mano de obra / notas
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex items-center justify-between">
        <div className="font-mono">
          <p className="text-sm text-slate-500">
            Refacciones: ${Number(order.totalPartsCost).toFixed(2)}
          </p>
          <p className="text-sm text-slate-500">
            Mano de obra: ${Number(order.laborCost).toFixed(2)}
          </p>
          <p className="font-semibold text-slate-800 text-lg font-sans">
            Total:{" "}
            <span className="font-mono">
              ${Number(order.totalCost).toFixed(2)}
            </span>
          </p>
        </div>
        {!isClosed && (
          <button
            onClick={handleCloseOrder}
            className="px-5 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Cerrar orden
          </button>
        )}
      </div>
    </div>
  );
}

export default ServiceOrderPage;
