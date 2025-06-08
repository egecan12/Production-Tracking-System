import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Your web app's API base URL
export const API_BASE_URL = 'YOUR_WEB_APP_URL';

// API client configuration
export const apiClient = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add any other configuration needed for your API client
}; 