import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import Swal from "sweetalert2";
import api from "../services/api";
import PartFormModal from "../components/PartFormModal";

function Inventory() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);

  const fetchParts = useCallback(async (searchTerm = "") => {
    setIsLoading(true);
    try {
      const response = await api.get("/inventory", {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setParts(response.data.parts);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el inventario",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParts(search);
  };

  const openCreateModal = () => {
    setEditingPart(null);
    setIsModalOpen(true);
  };

  const openEditModal = (part) => {
    setEditingPart(part);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (form) => {
    try {
      if (editingPart) {
        await api.put(`/inventory/${editingPart.id}`, form);
        Swal.fire({
          icon: "success",
          title: "Refacción actualizada",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/inventory", form);
        Swal.fire({
          icon: "success",
          title: "Refacción creada",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setIsModalOpen(false);
      fetchParts(search);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.response?.data?.message || "Error inesperado",
      });
    }
  };

  const handleDelete = async (part) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `¿Desactivar "${part.description}"?`,
      text: "La refacción dejará de aparecer en el catálogo activo.",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/inventory/${part.id}`);
      Swal.fire({
        icon: "success",
        title: "Refacción desactivada",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchParts(search);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo desactivar",
        text: error.response?.data?.message || "Error inesperado",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-ember text-white px-4 py-2 rounded hover:bg-ember-dark transition"
        >
          <Plus size={18} /> Nueva refacción
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o descripción..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-ember/40"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50"
        >
          Buscar
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-right">Costo</th>
              <th className="px-4 py-3 text-right">Venta</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[13px]">
            {isLoading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400 font-sans"
                >
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && parts.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400 font-sans"
                >
                  Sin refacciones registradas
                </td>
              </tr>
            )}
            {!isLoading &&
              parts.map((part) => {
                const lowStock = part.stockQuantity <= part.minStockQuantity;
                return (
                  <tr key={part.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {part.partCode}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-sans">
                      {part.description}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-sans">
                      {part.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      ${Number(part.costPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      ${Number(part.sellingPrice).toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${lowStock ? "text-ember-dark" : "text-slate-700"}`}
                    >
                      {part.stockQuantity}
                      {lowStock && (
                        <span className="ml-1 text-[10px] uppercase font-sans">
                          bajo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(part)}
                          className="text-slate-500 hover:text-slate-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(part)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <PartFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingPart}
      />
    </div>
  );
}

export default Inventory;
