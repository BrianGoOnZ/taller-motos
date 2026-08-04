import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import Swal from "sweetalert2";
import api from "../services/api";

const EMPTY_CUSTOMER = { fullName: "", phone: "", email: "", address: "" };
const EMPTY_MOTORCYCLE = {
  licensePlate: "",
  brand: "",
  model: "",
  year: "",
  color: "",
  vin: "",
};

function ReceptionFormModal({ isOpen, onClose, onSubmit }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerMotorcycles, setCustomerMotorcycles] = useState([]);
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState("");
  const [showNewMotoForm, setShowNewMotoForm] = useState(false);
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER);
  const [motorcycleForm, setMotorcycleForm] = useState(EMPTY_MOTORCYCLE);
  const [reportedFailure, setReportedFailure] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setHasSearched(false);
      setSelectedCustomer(null);
      setCustomerMotorcycles([]);
      setSelectedMotorcycleId("");
      setShowNewMotoForm(false);
      setCustomerForm(EMPTY_CUSTOMER);
      setMotorcycleForm(EMPTY_MOTORCYCLE);
      setReportedFailure("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isNewCustomer = hasSearched && !selectedCustomer;

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    const response = await api.get("/customers", {
      params: { search: searchTerm },
    });
    setSearchResults(response.data.customers);
    setHasSearched(true);
    setSelectedCustomer(null);
    setCustomerMotorcycles([]);
    setSelectedMotorcycleId("");
    setShowNewMotoForm(false);
    setCustomerForm({ ...EMPTY_CUSTOMER, fullName: searchTerm });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
    });
    const response = await api.get(`/customers/${customer.id}/motorcycles`);
    setCustomerMotorcycles(response.data.motorcycles);
    setSelectedMotorcycleId("");
    setShowNewMotoForm(response.data.motorcycles.length === 0);
  };

  const handleCustomerFieldChange = (e) => {
    setCustomerForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMotoFieldChange = (e) => {
    setMotorcycleForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasSearched) {
      Swal.fire({
        icon: "warning",
        title: "Falta buscar al cliente",
        text: "Escribe el nombre y presiona Enter o el botón de la lupa antes de continuar.",
      });
      return;
    }

    if (
      isNewCustomer &&
      (!customerForm.fullName.trim() || !customerForm.phone.trim())
    ) {
      Swal.fire({
        icon: "warning",
        title: "Faltan datos del cliente",
        text: "Completa nombre y teléfono del cliente nuevo.",
      });
      return;
    }

    const needsNewMoto = isNewCustomer || showNewMotoForm;

    if (
      needsNewMoto &&
      (!motorcycleForm.licensePlate.trim() ||
        !motorcycleForm.brand.trim() ||
        !motorcycleForm.model.trim())
    ) {
      Swal.fire({
        icon: "warning",
        title: "Faltan datos de la motocicleta",
        text: "Completa placa, marca y modelo.",
      });
      return;
    }

    if (!needsNewMoto && !selectedMotorcycleId) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona una motocicleta",
        text: "Elige una moto existente del cliente o registra una nueva.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let customerId = selectedCustomer?.id;

      if (isNewCustomer) {
        const customerResponse = await api.post("/customers", customerForm);
        customerId = customerResponse.data.customer.id;
      }

      let motorcycleId = selectedMotorcycleId;

      if (needsNewMoto) {
        const motoResponse = await api.post("/motorcycles", {
          ...motorcycleForm,
          customerId,
        });
        motorcycleId = motoResponse.data.motorcycle.id;
      }

      await onSubmit({ motorcycleId, reportedFailure });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
        text: error.response?.data?.message || "Error inesperado",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Nueva recepción
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
          className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Buscar cliente por nombre
            </label>
            <div className="flex gap-2">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="flex-1 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Nombre del cliente..."
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-3 py-2 bg-slate-100 rounded hover:bg-slate-200"
              >
                <Search size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Presiona Enter o el botón de lupa para buscar.
            </p>
          </div>

          {hasSearched && searchResults.length > 0 && !selectedCustomer && (
            <div className="border border-slate-200 rounded divide-y divide-slate-100">
              {searchResults.map((customer) => (
                <button
                  type="button"
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                >
                  <p className="text-sm font-medium text-slate-700">
                    {customer.fullName}
                  </p>
                  <p className="text-xs text-slate-400">{customer.phone}</p>
                </button>
              ))}
            </div>
          )}

          {selectedCustomer && (
            <div className="bg-slate-50 rounded p-3 text-sm">
              <p className="font-medium text-slate-700">
                {selectedCustomer.fullName}
              </p>
              <p className="text-slate-500">{selectedCustomer.phone}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerForm(EMPTY_CUSTOMER);
                }}
                className="text-xs text-slate-400 underline mt-1"
              >
                Cambiar cliente
              </button>
            </div>
          )}

          {isNewCustomer && (
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <p className="text-sm text-slate-500">
                Cliente nuevo, completa sus datos:
              </p>
              <input
                name="fullName"
                placeholder="Nombre completo"
                value={customerForm.fullName}
                onChange={handleCustomerFieldChange}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
              <input
                name="phone"
                placeholder="Teléfono"
                value={customerForm.phone}
                onChange={handleCustomerFieldChange}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
              <input
                name="email"
                placeholder="Email (opcional)"
                value={customerForm.email}
                onChange={handleCustomerFieldChange}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          )}

          {selectedCustomer &&
            customerMotorcycles.length > 0 &&
            !showNewMotoForm && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Motocicleta
                </label>
                <select
                  value={selectedMotorcycleId}
                  onChange={(e) => setSelectedMotorcycleId(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">Selecciona una moto...</option>
                  {customerMotorcycles.map((moto) => (
                    <option key={moto.id} value={moto.id}>
                      {moto.brand} {moto.model} — {moto.licensePlate}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewMotoForm(true)}
                  className="text-xs text-slate-500 underline mt-1"
                >
                  + Registrar moto nueva
                </button>
              </div>
            )}

          {(isNewCustomer || showNewMotoForm) && (
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <p className="text-sm text-slate-500">Datos de la motocicleta:</p>
              <input
                name="licensePlate"
                placeholder="Placa"
                value={motorcycleForm.licensePlate}
                onChange={handleMotoFieldChange}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="brand"
                  placeholder="Marca"
                  value={motorcycleForm.brand}
                  onChange={handleMotoFieldChange}
                  className="border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />
                <input
                  name="model"
                  placeholder="Modelo"
                  value={motorcycleForm.model}
                  onChange={handleMotoFieldChange}
                  className="border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="year"
                  placeholder="Año (opcional)"
                  value={motorcycleForm.year}
                  onChange={handleMotoFieldChange}
                  className="border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <input
                  name="color"
                  placeholder="Color (opcional)"
                  value={motorcycleForm.color}
                  onChange={handleMotoFieldChange}
                  className="border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              {selectedCustomer && customerMotorcycles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewMotoForm(false)}
                  className="text-xs text-slate-500 underline"
                >
                  Cancelar, usar moto existente
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Falla reportada
            </label>
            <textarea
              value={reportedFailure}
              onChange={(e) => setReportedFailure(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>

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
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Registrar recepción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReceptionFormModal;
