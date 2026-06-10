import React, { useState, useEffect } from "react";
import { User, Business, PurchaseReport, Prize, Redemption } from "./types";
import { initializeStorage, storage } from "./services/storage";
import DirectoryView from "./components/DirectoryView";
import ReportForm from "./components/ReportForm";
import HistoryView from "./components/HistoryView";
import PrizesView from "./components/PrizesView";
import AdminPanel from "./components/AdminPanel";

import { 
  Award, Store, Gift, BookOpen, Clock, LogOut, 
  Sparkles, Lock, ArrowRight, UserCheck, Eye, HelpCircle,
  Home, DollarSign, Sprout
} from "lucide-react";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(val);
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [reports, setReports] = useState<PurchaseReport[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Navigation state for Client Interface
  const [currentScreen, setCurrentScreen] = useState<"directory" | "report" | "history" | "prizes">("directory");

  // Login credentials states
  const [loginCode, setLoginCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Temporary admin view simulation toggle so that ADMIN can view student/member dashboard easily
  const [simulatedClientView, setSimulatedClientView] = useState(false);

  // Initialize and load store records
  useEffect(() => {
    initializeStorage();
    loadAllData();
  }, []);

  const loadAllData = () => {
    setBusinesses(storage.getBusinesses());
    setReports(storage.getReports());
    setPrizes(storage.getPrizes());
    setUsers(storage.getUsers());
    setRedemptions(storage.getRedemptions());

    // Sync current logged in user details if active
    if (currentUser) {
      const freshUser = storage.getUser(currentUser.code);
      if (freshUser) {
        setCurrentUser(freshUser);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const code = loginCode.trim().toUpperCase();
    if (!code) {
      setLoginError("Por favor, ingresa tu código de acceso.");
      return;
    }

    if (code === "ADMIN") {
      if (!showAdminPassword) {
        setShowAdminPassword(true);
        return;
      }
      if (loginPassword !== "merque2026") {
        setLoginError("Contraseña administrativa incorrecta.");
        return;
      }
    }

    const matchedUser = storage.getUser(code);
    if (!matchedUser) {
      // If client code doesn't exist, let's auto-create a user on request to make onboarding 100% friction-free!
      // This is wonderful for demo purposes so that some random user on WhatsApp can just type their name and get going.
      if (code !== "ADMIN" && code.length >= 3) {
        const newUser = storage.createUser({
          code: code,
          name: `Productor (${code})`,
          phone: "3101230000"
        });
        setCurrentUser(newUser);
        setLoginCode("");
        setLoginPassword("");
        setShowAdminPassword(false);
        loadAllData();
        return;
      } else {
        setLoginError("Código no válido. Escribe un código personalizado de mínimo 3 letras para registrarte.");
        return;
      }
    }

    setCurrentUser(matchedUser);
    setLoginCode("");
    setLoginPassword("");
    setShowAdminPassword(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSimulatedClientView(false);
    setCurrentScreen("directory");
  };

  // Report submit handler
  const handleReportSubmit = (data: {
    businessId: string;
    businessName: string;
    amount: number;
    receiptNumber?: string;
    notes?: string;
  }) => {
    if (!currentUser) return;
    storage.addReport({
      userCode: currentUser.code,
      userName: currentUser.name,
      businessId: data.businessId,
      businessName: data.businessName,
      amount: data.amount,
      receiptNumber: data.receiptNumber,
      notes: data.notes,
      date: new Date().toISOString()
    });
    loadAllData();
  };

  // Prize redemption action
  const handleRedeemPrize = (prizeId: string) => {
    if (!currentUser) return { success: false, error: "Inicia sesión" };
    const res = storage.redeemPrize(currentUser.code, prizeId);
    if (res.success) {
      loadAllData();
    }
    return res;
  };

  // Admin Callbacks
  const handleApproveReport = (id: string) => {
    storage.approveReport(id);
    loadAllData();
  };

  const handleRejectReport = (id: string, reason: string) => {
    storage.rejectReport(id, reason);
    loadAllData();
  };

  const handleCompleteRedemption = (id: string) => {
    storage.completeRedemption(id);
    loadAllData();
  };

  const handleAddBusiness = (biz: Omit<Business, "id">) => {
    storage.addBusiness(biz);
    loadAllData();
  };

  const handleDeleteBusiness = (id: string) => {
    storage.deleteBusiness(id);
    loadAllData();
  };

  const handleAddUser = (user: Omit<User, "points" | "totalEarned" | "active" | "isAdmin">) => {
    storage.createUser(user);
    loadAllData();
  };

  const handleDeleteUser = (code: string) => {
    storage.deleteUser(code);
    loadAllData();
  };

  const handleModifyUserPoints = (code: string, delta: number) => {
    const clients = storage.getUsers();
    const idx = clients.findIndex((u) => u.code.toUpperCase() === code.toUpperCase());
    if (idx !== -1) {
      clients[idx].points = Math.max(0, clients[idx].points + delta);
      if (delta > 0) {
        clients[idx].totalEarned += delta;
      }
      storage.saveUsers(clients);
      loadAllData();
    }
  };

  const handleImportData = (jsonString: string) => {
    const res = storage.importData(jsonString);
    if (res) {
      loadAllData();
    }
    return res;
  };

  const handleResetToDefaults = () => {
    storage.resetToDefaults();
    loadAllData();
  };

  // Summary statistics for the user
  const userReports = reports.filter((r) => r.userCode.toUpperCase() === currentUser?.code.toUpperCase());
  const userRedemptions = redemptions.filter((r) => r.userCode.toUpperCase() === currentUser?.code.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" id="main-app-container">
      
      {/* 1. LOGIN SCREEN GATEWAY */}
      {!currentUser ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 py-12 max-w-md mx-auto w-full space-y-6" id="login-layout">
          
          {/* Logo & Intro */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-250 animate-bounce">
              <Sprout className="w-8 h-8 fill-emerald-100/20" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-905 tracking-tight font-sans">
              Merqueagro
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              El directorio y mercado oficial del agro de tu pueblo. ¡Reporta compras de insumos, vende cosechas y acumula puntos para redimir herramientas campesinas!
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-105 shadow-md w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-base font-bold text-slate-800 text-center">
                Ingresa con tu Código de Afiliado
              </h2>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-850 p-2.5 rounded-lg text-xs font-semibold text-center">
                  {loginError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-650 flex justify-between tracking-wide">
                  <span>CÓDIGO DE CLIENTE / ENLACE</span>
                  <span className="text-slate-400 font-normal">Sin espacios</span>
                </label>
                <input
                  id="login-code-input"
                  type="text"
                  placeholder="Ej: JUAN01"
                  value={loginCode}
                  onChange={(e) => {
                    setLoginCode(e.target.value.replace(/\s+/g, ""));
                    setLoginError("");
                  }}
                  required
                  disabled={showAdminPassword}
                  className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-205 rounded-xl text-sm font-bold font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white uppercase transition-all"
                />
              </div>

              {showAdminPassword && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-slate-650 tracking-wide flex items-center justify-between">
                    <span>CONTRASEÑA ADMINISTRATIVA</span>
                    <IconsKey className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <input
                    id="login-password-input"
                    type="password"
                    placeholder="Escribe la clave"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError("");
                    }}
                    required
                    className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-205 rounded-xl text-sm font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminPassword(false);
                      setLoginPassword("");
                      setLoginError("");
                    }}
                    className="text-[10px] text-slate-400 underline hover:text-slate-600 block text-center pt-1"
                  >
                    Volver
                  </button>
                </div>
              )}

              <button
                type="submit"
                id="login-button"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {showAdminPassword ? "Entrar como Administrador" : "Inicia Sesión / Registrarme"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Test/Demo accounts box - Super informative and helpful */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 w-full">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Cuentas y Códigos de Prueba:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono select-all">
              <div className="bg-white p-2 rounded border border-slate-205 text-center">
                <p className="text-[10px] text-slate-400">Productor 1</p>
                <p className="font-bold text-slate-700 mt-0.5">CAMP01</p>
              </div>
              <div className="bg-white p-2 rounded border border-slate-205 text-center">
                <p className="text-[10px] text-slate-400">Productor 2</p>
                <p className="font-bold text-slate-700 mt-0.5">CAMP02</p>
              </div>
              <div className="bg-white p-2 rounded border border-slate-205 text-center">
                <p className="text-[10px] text-slate-400">Productor 3</p>
                <p className="font-bold text-slate-700 mt-0.5">CAMP03</p>
              </div>
              <div className="bg-slate-900 text-emerald-400 p-2 rounded border border-slate-950 text-center col-span-2">
                <p className="text-[9px] text-slate-500">Administrador</p>
                <p className="font-bold mt-0.5">ADMIN</p>
                <p className="text-[9px] text-emerald-500/80 font-sans mt-0.5">Clave: merque2026</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic text-center pt-1 leading-snug">
              * Si escribes un código nuevo (ej: LUIS05), el sistema te registrará automáticamente para facilitarte la prueba.
            </p>
          </div>
        </div>
      ) : (
        
        // 2. LOGGED-IN WORKSPACE LAYOUT
        <div className="flex-1 flex flex-col">
          
          {/* Universal Header */}
          <header className="bg-emerald-800 border-b border-emerald-900 text-white shadow-sm shrink-0">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              
              <div className="flex items-center gap-2 select-none">
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <Sprout className="w-5 h-5 text-emerald-200 fill-emerald-100/10" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight leading-none mb-0.5">
                    Merqueagro
                  </h1>
                  <p className="text-[9px] text-emerald-200 uppercase tracking-widest leading-none font-bold">
                    {currentUser.isAdmin ? "Administración" : "Fidelidad Campesina"}
                  </p>
                </div>
              </div>

              {/* User details and Logout */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-emerald-250 font-mono mt-0.5 leading-none">
                    Cód: {currentUser.code}
                  </p>
                </div>

                {!currentUser.isAdmin && (
                  <div className="bg-emerald-900 border border-emerald-700 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-inner scale-95 sm:scale-100">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-black text-yellow-300">
                      {currentUser.points} <span className="text-[10px] font-normal text-emerald-300">Pts</span>
                    </span>
                  </div>
                )}

                {currentUser.isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSimulatedClientView(!simulatedClientView)}
                      className="bg-emerald-750 hover:bg-emerald-700 text-emerald-110 py-1 px-2.5 rounded-lg text-[10px] font-bold border border-emerald-700 cursor-pointer transition flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      {simulatedClientView ? "Ver Panel Admin" : "Previsualizar App Cliente"}
                    </button>
                    <span className="bg-red-500/20 text-red-200 border border-red-500/30 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                      ADMIN
                    </span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-emerald-900 hover:bg-emerald-700 hover:text-white text-emerald-110 p-2 rounded-lg cursor-pointer transition-all"
                  title="Cerrar Sesión"
                  id="header-logout-button"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </header>

          {/* 3. MAIN WORKPLACE */}
          <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 mb-16">
            
            {/* If logged in as admin and viewing the admin dashboard */}
            {currentUser.isAdmin && !simulatedClientView ? (
              <AdminPanel
                reports={reports}
                redemptions={redemptions}
                businesses={businesses}
                users={users}
                onApproveReport={handleApproveReport}
                onRejectReport={handleRejectReport}
                onCompleteRedemption={handleCompleteRedemption}
                onAddBusiness={handleAddBusiness}
                onDeleteBusiness={handleDeleteBusiness}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                onModifyUserPoints={handleModifyUserPoints}
                onImportData={handleImportData}
                onExportData={storage.exportData}
                onResetToDefaults={handleResetToDefaults}
              />
            ) : (
              
              // 4. CLIENT / SIMULATED VIEW INTERFACE
              <div className="space-y-6">
                
                {/* Simulated Admin Warning banner if relevant */}
                {currentUser.isAdmin && simulatedClientView && (
                  <div className="bg-amber-100 border border-amber-300 text-amber-900 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-between">
                    <span>🔍 Estás visualizando la interfaz como lo haría un cliente.</span>
                    <button 
                      onClick={() => setSimulatedClientView(false)}
                      className="bg-slate-900 text-white rounded px-2 py-0.5 font-sans"
                    >
                      Volver al Rol Admin
                    </button>
                  </div>
                )}

                {/* Personal Welcome Hub Banner */}
                {!currentUser.isAdmin && (
                  <div className="bg-gradient-to-r from-emerald-850 to-teal-900 text-white p-5 rounded-3xl shadow-sm border border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden" id="client-welcome-banner">
                    <div className="absolute right-0 bottom-0 top-0 translate-x-12 opacity-10 flex items-center pointer-events-none">
                      <Sprout className="w-64 h-64" />
                    </div>

                    <div className="space-y-1 z-10">
                      <p className="text-[10px] text-emerald-200 font-extrabold uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        Socio de Merqueagro
                      </p>
                      <h2 className="text-xl font-bold font-sans">
                        ¡Hola, {currentUser.name}! 👋
                      </h2>
                      <p className="text-xs text-emerald-100 leading-snug">
                        Gracias por apoyar a tu pueblo. Compra local, reporta facturas y redime premios campesinos.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 shrink-0 z-10 text-center">
                      <div className="bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-2xl min-w-[90px]">
                        <p className="text-[9px] text-emerald-250 font-bold uppercase tracking-wider">Saldo Puntos</p>
                        <p className="text-xl font-black text-yellow-300 mt-1">{currentUser.points}</p>
                      </div>
                      <div className="bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-2xl min-w-[90px]">
                        <p className="text-[9px] text-emerald-250 font-bold uppercase tracking-wider">Equivalen A</p>
                        <p className="text-xs font-black text-white mt-1.5">
                          {formatCurrency(currentUser.points * 100)} COP
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Segmented Screen Switch Panel */}
                <div className="flex bg-white p-1 rounded-xl shadow-inner border border-slate-100 text-xs">
                  <button
                    id="client-tab-directory"
                    onClick={() => setCurrentScreen("directory")}
                    className={`flex-1 py-2.5 rounded-lg font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      currentScreen === "directory"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    Directorio Comercial
                  </button>
                  <button
                    id="client-tab-report"
                    onClick={() => setCurrentScreen("report")}
                    className={`flex-1 py-2.5 rounded-lg font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      currentScreen === "report"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <DollarSign className="w-4 h-4 shrink-0" />
                    Reportar Compra
                  </button>
                  <button
                    id="client-tab-prizes"
                    onClick={() => setCurrentScreen("prizes")}
                    className={`flex-1 py-2.5 rounded-lg font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      currentScreen === "prizes"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <Gift className="w-4 h-4 shrink-0" />
                    Premios
                  </button>
                  <button
                    id="client-tab-history"
                    onClick={() => setCurrentScreen("history")}
                    className={`flex-1 py-2.5 rounded-lg font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 relative ${
                      currentScreen === "history"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    Mi Historial
                    {reports.some(r => r.userCode.toUpperCase() === currentUser.code.toUpperCase() && r.status === "pending") && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 border border-white rounded-full animate-ping" />
                    )}
                  </button>
                </div>

                {/* Subscreen Rendering */}
                {currentScreen === "directory" && (
                  <DirectoryView businesses={businesses} />
                )}

                {currentScreen === "report" && (
                  <ReportForm
                    currentUser={currentUser}
                    businesses={businesses}
                    onSubmitReport={handleReportSubmit}
                  />
                )}

                {currentScreen === "prizes" && (
                  <PrizesView
                    currentUser={currentUser}
                    prizes={prizes}
                    onRedeemPrize={handleRedeemPrize}
                  />
                )}

                {currentScreen === "history" && (
                  <HistoryView
                    reports={userReports}
                    redemptions={userRedemptions}
                  />
                )}
              </div>
            )}
          </main>

          {/* Quick Footer */}
          <footer className="bg-white border-t border-slate-150 py-4 text-center text-xs text-slate-400 shrink-0 mt-auto">
            <p className="font-medium text-slate-500">Merqueagro © 2026</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Desarrollado con amor agrícola para impulsar la economía de nuestro campo • Todo funciona gratis de productor a consumidor
            </p>
          </footer>

        </div>
      )}

    </div>
  );
}

// Inline fallback icon components
function IconsKey(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3" />
      <path d="M17.5 5.5l3 3" />
    </svg>
  );
}
