import {
  users,
  sites,
  labourGroups,
  labour,
  purchases,
  salary,
  invoices,
  invoiceLabourDetail,
  type User,
  type InsertUser,
  type Site,
  type InsertSite,
  type LabourGroup,
  type InsertLabourGroup,
  type Labour,
  type InsertLabour,
  type Purchase,
  type InsertPurchase,
  type Salary,
  type InsertSalary,
  type Invoice,
  type InsertInvoice,
  type InvoiceLabourDetail,
  type InsertInvoiceLabourDetail,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sum, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  
  // Site operations
  getSites(): Promise<Site[]>;
  getSite(id: number): Promise<Site | undefined>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: number, site: Partial<InsertSite>): Promise<Site>;
  deleteSite(id: number): Promise<boolean>;
  
  // Labour Group operations
  getLabourGroups(siteId?: number): Promise<LabourGroup[]>;
  getLabourGroup(id: number): Promise<LabourGroup | undefined>;
  createLabourGroup(group: InsertLabourGroup): Promise<LabourGroup>;
  updateLabourGroup(id: number, group: Partial<InsertLabourGroup>): Promise<LabourGroup>;
  deleteLabourGroup(id: number): Promise<boolean>;
  
  // Labour operations
  getLabour(siteId?: number): Promise<Labour[]>;
  getLabourById(id: number): Promise<Labour | undefined>;
  createLabour(labourData: InsertLabour): Promise<Labour>;
  updateLabour(id: number, labourData: Partial<InsertLabour>): Promise<Labour>;
  deleteLabour(id: number): Promise<boolean>;
  
  // Purchase operations
  getPurchases(siteId?: number): Promise<Purchase[]>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase>;
  deletePurchase(id: number): Promise<boolean>;
  
  // Salary operations
  getSalaries(siteId?: number, labourId?: number): Promise<Salary[]>;
  getSalary(id: number): Promise<Salary | undefined>;
  createSalary(salaryData: InsertSalary): Promise<Salary>;
  updateSalary(id: number, salaryData: Partial<InsertSalary>): Promise<Salary>;
  deleteSalary(id: number): Promise<boolean>;
  
  // Invoice operations
  getInvoices(siteId?: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<boolean>;
  
  // Invoice Labour Detail operations
  getInvoiceLabourDetails(invoiceId: number): Promise<InvoiceLabourDetail[]>;
  createInvoiceLabourDetail(detail: InsertInvoiceLabourDetail): Promise<InvoiceLabourDetail>;
  
  // Dashboard operations
  getDashboardMetrics(): Promise<{
    activeSites: number;
    totalLabour: number;
    monthlyExpenses: number;
    pendingInvoices: number;
  }>;
  getRecentSites(): Promise<Site[]>;
  getRecentPurchases(): Promise<Purchase[]>;
  getPendingWages(): Promise<Salary[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning();
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Site operations
  async getSites(): Promise<Site[]> {
    return await db.select().from(sites).orderBy(desc(sites.createdAt));
  }

  async getSite(id: number): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site;
  }

  async createSite(siteData: InsertSite): Promise<Site> {
    const [site] = await db.insert(sites).values(siteData).returning();
    return site;
  }

  async updateSite(id: number, siteData: Partial<InsertSite>): Promise<Site> {
    const [site] = await db
      .update(sites)
      .set({ ...siteData, updatedAt: new Date() })
      .where(eq(sites.id, id))
      .returning();
    return site;
  }

  async deleteSite(id: number): Promise<boolean> {
    const result = await db.delete(sites).where(eq(sites.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Labour Group operations
  async getLabourGroups(siteId?: number): Promise<LabourGroup[]> {
    const query = db.select().from(labourGroups);
    if (siteId) {
      query.where(eq(labourGroups.siteId, siteId));
    }
    return await query.orderBy(desc(labourGroups.createdAt));
  }

  async getLabourGroup(id: number): Promise<LabourGroup | undefined> {
    const [group] = await db.select().from(labourGroups).where(eq(labourGroups.id, id));
    return group;
  }

  async createLabourGroup(groupData: InsertLabourGroup): Promise<LabourGroup> {
    const [group] = await db.insert(labourGroups).values(groupData).returning();
    return group;
  }

  async updateLabourGroup(id: number, groupData: Partial<InsertLabourGroup>): Promise<LabourGroup> {
    const [group] = await db
      .update(labourGroups)
      .set(groupData)
      .where(eq(labourGroups.id, id))
      .returning();
    return group;
  }

  async deleteLabourGroup(id: number): Promise<boolean> {
    const result = await db.delete(labourGroups).where(eq(labourGroups.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Labour operations
  async getLabour(siteId?: number): Promise<Labour[]> {
    const query = db.select().from(labour);
    if (siteId) {
      query.where(eq(labour.siteId, siteId));
    }
    return await query.orderBy(desc(labour.createdAt));
  }

  async getLabourById(id: number): Promise<Labour | undefined> {
    const [labourData] = await db.select().from(labour).where(eq(labour.id, id));
    return labourData;
  }

  async createLabour(labourData: InsertLabour): Promise<Labour> {
    const [newLabour] = await db.insert(labour).values(labourData).returning();
    return newLabour;
  }

  async updateLabour(id: number, labourData: Partial<InsertLabour>): Promise<Labour> {
    const [updatedLabour] = await db
      .update(labour)
      .set({ ...labourData, updatedAt: new Date() })
      .where(eq(labour.id, id))
      .returning();
    return updatedLabour;
  }

  async deleteLabour(id: number): Promise<boolean> {
    const result = await db.delete(labour).where(eq(labour.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Purchase operations
  async getPurchases(siteId?: number): Promise<Purchase[]> {
    const query = db.select().from(purchases);
    if (siteId) {
      query.where(eq(purchases.siteId, siteId));
    }
    return await query.orderBy(desc(purchases.createdAt));
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase;
  }

  async createPurchase(purchaseData: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db.insert(purchases).values(purchaseData).returning();
    return purchase;
  }

  async updatePurchase(id: number, purchaseData: Partial<InsertPurchase>): Promise<Purchase> {
    const [purchase] = await db
      .update(purchases)
      .set({ ...purchaseData, updatedAt: new Date() })
      .where(eq(purchases.id, id))
      .returning();
    return purchase;
  }

  async deletePurchase(id: number): Promise<boolean> {
    const result = await db.delete(purchases).where(eq(purchases.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Salary operations
  async getSalaries(siteId?: number, labourId?: number): Promise<Salary[]> {
    let query = db.select().from(salary);
    
    if (siteId && labourId) {
      return await query.where(and(eq(salary.siteId, siteId), eq(salary.labourId, labourId))).orderBy(desc(salary.createdAt));
    } else if (siteId) {
      return await query.where(eq(salary.siteId, siteId)).orderBy(desc(salary.createdAt));
    } else if (labourId) {
      return await query.where(eq(salary.labourId, labourId)).orderBy(desc(salary.createdAt));
    }
    
    return await query.orderBy(desc(salary.createdAt));
  }

  async getSalary(id: number): Promise<Salary | undefined> {
    const [salaryData] = await db.select().from(salary).where(eq(salary.id, id));
    return salaryData;
  }

  async createSalary(salaryData: InsertSalary): Promise<Salary> {
    const [newSalary] = await db.insert(salary).values(salaryData).returning();
    return newSalary;
  }

  async updateSalary(id: number, salaryData: Partial<InsertSalary>): Promise<Salary> {
    const [updatedSalary] = await db
      .update(salary)
      .set({ ...salaryData, updatedAt: new Date() })
      .where(eq(salary.id, id))
      .returning();
    return updatedSalary;
  }

  async deleteSalary(id: number): Promise<boolean> {
    const result = await db.delete(salary).where(eq(salary.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Invoice operations
  async getInvoices(siteId?: number): Promise<Invoice[]> {
    const query = db.select().from(invoices);
    if (siteId) {
      query.where(eq(invoices.siteId, siteId));
    }
    return await query.orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(invoiceData).returning();
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ ...invoiceData, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Invoice Labour Detail operations
  async getInvoiceLabourDetails(invoiceId: number): Promise<InvoiceLabourDetail[]> {
    return await db
      .select()
      .from(invoiceLabourDetail)
      .where(eq(invoiceLabourDetail.invoiceId, invoiceId));
  }

  async createInvoiceLabourDetail(detail: InsertInvoiceLabourDetail): Promise<InvoiceLabourDetail> {
    const [newDetail] = await db.insert(invoiceLabourDetail).values(detail).returning();
    return newDetail;
  }

  // Dashboard operations
  async getDashboardMetrics(): Promise<{
    activeSites: number;
    totalLabour: number;
    monthlyExpenses: number;
    pendingInvoices: number;
  }> {
    const [activeSitesResult] = await db
      .select({ count: count() })
      .from(sites)
      .where(eq(sites.status, "on_progress"));

    const [totalLabourResult] = await db
      .select({ count: count() })
      .from(labour)
      .where(eq(labour.status, "active"));

    const [monthlyExpensesResult] = await db
      .select({ 
        total: sum(purchases.totalAmount)
      })
      .from(purchases)
      .where(sql`EXTRACT(MONTH FROM ${purchases.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`);

    const [pendingInvoicesResult] = await db
      .select({ count: count() })
      .from(invoices)
      .where(eq(invoices.paymentStatus, "credit"));

    return {
      activeSites: activeSitesResult.count,
      totalLabour: totalLabourResult.count,
      monthlyExpenses: Number(monthlyExpensesResult.total || 0),
      pendingInvoices: pendingInvoicesResult.count,
    };
  }

  async getRecentSites(): Promise<Site[]> {
    return await db
      .select()
      .from(sites)
      .orderBy(desc(sites.createdAt))
      .limit(5);
  }

  async getRecentPurchases(): Promise<Purchase[]> {
    return await db
      .select()
      .from(purchases)
      .orderBy(desc(purchases.createdAt))
      .limit(5);
  }

  async getPendingWages(): Promise<Salary[]> {
    return await db
      .select()
      .from(salary)
      .where(eq(salary.paymentType, "pending"))
      .orderBy(desc(salary.createdAt))
      .limit(5);
  }
}

export const storage = new DatabaseStorage();
