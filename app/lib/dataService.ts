/**
 * DataService - A central service for all data operations
 * This service provides a consistent interface for components to perform
 * data operations instead of dealing directly with Supabase or API.
 */

// Type definitions for general table operations
export type DataAction = 'read' | 'create' | 'update' | 'delete';
export type DataTable = 
    | 'employees'
  | 'customers'
  | 'machines'
  | 'production_logs'
  | 'production_specifications'
  | 'work_sessions';  // Work sessions table added

// Type definition for requests to the API service
interface DataRequest {
  table: DataTable;
  action: DataAction;
  data?: any;
  filters?: Record<string, any>;
}

// Type definition for API responses
interface DataResponse<T = any> {
  success: boolean;
  data?: T[];
  count?: number;
  error?: string;
}

/**
 * Performs data operations using the API
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
      throw new Error(result.error || `${request.action} operation failed`);
    }

    return result as DataResponse<T>;
  } catch (error: any) {
    console.error('Data operation error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during data operation',
    };
  }
}

/**
 * Reads table data
 */
export async function getData<T = any>(table: DataTable, filters?: Record<string, any>): Promise<T[]> {
  const result = await fetchData<T>({
    table,
    action: 'read',
    filters,
  });

  if (!result.success) {
    console.error(`Data reading error (${table}):`, result.error);
    return [];
  }

  return result.data || [];
}

/**
 * Adds new data/records to the table
 */
export async function createData<T = any>(table: DataTable, data: Partial<T> | Partial<T>[]): Promise<T[]> {
  const result = await fetchData<T>({
    table,
    action: 'create',
    data,
  });

  if (!result.success) {
    console.error(`Data addition error (${table}):`, result.error);
    throw new Error(result.error || 'Data could not be added');
  }

  return result.data || [];
}

/**
 * Special function to get only active employees
 */
export async function getActiveEmployees<T = any>(): Promise<T[]> {
  const result = await fetchData<T>({
    table: 'employees',
    action: 'read',
    filters: { is_active: true },
  });

  if (!result.success) {
    console.error(`Error getting active employees:`, result.error);
    return [];
  }

  return result.data || [];
}

/**
 * Special function to get only active customers
 */
export async function getActiveCustomers<T = any>(): Promise<T[]> {
  const result = await fetchData<T>({
    table: 'customers',
    action: 'read',
    filters: { is_active: true },
  });

  if (!result.success) {
    console.error(`Error getting active customers:`, result.error);
    return [];
  }

  return result.data || [];
}

/**
 * Special function to get only active machines
 */
export async function getActiveMachines<T = any>(): Promise<T[]> {
  const result = await fetchData<T>({
    table: 'machines',
    action: 'read',
    filters: { is_active: true },
  });

  if (!result.success) {
    console.error(`Error getting active machines:`, result.error);
    return [];
  }

  return result.data || [];
}

/**
 * Updates table data
 */
export async function updateData<T = any>(table: DataTable, data: Partial<T>, filters: Record<string, any>): Promise<T[]> {
  const result = await fetchData<T>({
    table,
    action: 'update',
    data,
    filters,
  });

  if (!result.success) {
    console.error(`Data update error (${table}):`, result.error);
    throw new Error(result.error || 'Data could not be updated');
  }

  return result.data || [];
}

/**
 * Deletes table data
 */
export async function deleteData<T = any>(table: DataTable, filters: Record<string, any>): Promise<T[]> {
  const result = await fetchData<T>({
    table,
    action: 'delete',
    filters,
  });

  if (!result.success) {
    console.error(`Data deletion error (${table}):`, result.error);
    throw new Error(result.error || 'Data could not be deleted');
  }

  return result.data || [];
} 