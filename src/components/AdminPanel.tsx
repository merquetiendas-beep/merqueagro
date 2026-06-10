import React, { useState } from "react";
import { Business, User, PurchaseReport, Redemption, CategoryType } from "../types";
import { CATEGORIES_METADATA } from "../data/categories";
import { 
  Check, X, Award, Users, Store, Gift, FileX, Info, 
  Trash2, Plus, Download, Upload, RefreshCw, Layers 
} from "lucide-react";

interface AdminPanelProps {
  reports: PurchaseReport[];
  redemptions: Redemption[];
  businesses: Business[];
  users: User[];
  onApproveReport: (id: string) => void;
  onRejectReport: (id: string, reason: string) => void;
  onCompleteRedemption: (id: string) => void;
  onAddBusiness: (biz: Omit<Business, "id">) => void;
  onDeleteBusiness: (id: string) => void;
  onAddUser: (user: Omit<User, "points" | "totalEarned" | "active" | "isAdmin">) => void;
  onDeleteUser: (code: string) => void;
  onModifyUserPoints: (code: string, delta: number) => void;
  onImportData: (jsonString: string) => boolean;
  onExportData: () => string;
  onResetToDefaults: () => void;
}

export default function AdminPanel({
  reports,
  redemptions,
  businesses,
  users,
  onApproveReport,
  onRejectReport,
  onCompleteRedemption,
  onAddBusiness,
  onDeleteBusiness,
  onAddUser,
  onDeleteUser,
  onModifyUserPoints,
  onImportData,
  onExportData,
  onResetToDefaults
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"pending_points" | "pending_prizes" | "manage_shops" | "manage_users" | "database">("pending_points");

  // Rejection state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Create Store form
  const [newBizName, setNewBizName] = useState("");
  const [newBizCategory, setNewBizCategory] = useState<CategoryType>(CategoryType.INSUMOS);
  const [newBizOwner, setNewBizOwner] = useState("");
  const [newBizPhone, setNewBizPhone] = useState("");
  const [newBizAddress, setNewBizAddress] = useState("");
  const [newBizRate, setNewBizRate] = useState(1.0);
  const [newBizDesc, setNewBizDesc] = useState("");
  const [newBizFeatured, setNewBizFeatured] = useState(false);
  const [storeFormSuccess, setStoreFormSuccess] = useState(false);

  // Create User form
  const [newUserCode, setNewUserCode] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [userFormSuccess, setUserFormSuccess] = useState(false);
  const [userFormError, setUserFormError] = useState("");

  // Point Adjustment state
  const [adjustingUserCode, setAdjustingUserCode] = useState<string | null>(null);
  const [pointsChange, setPointsChange] = useState<number>(10);

  // Database copy-paste loader state
  const [importJsonText, setImportJsonText] = useState("");
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);
  const [importError, setImportError] = useState("");

  const pendingReports = reports.filter((r) => r.status === "pending");
  const pendingRedemptions = redemptions.filter((r) => r.status === "pending");

  const handleApprove = (id: string) => {
    onApproveReport(id);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;
    onRejectReport(rejectId, rejectReason.trim());
    setRejectId(null);
    setRejectReason("");
  };

  const handleAddStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim() || !newBizOwner.trim() || !newBizPhone.trim()) return;

    onAddBusiness({
      name: newBizName.trim(),
      category: newBizCategory,
      owner: newBizOwner.trim(),
      phone: newBizPhone.trim(),
      address: newBizAddress.trim() || "Dirección del Pueblo",
      pointsRate: Number(newBizRate) || 1.0,
      description: newBizDesc.trim() || undefined,
      featured: newBizFeatured
    });

    setNewBizName("");
    setNewBizOwner("");
    setNewBizPhone("");
    setNewBizAddress("");
    setNewBizRate(1.0);
    setNewBizDesc("");
    setNewBizFeatured(false);
    
    setStoreFormSuccess(true);
    setTimeout(() => setStoreFormSuccess(false), 4000);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError("");
    setUserFormSuccess(false);

    const cleanCode = newUserCode.trim().toUpperCase();
    if (!cleanCode || !newUserName.trim()) {
      setUserFormError("Código y Nombre son obligatorios");
      return;
    }

    if (users.some((u) => u.code.toUpperCase() === cleanCode)) {
      setUserFormError(`El código de usuario "${cleanCode}" ya se encuentra registrado.`);
      return;
    }

    onAddUser({
      code: cleanCode,
      name: newUserName.trim(),
      phone: newUserPhone.trim()
    });

    setNewUserCode("");
    setNewUserName("");
    setNewUserPhone("");
    setUserFormSuccess(true);
    setTimeout(() => setUserFormSuccess(false), 4000);
  };

  const handleExportClick = () => {
    const raw = onExportData();
    setImportJsonText(raw);
    
    // Auto download JSON file helper
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(raw);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `merqueagro_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportClick = () => {
    setImportSuccess(null);
    setImportError("");
    if (!importJsonText.trim()) {
      setImportError("Por favor ingresa o pega el JSON con los datos.");
      return;
    }
    const res = onImportData(importJsonText.trim());
    if (res) {
      setImportSuccess(true);
      setImportJsonText("");
    } else {
      setImportError("Error al importar. Verifica que el formato JSON sea correcto.");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="admin-panel">
      {/* Admin Header */}
      <div className="bg-slate-900 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-rose-500 select-none animate-pulse">
              Admin Mode
            </span>
            <h1 className="text-xl font-bold font-sans tracking-tight">Panel de Administración</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Revisa compras, aprueba puntos, edita el directorio de {businesses.length} comercios y exporta bases de datos.
          </p>
        </div>

        <button
          onClick={onResetToDefaults}
          id="admin-reset-button"
          className="bg-slate-800 hover:bg-slate-700 text-slate-205 border border-slate-700 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reiniciar Todo (Demo)
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-150 overflow-x-auto bg-slate-50 divide-x divide-slate-100">
        <button
          id="tab-pending-points"
          onClick={() => setActiveTab("pending_points")}
          className={`flex-1 py-3.5 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeTab === "pending_points"
              ? "bg-white text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          Aprobar Compras ({pendingReports.length})
        </button>
        <button
          id="tab-pending-prizes"
          onClick={() => setActiveTab("pending_prizes")}
          className={`flex-1 py-3.5 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeTab === "pending_prizes"
              ? "bg-white text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <Gift className="w-4 h-4 shrink-0" />
          Reclamos Premios ({pendingRedemptions.length})
        </button>
        <button
          id="tab-manage-shops"
          onClick={() => setActiveTab("manage_shops")}
          className={`flex-1 py-3.5 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeTab === "manage_shops"
              ? "bg-white text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <Store className="w-4 h-4 shrink-0" />
          Directorio Comercios ({businesses.length})
        </button>
        <button
          id="tab-manage-users"
          onClick={() => setActiveTab("manage_users")}
          className={`flex-1 py-3.5 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeTab === "manage_users"
              ? "bg-white text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          Afiliados ({users.length - 1})
        </button>
        <button
          id="tab-database"
          onClick={() => setActiveTab("database")}
          className={`flex-1 py-3.5 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeTab === "database"
              ? "bg-white text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          Base Datos (200 Locales)
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        
        {/* Tab 1: Pending Points Verification */}
        {activeTab === "pending_points" && (
          <div className="space-y-4" id="section-pending-points">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b pb-2">
              Validar Compras Reportadas
            </h3>

            {pendingReports.length === 0 ? (
              <div className="p-10 text-center text-slate-500 bg-slate-50 border border-slate-100 rounded-xl">
                <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-xs">¡No hay reportes pendientes de validar!</p>
                <p className="text-[11px] text-slate-400 mt-1">Los vecinos recibirán sus puntos inmediatamente al aprobar.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingReports.map((report) => (
                  <div key={report.id} className="bg-slate-50 border border-slate-205 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-900 bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded border border-emerald-200">
                          {report.userCode}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{report.userName}</span>
                        <span className="text-[10px] text-slate-400">{new Date(report.date).toLocaleString()}</span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p>
                          Negocio: <span className="font-bold text-slate-800">{report.businessName}</span>
                        </p>
                        <p>
                          Valor: <span className="font-bold text-slate-800">{formatCurrency(report.amount)}</span>
                        </p>
                        {report.receiptNumber && (
                          <p>
                            Nº Recibo/Factura: <span className="font-mono bg-white px-1.5 py-0.5 border rounded text-slate-700">#{report.receiptNumber}</span>
                          </p>
                        )}
                        {report.notes && (
                          <p className="italic bg-white p-2 rounded border border-slate-150 inline-block text-[11px]">
                            Detalle: "{report.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-0 pt-3 md:pt-0 border-slate-200 justify-end">
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-emerald-600 block">+{report.pointsEarned} Pts</span>
                        <span className="text-[9px] text-slate-400 block font-semibold leading-none">a acumular</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setRejectId(report.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg border border-red-200 cursor-pointer transition-all flex items-center justify-center gap-1 text-xs font-bold"
                          title="Rechazar reporte"
                        >
                          <X className="w-4 h-4" />
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleApprove(report.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3.5 rounded-lg shadow-sm font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs"
                          title="Aprobar puntos"
                        >
                          <Check className="w-4 h-4 font-bold" />
                          Aprobar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reject Form dialog overlay */}
            {rejectId && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleRejectSubmit} className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border">
                  <h4 className="text-sm font-bold text-slate-800">Rechazar Reporte de Compra</h4>
                  <p className="text-xs text-slate-500">
                    Por favor especifica la razón de rechazo. El vecino la verá en su aplicación:
                  </p>
                  
                  <input
                    type="text"
                    placeholder="Ej: Recibo borroso / El comercio no confirma esta compra / Valor duplicado"
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />

                  <div className="flex gap-3 justify-end text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setRejectId(null)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-red-650 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                    >
                      Confirmar Rechazo
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pending Prize Redemptions */}
        {activeTab === "pending_prizes" && (
          <div className="space-y-4" id="section-pending-prizes">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b pb-2">
              Entregar Premios Canjeados
            </h3>

            {pendingRedemptions.length === 0 ? (
              <div className="p-10 text-center text-slate-500 bg-slate-50 border rounded-xl">
                <Gift className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-xs">No hay entregas pendientes de premios</p>
                <p className="text-[11px] text-slate-400 mt-1">Los vecinos te mostrarán el código generado al reclamar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRedemptions.map((redemption) => (
                  <div key={redemption.id} className="bg-amber-50/40 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-705 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded">
                          {redemption.userCode}
                        </span>
                        <p className="text-xs font-bold text-slate-800">{redemption.userName}</p>
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        Premio Solicitado: <span className="text-amber-850 font-sans">{redemption.prizeTitle}</span>
                      </p>
                      <p className="text-[10px] text-slate-505">
                        Fecha: {new Date(redemption.date).toLocaleString()} • Código: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 text-amber-900">{redemption.id}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-0 pt-3 md:pt-0 border-slate-200 justify-end">
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-red-600">-{redemption.pointsCost} Pts</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Descontados</p>
                      </div>

                      <button
                        onClick={() => onCompleteRedemption(redemption.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 font-bold" />
                        Marcar como Entregado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Directory Management */}
        {activeTab === "manage_shops" && (
          <div className="space-y-6" id="section-manage-shops">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                Crear / Eliminar Comercios del Directorio
              </h3>
              <p className="text-xs text-slate-400">Total: {businesses.length} locales registrados</p>
            </div>

            {/* Grid layout with adding form left and list right */}
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Form Col */}
              <form onSubmit={handleAddStoreSubmit} className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1 pb-1 border-b">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Agregar Nuevo Comercio
                </p>

                {storeFormSuccess && (
                  <p className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 p-2 rounded-lg font-bold">
                    ¡Comercio agregado correctamente! Revisa el listado.
                  </p>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600">Nombre del Local</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Granero La Providencia"
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Categoría</label>
                    <select
                      value={newBizCategory}
                      onChange={(e) => setNewBizCategory(e.target.value as CategoryType)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      {Object.values(CategoryType).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Propietario</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Don Pedro"
                      value={newBizOwner}
                      onChange={(e) => setNewBizOwner(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Teléfono (WhatsApp)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 3123456789"
                      value={newBizPhone}
                      onChange={(e) => setNewBizPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Multiplicador Pts</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="5.0"
                      value={newBizRate}
                      onChange={(e) => setNewBizRate(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600">Dirección</label>
                  <input
                    type="text"
                    placeholder="Ej: Calle Principal #10-15"
                    value={newBizAddress}
                    onChange={(e) => setNewBizAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600">Descripción / Servicios</label>
                  <textarea
                    placeholder="Ej: Víveres al por mayor y detal"
                    value={newBizDesc}
                    onChange={(e) => setNewBizDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 font-bold text-[11px] text-slate-705 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBizFeatured}
                    onChange={(e) => setNewBizFeatured(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Destacar este comercio en la Web
                </label>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm md:mt-2"
                >
                  Confirmar y Guardar Comercio
                </button>
              </form>

              {/* List Col */}
              <div className="lg:col-span-3 space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {businesses.map((biz) => {
                  const meta = CATEGORIES_METADATA.find((m) => m.type === biz.category);
                  return (
                    <div key={biz.id} className="bg-white border hover:border-slate-300 p-3 rounded-xl flex justify-between items-center transition-all gap-2">
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-extrabold text-slate-800 truncate">{biz.name}</p>
                          {meta && (
                            <span className={`inline-block text-[9 px] scale-90 px-1.5 py-0.2 rounded border font-semibold ${meta.color} ${meta.textColor} ${meta.borderColor}`}>
                              {biz.category}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Dueño: <span className="font-bold">{biz.owner}</span> • Cel: {biz.phone}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{biz.address}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] bg-yellow-105 text-yellow-800 border border-yellow-200 px-1.5 py-0.5 rounded font-extrabold">
                          {biz.pointsRate}x Pts
                        </span>
                        <button
                          onClick={() => onDeleteBusiness(biz.id)}
                          className="text-slate-400 hover:text-red-750 p-1.5 hover:bg-red-50 rounded transition-all cursor-pointer"
                          title="Eliminar del directorio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: User/Affiliate Management */}
        {activeTab === "manage_users" && (
          <div className="space-y-6" id="section-manage-users">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b pb-2">
              Gestión de Afiliados (Clientes del Pueblo)
            </h3>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Form Col */}
              <form onSubmit={handleCreateUserSubmit} className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1 pb-1 border-b">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Registrar Nuevo Afiliado
                </p>

                {userFormSuccess && (
                  <p className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-250 p-2 rounded font-bold">
                    ¡Afiliado registrado exitosamente! Ya puede iniciar sesión con su código único.
                  </p>
                )}

                {userFormError && (
                  <p className="text-[10px] bg-red-100 text-red-800 border border-red-200 p-2 rounded font-semibold">
                    {userFormError}
                  </p>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650 flex items-center justify-between">
                    <span>Código Único / Enlace <span className="text-red-500">*</span></span>
                    <span className="text-[9px] font-normal text-slate-400 font-mono">Ej: LUIS05, CARMEN7</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: PEDRO10"
                    value={newUserCode}
                    onChange={(e) => setNewUserCode(e.target.value.replace(/\s+/g, ""))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono tracking-wider text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650">Nombre Completo <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pedro Antonio Alarcón"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650">Teléfono (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="Ej: 3125554321"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="bg-amber-50 p-2.5 rounded text-[10px] text-amber-900 border border-amber-100">
                  <Info className="w-3.5 h-3.5 inline shrink-0 mr-1 text-amber-500" />
                  Este es el código que el vecino usará para iniciar sesión. Dale un código fácil de recordar y avísale de uso personal.
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all border border-emerald-650 shadow-sm"
                >
                  Registrar Afiliado
                </button>
              </form>

              {/* List Col */}
              <div className="lg:col-span-3 space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {users.filter(u => !u.isAdmin).map((user) => (
                  <div key={user.code} className="bg-white border p-3 rounded-xl flex justify-between items-center">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-205">
                          {user.code}
                        </span>
                        <p className="text-xs font-bold text-slate-805 truncate">{user.name}</p>
                      </div>
                      <p className="text-[10px] text-slate-400">Cel: {user.phone || "No registrado"}</p>
                      <p className="text-[10px] text-slate-500 font-bold">
                        Saldo puntos: <span className="text-emerald-700">{user.points} Pts</span> • Totales ganados: {user.totalEarned} Pts
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {/* Manual adjust buttons */}
                      <button
                        onClick={() => {
                          setAdjustingUserCode(user.code);
                          setPointsChange(10);
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 py-1 px-2 rounded-lg cursor-pointer transition"
                        title="Ajustar Puntos Manualmente"
                      >
                        Ajustar Pts
                      </button>

                      <button
                        onClick={() => onDeleteUser(user.code)}
                        className="text-slate-400 hover:text-red-750 p-1.5 hover:bg-red-50 rounded cursor-pointer"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Points Adjust dialogue */}
            {adjustingUserCode && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 border shadow-2xl">
                  <h4 className="text-sm font-bold text-slate-905">Ajustar Saldo de Puntos Campaña</h4>
                  <p className="text-xs text-slate-550">
                    Modificar puntos manualmente para el afiliado <span className="font-black text-slate-800">{adjustingUserCode}</span>:
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-550">Valor del ajuste (puntos)</label>
                    <input
                      type="number"
                      value={pointsChange}
                      onChange={(e) => setPointsChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-350 rounded-lg text-xs"
                    />
                    <p className="text-[9px] text-slate-400 font-medium">Use un valor positivo para sumarle puntos o un valor negativo para restarle puntos.</p>
                  </div>

                  <div className="flex gap-3 justify-end text-xs font-bold pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setAdjustingUserCode(null)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onModifyUserPoints(adjustingUserCode, pointsChange);
                        setAdjustingUserCode(null);
                      }}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shadow-sm"
                    >
                      Aplicar Ajuste
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Data Backup, Import & Export */}
        {activeTab === "database" && (
          <div className="space-y-5" id="section-database">
            <div className="border-b pb-3.5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                Cargar o Respaldar Base de Datos (Excelente para 200 Locales)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ¿Tienes una lista de comercios en Excel? No hay problema. Copia y pega tus datos en formato JSON para rellenar instantáneamente tus 200 almacenes locales.
              </p>
            </div>

            {importSuccess === true && (
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-xl text-xs font-bold">
                ¡Información cargada correctamente en la plataforma! El directorio y la base de datos se actualizaron en tiempo real.
              </div>
            )}

            {importError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold">
                {importError}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Export Panel */}
              <div className="bg-slate-50 border p-4 rounded-xl space-y-3.5">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <Download className="w-4 h-4 text-emerald-600" />
                    Respaldar Información
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Descarga toda la información actual (afiliados, comercios, puntos aprobados, redenciones de premios) en un archivo local para que nunca pierdas nada.
                  </p>
                </div>

                <button
                  onClick={handleExportClick}
                  id="admin-export-button"
                  className="bg-slate-800 hover:bg-slate-900 border border-slate-950 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Exportar / Descargar Base de Datos
                </button>
              </div>

              {/* Import Panel */}
              <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <Upload className="w-4 h-4 text-amber-500" />
                    Cargar / Restaurar Base de Datos
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    ¿Quieres usar los 200 negocios listos o restaurar un respaldo anterior? Pega aquí el código JSON y haz clic en Cargar.
                  </p>
                </div>

                <textarea
                  id="json-import-textarea"
                  rows={4}
                  placeholder='Pega tu código JSON aquí...'
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-[10px] text-slate-705"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleImportClick}
                    id="admin-import-button"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg cursor-pointer transition shadow-sm text-center"
                  >
                    Cargar Base de Datos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Generate Specimen JSON structure to guide the user
                      const templateSpecimen = {
                        businesses: [
                          {
                            name: "Tu Almacén del Pueblo Ejemplo",
                            category: "Tienda / Supermercado",
                            owner: "Don Alirio",
                            phone: "3120000000",
                            address: "Calle Real #1-23",
                            pointsRate: 1.0,
                            description: "Víveres campesinos y rancho."
                          }
                        ]
                      };
                      setImportJsonText(JSON.stringify(templateSpecimen, null, 2));
                    }}
                    className="bg-slate-205 hover:bg-slate-300 text-slate-700 text-[10px] font-bold p-2 rounded-lg cursor-pointer transition"
                  >
                    Ver Plantilla Ejemplo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
