import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// BU ENDPOİNT SADECE GELİŞTİRME AMAÇLIDIR!
// KULLANIMI: /api/setup-admin?key=setup-secret-key
// Canlı ortamda bu endpoint'i KALDIR veya güçlü bir koruma ekle!

export async function GET(req: Request) {
  try {
    // Güvenlik kontrolü - basit bir koruma
    const url = new URL(req.url);
    const key = url.searchParams.get('key');
    
    // Yetkisiz erişim koruması
    if (key !== 'setup-secret-key') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    // Admin kullanıcısı için bilgiler
    const adminUser = {
      id: uuidv4(),
      username: 'admin',
      password_hash: await bcrypt.hash('admin123', 10), // Güvenli şifre kullanılmalı!
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Mevcut admin kullanıcısını kontrol et
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('system_auth')
      .select('id')
      .eq('username', 'admin')
      .single();
      
    if (checkError && checkError.code !== 'PGRST104') {
      return NextResponse.json({ 
        error: 'Veritabanı kontrol hatası: ' + checkError.message
      }, { status: 500 });
    }
    
    let result;
    
    // Eğer varsa güncelle, yoksa oluştur
    if (existingAdmin) {
      // Mevcut kullanıcıyı güncelle
      const { data, error } = await supabaseAdmin
        .from('system_auth')
        .update({
          password_hash: adminUser.password_hash,
          role: adminUser.role,
          updated_at: adminUser.updated_at
        })
        .eq('username', 'admin')
        .select();
        
      if (error) throw error;
      result = { action: 'updated', data };
    } else {
      // Yeni kullanıcı oluştur
      const { data, error } = await supabaseAdmin
        .from('system_auth')
        .insert([adminUser])
        .select();
        
      if (error) throw error;
      result = { action: 'created', data };
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin kullanıcısı kurulumu tamamlandı',
      details: result,
      loginInfo: {
        username: 'admin',
        password: 'admin123' // Gerçek uygulamalarda şifreyi yanıtta göstermeyin!
      }
    });
  } catch (error: any) {
    console.error('Admin kurulum hatası:', error);
    return NextResponse.json({
      success: false,
      message: 'Admin kullanıcısı oluşturulamadı: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 