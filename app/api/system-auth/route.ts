import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    console.log('Login işlemi başladı');
    const { username, password } = await req.json();
    console.log('Giriş bilgileri alındı:', { username, passwordLength: password?.length });

    if (!username || !password) {
      console.log('Eksik giriş bilgileri');
      return NextResponse.json(
        { success: false, message: 'Kullanıcı adı ve şifre gereklidir.' },
        { status: 400 }
      );
    }

    // Veritabanından kullanıcı bilgilerini al - service_role key ile
    console.log('Supabase sorgusu yapılıyor:', username);
    const { data, error } = await supabaseAdmin
      .from('system_auth')
      .select('id, username, password_hash, role')
      .eq('username', username)
      .single();

    console.log('Supabase sorgu sonucu:', { data: !!data, error });

    if (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      
      // RLS veya tablo hatası durumunda
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Veritabanı erişim hatası. RLS politikaları kontrol edilmeli.' },
          { status: 403 }
        );
      }
      
      // Kullanıcı bulunamadı
      if (error.code === 'PGRST104') {
        return NextResponse.json(
          { success: false, message: 'Kullanıcı adı veya şifre hatalı.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: 'Veritabanı hatası: ' + error.message },
        { status: 500 }
      );
    }

    if (!data || !data.password_hash) {
      console.error('Kullanıcı şifre hash\'i bulunamadı');
      return NextResponse.json(
        { success: false, message: 'Kullanıcı adı veya şifre hatalı.' },
        { status: 401 }
      );
    }

    // Şifre doğrulaması
    console.log('Şifre doğrulaması yapılıyor');
    const isPasswordValid = await bcrypt.compare(password, data.password_hash);
    console.log('Şifre doğrulama sonucu:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı adı veya şifre hatalı.' },
        { status: 401 }
      );
    }

    console.log('Giriş başarılı:', { id: data.id, role: data.role });
    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı.',
      userData: {
        id: data.id,
        username: data.username,
        role: data.role
      }
    });
  } catch (error: any) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Giriş işlemi başarısız: ' + (error.message || 'Bilinmeyen hata'),
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      },
      { status: 500 }
    );
  }
} 