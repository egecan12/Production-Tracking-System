import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { PostgrestFilterBuilder, PostgrestQueryBuilder } from '@supabase/postgrest-js';

// İzin verilen tablolar listesi - güvenlik için sadece izin verilen tablolara erişim sağlayacağız
const ALLOWED_TABLES = [
  'employees',
  'customers',
  'machines',
  'orders',
  'work_orders',
  'production_logs',
  'production_specifications'
];

// Her tablo için izin verilen işlemler
const TABLE_PERMISSIONS = {
  employees: ['read', 'create', 'update', 'delete'],
  customers: ['read', 'create', 'update', 'delete'],
  machines: ['read', 'create', 'update', 'delete'],
  orders: ['read', 'create', 'update', 'delete'],
  work_orders: ['read', 'create', 'update', 'delete'],
  production_logs: ['read', 'create', 'update', 'delete'],
  production_specifications: ['read', 'create', 'update', 'delete']
  // İhtiyaç duyulursa bazı tablolarda belirli işlemleri kısıtlayabilirsiniz
};

export async function POST(req: NextRequest) {
  try {
    const { table, action, data, filters } = await req.json();
    
    // Tablo erişim kontrolü
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ 
        error: `'${table}' tablosuna erişim izni yok. İzin verilen tablolar: ${ALLOWED_TABLES.join(', ')}` 
      }, { status: 403 });
    }
    
    // İşlem erişim kontrolü
    const allowedActions = TABLE_PERMISSIONS[table as keyof typeof TABLE_PERMISSIONS];
    if (!allowedActions.includes(action)) {
      return NextResponse.json({ 
        error: `'${table}' tablosu için '${action}' işlemine izin verilmiyor.` 
      }, { status: 403 });
    }
    
    // İşlem türüne göre Supabase sorgusu oluştur
    let query: PostgrestFilterBuilder<any, any, any> | PostgrestQueryBuilder<any, any>;
    let result;
    
    switch (action) {
      case 'read':
        query = supabaseAdmin.from(table).select('*');
        
        // Filtreleri uygula
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              (query as PostgrestFilterBuilder<any, any, any>) = (query as PostgrestFilterBuilder<any, any, any>).eq(key, value);
            }
          });
        }
        
        result = await query;
        break;
        
      case 'create':
        if (!data) {
          return NextResponse.json({ error: 'Veri (data) gereklidir' }, { status: 400 });
        }
        
        // Birden fazla kayıt eklenebilir, tek kayıtları diziye çevirir
        const insertData = Array.isArray(data) ? data : [data];
        result = await supabaseAdmin.from(table).insert(insertData).select();
        break;
        
      case 'update':
        if (!data || !filters) {
          return NextResponse.json({ 
            error: 'Veri (data) ve filtreler (filters) gereklidir' 
          }, { status: 400 });
        }
        
        query = supabaseAdmin.from(table).update(data);
        
        // Filtreleri uygula
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            (query as PostgrestFilterBuilder<any, any, any>) = (query as PostgrestFilterBuilder<any, any, any>).eq(key, value);
          }
        });
        
        result = await query.select();
        break;
        
      case 'delete':
        if (!filters) {
          return NextResponse.json({ error: 'Filtreler (filters) gereklidir' }, { status: 400 });
        }
        
        query = supabaseAdmin.from(table).delete();
        
        // Filtreleri uygula
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            (query as PostgrestFilterBuilder<any, any, any>) = (query as PostgrestFilterBuilder<any, any, any>).eq(key, value);
          }
        });
        
        result = await query.select();
        break;
        
      default:
        return NextResponse.json({ error: `Geçersiz işlem: ${action}` }, { status: 400 });
    }
    
    // Supabase hata kontrolü
    if (result.error) {
      console.error(`Veritabanı hatası (${table}/${action}):`, result.error);
      return NextResponse.json({
        error: result.error.message || 'Veritabanı hatası oluştu'
      }, { status: 500 });
    }
    
    // Başarılı sonuç
    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0
    });
    
  } catch (error: any) {
    console.error('API hatası:', error);
    return NextResponse.json({
      error: error.message || 'İşlem sırasında bir hata oluştu'
    }, { status: 500 });
  }
} 