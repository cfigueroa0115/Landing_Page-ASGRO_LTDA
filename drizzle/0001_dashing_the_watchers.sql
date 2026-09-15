CREATE TABLE "knowledge_base_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(160) NOT NULL,
	"topic" varchar(200) NOT NULL,
	"category" varchar(40) NOT NULL,
	"subcategory" varchar(60) NOT NULL,
	"content" text NOT NULL,
	"tags" text NOT NULL,
	"source" varchar(200) NOT NULL,
	"source_type" varchar(30) NOT NULL,
	"authority" varchar(20) NOT NULL,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_to" timestamp,
	"version" integer DEFAULT 1 NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" varchar(120),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_base_v2_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE INDEX "kb_v2_category_idx" ON "knowledge_base_v2" USING btree ("category");--> statement-breakpoint
CREATE INDEX "kb_v2_subcategory_idx" ON "knowledge_base_v2" USING btree ("subcategory");--> statement-breakpoint
CREATE INDEX "kb_v2_is_approved_idx" ON "knowledge_base_v2" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX "kb_v2_is_active_idx" ON "knowledge_base_v2" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "kb_v2_priority_idx" ON "knowledge_base_v2" USING btree ("priority");