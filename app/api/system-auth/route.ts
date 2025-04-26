import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    console.log('Login process started');
    const { username, password } = await req.json();
    console.log('Login credentials received:', { username, passwordLength: password?.length });

    if (!username || !password) {
      console.log('Missing login credentials');
      return NextResponse.json(
        { success: false, message: 'Username and password are required.' },
        { status: 400 }
      );
    }

    // Get user information from database using service_role key
    console.log('Executing Supabase query:', username);
    const { data, error } = await supabaseAdmin
      .from('system_auth')
      .select('id, username, password_hash, role')
      .eq('username', username)
      .single();

    console.log('Supabase query result:', { data: !!data, error });

    if (error) {
      console.error('Could not retrieve user information:', error);
      
      // RLS or table error
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Database access error. RLS policies should be checked.' },
          { status: 403 }
        );
      }
      
      // User not found
      if (error.code === 'PGRST104') {
        return NextResponse.json(
          { success: false, message: 'Username or password is incorrect.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    if (!data || !data.password_hash) {
      console.error('User password hash not found');
      return NextResponse.json(
        { success: false, message: 'Username or password is incorrect.' },
        { status: 401 }
      );
    }

    // Password validation
    console.log('Validating password');
    const isPasswordValid = await bcrypt.compare(password, data.password_hash);
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Username or password is incorrect.' },
        { status: 401 }
      );
    }

    console.log('Login successful:', { id: data.id, role: data.role });
    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      userData: {
        id: data.id,
        username: data.username,
        role: data.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Login failed: ' + (error.message || 'Unknown error'),
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      },
      { status: 500 }
    );
  }
} 