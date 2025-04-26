-- Adding is_active field to Employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Mark all existing employees as active
UPDATE employees
SET is_active = TRUE
WHERE is_active IS NULL;

-- Adding comment for is_active field
COMMENT ON COLUMN employees.is_active IS 'Indicates whether the employee is active. Instead of deletion, this field should be set to FALSE.';

-- Adding index to efficiently query only active employees in future queries
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active); 