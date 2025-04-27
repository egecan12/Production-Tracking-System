import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the Next.js API - this should be configurable
const API_BASE_URL = 'http://172.20.10.2:3000/api';

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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const data = await fetchApi('/system-auth', 'POST', { username, password });
    
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
  getAll: () => fetchApi('/workorders'),
  getById: (id: string) => fetchApi(`/workorders/${id}`),
  create: (data: any) => fetchApi('/workorders', 'POST', data),
  update: (id: string, data: any) => fetchApi(`/workorders/${id}`, 'PUT', data),
  delete: (id: string) => fetchApi(`/workorders/${id}`, 'DELETE'),
};

export const ordersApi = {
  getAll: () => fetchApi('/orders'),
  getById: (id: string) => fetchApi(`/orders/${id}`),
  create: (data: any) => fetchApi('/orders', 'POST', data),
  update: (id: string, data: any) => fetchApi(`/orders/${id}`, 'PUT', data),
  delete: (id: string) => fetchApi(`/orders/${id}`, 'DELETE'),
};

export const machinesApi = {
  getAll: () => fetchApi('/machines'),
  getById: (id: string) => fetchApi(`/machines/${id}`),
  create: (data: any) => fetchApi('/machines', 'POST', data),
  update: (id: string, data: any) => fetchApi(`/machines/${id}`, 'PUT', data),
  delete: (id: string) => fetchApi(`/machines/${id}`, 'DELETE'),
};

// Add more API endpoints as needed for other modules 