import { useState, useEffect } from "react";
import { X } from "lucide-react";

const EMPTY_FORM = {
  partCode: "",
  description: "",
  category: "",
  costPrice: "",
  sellingPrice: "",
  stockQuantity: "",
  minStockQuantity: "",
  adjustmentReason: "",
};

function PartFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM);
      return;
    }
    if (initialData) {
      setForm({
        partCode: initialData.partCode || "",
        description: initialData.description || "",
        category: initialData.category || "",
        costPrice: initialData.costPrice || "",
        sellingPrice: initialData.sellingPrice || "",
        stockQuantity: initialData.stockQuantity ?? "",
        minStockQuantity: initialData.minStockQuantity ?? "",
        adjustmentReason: "",
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditing ? "Editar refacción" : "Nueva refacción"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Código de parte
            </label>
            <input
              name="partCode"
              value={form.partCode}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              disabled={isEditing}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Descripción
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Categoría
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Precio costo
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="costPrice"
                value={form.costPrice}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Precio venta
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="sellingPrice"
                value={form.sellingPrice}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                {isEditing ? "Stock actual" : "Stock inicial"}
              </label>
              <input
                type="number"
                min="0"
                name="stockQuantity"
                value={form.stockQuantity}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Stock mínimo
              </label>
              <input
                type="number"
                min="0"
                name="minStockQuantity"
                value={form.minStockQuantity}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Motivo del ajuste (si cambiaste el stock)
              </label>
              <input
                name="adjustmentReason"
                value={form.adjustmentReason}
                onChange={handleChange}
                placeholder="Ej. Conteo físico, mercancía dañada..."
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-slate-800 text-white hover:bg-slate-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PartFormModal;
