-- customers
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    company_name TEXT,
    contact_email TEXT,
    phone_number TEXT
);

-- employees
CREATE TABLE employees (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- machines
CREATE TABLE machines (
    id UUID PRIMARY KEY,
    name TEXT,
    model TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    location TEXT,
    number TEXT
);

-- work_orders
CREATE TABLE work_orders (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    order_date DATE,
    delivery_date DATE,
    ref_no TEXT,
    total_order_weight NUMERIC,
    total_order_length NUMERIC,
    product_type TEXT,
    material_type TEXT,
    dimensions_width NUMERIC
);

-- order_details
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    quantity INTEGER,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    customer_id UUID REFERENCES customers(id),
    order_number TEXT,
    product_type TEXT,
    thickness NUMERIC,
    width NUMERIC,
    diameter NUMERIC,
    length NUMERIC,
    weight NUMERIC,
    isolation_type TEXT,
    delivery_week INTEGER,
    production_start_date DATE
);

-- production_logs
CREATE TABLE production_logs (
    id UUID PRIMARY KEY,
    employee_id UUID REFERENCES employees(id),
    machine_id UUID REFERENCES machines(id),
    order_id UUID REFERENCES orders(id),
    quantity_produced INTEGER,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- production_specifications
CREATE TABLE production_specifications (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    insulation_type TEXT,
    max_thickness NUMERIC,
    production_speed NUMERIC,
    load NUMERIC,
    layers INTEGER,
    min_thickness NUMERIC,
    base_width NUMERIC,
    created_at TIMESTAMPTZ
);

-- system_auth
CREATE TABLE system_auth (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- For development purposes only; replace with secure credentials in production
-- INSERT INTO system_auth (id, username, password_hash, role) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin', 'your-secure-hash-here', 'admin');

-- 1. Backup existing data if needed
-- CREATE TABLE orders_backup AS SELECT * FROM orders;

-- 2. Update the orders table structure
ALTER TABLE orders
DROP COLUMN IF EXISTS customer_name;

-- 3. Add foreign key constraint if it doesn't exist
ALTER TABLE orders
ADD CONSTRAINT IF NOT EXISTS fk_customer
FOREIGN KEY (customer_id) 
REFERENCES customers(id);

-- 4. Add index for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
