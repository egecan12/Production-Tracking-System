import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { employeesApi } from '../api/apiService';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  AddEditEmployee: {
    employeeId?: string;
    onEmployeeAdded?: () => void;
  };
};

type AddEditEmployeeRouteProp = RouteProp<RootStackParamList, 'AddEditEmployee'>;

const AddEditEmployeeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<AddEditEmployeeRouteProp>();
  const { employeeId, onEmployeeAdded } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: true,
  });

  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeesApi.getById(employeeId!);
      if (response && response.success && response.data && response.data.length > 0) {
        const employeeData = response.data[0];
        setEmployee({
          name: employeeData.name || '',
          email: employeeData.email || '',
          phone: employeeData.phone || '',
          is_active: employeeData.is_active !== false,
        });
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      Alert.alert('Error', 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!employee.name || !employee.email) {
      Alert.alert('Error', 'Name and email are required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (employeeId) {
        // Update existing employee
        const response = await employeesApi.update(employeeId, employee);
        if (response && response.success) {
          Alert.alert('Success', 'Employee updated successfully');
          onEmployeeAdded?.();
          navigation.goBack();
        } else {
          throw new Error('Failed to update employee');
        }
      } else {
        // Create new employee
        const response = await employeesApi.create(employee);
        if (response && response.success) {
          Alert.alert('Success', 'Employee added successfully');
          onEmployeeAdded?.();
          navigation.goBack();
        } else {
          throw new Error('Failed to add employee');
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      Alert.alert('Error', 'An error occurred while saving the employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loaderText}>Loading employee data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {employeeId ? 'Edit Employee' : 'Add New Employee'}
        </Text>
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={employee.name}
            onChangeText={(text) => setEmployee({ ...employee, name: text })}
            placeholder="Enter employee name"
            placeholderTextColor="#6B7280"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={employee.email}
            onChangeText={(text) => setEmployee({ ...employee, email: text })}
            placeholder="example@company.com"
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={employee.phone}
            onChangeText={(text) => setEmployee({ ...employee, phone: text })}
            placeholder="Optional"
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                employee.is_active && styles.checkboxActive,
              ]}
              onPress={() =>
                setEmployee({ ...employee, is_active: !employee.is_active })
              }
            >
              {employee.is_active && (
                <Icon name="check" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              {employee.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <Text style={styles.checkboxDescription}>
            Inactive employees will not appear in lists and cannot be assigned to work.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {employeeId ? 'Update Employee' : 'Add Employee'}
            </Text>
          )}
        </TouchableOpacity>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#3B82F6',
  },
  checkboxLabel: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  checkboxDescription: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 32,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#D1D5DB',
    marginTop: 12,
  },
});

export default AddEditEmployeeScreen; 