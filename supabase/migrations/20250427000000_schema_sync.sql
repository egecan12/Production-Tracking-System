

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "company_name" "text",
    "contact_email" "text",
    "phone_number" "text",
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."customers"."is_active" IS 'Indicates whether the customer is active. Instead of deletion, this field should be set to FALSE.';



CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


COMMENT ON COLUMN "public"."employees"."is_active" IS 'Indicates whether the employee is active. Instead of deletion, this field should be set to FALSE.';



CREATE TABLE IF NOT EXISTS "public"."machines" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "model" "text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "location" "text",
    "number" "text",
    "is_active" boolean DEFAULT true,
    CONSTRAINT "machines_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'maintenance'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."machines" OWNER TO "postgres";


COMMENT ON COLUMN "public"."machines"."is_active" IS 'Indicates whether the machine is active. Instead of deletion, this field should be set to FALSE.';



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_specifications" "text",
    "quantity" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "customer_id" "uuid",
    "order_number" "text" NOT NULL,
    "product_type" "text" NOT NULL,
    "thickness" numeric NOT NULL,
    "width" numeric NOT NULL,
    "diameter" numeric NOT NULL,
    "length" numeric NOT NULL,
    "weight" numeric NOT NULL,
    "isolation_type" "text" NOT NULL,
    "delivery_week" integer NOT NULL,
    "production_start_date" "date" NOT NULL,
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_production'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders_backup" (
    "id" "uuid",
    "product_specifications" "text",
    "quantity" integer,
    "status" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "customer_id" "uuid",
    "order_number" "text",
    "customer_name" "text",
    "product_type" "text",
    "thickness" numeric,
    "width" numeric,
    "diameter" numeric,
    "length" numeric,
    "weight" numeric,
    "isolation_type" "text",
    "delivery_week" integer,
    "production_start_date" "date"
);


ALTER TABLE "public"."orders_backup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."production_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "employee_id" "uuid",
    "machine_id" "uuid",
    "order_id" "uuid",
    "quantity_produced" integer NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."production_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."production_specifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "work_order_id" "uuid",
    "paper_type" character varying(100),
    "insulation_thickness" numeric(6,2),
    "production_speed" numeric(8,2),
    "line_speed" numeric(8,2),
    "paper_layers" integer,
    "tolerance_thickness" numeric(6,2),
    "tolerance_width" numeric(6,2),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."production_specifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spools" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "work_order_id" "uuid",
    "spool_number" integer,
    "naked_weight" numeric(8,2),
    "length" numeric(10,2),
    "diameter" numeric(8,2),
    "spool_type" character varying(100),
    "insulation_weight" numeric(8,2),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."spools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_auth" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_auth" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "order_date" "date" NOT NULL,
    "delivery_date" "date",
    "ref_no" character varying(50),
    "total_order_weight" numeric(10,2),
    "total_order_length" numeric(10,2),
    "product_type" character varying(100),
    "material_type" character varying(100),
    "dimensions_width" numeric(6,2),
    "dimensions_thickness" numeric(6,2),
    "status" character varying(50) DEFAULT 'PENDING'::character varying,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."work_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "machine_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "end_time" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."work_sessions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."machines"
    ADD CONSTRAINT "machines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_logs"
    ADD CONSTRAINT "production_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_specifications"
    ADD CONSTRAINT "production_specifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spools"
    ADD CONSTRAINT "spools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_auth"
    ADD CONSTRAINT "system_auth_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_orders"
    ADD CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_sessions"
    ADD CONSTRAINT "work_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "workers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "workers_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_customers_is_active" ON "public"."customers" USING "btree" ("is_active");



CREATE INDEX "idx_employees_is_active" ON "public"."employees" USING "btree" ("is_active");



CREATE INDEX "idx_machines_is_active" ON "public"."machines" USING "btree" ("is_active");



CREATE INDEX "idx_orders_customer_id" ON "public"."orders" USING "btree" ("customer_id");



CREATE OR REPLACE TRIGGER "set_timestamp_production_specifications" BEFORE UPDATE ON "public"."production_specifications" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_spools" BEFORE UPDATE ON "public"."spools" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_work_orders" BEFORE UPDATE ON "public"."work_orders" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "update_machines_updated_at" BEFORE UPDATE ON "public"."machines" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_production_logs_updated_at" BEFORE UPDATE ON "public"."production_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workers_updated_at" BEFORE UPDATE ON "public"."employees" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "fk_customer" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."production_logs"
    ADD CONSTRAINT "production_logs_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id");



ALTER TABLE ONLY "public"."production_logs"
    ADD CONSTRAINT "production_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."production_logs"
    ADD CONSTRAINT "production_logs_worker_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."production_specifications"
    ADD CONSTRAINT "production_specifications_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id");



ALTER TABLE ONLY "public"."spools"
    ADD CONSTRAINT "spools_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id");



ALTER TABLE ONLY "public"."work_orders"
    ADD CONSTRAINT "work_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."work_sessions"
    ADD CONSTRAINT "work_sessions_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id");



ALTER TABLE ONLY "public"."work_sessions"
    ADD CONSTRAINT "work_sessions_worker_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");



CREATE POLICY "Enable delete access for all users" ON "public"."customers" FOR DELETE USING (true);



CREATE POLICY "Enable insert access for all users" ON "public"."customers" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."customers" FOR SELECT USING (true);



CREATE POLICY "Enable update access for all users" ON "public"."customers" FOR UPDATE USING (true);



ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."machines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders_backup" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."production_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."production_specifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."spools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_auth" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_sessions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



























GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON TABLE "public"."machines" TO "anon";
GRANT ALL ON TABLE "public"."machines" TO "authenticated";
GRANT ALL ON TABLE "public"."machines" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."orders_backup" TO "anon";
GRANT ALL ON TABLE "public"."orders_backup" TO "authenticated";
GRANT ALL ON TABLE "public"."orders_backup" TO "service_role";



GRANT ALL ON TABLE "public"."production_logs" TO "anon";
GRANT ALL ON TABLE "public"."production_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."production_logs" TO "service_role";



GRANT ALL ON TABLE "public"."production_specifications" TO "anon";
GRANT ALL ON TABLE "public"."production_specifications" TO "authenticated";
GRANT ALL ON TABLE "public"."production_specifications" TO "service_role";



GRANT ALL ON TABLE "public"."spools" TO "anon";
GRANT ALL ON TABLE "public"."spools" TO "authenticated";
GRANT ALL ON TABLE "public"."spools" TO "service_role";



GRANT ALL ON TABLE "public"."system_auth" TO "anon";
GRANT ALL ON TABLE "public"."system_auth" TO "authenticated";
GRANT ALL ON TABLE "public"."system_auth" TO "service_role";



GRANT ALL ON TABLE "public"."work_orders" TO "anon";
GRANT ALL ON TABLE "public"."work_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."work_orders" TO "service_role";



GRANT ALL ON TABLE "public"."work_sessions" TO "anon";
GRANT ALL ON TABLE "public"."work_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."work_sessions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
