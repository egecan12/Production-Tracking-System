import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// THIS ENDPOINT IS FOR DEVELOPMENT PURPOSES ONLY!
// USAGE: /api/setup-admin?key=setup-secret-key
// In production, REMOVE this endpoint or add strong protection!

export async function GET(req: Request) {
  try {
    // Security check - simple protection
    const url = new URL(req.url);
    const key = url.searchParams.get('key');
    
    // Unauthorized access protection
    if (key !== 'setup-secret-key') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    
    // Admin user information
    const adminUser = {
      id: uuidv4(),
      username: 'admin',
      password_hash: await bcrypt.hash('admin123', 10), // Use a secure password!
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Check existing admin user
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('system_auth')
      .select('id')
      .eq('username', 'admin')
      .single();
      
    if (checkError && checkError.code !== 'PGRST104') {
      return NextResponse.json({ 
        error: 'Database check error: ' + checkError.message
      }, { status: 500 });
    }
    
    let result;
    
    // If exists update, otherwise create
    if (existingAdmin) {
      // Update existing user
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
      // Create new user
      const { data, error } = await supabaseAdmin
        .from('system_auth')
        .insert([adminUser])
        .select();
        
      if (error) throw error;
      result = { action: 'created', data };
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin user setup completed',
      details: result,
      loginInfo: {
        username: 'admin',
        password: 'admin123' // Don't show password in response in real applications!
      }
    });
  } catch (error: any) {
    console.error('Admin setup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 