import React from "react";
import { PurchaseReport, Redemption } from "../types";
import { Check, Clock, X, Gift, Award, HelpCircle } from "lucide-react";

interface HistoryViewProps {
  reports: PurchaseReport[];
  redemptions: Redemption[];
}

export default function HistoryView({ reports, redemptions }: HistoryViewProps) {
  const allHistory = [
    ...reports.map((r) => ({
      ...r,
      type: "purchase" as const,
      timestamp: new Date(r.id.split("-")[1] ? parseInt(r.id.split("-")[1]) : Date.now())
    })),
    ...redemptions.map((rd) => ({
      ...rd,
      type: "redemption" as const,
      timestamp: new Date(rd.id.split("-")[1] ? parseInt(rd.id.split("-")[1]) : Date.now())
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
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
    <div className="space-y-6" id="history-section">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tu Historial de Actividad</h2>
          <p className="text-xs text-slate-500 mt-1">
            Revisa tus compras reportadas, aprobaciones de puntos y premios redimidos.
          </p>
        </div>
        <div className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reportes</p>
          <p className="text-lg font-extrabold text-slate-700">{reports.length}</p>
        </div>
      </div>

      {allHistory.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Aún no tienes actividad registrada</p>
          <p className="text-xs text-slate-400 mt-1">
            Empieza por reportar tu primera compra en el menú superior.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {allHistory.map((item) => {
            if (item.type === "purchase") {
              const report = item as PurchaseReport;
              return (
                <div
                  key={report.id}
                  id={`history-${report.id}`}
                  className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      {report.status === "approved" ? (
                        <div className="bg-emerald-100 text-emerald-800 p-2 rounded-full">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : report.status === "rejected" ? (
                        <div className="bg-red-100 text-red-800 p-2 rounded-full">
                          <X className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="bg-amber-100 text-amber-800 p-2 rounded-full">
                          <Clock className="w-4 h-4 text-amber-650" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {report.businessName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDate(report.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Monto Comprado:</span>
                        <span className="font-bold text-slate-700">{formatCurrency(report.amount)}</span>
                        {report.receiptNumber && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded border">
                            Recibo: #{report.receiptNumber}
                          </span>
                        )}
                      </div>

                      {report.notes && (
                        <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-dotted">
                          Notas: {report.notes}
                        </p>
                      )}

                      {report.status === "rejected" && report.rejectionReason && (
                        <div className="bg-red-50 text-red-900 border border-red-100 p-2 rounded text-[10px] font-semibold mt-1 flex items-start gap-1">
                          <span className="text-red-700 font-bold">Rechazo:</span>
                          <span>{report.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                    <div>
                      {report.status === "approved" ? (
                        <span className="text-xs font-semibold py-0.5 px-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-150">
                          Aprobado
                        </span>
                      ) : report.status === "rejected" ? (
                        <span className="text-xs font-semibold py-0.5 px-2 rounded-full bg-red-50 text-red-800 border border-red-150">
                          Rechazado
                        </span>
                      ) : (
                        <span className="text-xs font-semibold py-0.5 px-2 rounded-full bg-amber-50 text-amber-800 border border-amber-150">
                          En Verificación
                        </span>
                      )}
                    </div>

                    <div className="text-right sm:mt-1 flex items-center gap-1.5 sm:gap-0 sm:flex-col">
                      <span className={`text-base font-extrabold ${
                        report.status === "approved" ? "text-emerald-600 animate-pulse" : report.status === "rejected" ? "text-slate-400 line-through" : "text-amber-600"
                      }`}>
                        +{report.pointsEarned} Pts
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">acumulados</span>
                    </div>
                  </div>
                </div>
              );
            } else {
              const redemption = item as Redemption;
              return (
                <div
                  key={redemption.id}
                  id={`history-${redemption.id}`}
                  className="bg-gradient-to-r from-amber-50/40 to-yellow-50/10 border border-amber-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-200 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 shrink-0 bg-amber-100 text-amber-800 p-2 rounded-full">
                      <Gift className="w-4 h-4 text-amber-600 fill-amber-300" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          Redimiste: {redemption.prizeTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDate(redemption.date)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Código de Entrega: <span className="font-mono font-bold text-slate-700 bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200">{redemption.id}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium italic">
                        {redemption.status === "pending" 
                          ? "Muestra este código al administrador en el pueblo para reclamar tu premio físico."
                          : "Entregado por el administrador."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-0 pt-2 sm:pt-0 border-amber-100">
                    <div>
                      {redemption.status === "completed" ? (
                        <span className="text-xs font-bold py-0.5 px-2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-250">
                          Entregado
                        </span>
                      ) : (
                        <span className="text-xs font-bold py-0.5 px-2 rounded-full bg-amber-500 text-white border border-amber-550 animate-pulse">
                          Listo para Reclamar
                        </span>
                      )}
                    </div>

                    <div className="text-right sm:mt-1 flex items-center gap-1.5 sm:gap-0 sm:flex-col">
                      <span className="text-base font-extrabold text-red-650">
                        -{redemption.pointsCost} Pts
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">canjeados</span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
