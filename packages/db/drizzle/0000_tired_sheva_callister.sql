CREATE TABLE "agent_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"timestamp" timestamp NOT NULL,
	"total_requests" integer DEFAULT 0,
	"successful_requests" integer DEFAULT 0,
	"failed_requests" integer DEFAULT 0,
	"avg_latency_ms" integer DEFAULT 0,
	"p95_latency_ms" integer DEFAULT 0,
	"unique_consumers" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "agent_showcase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"input_example" text NOT NULL,
	"output_example" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"creator_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"mcp_endpoint" text NOT NULL,
	"creator_wallet" text NOT NULL,
	"price_per_call" numeric(10, 6) NOT NULL,
	"agent_card" jsonb,
	"tools" jsonb,
	"rating_avg" numeric(3, 2) DEFAULT '0',
	"total_calls" integer DEFAULT 0,
	"status" text DEFAULT 'active' NOT NULL,
	"trust_score" numeric(5, 2) DEFAULT '0',
	"trust_tier" text DEFAULT 'new',
	"uptime_30d" numeric(5, 2) DEFAULT '0',
	"success_rate_30d" numeric(5, 2) DEFAULT '0',
	"p95_latency_ms" integer DEFAULT 0,
	"unique_consumers_30d" integer DEFAULT 0,
	"health_check_failures" integer DEFAULT 0,
	"health_check_total" integer DEFAULT 0,
	"health_check_passed" integer DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"bio" text,
	"total_revenue" numeric(18, 6) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creators_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"consumer_wallet" text NOT NULL,
	"amount" numeric(18, 6) NOT NULL,
	"platform_fee" numeric(18, 6) NOT NULL,
	"creator_payout" numeric(18, 6) NOT NULL,
	"x402_payment_hash" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"user_wallet" text NOT NULL,
	"score" integer NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_metrics" ADD CONSTRAINT "agent_metrics_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_showcase" ADD CONSTRAINT "agent_showcase_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_metrics_agent_id_idx" ON "agent_metrics" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agent_showcase_agent_id_idx" ON "agent_showcase" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agents_creator_id_idx" ON "agents" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "agents_status_idx" ON "agents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "agents_status_category_idx" ON "agents" USING btree ("status","category");--> statement-breakpoint
CREATE INDEX "agents_trust_score_idx" ON "agents" USING btree ("trust_score");--> statement-breakpoint
CREATE INDEX "transactions_agent_id_idx" ON "transactions" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "ratings_agent_id_idx" ON "ratings" USING btree ("agent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_agent_user_unique" ON "ratings" USING btree ("agent_id","user_wallet");