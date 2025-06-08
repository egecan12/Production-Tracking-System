import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the Next.js API - this should be configurable
const API_BASE_URL = 'http://192.168.178.75:3000';

// Generic fetch function with error handling
const fetchApi = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
) => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('📱 Mobile API Request:', {
      url,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const response = await fetch(url, config);
    
    console.log('📱 Mobile API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Handle 404 and other error status codes
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Endpoint ${endpoint} not found (404)`);
        return method === 'GET' ? [] : { success: false, message: 'Resource not found' };
      }
      const errorText = await response.text();
      console.log('📱 Error Response Text:', errorText);
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || `Error ${response.status}: ${response.statusText}`);
      } catch (parseError) {
        // If can't parse as JSON, use text
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }
    
    // Safe JSON parsing
    try {
      const text = await response.text();
      console.log('📱 Response Text:', text);
      const data = text ? JSON.parse(text) : {};
      console.log('📱 Parsed Data:', data);
      return data;
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return method === 'GET' ? [] : { success: false, message: 'Invalid response format' };
    }
  } catch (error) {
    console.error('API call failed:', error);
    // Return empty array for GET requests to prevent app crashes
    if (method === 'GET') {
      return [];
    }
    throw error;
  }
};

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const data = await fetchApi('/api/system-auth', 'POST', { username, password });
    
    if (data.success) {
      // Store auth data in AsyncStorage
      await AsyncStorage.setItem('systemAuth', 'true');
      await AsyncStorage.setItem('username', username);
      
      if (data.userData && data.userData.role) {
        await AsyncStorage.setItem('userRole', data.userData.role);
      }
    }
    
    return data;
  },
  
  logout: async () => {
    // Clear auth data from AsyncStorage
    await AsyncStorage.removeItem('systemAuth');
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('userRole');
  },
  
  isAuthenticated: async () => {
    return await AsyncStorage.getItem('systemAuth') === 'true';
  },
  
  getUsername: async () => {
    return await AsyncStorage.getItem('username');
  }
};

// Other API endpoints can be added here as needed, following the same pattern
export const workOrdersApi = {
  getAll: () => fetchApi('/api/data', 'POST', { 
    table: 'work_orders', 
    action: 'read' 
  }),
  getById: (id: string) => fetchApi('/api/data', 'POST', { 
    table: 'work_orders', 
    action: 'read',
    filters: { id }
  }),
  create: (data: any) => fetchApi('/api/data', 'POST', { 
    table: 'work_orders', 
    action: 'create',
    data
  }),
  update: (id: string, data: any) => fetchApi('/api/data', 'POST', { 
    table: 'work_orders', 
    action: 'update',
    data,
    filters: { id }
  }),
  delete: (id: string) => fetchApi('/api/data', 'POST', { 
    table: 'work_orders', 
    action: 'delete',
    filters: { id }
  }),
};

export const ordersApi = {
  getAll: () => fetchApi('/api/data', 'POST', { 
    table: 'orders', 
    action: 'read' 
  }),
  getById: (id: string) => fetchApi('/api/data', 'POST', { 
    table: 'orders', 
    action: 'read',
    filters: { id }
  }),
  create: (data: any) => fetchApi('/api/data', 'POST', { 
    table: 'orders', 
    action: 'create',
    data
  }),
  update: (id: string, data: any) => fetchApi('/api/data', 'POST', { 
    table: 'orders', 
    action: 'update',
    data,
    filters: { id }
  }),
  delete: (id: string) => fetchApi('/api/data', 'POST', { 
    table: 'orders', 
    action: 'delete',
    filters: { id }
  }),
};

export const machinesApi = {
  getAll: () => fetchApi('/api/data', 'POST', { 
    table: 'machines', 
    action: 'read',
    filters: { is_active: true }
  }),
  getById: (id: string) => fetchApi('/api/data', 'POST', { 
    table: 'machines', 
    action: 'read',
    filters: { id }
  }),
  create: (data: any) => fetchApi('/api/data', 'POST', { 
    table: 'machines', 
    action: 'create',
    data
  }),
  update: (id: string, data: any) => fetchApi('/api/data', 'POST', { 
    table: 'machines', 
    action: 'update',
    data,
    filters: { id }
  }),
  delete: (id: string) => fetchApi('/api/data', 'POST', { 
    table: 'machines', 
    action: 'delete',
    filters: { id }
  }),
};

export const employeesApi = {
  getAll: () => fetchApi('/api/data', 'POST', { 
    table: 'employees', 
    action: 'read',
    filters: { is_active: true }
  }),
  getById: (id: string) => fetchApi('/api/data', 'POST', { 
    table: 'employees', 
    action: 'read',
    filters: { id }
  }),
  create: (data: any) => fetchApi('/api/data', 'POST', { 
    table: 'employees', 
    action: 'create',
    data
  }),
  update: (id: string, data: any) => fetchApi('/api/data', 'POST', { 
    table: 'employees', 
    action: 'update',
    data,
    filters: { id }
  }),
  delete: (id: string) => fetchApi('/api/data', 'POST', { 
    table: 'employees', 
    action: 'delete',
    filters: { id }
  }),
};

// Add more API endpoints as needed for other modules 