import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { hasModuleAccess } from '../lib/authUtils';
import { employeesApi } from '../api/apiService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';

// Employee type definition
interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  is_active: boolean;
}

const EmployeesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [canAddEdit, setCanAddEdit] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  // Check user permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const hasAccess = hasModuleAccess('employees', 'hr') || 
                        hasModuleAccess('employees', 'admin') || 
                        hasModuleAccess('employees', 'manager');
      setCanAddEdit(hasAccess);
    };
    
    checkPermissions();
  }, []);

  // Load employees
  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      const response = await employeesApi.getAll();
      console.log('API Response:', response); // Debug log
      
      if (response && response.success && response.data) {
        const data = response.data.map((employee: any) => {
          console.log('Employee data:', employee); // Debug log for each employee
          return {
            ...employee,
            hire_date: formatDate(employee.hire_date)
          };
        });
        
        setEmployees(data);
        applyFilters(data, searchText, departmentFilter);
      } else {
        throw new Error('Failed to load employees');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      Alert.alert('Error', 'An error occurred while loading employees.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter function
  const applyFilters = (data: Employee[], search: string, department: string | null) => {
    let result = [...data];
    
    // Text search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(employee => 
        employee.name.toLowerCase().includes(searchLower) ||
        (employee.position && employee.position.toLowerCase().includes(searchLower)) ||
        (employee.email && employee.email.toLowerCase().includes(searchLower)) ||
        (employee.department && employee.department.toLowerCase().includes(searchLower))
      );
    }
    
    // Department filter
    if (department) {
      result = result.filter(employee => employee.department === department);
    }
    
    setFilteredEmployees(result);
  };

  // When search/filter changes
  useEffect(() => {
    applyFilters(employees, searchText, departmentFilter);
  }, [searchText, departmentFilter, employees]);

  // Date format
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // Get unique departments for filter
  const departments = Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)));

  // Change department filter
  const changeDepartmentFilter = (department: string | null) => {
    setDepartmentFilter(department === 'all' ? null : department);
  };

  // Add new employee
  const handleAddEmployee = () => {
    navigation.navigate('AddEditEmployee', {});
  };

  // View employee details
  const handleViewEmployee = (employee: Employee) => {
    navigation.navigate('EmployeeDetail', {
      employeeId: employee.id
    });
  };

  // Delete employee
  const handleDeleteEmployee = (id: string) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this employee?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await employeesApi.delete(id);
              if (response && response.success) {
                loadEmployees();
                Alert.alert('Success', 'Employee has been deleted.');
              } else {
                throw new Error('Failed to delete employee');
              }
            } catch (error) {
              console.error('Error deleting employee:', error);
              Alert.alert('Error', 'An error occurred while deleting the employee.');
            }
          }
        }
      ]
    );
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Employee item render function
  const renderEmployee = ({ item }: { item: Employee }) => (
    <TouchableOpacity 
      style={styles.employeeItem}
      onPress={() => handleViewEmployee(item)}
      activeOpacity={0.7}
    >
      <View style={styles.employeeHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <View style={styles.employeeHeaderText}>
          <Text style={styles.employeeName}>{item.name}</Text>
          {item.position && (
            <Text style={styles.positionText}>{item.position}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#10B981' : '#EF4444' }]}>
          <Text style={styles.statusText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      
      <View style={styles.employeeDetailsSection}>
        {item.email && (
          <View style={styles.detailRow}>
            <Icon name="email" size={16} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        )}
        {item.phone && (
          <View style={styles.detailRow}>
            <Icon name="phone" size={16} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
        )}
        {item.department && (
          <View style={styles.detailRow}>
            <Icon name="business" size={16} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.department}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('AddEditEmployee', { employeeId: item.id })}
            activeOpacity={0.7}
          >
            <Icon name="edit" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteEmployee(item.id)}
            activeOpacity={0.7}
          >
            <Icon name="delete" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employees</Text>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddEmployee}
            activeOpacity={0.8}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Icon name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      
      {departments.length > 0 && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Department:</Text>
          <ScrollablePills
            options={[
              { value: 'all', label: 'All Departments' },
              ...departments.map(dept => ({ value: dept!, label: dept! }))
            ]}
            selectedValue={departmentFilter || 'all'}
            onSelect={changeDepartmentFilter}
          />
        </View>
      )}
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      ) : (
        <>
          {filteredEmployees.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="person" size={64} color="#6B7280" />
              <Text style={styles.emptyTitle}>
                {searchText || departmentFilter 
                  ? 'No employees found' 
                  : 'No employees registered yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchText || departmentFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first employee to get started'}
              </Text>
              {!searchText && !departmentFilter && canAddEdit && (
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={handleAddEmployee}
                  activeOpacity={0.8}
                >
                  <Icon name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyActionText}>Add First Employee</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredEmployees}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderEmployee}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadEmployees();
                  }}
                  colors={['#60A5FA']}
                  tintColor="#60A5FA"
                />
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

// Scrollable filtering pills
const ScrollablePills = ({ 
  options, 
  selectedValue, 
  onSelect 
}: { 
  options: Array<{value: string, label: string}>,
  selectedValue: string | null,
  onSelect: (value: string) => void
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pillsContainer}
    >
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.pill,
            selectedValue === option.value ? styles.activePill : null
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text 
            style={[
              styles.pillText,
              selectedValue === option.value ? styles.activePillText : null
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginRight: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  pill: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activePill: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pillText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  activePillText: {
    color: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  employeeItem: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeeHeaderText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  positionText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#121212',
    fontSize: 12,
    fontWeight: '600',
  },
  employeeDetailsSection: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#F87171',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyActionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default EmployeesScreen; 