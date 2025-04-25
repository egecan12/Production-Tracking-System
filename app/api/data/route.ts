import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// İzin verilen tablolar listesi - güvenlik için sadece izin verilen tablolara erişim sağlayacağız
const ALLOWED_TABLES = [
  'employees',
  'customers',
  'machines',
  'orders',
  'work_orders',
  'production_logs',
  'production_specifications',
  'work_sessions'  // İş oturumları tablosu eklendi
];

// Her tablo için izin verilen işlemler
const TABLE_PERMISSIONS = {
  employees: ['read', 'create', 'update', 'delete'],
  customers: ['read', 'create', 'update', 'delete'],
  machines: ['read', 'create', 'update', 'delete'],
  orders: ['read', 'create', 'update', 'delete'],
  work_orders: ['read', 'create', 'update', 'delete'],
  production_logs: ['read', 'create', 'update', 'delete'],
  production_specifications: ['read', 'create', 'update', 'delete'],
  work_sessions: ['read', 'create', 'update', 'delete']  // İş oturumları için izinler
  // İhtiyaç duyulursa bazı tablolarda belirli işlemleri kısıtlayabilirsiniz
};

// Tarih alanlarını doğru biçime dönüştürür
function validateAndConvertDateField(table: string, data: any): any {
  // Dönüştürülmüş veriyi içerecek nesne
  const convertedData = { ...data };
  
  // Tabloya göre tarih alanları farklı olabilir
  const dateFields: Record<string, string[]> = {
    orders: ['created_at', 'delivery_date', 'production_start_date'],
    work_orders: ['start_date', 'end_date', 'created_at'],
    production_logs: ['production_date', 'created_at'],
    employees: ['hire_date', 'created_at'],
    // Diğer tablolar için tarih alanları eklenebilir
  };
  
  // İlgili tablonun tarih alanları varsa
  const fieldsToConvert = dateFields[table];
  if (fieldsToConvert) {
    // Her tarih alanı için
    fieldsToConvert.forEach(field => {
      if (field in convertedData && convertedData[field]) {
        // Eğer dizi içindeyse (tarih aralığı filtresi)
        if (Array.isArray(convertedData[field])) {
          convertedData[field] = convertedData[field].map((date: any) => 
            date ? new Date(date).toISOString() : null
          );
        } else {
          // Tek tarih değeri
          convertedData[field] = new Date(convertedData[field]).toISOString();
        }
      }
    });
  }
  
  return convertedData;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Veri API isteği alındı');
    const { table, action, data, filters } = await request.json();
    console.log('📊 İstek detayları:', { table, action, filters });
    
    // Tablo erişim kontrolü
    if (!ALLOWED_TABLES.includes(table)) {
      console.warn(`⛔ Tablo erişimi reddedildi: ${table}`);
      return NextResponse.json({ 
        error: `'${table}' tablosuna erişim izni yok. İzin verilen tablolar: ${ALLOWED_TABLES.join(', ')}` 
      }, { status: 403 });
    }
    
    // İşlem erişim kontrolü
    const allowedActions = TABLE_PERMISSIONS[table as keyof typeof TABLE_PERMISSIONS];
    if (!allowedActions.includes(action)) {
      console.warn(`⛔ İşlem erişimi reddedildi: ${table}/${action}`);
      return NextResponse.json({ 
        error: `'${table}' tablosu için '${action}' işlemine izin verilmiyor.` 
      }, { status: 403 });
    }
    
    console.log(`✅ Erişim kontrolleri başarılı: ${table}/${action}`);
    
    // İşlem türüne göre Supabase sorgusu oluştur
    let result;
    
    try {
      switch (action) {
        case 'read':
          console.log(`📖 Veri okuma işlemi başlatılıyor: ${table}`);
          let readQuery = supabaseAdmin.from(table).select('*');
          
          // Filtreleri uygula
          if (filters) {
            // Date alanlarını dönüştür
            const convertedFilters = validateAndConvertDateField(table, filters);
            
            Object.entries(convertedFilters).forEach(([key, value]) => {
              if (Array.isArray(value) && value.length === 2) {
                // Range filter for dates or numbers
                if (value[0] !== null) {
                  readQuery = readQuery.gte(key, value[0]);
                }
                if (value[1] !== null) {
                  readQuery = readQuery.lte(key, value[1]);
                }
              } else if (value !== undefined && value !== null && value !== '') {
                console.log(`🔍 Filtre uygulanıyor: ${key}=${value}`);
                readQuery = readQuery.eq(key, value);
              }
            });
          }
          
          result = await readQuery;
          break;
          
        case 'create':
          if (!data) {
            return NextResponse.json({ error: 'Veri (data) gereklidir' }, { status: 400 });
          }
          
          console.log(`➕ Veri ekleme işlemi başlatılıyor: ${table}`);
          // Birden fazla kayıt eklenebilir, tek kayıtları diziye çevirir
          const insertData = Array.isArray(data) ? data : [data];
          // Date alanlarını dönüştür
          const insertFormattedData = insertData.map(item => validateAndConvertDateField(table, item));
          result = await supabaseAdmin.from(table).insert(insertFormattedData).select();
          break;
          
        case 'update':
          if (!data || !filters) {
            return NextResponse.json({ 
              error: 'Veri (data) ve filtreler (filters) gereklidir' 
            }, { status: 400 });
          }
          
          console.log(`🔄 Veri güncelleme işlemi başlatılıyor: ${table}`);
          // Date alanlarını dönüştür
          const updateFormattedData = validateAndConvertDateField(table, data);
          let updateQuery = supabaseAdmin.from(table).update(updateFormattedData);
          
          // Filtreleri uygula
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              console.log(`🔍 Filtre uygulanıyor: ${key}=${value}`);
              updateQuery = updateQuery.eq(key, value);
            }
          });
          
          result = await updateQuery.select();
          break;
          
        case 'delete':
          if (!filters) {
            return NextResponse.json({ error: 'Filtreler (filters) gereklidir' }, { status: 400 });
          }
          
          console.log(`❌ Veri silme işlemi başlatılıyor: ${table}`);
          
          // Eğer employees, customers veya machines tablosu ise, silme yerine is_active = false olarak güncelle
          if (table === 'employees' || table === 'customers' || table === 'machines') {
            console.log(`🔄 ${table} kaydı silme yerine pasif duruma alınıyor`);
            let updateQuery = supabaseAdmin.from(table).update({ is_active: false });
            
            // Filtreleri uygula
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                console.log(`🔍 Filtre uygulanıyor: ${key}=${value}`);
                updateQuery = updateQuery.eq(key, value);
              }
            });
            
            result = await updateQuery.select();
          } else {
            // Diğer tablolar için normal silme işlemi
            let deleteQuery = supabaseAdmin.from(table).delete();
            
            // Filtreleri uygula
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                console.log(`🔍 Filtre uygulanıyor: ${key}=${value}`);
                deleteQuery = deleteQuery.eq(key, value);
              }
            });
            
            result = await deleteQuery.select();
          }
          break;
          
        default:
          return NextResponse.json({ error: `Geçersiz işlem: ${action}` }, { status: 400 });
      }
    } catch (queryError: any) {
      console.error(`⚠️ Supabase sorgu hatası:`, queryError);
      return NextResponse.json({
        error: `Veritabanı işlemi sırasında hata: ${queryError.message || queryError}`,
        details: process.env.NODE_ENV === 'development' ? queryError.stack : undefined
      }, { status: 500 });
    }
    
    // Supabase hata kontrolü
    if (result.error) {
      console.error(`⚠️ Veritabanı hatası (${table}/${action}):`, result.error);
      return NextResponse.json({
        error: result.error.message || 'Veritabanı hatası oluştu',
        details: result.error,
        code: result.error.code
      }, { status: 500 });
    }
    
    // Sonuç log
    console.log(`✅ İşlem başarılı (${table}/${action}): ${result.data?.length || 0} kayıt`);
    
    // Başarılı sonuç
    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0
    });
    
  } catch (error: any) {
    console.error('❌ API hatası:', error);
    return NextResponse.json({
      error: error.message || 'İşlem sırasında bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 