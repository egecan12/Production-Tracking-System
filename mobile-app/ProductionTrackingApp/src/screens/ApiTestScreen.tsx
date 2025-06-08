import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { workOrdersApi, ordersApi, machinesApi } from '../api/apiService';

// Make sure to update this to your correct API address
const API_BASE_URL = 'http://172.20.10.2:3000/api';

// Define the missing interfaces
interface WorkOrder {
  id: number;
  name: string;
  status: string;
  // Add other properties as needed
}

interface Order {
  id: number;
  orderNumber: string;
  customer: string;
  // Add other properties as needed
}

interface Machine {
  id: number;
  name: string;
  status: string;
  // Add other properties as needed
}

// Improved fetchApi function with better error handling
const fetchApi = async (endpoint: string) => {
  try {
    console.log(`Fetching from: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    // Log status for debugging
    console.log(`Status: ${response.status} for ${endpoint}`);
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Get the raw text first
    const text = await response.text();
    
    // Try to parse as JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error(`JSON Parse error for ${endpoint}: ${parseError}`);
      // If this fails, throw an error with context
      throw new Error(`Invalid JSON response: ${text.substring(0, 50)}...`);
    }
  } catch (error) {
    console.error(`API call failed: ${error}`);
    throw error;
  }
};

const ApiTestScreen: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [endpoint, setEndpoint] = useState('/orders');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [responseText, setResponseText] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [workOrdersError, setWorkOrdersError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machinesError, setMachinesError] = useState<string | null>(null);

  const endpoints = [
    '/orders',
    '/work-orders', // Corrected from /workorders to /work-orders
    '/machines',
    '/system-auth',
    '/custom'
  ];

  const testApiConnection = async () => {
    try {
      setPingResult('Testing connection...');
      setError(null);
      
      const startTime = Date.now();
      const response = await fetch(apiUrl, { method: 'HEAD' });
      const endTime = Date.now();
      
      setPingResult(`Connection successful! Response time: ${endTime - startTime}ms`);
    } catch (err) {
      setPingResult(`Connection failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const makeApiRequest = async () => {
    setLoading(true);
    setError(null);
    setResponseData(null);
    setResponseText(null);
    setStatusCode(null);
    setResponseTime(null);

    try {
      const targetEndpoint = endpoint === '/custom' ? customEndpoint : endpoint;
      const fullUrl = `${apiUrl}${targetEndpoint}`;
      
      console.log(`Making ${method} request to: ${fullUrl}`);
      
      const startTime = Date.now();
      
      const requestInit: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };

      if (method !== 'GET' && method !== 'HEAD' && requestBody) {
        try {
          // Validate JSON
          JSON.parse(requestBody);
          requestInit.body = requestBody;
        } catch (e) {
          setError('Invalid JSON in request body');
          setLoading(false);
          return;
        }
      }

      const response = await fetch(fullUrl, requestInit);
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setStatusCode(response.status);

      // Get raw response text first
      const rawText = await response.text();
      setResponseText(rawText);

      // Try to parse as JSON if possible
      try {
        if (rawText.trim()) {
          const jsonData = JSON.parse(rawText);
          setResponseData(jsonData);
        } else {
          setResponseData({ message: "Empty response" });
        }
      } catch (e) {
        // If it's not valid JSON, we already have the raw text
        console.error(`JSON parse error: ${e}`);
        setResponseData({ message: "Response is not valid JSON", error: String(e) });
      }
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkOrders = async () => {
    setLoading(true);
    setWorkOrdersError('');
    try {
      // Corrected endpoint to match backend
      const result = await fetchApi('/work-orders');
      setWorkOrders(result);
      setResponseText(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('İş emirleri yüklenirken hata:', error);
      setWorkOrdersError(`Yükleme sırasında hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
      setResponseText('Error loading work orders');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    setOrdersError('');
    try {
      const result = await fetchApi('/orders');
      setOrders(result);
      setResponseText(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
      setOrdersError(`Yükleme sırasında hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
      setResponseText('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const loadMachines = async () => {
    setLoading(true);
    setMachinesError('');
    try {
      const result = await fetchApi('/machines');
      setMachines(result);
      setResponseText(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Makineler yüklenirken hata:', error);
      setMachinesError(`Yükleme sırasında hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
      setResponseText('Error loading machines');
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle loading buttons in the UI
  const handleLoadData = (type: string) => {
    switch(type) {
      case 'orders':
        loadOrders();
        break;
      case 'work-orders':
        loadWorkOrders();
        break;
      case 'machines':
        loadMachines();
        break;
      default:
        Alert.alert('Error', 'Unknown data type');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>API Diagnostics</Text>
          
          {/* API URL Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Server Configuration</Text>
            <Text style={styles.label}>API Base URL:</Text>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="Enter API base URL"
            />
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={testApiConnection}
            >
              <Text style={styles.buttonText}>Test Connection</Text>
            </TouchableOpacity>
            
            {pingResult && (
              <Text style={[
                styles.resultText, 
                pingResult.includes('failed') ? styles.errorText : styles.successText
              ]}>
                {pingResult}
              </Text>
            )}
          </View>
          
          {/* Quick Data Loading Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Data Load</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.buttonSmall} 
                onPress={() => handleLoadData('orders')}
              >
                <Text style={styles.buttonText}>Load Orders</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.buttonSmall} 
                onPress={() => handleLoadData('work-orders')}
              >
                <Text style={styles.buttonText}>Load Work Orders</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.buttonSmall} 
                onPress={() => handleLoadData('machines')}
              >
                <Text style={styles.buttonText}>Load Machines</Text>
              </TouchableOpacity>
            </View>
            
            {(workOrdersError || ordersError || machinesError) && (
              <View style={styles.errorContainer}>
                {workOrdersError && <Text style={styles.errorText}>{workOrdersError}</Text>}
                {ordersError && <Text style={styles.errorText}>{ordersError}</Text>}
                {machinesError && <Text style={styles.errorText}>{machinesError}</Text>}
              </View>
            )}
          </View>
          
          {/* Standard API Tests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Request</Text>
            
            <Text style={styles.label}>Endpoint:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={endpoint}
                onValueChange={(itemValue) => {
                  setEndpoint(itemValue);
                  if (itemValue === '/custom') {
                    setCustomEndpoint('');
                  }
                }}
                style={styles.picker}
              >
                {endpoints.map((ep) => (
                  <Picker.Item key={ep} label={ep} value={ep} />
                ))}
              </Picker>
            </View>
            
            {endpoint === '/custom' && (
              <>
                <Text style={styles.label}>Custom Endpoint:</Text>
                <TextInput
                  style={styles.input}
                  value={customEndpoint}
                  onChangeText={setCustomEndpoint}
                  placeholder="/your-endpoint"
                />
              </>
            )}
            
            <Text style={styles.label}>Method:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={method}
                onValueChange={(itemValue) => setMethod(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="GET" value="GET" />
                <Picker.Item label="POST" value="POST" />
                <Picker.Item label="PUT" value="PUT" />
                <Picker.Item label="DELETE" value="DELETE" />
              </Picker>
            </View>
            
            {(method === 'POST' || method === 'PUT') && (
              <>
                <Text style={styles.label}>Request Body (JSON):</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={requestBody}
                  onChangeText={setRequestBody}
                  placeholder='{"key": "value"}'
                  multiline
                  numberOfLines={4}
                />
              </>
            )}
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={makeApiRequest}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send Request'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Response Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Response</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <>
                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
                
                {statusCode !== null && (
                  <Text style={styles.responseInfo}>
                    Status: <Text style={statusCode >= 200 && statusCode < 300 ? styles.successText : styles.errorText}>
                      {statusCode}
                    </Text>
                  </Text>
                )}
                
                {responseTime !== null && (
                  <Text style={styles.responseInfo}>
                    Response Time: {responseTime}ms
                  </Text>
                )}
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Raw Response:</Text>
                  <ScrollView style={styles.responseContainer}>
                    <Text style={styles.responseText}>
                      {responseText || 'No response data'}
                    </Text>
                  </ScrollView>
                </View>
                
                {responseData && (
                  <>
                    <Text style={styles.label}>Parsed JSON Response:</Text>
                    <ScrollView style={styles.responseContainer}>
                      <Text>
                        {JSON.stringify(responseData, null, 2)}
                      </Text>
                    </ScrollView>
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonSmall: {
    backgroundColor: '#007bff',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  responseContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#f9f9f9',
    maxHeight: 200,
  },
  resultText: {
    marginVertical: 8,
    fontSize: 14,
  },
  errorText: {
    color: '#d9534f',
  },
  errorContainer: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#fff9f9',
    borderRadius: 4,
    borderColor: '#ffdddd',
    borderWidth: 1,
  },
  successText: {
    color: '#5cb85c',
  },
  responseInfo: {
    fontSize: 14,
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
  },
});

export default ApiTestScreen; 