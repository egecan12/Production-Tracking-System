import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// List of allowed tables - for security, we'll only provide access to allowed tables
const ALLOWED_TABLES = [
  'employees',
  'customers',
  'machines',
  'production_logs',
  'production_specifications',
  'work_sessions'  // Work sessions table added
];

// Allowed operations for each table
const TABLE_PERMISSIONS = {
  employees: ['read', 'create', 'update', 'delete'],
  customers: ['read', 'create', 'update', 'delete'],
  machines: ['read', 'create', 'update', 'delete'],
  production_logs: ['read', 'create', 'update', 'delete'],
  production_specifications: ['read', 'create', 'update', 'delete'],
  work_sessions: ['read', 'create', 'update', 'delete']  // Permissions for work sessions
  // You can restrict certain operations for some tables if needed
};

// Converts date fields to the correct format
function validateAndConvertDateField(table: string, data: any): any {
  // Object that will contain the converted data
  const convertedData = { ...data };
  
  // Date fields can be different depending on the table
  const dateFields: Record<string, string[]> = {
    orders: ['created_at', 'delivery_date', 'production_start_date'],
    work_orders: ['start_date', 'end_date', 'created_at'],
    production_logs: ['production_date', 'created_at'],
    employees: ['hire_date', 'created_at'],
    // Date fields for other tables can be added here
  };
  
  // If the table has date fields
  const fieldsToConvert = dateFields[table];
  if (fieldsToConvert) {
    // For each date field
    fieldsToConvert.forEach(field => {
      if (field in convertedData && convertedData[field]) {
        // If it's in an array (date range filter)
        if (Array.isArray(convertedData[field])) {
          convertedData[field] = convertedData[field].map((date: any) => 
            date ? new Date(date).toISOString() : null
          );
        } else {
          // Single date value
          convertedData[field] = new Date(convertedData[field]).toISOString();
        }
      }
    });
  }
  
  return convertedData;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Data API request received');
    const { table, action, data, filters } = await request.json();
    console.log('📊 Request details:', { table, action, filters });
    
    // Table access control
    if (!ALLOWED_TABLES.includes(table)) {
      console.warn(`⛔ Table access denied: ${table}`);
      return NextResponse.json({ 
        error: `No access permission for '${table}' table. Allowed tables: ${ALLOWED_TABLES.join(', ')}` 
      }, { status: 403 });
    }
    
    // Operation access control
    const allowedActions = TABLE_PERMISSIONS[table as keyof typeof TABLE_PERMISSIONS];
    if (!allowedActions.includes(action)) {
      console.warn(`⛔ Operation access denied: ${table}/${action}`);
      return NextResponse.json({ 
        error: `Operation '${action}' is not allowed for '${table}' table.` 
      }, { status: 403 });
    }
    
    console.log(`✅ Access controls passed: ${table}/${action}`);
    
    // Create Supabase query based on operation type
    let result;
    
    try {
      switch (action) {
        case 'read':
          console.log(`📖 Starting data read operation: ${table}`);
          let readQuery = supabaseAdmin.from(table).select('*');
          
          // Apply filters
          if (filters) {
            // Convert date fields
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
                console.log(`🔍 Applying filter: ${key}=${value}`);
                readQuery = readQuery.eq(key, value);
              }
            });
          }
          
          result = await readQuery;
          break;
          
        case 'create':
          if (!data) {
            return NextResponse.json({ error: 'Data is required' }, { status: 400 });
          }
          
          console.log(`➕ Starting data addition operation: ${table}`);
          // Multiple records can be added, convert single records to array
          const insertData = Array.isArray(data) ? data : [data];
          // Convert date fields
          const insertFormattedData = insertData.map(item => validateAndConvertDateField(table, item));
          result = await supabaseAdmin.from(table).insert(insertFormattedData).select();
          break;
          
        case 'update':
          if (!data || !filters) {
            return NextResponse.json({ 
              error: 'Data and filters are required' 
            }, { status: 400 });
          }
          
          console.log(`🔄 Starting data update operation: ${table}`);
          // Convert date fields
          const updateFormattedData = validateAndConvertDateField(table, data);
          let updateQuery = supabaseAdmin.from(table).update(updateFormattedData);
          
          // Apply filters
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              console.log(`🔍 Applying filter: ${key}=${value}`);
              updateQuery = updateQuery.eq(key, value);
            }
          });
          
          result = await updateQuery.select();
          break;
          
        case 'delete':
          if (!filters) {
            return NextResponse.json({ error: 'Filters are required' }, { status: 400 });
          }
          
          console.log(`❌ Starting data deletion operation: ${table}`);
          
          // If the table is employees, customers, or machines, update is_active to false instead of deleting
          if (table === 'employees' || table === 'customers' || table === 'machines') {
            console.log(`🔄 Setting ${table} record to inactive instead of deleting`);
            let updateQuery = supabaseAdmin.from(table).update({ is_active: false });
            
            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                console.log(`🔍 Applying filter: ${key}=${value}`);
                updateQuery = updateQuery.eq(key, value);
              }
            });
            
            result = await updateQuery.select();
          } else {
            // Normal deletion for other tables
            let deleteQuery = supabaseAdmin.from(table).delete();
            
            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                console.log(`🔍 Applying filter: ${key}=${value}`);
                deleteQuery = deleteQuery.eq(key, value);
              }
            });
            
            result = await deleteQuery.select();
          }
          break;
          
        default:
          return NextResponse.json({ error: `Invalid operation: ${action}` }, { status: 400 });
      }
    } catch (queryError: any) {
      console.error(`⚠️ Supabase query error:`, queryError);
      return NextResponse.json({
        error: `Error during database operation: ${queryError.message || queryError}`,
        details: process.env.NODE_ENV === 'development' ? queryError.stack : undefined
      }, { status: 500 });
    }
    
    // Supabase error check
    if (result.error) {
      console.error(`⚠️ Database error (${table}/${action}):`, result.error);
      return NextResponse.json({
        error: result.error.message || 'Database error occurred',
        details: result.error,
        code: result.error.code
      }, { status: 500 });
    }
    
    // Result log
    console.log(`✅ Operation successful (${table}/${action}): ${result.data?.length || 0} records`);
    
    // Successful result
    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0
    });
    
  } catch (error: any) {
    console.error('❌ API error:', error);
    return NextResponse.json({
      error: error.message || 'An error occurred during the operation',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 