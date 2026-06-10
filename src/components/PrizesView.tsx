import React, { useState } from "react";
import { Prize, User } from "../types";
import { Gift, Lock, CheckCircle, Ticket, ShoppingBag, X } from "lucide-react";

interface PrizesViewProps {
  currentUser: User;
  prizes: Prize[];
  onRedeemPrize: (prizeId: string) => { success: boolean; error?: string };
}

export default function PrizesView({ currentUser, prizes, onRedeemPrize }: PrizesViewProps) {
  const [confirmPrizeId, setConfirmPrizeId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const selectedPrizeForCall = prizes.find((p) => p.id === confirmPrizeId);

  const handleConfirmRedeem = () => {
    if (!confirmPrizeId) return;
    setErrorMsg("");
    setSuccessMsg("");

    const res = onRedeemPrize(confirmPrizeId);
    if (res.success) {
      setSuccessMsg(`¡Premio redimido con éxito! Se ha generado tu solicitud. Revisa el menú 'Mi Historial' para ver tu código de reclamo.`);
      setConfirmPrizeId(null);
      
      // Clear success alert after 6 seconds
      setTimeout(() => {
        setSuccessMsg("");
      }, 7000);
    } else {
      setErrorMsg(res.error || "Ocurrió un error al procesar tu redención.");
    }
  };

  return (
    <div className="space-y-6" id="prizes-section">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Catálogo de Premios del Pueblo</h2>
          <p className="text-xs text-slate-500 mt-1">
            Canjea tus puntos de Merqueagro por herramientas del campo, abonos y fabulosos premios locales.
          </p>
        </div>
        <div className="bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-100 text-center shrink-0">
          <p className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wide">Tus Puntos</p>
          <p className="text-lg font-extrabold text-emerald-700">{currentUser.points} Pts</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3 animate-fade-in" id="prize-success-banner">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-950">¡Redención Exitosa!</p>
            <p className="mt-1">{successMsg}</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-2" id="prize-error-banner">
          <CheckCircle className="w-4 h-4 text-red-650 shrink-0" />
          <p className="text-xs font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* Prizes Grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {prizes.map((prize) => {
          const hasPoints = currentUser.points >= prize.pointsCost;
          const outOfStock = prize.stock <= 0;

          return (
            <div
              key={prize.id}
              id={`prize-card-${prize.id}`}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden ${
                outOfStock ? "opacity-70 border-slate-200 bg-slate-50" : "border-slate-100 hover:shadow"
              }`}
            >
              {/* Point Badge on the Card */}
              <div className="absolute top-0 right-0 bg-slate-800 text-emerald-400 text-xs font-extrabold px-4 py-2 rounded-bl-2xl flex items-center gap-1 shadow-sm">
                <Ticket className="w-3.5 h-3.5" />
                {prize.pointsCost} <span className="font-medium text-[10px] text-slate-250">Pts</span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2.5 rounded-xl ${outOfStock ? "bg-slate-200 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-sans leading-tight pr-14">
                      {prize.title}
                    </h3>
                    <p className={`text-[10px] font-semibold mt-1 inline-block px-2 py-0.5 rounded ${
                      outOfStock ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                    }`}>
                      {outOfStock ? "Agotado" : `Quedan ${prize.stock} unidades`}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  {prize.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-5 border-t border-slate-50 pt-4">
                {outOfStock ? (
                  <button
                    disabled
                    className="w-full py-2 bg-slate-200 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    Premio Agotado
                  </button>
                ) : hasPoints ? (
                  <button
                    onClick={() => setConfirmPrizeId(prize.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Redimir Premio
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-350" />
                      Puntos Insuficientes
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-medium">
                      Te faltan <span className="font-bold text-slate-500">{(prize.pointsCost - currentUser.points)} puntos</span> para este premio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal overlay */}
      {confirmPrizeId && selectedPrizeForCall && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex justify-between items-start">
              <div className="bg-amber-100 text-amber-850 p-2.5 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <button 
                onClick={() => setConfirmPrizeId(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-950">¿Confirmar Redención?</h4>
              <p className="text-xs text-slate-500">
                Estás a punto de canjear tus puntos por el siguiente premio:
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <p className="text-xs font-bold text-slate-800">{selectedPrizeForCall.title}</p>
              <p className="text-[10px] text-slate-500 truncate">{selectedPrizeForCall.description}</p>
              <div className="flex justify-between text-xs pt-2 mt-2 border-t border-slate-100 font-semibold">
                <span className="text-slate-500">Costo:</span>
                <span className="text-emerald-700">{selectedPrizeForCall.pointsCost} Pts</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Tu saldo actual:</span>
                <span className="text-slate-700">{currentUser.points} Pts</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-dashed border-slate-200 font-bold">
                <span className="text-slate-500">Saldo final:</span>
                <span className="text-emerald-800">{(currentUser.points - selectedPrizeForCall.pointsCost)} Pts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setConfirmPrizeId(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all border border-slate-205"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRedeem}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm"
              >
                ¡Sí, Redimir!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
