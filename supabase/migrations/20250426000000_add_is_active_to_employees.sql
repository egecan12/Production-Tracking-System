-- Employees tablosuna is_active alanı ekleniyor
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Mevcut tüm çalışanlar aktif olarak işaretleniyor
UPDATE employees
SET is_active = TRUE
WHERE is_active IS NULL;

-- is_active alanı için açıklama ekleniyor
COMMENT ON COLUMN employees.is_active IS 'Çalışanın aktif olup olmadığını belirtir. Silme işlemi yerine bu alan FALSE yapılmalıdır.';

-- İleriki sorgularda sadece aktif çalışanları getirmek için index ekleniyor
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active); 