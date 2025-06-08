import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { customersApi } from '../api/apiService';
import { hasModuleAccess } from '../lib/authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Customer type definition
interface Customer {
  id?: string;
  name: string;
  company_name: string;
  contact_email: string;
  phone_number: string;
  is_active: boolean;
}

// Navigation type
type RootStackParamList = {
  AddEditCustomer: { customerId?: string };
  Customers: undefined;
};

type AddEditCustomerScreenRouteProp = RouteProp<RootStackParamList, 'AddEditCustomer'>;
type AddEditCustomerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddEditCustomer'>;

const AddEditCustomerScreen = () => {
  const navigation = useNavigation<AddEditCustomerScreenNavigationProp>();
  const route = useRoute<AddEditCustomerScreenRouteProp>();
  const { customerId } = route.params || {};
  
  const isEditing = !!customerId;
  
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    company_name: '',
    contact_email: '',
    phone_number: '',
    is_active: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Check permissions and load customer data
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Check permissions
        const userRole = await AsyncStorage.getItem('userRole');
        const permission = hasModuleAccess('customers', userRole);
        
        setHasPermission(permission);
        
        if (!permission) {
          Alert.alert('Access Denied', 'You do not have permission to perform this action.');
          navigation.goBack();
          return;
        }

        // Load customer data if editing
        if (isEditing && customerId) {
          setLoading(true);
          try {
            const response = await customersApi.getById(customerId);
            if (response.data && response.data.length > 0) {
              const customerData = response.data[0];
              setCustomer({
                name: customerData.name || '',
                company_name: customerData.company_name || '',
                contact_email: customerData.contact_email || '',
                phone_number: customerData.phone_number || '',
                is_active: customerData.is_active !== false,
              });
            }
          } catch (error) {
            console.error('Error loading customer:', error);
            Alert.alert('Error', 'Failed to load customer data.');
            navigation.goBack();
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing screen:', error);
        Alert.alert('Error', 'Failed to initialize screen.');
        navigation.goBack();
      }
    };

    initializeScreen();
  }, [isEditing, customerId, navigation]);

  const handleInputChange = (field: keyof Customer, value: string | boolean) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    // Validation
    if (!customer.name.trim()) {
      Alert.alert('Validation Error', 'Customer name is required.');
      return;
    }

    if (!customer.company_name.trim()) {
      Alert.alert('Validation Error', 'Company name is required.');
      return;
    }

    if (!customer.contact_email.trim()) {
      Alert.alert('Validation Error', 'Email is required.');
      return;
    }

    if (!customer.phone_number.trim()) {
      Alert.alert('Validation Error', 'Phone number is required.');
      return;
    }

    if (!validateEmail(customer.contact_email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      let response;
      
      const customerData = {
        ...customer,
      };
      
      if (isEditing && customerId) {
        // Update existing customer
        response = await customersApi.update(customerId, customerData);
      } else {
        // Create new customer
        response = await customersApi.create(customerData);
      }

      if (response.success !== false) {
        Alert.alert(
          'Success',
          `Customer ${isEditing ? 'updated' : 'created'} successfully!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Customers'),
            },
          ]
        );
      } else {
        throw new Error(response.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} customer.`);
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Access Denied</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading customer data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Edit Customer' : 'Add New Customer'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Customer Name *</Text>
            <TextInput
              style={styles.input}
              value={customer.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter customer name"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={styles.input}
              value={customer.company_name}
              onChangeText={(value) => handleInputChange('company_name', value)}
              placeholder="Enter company name"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={customer.contact_email}
              onChangeText={(value) => handleInputChange('contact_email', value)}
              placeholder="Enter email address"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={customer.phone_number}
              onChangeText={(value) => handleInputChange('phone_number', value)}
              placeholder="Enter phone number"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleInputChange('is_active', !customer.is_active)}
            >
              <View style={[styles.checkbox, customer.is_active && styles.checkboxChecked]}>
                {customer.is_active && (
                  <Icon name="check" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                {customer.is_active ? 'Active' : 'Inactive'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.helpText}>
              Inactive customers are not visible in lists
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Customer' : 'Add Customer'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
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
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#374151',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#fff',
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddEditCustomerScreen; 