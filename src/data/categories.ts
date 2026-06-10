import { CategoryType } from "../types";

export interface CategoryMetadata {
  type: CategoryType;
  iconName: string; // Used to choose which lucide-react icon to display
  color: string; // Tailwind class background
  textColor: string; // Tailwind text color
  borderColor: string; // Tailwind border
  desc: string;
}

export const CATEGORIES_METADATA: CategoryMetadata[] = [
  {
    type: CategoryType.INSUMOS,
    iconName: "Sprout",
    color: "bg-emerald-50 hover:bg-emerald-100",
    textColor: "text-emerald-850",
    borderColor: "border-emerald-200",
    desc: "Abonos, fertilizantes, semilleros y enraizantes",
  },
  {
    type: CategoryType.COSECHAS,
    iconName: "Leaf",
    color: "bg-amber-50 hover:bg-amber-100",
    textColor: "text-amber-805",
    borderColor: "border-amber-200",
    desc: "Cosechas frescas directas de las fincas locales",
  },
  {
    type: CategoryType.HERRAMIENTAS,
    iconName: "Hammer",
    color: "bg-stone-50 hover:bg-stone-105",
    textColor: "text-stone-800",
    borderColor: "border-stone-200",
    desc: "Machetes, palas, azadones, baldes y mangueras",
  },
  {
    type: CategoryType.MAQUINARIA,
    iconName: "Settings",
    color: "bg-blue-50 hover:bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
    desc: "Arados, tractores, guadañas e implementos de labranza",
  },
  {
    type: CategoryType.TRANSPORTE,
    iconName: "Truck",
    color: "bg-cyan-50 hover:bg-cyan-100",
    textColor: "text-cyan-800",
    borderColor: "border-cyan-200",
    desc: "Fletes de cosechas y mudanzas de vereda a ciudad",
  },
  {
    type: CategoryType.VETERINARIA,
    iconName: "ShieldAlert", // generic fallback or safety
    color: "bg-rose-50 hover:bg-rose-100",
    textColor: "text-rose-800",
    borderColor: "border-rose-200",
    desc: "Vacunas, vitaminas, y balanceados para especies",
  },
  {
    type: CategoryType.SERVICIOS,
    iconName: "Users",
    color: "bg-yellow-50 hover:bg-yellow-105",
    textColor: "text-yellow-805",
    borderColor: "border-yellow-250",
    desc: "Mano de obra, jornales y apoyo agrícola general",
  },
  {
    type: CategoryType.ALIMENTOS,
    iconName: "Beef",
    color: "bg-orange-50 hover:bg-orange-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-200",
    desc: "Quesos, yogur artesanal, manteca y lácteos frescos",
  }
];
