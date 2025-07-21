CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'half_day');--> statement-breakpoint
CREATE TYPE "public"."labour_type" AS ENUM('office_staff', 'hire_worker', 'subcontractor_labour');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('paid', 'credit');--> statement-breakpoint
CREATE TYPE "public"."site_status" AS ENUM('completed', 'on_hold', 'on_progress');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "attendance" (
	"attendance_id" serial PRIMARY KEY NOT NULL,
	"site_id" integer,
	"labour_id" integer,
	"date" timestamp DEFAULT now(),
	"status" "attendance_status" DEFAULT 'present' NOT NULL,
	"hours_worked" numeric(4, 2),
	"remarks" text,
	"recorded_by_user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_labour_detail" (
	"invoice_id" integer,
	"labour_id" integer,
	"labour_group_id" integer,
	"piecework_payment" numeric(10, 2),
	"daily_wage" numeric(10, 2),
	"advance_payment" numeric(10, 2),
	"refund" numeric(10, 2),
	"sign" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"invoice_id" serial PRIMARY KEY NOT NULL,
	"site_id" integer,
	"recorded_by_user_id" integer,
	"invoice_number" varchar(50) NOT NULL,
	"invoice_date" timestamp DEFAULT now(),
	"total_piecework" numeric(15, 2),
	"total_daily_wage" numeric(15, 2),
	"total_advance_payment" numeric(15, 2),
	"total_refund" numeric(15, 2),
	"grand_total" numeric(15, 2),
	"payment_status" "payment_status" DEFAULT 'credit' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "labour" (
	"labour_id" serial PRIMARY KEY NOT NULL,
	"site_id" integer,
	"labour_group_id" integer,
	"full_name" varchar(200) NOT NULL,
	"labour_type" "labour_type" NOT NULL,
	"contact_number" varchar(20),
	"address" text,
	"daily_wage" numeric(10, 2),
	"monthly_salary" numeric(10, 2),
	"join_date" timestamp DEFAULT now(),
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"recorded_by_user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "labour_groups" (
	"group_id" serial PRIMARY KEY NOT NULL,
	"group_name" varchar(200) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"purchase_id" serial PRIMARY KEY NOT NULL,
	"site_id" integer,
	"purchase_date" timestamp DEFAULT now(),
	"purchase_type" varchar(100),
	"quantity" numeric(10, 2),
	"units" varchar(50),
	"unit_price" numeric(10, 2),
	"total_amount" numeric(15, 2),
	"invoice_number_or_img" varchar(50),
	"recorded_by_user_id" integer,
	"item_description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "salary" (
	"salary_id" serial PRIMARY KEY NOT NULL,
	"site_id" integer,
	"labour_id" integer,
	"payment_date" timestamp DEFAULT now(),
	"payment_type" varchar(50),
	"remarks" text,
	"recorded_by_user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"site_id" serial PRIMARY KEY NOT NULL,
	"site_name" varchar(255) NOT NULL,
	"user_id" serial NOT NULL,
	"location" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"budget" numeric(15, 2),
	"status" "site_status" DEFAULT 'on_progress' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"username" varchar(150) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(150) NOT NULL,
	"fullname" varchar(200) NOT NULL,
	"role" varchar(50) DEFAULT 'staff' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"join_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_site_id_sites_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("site_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_labour_id_labour_labour_id_fk" FOREIGN KEY ("labour_id") REFERENCES "public"."labour"("labour_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_recorded_by_user_id_users_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_labour_detail" ADD CONSTRAINT "invoice_labour_detail_invoice_id_invoices_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("invoice_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_labour_detail" ADD CONSTRAINT "invoice_labour_detail_labour_id_labour_labour_id_fk" FOREIGN KEY ("labour_id") REFERENCES "public"."labour"("labour_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_labour_detail" ADD CONSTRAINT "invoice_labour_detail_labour_group_id_labour_groups_group_id_fk" FOREIGN KEY ("labour_group_id") REFERENCES "public"."labour_groups"("group_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_site_id_sites_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("site_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_recorded_by_user_id_users_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labour" ADD CONSTRAINT "labour_site_id_sites_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("site_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labour" ADD CONSTRAINT "labour_labour_group_id_labour_groups_group_id_fk" FOREIGN KEY ("labour_group_id") REFERENCES "public"."labour_groups"("group_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labour" ADD CONSTRAINT "labour_recorded_by_user_id_users_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_site_id_sites_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("site_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_recorded_by_user_id_users_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary" ADD CONSTRAINT "salary_site_id_sites_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("site_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary" ADD CONSTRAINT "salary_labour_id_labour_labour_id_fk" FOREIGN KEY ("labour_id") REFERENCES "public"."labour"("labour_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary" ADD CONSTRAINT "salary_recorded_by_user_id_users_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;