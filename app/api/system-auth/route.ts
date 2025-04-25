import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir.' },
        { status: 400 }
      );
    }

    // Veritabanından kullanıcı bilgilerini al
    const { data, error } = await supabase
      .from('system_auth')
      .select('id, username, password_hash, role')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      return NextResponse.json(
        { success: false, message: 'Kullanıcı adı veya şifre hatalı.' },
        { status: 401 }
      );
    }

    // Şifre doğrulaması
    const isPasswordValid = await bcrypt.compare(password, data.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı adı veya şifre hatalı.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı.',
      userData: {
        id: data.id,
        username: data.username,
        role: data.role
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi başarısız.' },
      { status: 500 }
    );
  }
} 