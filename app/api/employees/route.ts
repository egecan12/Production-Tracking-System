import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Sunucu tarafında service_role key kullanma
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const { name, email, phone } = await req.json();
    
    if (!name || !email) {
      return NextResponse.json({ error: 'İsim ve email alanları zorunludur' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('employees')
      .insert([{ name, email, phone: phone || null }])
      .select();
      
    if (error) {
      console.error('Çalışan ekleme hatası:', error);
      return NextResponse.json(
        { error: error.message || 'Veritabanı hatası oluştu' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Çalışan ekleme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Çalışan eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 