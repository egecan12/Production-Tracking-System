/**
 * DataService - Tüm veri işlemleri için merkezi bir servis
 * Bu servis, component'lerin doğrudan Supabase veya API ile uğraşmak yerine
 * veri işlemlerini gerçekleştirmesi için tutarlı bir arayüz sağlar.
 */

// Genel tablo işlemleri için tip tanımlamaları
export type DataAction = 'read' | 'create' | 'update' | 'delete';
export type DataTable = 
  | 'employees' 
  | 'customers' 
  | 'machines' 
  | 'orders' 
  | 'work_orders' 
  | 'production_logs' 
  | 'production_specifications'
  | 'work_sessions';  // İş oturumları tablosu eklendi

// API servisine yapılacak istekler için tip tanımı
interface DataRequest {
  table: DataTable;
  action: DataAction;
  data?: any;
  filters?: Record<string, any>;
}

// API yanıtları için tip tanımı
interface DataResponse<T = any> {
  success: boolean;
  data?: T[];
  count?: number;
  error?: string;
}

/**
 * API'yi kullanarak veri işlemlerini gerçekleştirir
 */
export async function fetchData<T = any>(request: DataRequest): Promise<DataResponse<T>> {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `${request.action} işlemi başarısız oldu`);
    }

    return result as DataResponse<T>;
  } catch (error: any) {
    console.error('Veri işlemi hatası:', error);
    return {
      success: false,
      error: error.message || 'Veri işlemi sırasında bir hata oluştu',
    };
  }
}

/**
 * Tablo verilerini okur
 */
export async function getData<T = any>(table: DataTable, filters?: Record<string, any>): Promise<T[]> {
  const result = await fetchData<T>({
    table,
    action: 'read',
    filters,
  });

  if (!result.success) {
    console.error(`Veri okuma hatası (${table}):`, result.error);
    return [];
  }

  return result.data || [];
}

/**
 * Tabloya yeni veri/veriler ekler
 */
export async function createData<T = any>(table: DataTable, data: Partial<T> | Partial<T>[]): Promise<T[]> {
  const result = await fetchData<T>({
    table,
    action: 'create',
    data,
  });

  if (!result.success) {
    console.error(`Veri ekleme hatası (${table}):`, result.error);
    throw new Error(result.error || 'Veri eklenemedi');
  }

  return result.data || [];
}

/**
 * Sadece aktif çalışanları almak için özel fonksiyon
 */
export async function getActiveEmployees<T = any>(): Promise<T[]> {
  const result = await fetchData<T>({
    table: 'employees',
    action: 'read',
    filters: { is_active: true },
  });

  if (!result.success) {
    console.error(`Aktif çalışanları alma hatası:`, result.error);
    return [];
  }

  return result.data || [];
}

/**
 * Tablo verisini günceller
 */
export async function updateData<T = any>(table: DataTable, data: Partial<T>, filters: Record<string, any>): Promise<T[]> {
  const result = await fetchData<T>({
    table,
    action: 'update',
    data,
    filters,
  });

  if (!result.success) {
    console.error(`Veri güncelleme hatası (${table}):`, result.error);
    throw new Error(result.error || 'Veri güncellenemedi');
  }

  return result.data || [];
}

/**
 * Tablo verisini siler
 */
export async function deleteData<T = any>(table: DataTable, filters: Record<string, any>): Promise<T[]> {
  const result = await fetchData<T>({
    table,
    action: 'delete',
    filters,
  });

  if (!result.success) {
    console.error(`Veri silme hatası (${table}):`, result.error);
    throw new Error(result.error || 'Veri silinemedi');
  }

  return result.data || [];
} 