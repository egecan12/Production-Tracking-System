/**
 * API Test Utility
 * 
 * This file contains utility functions to test API connectivity
 */

import { API_BASE_URL } from '../api/apiService';

/**
 * Tests connectivity to the API server
 */
export const testApiConnection = async () => {
  const startTime = Date.now();
  
  try {
    // Try a simple fetch request to the base URL
    const response = await fetch(API_BASE_URL, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log('API Connection Test Results:');
    console.log(`- URL: ${API_BASE_URL}`);
    console.log(`- Status: ${response.status} ${response.statusText}`);
    console.log(`- Response Time: ${responseTime}ms`);
    
    // Try to get response content
    try {
      const contentType = response.headers.get('content-type');
      console.log(`- Content Type: ${contentType || 'Unknown'}`);
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        console.log('- Response Data:', data);
      } else {
        const text = await response.text();
        console.log(`- Response Text: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      }
    } catch (contentError) {
      console.log(`- Content Error: ${contentError.message}`);
    }
    
    return {
      success: response.ok,
      status: response.status,
      responseTime
    };
  } catch (error) {
    console.error('API Connection Test Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Run this function to test specific endpoints
 */
export const testEndpoints = async () => {
  const endpoints = [
    '/work-orders',
    '/orders',
    '/machines'
  ];
  
  console.log('Testing API Endpoints:');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint}...`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      console.log(`- Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`- Data: ${JSON.stringify(data).substring(0, 100)}...`);
        } catch (parseError) {
          const text = await response.text();
          console.log(`- Parse Error: ${parseError.message}`);
          console.log(`- Raw Response: ${text.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log(`- Error: ${error.message}`);
    }
  }
}; 