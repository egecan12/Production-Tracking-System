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
import { machinesApi } from '../api/apiService';

// Make sure to update this to your correct API address
const API_BASE_URL = 'http://172.20.10.2:3000/api';

// Define the missing interfaces
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
  const [endpoint, setEndpoint] = useState('/machines');
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
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machinesError, setMachinesError] = useState<string | null>(null);

  const endpoints = [
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

  const handleLoadData = (type: string) => {
    switch (type) {
      case 'machines':
        loadMachines();
        break;
      default:
        console.log('Unknown data type:', type);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>API Test Screen</Text>
          
          {/* API URL Input */}
          <View style={styles.section}>
            <Text style={styles.label}>API Base URL:</Text>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="Enter API base URL"
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.button} onPress={testApiConnection}>
              <Text style={styles.buttonText}>Test Connection</Text>
            </TouchableOpacity>
            {pingResult && (
              <Text style={[styles.result, pingResult.includes('successful') ? styles.success : styles.error]}>
                {pingResult}
              </Text>
            )}
          </View>

          {/* Endpoint Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Endpoint:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={endpoint}
                onValueChange={setEndpoint}
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                {endpoints.map((ep) => (
                  <Picker.Item key={ep} label={ep} value={ep} color="#fff" />
                ))}
              </Picker>
            </View>
            
            {endpoint === '/custom' && (
              <TextInput
                style={styles.input}
                value={customEndpoint}
                onChangeText={setCustomEndpoint}
                placeholder="Enter custom endpoint (e.g., /data)"
                placeholderTextColor="#666"
              />
            )}
          </View>

          {/* HTTP Method Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>HTTP Method:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={method}
                onValueChange={setMethod}
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="GET" value="GET" color="#fff" />
                <Picker.Item label="POST" value="POST" color="#fff" />
                <Picker.Item label="PUT" value="PUT" color="#fff" />
                <Picker.Item label="DELETE" value="DELETE" color="#fff" />
              </Picker>
            </View>
          </View>

          {/* Request Body (for POST/PUT) */}
          {(method === 'POST' || method === 'PUT') && (
            <View style={styles.section}>
              <Text style={styles.label}>Request Body (JSON):</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={requestBody}
                onChangeText={setRequestBody}
                placeholder='{"key": "value"}'
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={makeApiRequest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Make Request</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleLoadData('machines')}
            >
              <Text style={styles.buttonText}>Load Machines</Text>
            </TouchableOpacity>
          </View>

          {/* Error Display */}
          {(error || machinesError) && (
            <View style={styles.section}>
              {error && <Text style={styles.errorText}>{error}</Text>}
              {machinesError && <Text style={styles.errorText}>{machinesError}</Text>}
            </View>
          )}

          {/* Response Info */}
          {(statusCode !== null || responseTime !== null) && (
            <View style={styles.section}>
              <Text style={styles.label}>Response Info:</Text>
              {statusCode !== null && (
                <Text style={styles.infoText}>Status Code: {statusCode}</Text>
              )}
              {responseTime !== null && (
                <Text style={styles.infoText}>Response Time: {responseTime}ms</Text>
              )}
            </View>
          )}

          {/* Response Display */}
          {responseText && (
            <View style={styles.section}>
              <Text style={styles.label}>Response:</Text>
              <ScrollView style={styles.responseContainer} nestedScrollEnabled>
                <Text style={styles.responseText}>{responseText}</Text>
              </ScrollView>
            </View>
          )}

          {/* Data Display */}
          {machines.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Machines ({machines.length}):</Text>
              {machines.map((machine, index) => (
                <View key={index} style={styles.dataItem}>
                  <Text style={styles.dataText}>
                    ID: {machine.id} - Name: {machine.name} - Status: {machine.status}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  picker: {
    color: '#fff',
    backgroundColor: '#1F2937',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    fontSize: 14,
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
  },
  success: {
    color: '#10B981',
    backgroundColor: '#064E3B',
  },
  error: {
    color: '#EF4444',
    backgroundColor: '#7F1D1D',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 8,
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  responseContainer: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  responseText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  dataItem: {
    backgroundColor: '#1F2937',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  dataText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
});

export default ApiTestScreen;