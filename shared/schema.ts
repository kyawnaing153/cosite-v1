import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);
export const siteStatusEnum = pgEnum("site_status", ["completed", "on_hold", "on_progress"]);
export const labourTypeEnum = pgEnum("labour_type", ["office_staff", "hire_worker", "subcontractor_labour"]);
export const paymentStatusEnum = pgEnum("payment_status", ["paid", "credit"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "half_day"]);

// Users table
export const users = pgTable("users", {
  id: serial("user_id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  fullname: varchar("fullname", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("staff"),
  status: userStatusEnum("status").notNull().default("active"),
  joinDate: timestamp("join_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sites table
export const sites = pgTable("sites", {
  id: serial("site_id").primaryKey(),
  siteName: varchar("site_name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  status: siteStatusEnum("status").notNull().default("on_progress"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Labour groups table
export const labourGroups = pgTable("labour_groups", {
  id: serial("group_id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id),
  groupName: varchar("group_name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Labour table
export const labour = pgTable("labour", {
  id: serial("labour_id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id),
  labourGroupId: integer("labour_group_id").references(() => labourGroups.id),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  labourType: labourTypeEnum("labour_type").notNull(),
  contactNumber: varchar("contact_number", { length: 20 }),
  address: text("address"),
  dailyWage: decimal("daily_wage", { precision: 10, scale: 2 }),
  monthlySalary: decimal("monthly_salary", { precision: 10, scale: 2 }),
  joinDate: timestamp("join_date").defaultNow(),
  status: userStatusEnum("status").notNull().default("active"),
  recordedByUserId: integer("recorded_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchases table
export const purchases = pgTable("purchases", {
  id: serial("purchase_id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  itemDescription: text("item_description").notNull(),
  purchaseType: varchar("purchase_type", { length: 100 }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  units: varchar("units", { length: 50 }),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Salary table
export const salary = pgTable("salary", {
  id: serial("salary_id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id),
  labourId: integer("labour_id").references(() => labour.id),
  paymentDate: timestamp("payment_date").defaultNow(),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  paymentType: varchar("payment_type", { length: 50 }),
  dailyWage: decimal("daily_wage", { precision: 10, scale: 2 }),
  pieceworkPayment: decimal("piecework_payment", { precision: 10, scale: 2 }),
  advancePayment: decimal("advance_payment", { precision: 10, scale: 2 }),
  totalDailywage: decimal("total_daily_wage", { precision: 10, scale: 2 }),
  totalPiecework: decimal("total_piecework", { precision: 10, scale: 2 }),
  totalAdvancePayment: decimal("total_advance_payment", { precision: 10, scale: 2 }),
  totalRefund: decimal("total_refund", { precision: 10, scale: 2 }),
  refund: decimal("refund", { precision: 10, scale: 2 }),
  remarks: text("remarks"),
  recordedByUserId: integer("recorded_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("invoice_id").primaryKey(),
  invoiceNumberOrImg: varchar("invoice_number_or_img", { length: 255 }),
  siteId: integer("site_id").references(() => sites.id),
  grandTotal: decimal("grand_total", { precision: 15, scale: 2 }),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("credit"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice labour detail table
export const invoiceLabourDetail = pgTable("invoice_labour_detail", {
  invoiceId: integer("invoice_id").references(() => invoices.id),
  labourId: integer("labour_id").references(() => labour.id),
  labourGroupId: integer("labour_group_id").references(() => labourGroups.id),
  siteId: integer("site_id").references(() => sites.id),
  date: timestamp("date"),
  dailyWage: decimal("daily_wage", { precision: 10, scale: 2 }),
  pieceworkPayment: decimal("piecework_payment", { precision: 10, scale: 2 }),
  sign: varchar("sign", { length: 255 }),
  recordedByUserId: integer("recorded_by_user_id").references(() => users.id),
});

// Attendance table (extended from the original requirements)
export const attendance = pgTable("attendance", {
  id: serial("attendance_id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id),
  labourId: integer("labour_id").references(() => labour.id),
  date: timestamp("date").defaultNow(),
  status: attendanceStatusEnum("status").notNull().default("present"),
  hoursWorked: decimal("hours_worked", { precision: 4, scale: 2 }),
  remarks: text("remarks"),
  recordedByUserId: integer("recorded_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  labour: many(labour),
  salary: many(salary),
  invoiceLabourDetail: many(invoiceLabourDetail),
  attendance: many(attendance),
}));

export const sitesRelations = relations(sites, ({ many }) => ({
  labour: many(labour),
  labourGroups: many(labourGroups),
  purchases: many(purchases),
  salary: many(salary),
  invoices: many(invoices),
  invoiceLabourDetail: many(invoiceLabourDetail),
  attendance: many(attendance),
}));

export const labourGroupsRelations = relations(labourGroups, ({ one, many }) => ({
  site: one(sites, { fields: [labourGroups.siteId], references: [sites.id] }),
  labour: many(labour),
  invoiceLabourDetail: many(invoiceLabourDetail),
}));

export const labourRelations = relations(labour, ({ one, many }) => ({
  site: one(sites, { fields: [labour.siteId], references: [sites.id] }),
  labourGroup: one(labourGroups, { fields: [labour.labourGroupId], references: [labourGroups.id] }),
  recordedByUser: one(users, { fields: [labour.recordedByUserId], references: [users.id] }),
  salary: many(salary),
  invoiceLabourDetail: many(invoiceLabourDetail),
  attendance: many(attendance),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  site: one(sites, { fields: [purchases.siteId], references: [sites.id] }),
}));

export const salaryRelations = relations(salary, ({ one }) => ({
  site: one(sites, { fields: [salary.siteId], references: [sites.id] }),
  labour: one(labour, { fields: [salary.labourId], references: [labour.id] }),
  recordedByUser: one(users, { fields: [salary.recordedByUserId], references: [users.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  site: one(sites, { fields: [invoices.siteId], references: [sites.id] }),
  invoiceLabourDetail: many(invoiceLabourDetail),
}));

export const invoiceLabourDetailRelations = relations(invoiceLabourDetail, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceLabourDetail.invoiceId], references: [invoices.id] }),
  labour: one(labour, { fields: [invoiceLabourDetail.labourId], references: [labour.id] }),
  labourGroup: one(labourGroups, { fields: [invoiceLabourDetail.labourGroupId], references: [labourGroups.id] }),
  site: one(sites, { fields: [invoiceLabourDetail.siteId], references: [sites.id] }),
  recordedByUser: one(users, { fields: [invoiceLabourDetail.recordedByUserId], references: [users.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  site: one(sites, { fields: [attendance.siteId], references: [sites.id] }),
  labour: one(labour, { fields: [attendance.labourId], references: [labour.id] }),
  recordedByUser: one(users, { fields: [attendance.recordedByUserId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLabourGroupSchema = createInsertSchema(labourGroups).omit({
  id: true,
  createdAt: true,
});

export const insertLabourSchema = createInsertSchema(labour).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSalarySchema = createInsertSchema(salary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceLabourDetailSchema = createInsertSchema(invoiceLabourDetail);

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type LabourGroup = typeof labourGroups.$inferSelect;
export type InsertLabourGroup = z.infer<typeof insertLabourGroupSchema>;
export type Labour = typeof labour.$inferSelect;
export type InsertLabour = z.infer<typeof insertLabourSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Salary = typeof salary.$inferSelect;
export type InsertSalary = z.infer<typeof insertSalarySchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceLabourDetail = typeof invoiceLabourDetail.$inferSelect;
export type InsertInvoiceLabourDetail = z.infer<typeof insertInvoiceLabourDetailSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
