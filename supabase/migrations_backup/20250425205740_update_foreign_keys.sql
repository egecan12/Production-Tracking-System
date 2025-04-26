-- Update work_orders foreign key
ALTER TABLE work_orders 
DROP CONSTRAINT IF EXISTS work_orders_customer_id_fkey,
ADD CONSTRAINT work_orders_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Do the same for other tables as well