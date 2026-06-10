import React, { useState } from "react";
import { Business, CategoryType } from "../types";
import { CATEGORIES_METADATA } from "../data/categories";
import * as Icons from "lucide-react";

// Robust dynamic icon mapper to prevent compilation issues
function getIcon(name: string, className?: string) {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) {
    return <Icons.HelpCircle className={className} />;
  }
  return <IconComponent className={className} />;
}

interface DirectoryViewProps {
  businesses: Business[];
}

export default function DirectoryView({ businesses }: DirectoryViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);

  const filteredBusinesses = businesses.filter((biz) => {
    const matchesSearch =
      biz.name.toLowerCase().includes(search.toLowerCase()) ||
      biz.owner.toLowerCase().includes(search.toLowerCase()) ||
      (biz.description || "").toLowerCase().includes(search.toLowerCase()) ||
      biz.address.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory ? biz.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  const featuredBusinesses = filteredBusinesses.filter(b => b.featured);
  const regularBusinesses = filteredBusinesses.filter(b => !b.featured);

  const handleWhatsApp = (biz: Business) => {
    const text = encodeURIComponent(
      `Hola ${biz.owner}, vi tu negocio "${biz.name}" en el directorio Merqueagro y me gustaría hacer una consulta/pedido.`
    );
    window.open(`https://wa.me/57${biz.phone}?text=${text}`, "_blank");
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  return (
    <div className="space-y-6" id="directory-section">
      {/* Search & Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">
            Directorio de Comercios y Servicios
          </h2>
          <p className="text-sm text-slate-500">
            Encuentra almacenes, talleres y productores locales. ¡Reporta tus compras para ganar MerquePuntos!
          </p>
        </div>

        <div className="relative">
          <Icons.Search className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
          <input
            id="search-input"
            type="text"
            placeholder="Buscar por nombre, dueño, producto o servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Badges Filter */}
      <div className="overflow-x-auto pb-2 scrollbar-none flex gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium cursor-pointer shrink-0 transition-all ${
            !selectedCategory
              ? "bg-emerald-600 text-white border-emerald-650 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
          id="cat-badge-all"
        >
          <Icons.LayoutGrid className="w-3.5 h-3.5" />
          Todos
        </button>
        {CATEGORIES_METADATA.map((cat) => {
          const isSelected = selectedCategory === cat.type;
          return (
            <button
              key={cat.type}
              id={`cat-badge-${cat.type.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedCategory(isSelected ? null : cat.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium cursor-pointer shrink-0 transition-all ${
                isSelected
                  ? "bg-slate-800 text-white border-slate-900 shadow-sm"
                  : `${cat.color} ${cat.textColor} ${cat.borderColor}`
              }`}
            >
              {getIcon(cat.iconName, "w-3.5 h-3.5")}
              {cat.type}
            </button>
          );
        })}
      </div>

      {/* Main Businesses List Grid */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-slate-50 p-12 text-center rounded-2xl border border-dashed border-slate-200">
          <Icons.Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No se encontraron negocios</p>
          <p className="text-xs text-slate-400 mt-1">Intenta con otra palabra clave o categoría</p>
          {(search || selectedCategory) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory(null);
              }}
              className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 transition text-slate-700 text-xs font-semibold rounded-lg"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured Sections (Recomendados) */}
          {featuredBusinesses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Icons.Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                  Comercios Destacados
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {featuredBusinesses.map((biz) => {
                  const meta = CATEGORIES_METADATA.find(c => c.type === biz.category);
                  return (
                    <div
                      key={biz.id}
                      id={`biz-card-${biz.id}`}
                      className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                        <Icons.Award className="w-3 h-3" />
                        Destacado
                      </div>

                      <div className="space-y-2">
                        {/* Category Badge */}
                        <div className="flex items-center gap-1">
                          {meta && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${meta.color} ${meta.textColor} ${meta.borderColor}`}>
                              {getIcon(meta.iconName, "w-3 h-3")}
                              {meta.type}
                            </span>
                          )}
                          {biz.pointsRate > 1 && (
                            <span className="bg-yellow-100 text-yellow-800 border-yellow-200 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold">
                              ⚡ Multiplicador {biz.pointsRate}x
                            </span>
                          )}
                        </div>

                        {/* Store Info */}
                        <div>
                          <h4 className="text-base font-bold text-slate-800 font-sans">
                            {biz.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Propietario: <span className="font-semibold text-slate-700">{biz.owner}</span>
                          </p>
                        </div>

                        {biz.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 pt-1">
                            {biz.description}
                          </p>
                        )}

                        <div className="text-xs space-y-1 text-slate-500 pt-2 border-t border-slate-50">
                          <div className="flex items-center gap-1.5">
                            <Icons.MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{biz.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Icons.Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>+57 {biz.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleCall(biz.phone)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                        >
                          <Icons.Phone className="w-3.5 h-3.5" />
                          Llamar
                        </button>
                        <button
                          onClick={() => handleWhatsApp(biz.phone ? biz : { ...biz })}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold cursor-pointer border border-emerald-200 transition-all"
                        >
                          <Icons.MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Businesses */}
          {regularBusinesses.length > 0 && (
            <div className="space-y-3">
              {featuredBusinesses.length > 0 && (
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pt-2">
                  Todos los Comercios ({regularBusinesses.length})
                </h3>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularBusinesses.map((biz) => {
                  const meta = CATEGORIES_METADATA.find(c => c.type === biz.category);
                  return (
                    <div
                      key={biz.id}
                      id={`biz-card-${biz.id}`}
                      className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1">
                          {meta && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${meta.color} ${meta.textColor} ${meta.borderColor}`}>
                              {getIcon(meta.iconName, "w-3 h-3")}
                              {meta.type}
                            </span>
                          )}
                          {biz.pointsRate > 1 && (
                            <span className="bg-amber-50 text-amber-800 border-amber-200 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-bold">
                              ⚡ {biz.pointsRate}x Pts
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 font-sans tracking-tight">
                            {biz.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Prop: <span className="font-semibold text-slate-600">{biz.owner}</span>
                          </p>
                        </div>

                        {biz.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            {biz.description}
                          </p>
                        )}

                        <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-50">
                          <div className="flex items-center gap-1.5">
                            <Icons.MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{biz.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Icons.Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>+57 {biz.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                        <button
                          onClick={() => handleCall(biz.phone)}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[11px] font-medium cursor-pointer transition-all"
                        >
                          <Icons.Phone className="w-3 h-3" />
                          Llamar
                        </button>
                        <button
                          onClick={() => handleWhatsApp(biz)}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold cursor-pointer border border-emerald-150 transition-all"
                        >
                          <Icons.MessageSquare className="w-3 h-3 text-emerald-500" />
                          Chat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
