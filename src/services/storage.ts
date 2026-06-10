import { User, Business, PurchaseReport, Prize, Redemption, CategoryType } from "../types";
import { SEED_BUSINESSES, SEED_USERS, SEED_PRIZES } from "../data/seed";

const KEYS = {
  USERS: "merquepuntos_users",
  BUSINESSES: "merquepuntos_businesses",
  REPORTS: "merquepuntos_reports",
  PRIZES: "merquepuntos_prizes",
  REDEMPTIONS: "merquepuntos_redemptions",
  INIT: "merquepuntos_initialized"
};

export const POINT_CONVERSION_RATE = 5000; // 1 Point per $5,000 COP spent

export function calculatePoints(amount: number, rateMultiplier: number): number {
  return Math.floor((amount / POINT_CONVERSION_RATE) * rateMultiplier);
}

export function initializeStorage() {
  if (!localStorage.getItem(KEYS.INIT)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(KEYS.BUSINESSES, JSON.stringify(SEED_BUSINESSES));
    localStorage.setItem(KEYS.PRIZES, JSON.stringify(SEED_PRIZES));
    localStorage.setItem(KEYS.REPORTS, JSON.stringify([]));
    localStorage.setItem(KEYS.REDEMPTIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.INIT, "true");
  }
}

// Low-level generic helpers
function get<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Exported high-level operations
export const storage = {
  // Users
  getUsers(): User[] {
    return get<User[]>(KEYS.USERS, []);
  },
  saveUsers(users: User[]) {
    set(KEYS.USERS, users);
  },
  getUser(code: string): User | null {
    const users = this.getUsers();
    return users.find((u) => u.code.toUpperCase() === code.toUpperCase()) || null;
  },
  createUser(user: Omit<User, "points" | "totalEarned" | "active">): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      points: 0,
      totalEarned: 0,
      active: true,
      isAdmin: false
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },
  deleteUser(code: string) {
    const users = this.getUsers().filter((u) => u.code.toUpperCase() !== code.toUpperCase());
    this.saveUsers(users);
  },

  // Businesses
  getBusinesses(): Business[] {
    return get<Business[]>(KEYS.BUSINESSES, []);
  },
  saveBusinesses(businesses: Business[]) {
    set(KEYS.BUSINESSES, businesses);
  },
  addBusiness(biz: Omit<Business, "id">): Business {
    const businesses = this.getBusinesses();
    const newBiz: Business = {
      ...biz,
      id: "biz-" + Date.now() + Math.random().toString(36).substring(2, 5)
    };
    businesses.push(newBiz);
    this.saveBusinesses(businesses);
    return newBiz;
  },
  deleteBusiness(id: string) {
    const businesses = this.getBusinesses().filter((b) => b.id !== id);
    this.saveBusinesses(businesses);
  },

  // Reports
  getReports(): PurchaseReport[] {
    return get<PurchaseReport[]>(KEYS.REPORTS, []);
  },
  saveReports(reports: PurchaseReport[]) {
    set(KEYS.REPORTS, reports);
  },
  addReport(report: Omit<PurchaseReport, "id" | "status" | "pointsEarned">): PurchaseReport {
    const reports = this.getReports();
    const businesses = this.getBusinesses();
    const biz = businesses.find((b) => b.id === report.businessId);
    const rateMultiplier = biz ? biz.pointsRate : 1.0;
    
    const computedPoints = calculatePoints(report.amount, rateMultiplier);

    const newReport: PurchaseReport = {
      ...report,
      id: "report-" + Date.now(),
      status: "pending",
      pointsEarned: computedPoints
    };
    reports.unshift(newReport); // newest first
    this.saveReports(reports);
    return newReport;
  },
  approveReport(reportId: string): PurchaseReport | null {
    const reports = this.getReports();
    const reportIndex = reports.findIndex((r) => r.id === reportId);
    if (reportIndex === -1) return null;

    const report = reports[reportIndex];
    if (report.status !== "pending") return report;

    report.status = "approved";
    
    // Add points to user account
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.code.toUpperCase() === report.userCode.toUpperCase());
    if (userIndex !== -1) {
      users[userIndex].points += report.pointsEarned;
      users[userIndex].totalEarned += report.pointsEarned;
      this.saveUsers(users);
    }

    this.saveReports(reports);
    return report;
  },
  rejectReport(reportId: string, reason: string): PurchaseReport | null {
    const reports = this.getReports();
    const reportIndex = reports.findIndex((r) => r.id === reportId);
    if (reportIndex === -1) return null;

    const report = reports[reportIndex];
    if (report.status !== "pending") return report;

    report.status = "rejected";
    report.rejectionReason = reason;

    this.saveReports(reports);
    return report;
  },

  // Prizes
  getPrizes(): Prize[] {
    return get<Prize[]>(KEYS.PRIZES, []);
  },
  savePrizes(prizes: Prize[]) {
    set(KEYS.PRIZES, prizes);
  },
  addPrize(prize: Omit<Prize, "id">): Prize {
    const prizes = this.getPrizes();
    const newPrize: Prize = {
      ...prize,
      id: "prize-" + Date.now()
    };
    prizes.push(newPrize);
    this.savePrizes(prizes);
    return newPrize;
  },
  deletePrize(id: string) {
    const prizes = this.getPrizes().filter((p) => p.id !== id);
    this.savePrizes(prizes);
  },
  redeemPrize(userCode: string, prizeId: string): { success: boolean; error?: string; redemption?: Redemption } {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.code.toUpperCase() === userCode.toUpperCase());
    if (userIndex === -1) return { success: false, error: "Usuario no existe" };

    const user = users[userIndex];
    const prizes = this.getPrizes();
    const prizeIndex = prizes.findIndex((p) => p.id === prizeId);
    if (prizeIndex === -1) return { success: false, error: "Premio no existe" };

    const prize = prizes[prizeIndex];
    if (prize.stock <= 0) return { success: false, error: "Este premio se encuentra agotado" };
    if (user.points < prize.pointsCost) return { success: false, error: `Puntos insuficientes. Requieres ${prize.pointsCost} pts y tienes ${user.points} pts.` };

    // Deduct points
    user.points -= prize.pointsCost;
    this.saveUsers(users);

    // Decrease prize stock
    prize.stock -= 1;
    this.savePrizes(prizes);

    // Create redemption record
    const redemptions = get<Redemption[]>(KEYS.REDEMPTIONS, []);
    const newRedemption: Redemption = {
      id: "redempt-" + Date.now(),
      userCode: user.code,
      userName: user.name,
      prizeId: prize.id,
      prizeTitle: prize.title,
      pointsCost: prize.pointsCost,
      date: new Date().toISOString(),
      status: "pending"
    };
    redemptions.unshift(newRedemption);
    set(KEYS.REDEMPTIONS, redemptions);

    return { success: true, redemption: newRedemption };
  },
  getRedemptions(): Redemption[] {
    return get<Redemption[]>(KEYS.REDEMPTIONS, []);
  },
  saveRedemptions(redemptions: Redemption[]) {
    set(KEYS.REDEMPTIONS, redemptions);
  },
  completeRedemption(id: string): boolean {
    const redemptions = this.getRedemptions();
    const idx = redemptions.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    redemptions[idx].status = "completed";
    this.saveRedemptions(redemptions);
    return true;
  },

  // Backup and Restore (Super useful for the user!)
  exportData(): string {
    const fullState = {
      users: this.getUsers(),
      businesses: this.getBusinesses(),
      reports: this.getReports(),
      prizes: this.getPrizes(),
      redemptions: this.getRedemptions()
    };
    return JSON.stringify(fullState, null, 2);
  },
  importData(jsonString: string): boolean {
    try {
      const state = JSON.parse(jsonString);
      if (state.users) set(KEYS.USERS, state.users);
      if (state.businesses) set(KEYS.BUSINESSES, state.businesses);
      if (state.reports) set(KEYS.REPORTS, state.reports);
      if (state.prizes) set(KEYS.PRIZES, state.prizes);
      if (state.redemptions) set(KEYS.REDEMPTIONS, state.redemptions);
      return true;
    } catch (e) {
      console.error("Error importing data", e);
      return false;
    }
  },
  resetToDefaults() {
    localStorage.removeItem(KEYS.INIT);
    initializeStorage();
  }
};
