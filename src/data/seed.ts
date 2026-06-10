import { Business, CategoryType, User, Prize } from "../types";

export const SEED_BUSINESSES: Business[] = [
  // Insumos, Fertilizantes y Semillas
  {
    id: "biz-agro-1",
    name: "AgroInsumos El Doradito",
    category: CategoryType.INSUMOS,
    owner: "Don Tobías Urrego",
    phone: "3124567890",
    address: "Calle Real #4-25, Sector de Abastos",
    pointsRate: 1,
    description: "Semanas medicinales, fertilizantes certificados, fungicidas y bultos de abono orgánico.",
    featured: true
  },
  {
    id: "biz-agro-2",
    name: "Semillas y Cultivos San Isidro",
    category: CategoryType.INSUMOS,
    owner: "Doña Clara Gómez",
    phone: "3159876543",
    address: "Carrera 8 #12-10, Frente al Comité",
    pointsRate: 1,
    description: "Distribuidor premium de semillas certificadas de plátano, café, cacao, hortalizas y frutales."
  },

  // Cosechas Directas y Frutos
  {
    id: "biz-cosechas-1",
    name: "Finca El Suspiro - Papas y Hortalizas",
    category: CategoryType.COSECHAS,
    owner: "Jacinto Herrera",
    phone: "3134567111",
    address: "Vereda La Esmeralda, Lote 4",
    pointsRate: 1.5, // Farmers give extra loyalty reward!
    description: "Papa criolla, papa pastusa, cilantro de castilla, zanahoria y legumbres frescas recién desenterradas.",
    featured: true
  },
  {
    id: "biz-cosechas-2",
    name: "Asociación Pro-Café de Altura",
    category: CategoryType.COSECHAS,
    owner: "Mercedes Patiño",
    phone: "3182345678",
    address: "Vereda El Mirador, km 5",
    pointsRate: 1.5,
    description: "Café de origen en pergamino, café tostado molido artesanalmente por familias recolectoras de la vereda."
  },

  // Ferretería y Herramientas
  {
    id: "biz-ferre-1",
    name: "Ferre-Campiña El Machete",
    category: CategoryType.HERRAMIENTAS,
    owner: "Jaime Montoya",
    phone: "3118901234",
    address: "Avenida de la Federación #15-30",
    pointsRate: 1,
    description: "Machetes, azadones, palas, alambre de púas, grapas, mangueras de riego y tanques de reserva.",
    featured: true
  },

  // Maquinaria Agrícola
  {
    id: "biz-maquinaria-1",
    name: "Tractores y Arados El Porvenir",
    category: CategoryType.MAQUINARIA,
    owner: "Carlos Lozano",
    phone: "3201122334",
    address: "Salida Vía Melgar km 1",
    pointsRate: 1.2,
    description: "Alquiler de tractores, mantenimiento de motoguadañas, guadañadoras y bombas de espalda para fumigación."
  },

  // Transporte de Carga y Fletes Veredales
  {
    id: "biz-trans-1",
    name: "Fletes y Acarreos La Trocha S.A.",
    category: CategoryType.TRANSPORTE,
    owner: "Mauricio Benítez",
    phone: "3145612345",
    address: "Central de Carga, Bahía Izquierda",
    pointsRate: 1,
    description: "Camiones estacas turbo y sencillos para sacar tu cosecha de café, caña, plátano o papa a la plaza principal."
  },

  // Veterinaria, Alimento y Concentrados
  {
    id: "biz-veterinaria-1",
    name: "Agropecuaria El Ternero Feliz",
    category: CategoryType.VETERINARIA,
    owner: "Dr. Rigoberto Vélez (Médico Veterinario)",
    phone: "3104321098",
    address: "Carrera 7 con Calle 10",
    pointsRate: 1,
    description: "Medicinas veterinarias, sales mineralizadas, concentrado para pollos de engorde, cerdos y ganado lechero."
  },

  // Abonos Orgánicos y Jornales de Apoyo
  {
    id: "biz-servicios-1",
    name: "Abonos y Mano de Obra Comunitaria",
    category: CategoryType.SERVICIOS,
    owner: "Luis Alberto Duarte",
    phone: "3139081234",
    address: "Vereda Arrayanes, Centro de Acopio",
    pointsRate: 1.2,
    description: "Provisión de compostaje orgánico de alta calidad y cuadrillas calificadas para limpia, poda y cosecha de cultivos."
  },

  // Quesos, Lácteos y Alimentos
  {
    id: "biz-alimentos-1",
    name: "Lácteos y Quesera La Pradera",
    category: CategoryType.ALIMENTOS,
    owner: "Doña Elena Gómez",
    phone: "3176543210",
    address: "Plaza de Abastos, Local 8",
    pointsRate: 1,
    description: "Queso campesino fresco de hoja, cuajada del día, arequipe de paila y yogur artesanal de mora silvestre.",
    featured: true
  }
];

export const SEED_USERS: User[] = [
  {
    code: "CAMP01",
    name: "Don Jacinto Herrera",
    phone: "3103456789",
    points: 125,
    totalEarned: 350,
    active: true
  },
  {
    code: "CAMP02",
    name: "Doña Mercedes Patiño",
    phone: "3156789123",
    points: 480,
    totalEarned: 780,
    active: true
  },
  {
    code: "CAMP03",
    name: "Don Luis Alberto Duarte",
    phone: "3208765432",
    points: 90,
    totalEarned: 240,
    active: true
  },
  {
    code: "ADMIN",
    name: "Administrador Merqueagro",
    phone: "3001234567",
    points: 0,
    totalEarned: 0,
    isAdmin: true,
    active: true
  }
];

export const SEED_PRIZES: Prize[] = [
  {
    id: "prize-1",
    title: "Bono de Compra AgroInsumos $20.000 COP",
    pointsCost: 150,
    description: "Reclamable en AgroInsumos El Doradito o Semillas San Isidro para abonos y herramientas pequeñas.",
    stock: 50
  },
  {
    id: "prize-2",
    title: "Bulto de Abono Orgánico Premium (40kg)",
    pointsCost: 300,
    description: "Abono enriquecido con humus para fortalecer la siembra y maximizar la productividad de tus cultivos.",
    stock: 20
  },
  {
    id: "prize-3",
    title: "Kit Campesino (Pala, Machete Corona y Guantes)",
    pointsCost: 500,
    description: "Herramientas de labranza de calidad certificada para agilizar las rudas tareas del campo diario.",
    stock: 12
  },
  {
    id: "prize-4",
    title: "Bono Combustible Maquinaria $60.000 COP",
    pointsCost: 750,
    description: "Válido para tanquear guadañas, motobombas de riego o tractores en las bombas autorizadas adheridas.",
    stock: 10
  },
  {
    id: "prize-5",
    title: "Bulto de Alimento Concentrado (Aves o Ganado)",
    pointsCost: 1000,
    description: "Saco completo de 40 kg de concentrado proteico premium para optimizar engorde de cerdos, gallinas o vacas.",
    stock: 5
  }
];
