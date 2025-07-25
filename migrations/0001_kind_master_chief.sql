CREATE TABLE "purchase_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" integer NOT NULL,
	"purchase_product_name" varchar(255),
	"quantity" numeric(10, 2),
	"units" varchar(50),
	"unit_price" numeric(10, 2),
	"single_total" numeric(15, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "purchase_products" ADD CONSTRAINT "purchase_products_purchase_id_purchases_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("purchase_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN "purchase_type";--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN "units";--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN "unit_price";