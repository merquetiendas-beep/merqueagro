import React, { useState, useEffect } from "react";
import { Business, User } from "../types";
import { POINT_CONVERSION_RATE, calculatePoints } from "../services/storage";
import { AlertCircle, CheckCircle, HelpCircle, Info, Sparkles, Store } from "lucide-react";

interface ReportFormProps {
  currentUser: User;
  businesses: Business[];
  onSubmitReport: (data: {
    businessId: string;
    businessName: string;
    amount: number;
    receiptNumber?: string;
    notes?: string;
  }) => void;
}

export default function ReportForm({ currentUser, businesses, onSubmitReport }: ReportFormProps) {
  const [selectedBizId, setSelectedBizId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedBiz = businesses.find((b) => b.id === selectedBizId);
  const numericAmount = parseFloat(amountStr.replace(/[^0-9]/g, "")) || 0;

  // Filter businesses for search dropdown
  const filteredSearchBiz = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-complete search box with selected business name
  useEffect(() => {
    if (selectedBiz) {
      setSearchQuery(selectedBiz.name);
    }
  }, [selectedBiz]);

  // Points estimation
  const estPoints = selectedBiz ? calculatePoints(numericAmount, selectedBiz.pointsRate) : 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    if (!rawVal) {
      setAmountStr("");
      return;
    }
    // Format with Colombian separation dots
    const formatted = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(parseInt(rawVal));
    
    setAmountStr(formatted);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedBizId) {
      setErrorMsg("Por favor, selecciona un comercio del listado.");
      return;
    }
    if (numericAmount < 1000) {
      setErrorMsg("El valor de compra mínimo para reportar es de $1.000 COP.");
      return;
    }

    try {
      onSubmitReport({
        businessId: selectedBizId,
        businessName: selectedBiz!.name,
        amount: numericAmount,
        receiptNumber: receiptNumber.trim() || undefined,
        notes: notes.trim() || undefined
      });

      // Clear Form & Show Success States
      setSuccess(true);
      setSelectedBizId("");
      setAmountStr("");
      setReceiptNumber("");
      setNotes("");
      setSearchQuery("");
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo registrar el reporte.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-xl mx-auto space-y-6" id="report-form-container">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Reportar una Compra
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Ingresa el valor de tu compra en cualquier almacén aliado para acumular puntos y canjear premios.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3 animate-fade-in" id="report-success-banner">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-900">¡Reporte Enviado Exitosamente!</p>
            <p className="mt-1">
              Tu reporte ha quedado en estado <span className="font-semibold text-emerald-950">Pendiente de Aprobación</span>. 
              El administrador validará la compra con el comercio y tus puntos se sumarán automáticamente tan pronto sea aprobado.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3" id="report-error-banner">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Step 1: Select Business */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-slate-500" />
            1. Comercio o Servicio Afiliado <span className="text-red-500">*</span>
          </label>
          
          <div className="relative">
            <input
              id="report-biz-search"
              type="text"
              placeholder="Escribe el nombre del negocio o del dueño..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                if (selectedBizId) setSelectedBizId(""); // clear selected if editing
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedBizId("");
                  setShowDropdown(true);
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                x
              </button>
            )}
          </div>

          {/* Custom Search Selection Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100">
              {filteredSearchBiz.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs text-semibold">
                  No se encontraron negocios con ese nombre o categoría
                </div>
              ) : (
                filteredSearchBiz.map((biz) => (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={() => {
                      setSelectedBizId(biz.id);
                      setSearchQuery(biz.name);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left p-3 text-xs hover:bg-slate-50 transition ${
                      selectedBizId === biz.id ? "bg-emerald-50 font-bold" : ""
                    } flex justify-between items-center`}
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{biz.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Prop: {biz.owner} • {biz.category}
                      </p>
                    </div>
                    {biz.pointsRate > 1 && (
                      <span className="bg-yellow-100 text-yellow-800 text-[9px] px-1.5 py-0.5 rounded font-extrabold border border-yellow-200">
                        ⚡ {biz.pointsRate}x Puntos
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Step 2: Value/Amount Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>2. Valor Total de la Compra (COP) <span className="text-red-500">*</span></span>
            <span className="text-[10px] font-normal text-slate-400 normal-case">
              Calculador: 1 punto cada ${POINT_CONVERSION_RATE.toLocaleString()} COP
            </span>
          </label>
          <input
            id="report-amount-input"
            type="text"
            placeholder="Ej: $50.000"
            value={amountStr}
            onChange={handleAmountChange}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-lg text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Points Estimator Preview */}
        {numericAmount > 0 && selectedBiz && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3.5 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-800">
                <Sparkles className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-900">Puntos a Recibir:</p>
                <p className="text-[10px] text-emerald-700 font-semibold">
                  Tasa de acumulación base del negocio ({selectedBiz.pointsRate}x)
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-emerald-800">
                +{estPoints}
              </span>
              <p className="text-[9px] text-emerald-600 font-medium">puntos estimados</p>
            </div>
          </div>
        )}

        {/* Receipt/Reference Number (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            3. Registro / Nº Recibo o Factura (Opcional)
          </label>
          <input
            id="report-receipt-input"
            type="text"
            placeholder="Nº o código de recibo si el local te entregó uno"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Optional Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            4. Detalles o Productos Comprados (Opcional)
          </label>
          <textarea
            id="report-notes-textarea"
            placeholder="Escribe aquí los productos comprados (ej: carne de res, papaya, repuesto aceite...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
          />
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-[10px] text-amber-800 flex gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <p>
            <span className="font-bold">Regla comunitaria:</span> Todos los reportes son cruzados y confirmados directamente con el comerciante. Intentar falsificar compras resultará en la suspensión permanente de tu cuenta y la pérdida de tus puntos del pueblo.
          </p>
        </div>

        {/* Action Submit */}
        <button
          type="submit"
          id="report-submit-button"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          Enviar Reporte al Administrador
        </button>
      </form>
    </div>
  );
}
