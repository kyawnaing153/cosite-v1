import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  decimal,
  pgEnum,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);
export const siteStatusEnum = pgEnum("site_status", [
  "completed",
  "on_hold",
  "on_progress",
]);
export const labourTypeEnum = pgEnum("labour_type", [
  "office_staff",
  "hire_worker",
  "subcontractor_labour",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["paid", "credit"]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "half_day",
]);
export const notificationTypeEnum = pgEnum("notification_type", ["info", "warning", "error", "success"]);
export const notificationStatusEnum = pgEnum("notification_status", ["unread", "read"]);

// Users table
export const users = pgTable("users", {
  id: serial("user_id").primaryKey(),
  username: varchar("username", { length: 150 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  fullname: varchar("fullname", { length: 200 }).notNull(),
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
  userId: serial("user_id").references(() => users.id),
  location: text("location"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  status: siteStatusEnum("status").notNull().default("on_progress"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Labour groups table
export const labourGroups = pgTable("labour_groups", {
  id: serial("group_id").primaryKey(),
  groupName: varchar("group_name", { length: 200 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Labour table
export const labour = pgTable("labour", {
  id: serial("labour_id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id),
  labourGroupId: integer("labour_group_id").references(() => labourGroups.id),
  fullName: varchar("full_name", { length: 200 }).notNull(),
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
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }),
  invoiceNumberORImg: varchar("invoice_number_or_img", { length: 50 }),
  recordedByUserId: integer("recorded_by_user_id").references(() => users.id),
  itemDescription: text("item_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//puchase products
export const purchaseProducts = pgTable("purchase_products", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id")
    .references(() => purchases.id)
    .notNull(),
  name: varchar("purchase_product_name", { length: 255 }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  units: varchar("units", { length: 50 }),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  singleTotal: decimal("single_total", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Salary table
export const salary = pgTable("salary", {
  id: serial("salary_id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id),
  labourId: integer("labour_id").references(() => labour.id),
  paymentDate: timestamp("payment_date").defaultNow(),
  paymentType: varchar("payment_type", { length: 50 }),
  remarks: text("remarks"),
  recordedByUserId: integer("recorded_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("invoice_id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id),
  recordedByUserId: integer("recorded_by_user_id").references(() => users.id),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  invoiceDate: timestamp("invoice_date").defaultNow(),
  totalPiecework: decimal("total_piecework", { precision: 15, scale: 2 }),
  totalDailyWage: decimal("total_daily_wage", { precision: 15, scale: 2 }),
  totalAdvancePayment: decimal("total_advance_payment", { precision: 15, scale: 2 }),
  totalRefund: decimal("total_refund", { precision: 15, scale: 2 }),
  grandTotal: decimal("grand_total", { precision: 15, scale: 2 }),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("credit"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice labour detail table
export const invoiceLabourDetail = pgTable("invoice_labour_detail", {
  id: serial("invoice_labour_detail_id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  labourId: integer("labour_id").references(() => labour.id),
  labourGroupId: integer("labour_group_id").references(() => labourGroups.id),
  pieceworkPayment: decimal("piecework_payment", { precision: 10, scale: 2 }),
  dailyWage: decimal("daily_wage", { precision: 10, scale: 2 }),
  advancePayment: decimal("advance_payment", { precision: 10, scale: 2 }),
  refund: decimal("refund", { precision: 10, scale: 2 }),
  sign: varchar("sign", { length: 255 }),
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

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("notification_id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull().default("info"),
  status: notificationStatusEnum("status").notNull().default("unread"),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sites: many(sites),
  labour: many(labour),
  salary: many(salary),
  invoice: many(invoices),
  attendance: many(attendance),
  notifications: many(notifications),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  user: one(users, { fields: [sites.userId], references: [users.id] }),
  labour: many(labour),
  purchases: many(purchases),
  salary: many(salary),
  invoices: many(invoices),
  invoiceLabourDetail: many(invoiceLabourDetail),
  attendance: many(attendance),
}));

export const labourGroupsRelations = relations(
  labourGroups,
  ({ one, many }) => ({
    labour: many(labour),
    invoiceLabourDetail: many(invoiceLabourDetail),
  })
);

export const labourRelations = relations(labour, ({ one, many }) => ({
  site: one(sites, { fields: [labour.siteId], references: [sites.id] }),
  labourGroup: one(labourGroups, {
    fields: [labour.labourGroupId],
    references: [labourGroups.id],
  }),
  recordedByUser: one(users, {
    fields: [labour.recordedByUserId],
    references: [users.id],
  }),
  salary: many(salary),
  invoiceLabourDetail: many(invoiceLabourDetail),
  attendance: many(attendance),
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  site: one(sites, { fields: [purchases.siteId], references: [sites.id] }),
  recordedBy: one(users, {
    fields: [purchases.recordedByUserId],
    references: [users.id],
  }),
  purchaseProducts: many(purchaseProducts),
}));

export const purchaseProductRelations = relations(
  purchaseProducts,
  ({ one }) => ({
    purchase: one(purchases, {
      fields: [purchaseProducts.purchaseId],
      references: [purchases.id],
    }),
  })
);

export const salaryRelations = relations(salary, ({ one }) => ({
  site: one(sites, { fields: [salary.siteId], references: [sites.id] }),
  labour: one(labour, { fields: [salary.labourId], references: [labour.id] }),
  recordedByUser: one(users, {
    fields: [salary.recordedByUserId],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  site: one(sites, { fields: [invoices.siteId], references: [sites.id] }),
  invoiceLabourDetail: many(invoiceLabourDetail),
  recordedByUser: one(users, {
    fields: [invoices.recordedByUserId],
    references: [users.id],
  }),
}));

export const invoiceLabourDetailRelations = relations(
  invoiceLabourDetail,
  ({ one }) => ({
    invoice: one(invoices, {
      fields: [invoiceLabourDetail.invoiceId],
      references: [invoices.id],
    }),
    labour: one(labour, {
      fields: [invoiceLabourDetail.labourId],
      references: [labour.id],
    }),
    labourGroup: one(labourGroups, {
      fields: [invoiceLabourDetail.labourGroupId],
      references: [labourGroups.id],
    }),
  })
);

export const attendanceRelations = relations(attendance, ({ one }) => ({
  site: one(sites, { fields: [attendance.siteId], references: [sites.id] }),
  labour: one(labour, {
    fields: [attendance.labourId],
    references: [labour.id],
  }),
  recordedByUser: one(users, {
    fields: [attendance.recordedByUserId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSchema = createInsertSchema(sites)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
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
}).extend({
    purchaseDate: z.coerce.date(),
  });

export const insertPurchaseProductSchema = createInsertSchema(
  purchaseProducts
).omit({
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
}).extend({
  invoiceDate: z.coerce.date(), // Handles string to Date conversion
  totalPiecework: z.number().optional().nullable(),
  totalDailyWage: z.number().optional().nullable(),
  totalAdvancePayment: z.number().optional().nullable(),
  totalRefund: z.number().optional().nullable(),
  grandTotal: z.number().optional().nullable(),
});

export const insertInvoiceLabourDetailSchema = createInsertSchema(invoiceLabourDetail).omit({
  id: true,
}).extend({
  pieceworkPayment: z.number().optional().nullable(),
  dailyWage: z.number().optional().nullable(),
  advancePayment: z.number().optional().nullable(),
  refund: z.number().optional().nullable(),
  sign: z.string().optional().nullable(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
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
export type PurchaseProduct = typeof purchaseProducts.$inferSelect;
export type InsertPurchaseProduct = z.infer<typeof insertPurchaseProductSchema>;
export type Salary = typeof salary.$inferSelect;
export type InsertSalary = z.infer<typeof insertSalarySchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceLabourDetail = typeof invoiceLabourDetail.$inferSelect;
export type InsertInvoiceLabourDetail = z.infer<typeof insertInvoiceLabourDetailSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
