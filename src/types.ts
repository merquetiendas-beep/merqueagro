export enum CategoryType {
  INSUMOS = "Insumos, Fertilizantes y Semillas",
  COSECHAS = "Cosechas Directas y Frutos",
  HERRAMIENTAS = "Ferretería y Herramientas del Campo",
  MAQUINARIA = "Tractores y Maquinaria Agrícola",
  TRANSPORTE = "Transporte de Carga y Fletes Veredales",
  VETERINARIA = "Veterinaria, Alimento y Concentrados",
  SERVICIOS = "Abonos Orgánicos y Jornales",
  ALIMENTOS = "Quesos, Lácteos y Alimentos del Campo"
}

export interface Business {
  id: string;
  name: string;
  category: CategoryType;
  owner: string;
  phone: string;
  address: string;
  pointsRate: number; // e.g. 1 point per $1,000 COP spent (so a rate of 0.001 or custom rate)
  description?: string;
  featured?: boolean;
}

export interface User {
  code: string;
  name: string;
  phone: string;
  points: number;
  totalEarned: number;
  isAdmin?: boolean;
  active?: boolean;
}

export interface PurchaseReport {
  id: string;
  userCode: string;
  userName: string;
  businessId: string;
  businessName: string;
  amount: number;
  pointsEarned: number;
  date: string;
  receiptNumber?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export interface Prize {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  image?: string;
  stock: number;
}

export interface Redemption {
  id: string;
  userCode: string;
  userName: string;
  prizeId: string;
  prizeTitle: string;
  pointsCost: number;
  date: string;
  status: "pending" | "completed";
}
