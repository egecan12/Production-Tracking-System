-- Customers (Müşteriler) tablosuna is_active alanı ekleniyor
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Mevcut tüm müşteriler aktif olarak işaretleniyor
UPDATE customers
SET is_active = TRUE
WHERE is_active IS NULL;

-- Machines (Makinalar) tablosuna is_active alanı ekleniyor
ALTER TABLE machines
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Mevcut tüm makinalar aktif olarak işaretleniyor
UPDATE machines
SET is_active = TRUE
WHERE is_active IS NULL;

-- İndeksler oluşturuluyor
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_machines_is_active ON machines(is_active);

-- Açıklamalar ekleniyor
COMMENT ON COLUMN customers.is_active IS 'Müşterinin aktif olup olmadığını belirtir. Silme işlemi yerine bu alan FALSE yapılmalıdır.';
COMMENT ON COLUMN machines.is_active IS 'Makinanın aktif olup olmadığını belirtir. Silme işlemi yerine bu alan FALSE yapılmalıdır.'; 