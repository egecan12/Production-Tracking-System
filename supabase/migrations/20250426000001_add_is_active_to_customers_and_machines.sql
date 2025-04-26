-- Adding is_active field to Customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Mark all existing customers as active
UPDATE customers
SET is_active = TRUE
WHERE is_active IS NULL;

-- Adding is_active field to Machines table
ALTER TABLE machines
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Mark all existing machines as active
UPDATE machines
SET is_active = TRUE
WHERE is_active IS NULL;

-- Creating indexes
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_machines_is_active ON machines(is_active);

-- Adding comments
COMMENT ON COLUMN customers.is_active IS 'Indicates whether the customer is active. Instead of deletion, this field should be set to FALSE.';
COMMENT ON COLUMN machines.is_active IS 'Indicates whether the machine is active. Instead of deletion, this field should be set to FALSE.'; 