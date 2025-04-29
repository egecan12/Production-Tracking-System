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
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { Employee } from '../types';
import { getEmployees, deleteEmployee } from '../services/apiService';
import { StatusBadge } from '../components/StatusBadge';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: StackNavigationProp<MainStackParamList, 'Employees'>;
};

const EmployeesScreen: React.FC<Props> = ({ navigation }) => {
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
        employee.position.toLowerCase().includes(searchLower) ||
        (employee.email && employee.email.toLowerCase().includes(searchLower))
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

  // Status display
  const StatusBadge = ({ status }: { status: string }) => {
    let color;
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'active':
      case 'aktif':
        color = '#34D399'; // Green
        break;
      case 'on leave':
      case 'izinde':
        color = '#FCD34D'; // Yellow
        break;
      case 'suspended':
      case 'askıda':
        color = '#F87171'; // Red
        break;
      default:
        color = '#9CA3AF'; // Gray
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{status || 'Unknown'}</Text>
      </View>
    );
  };

  // Add new employee
  const handleAddEmployee = () => {
    navigation.navigate('AddEditEmployee', {
      onEmployeeAdded: () => {
        loadEmployees();
      }
    });
  };

  // View employee details
  const handleViewEmployee = (employee: Employee) => {
    navigation.navigate('EmployeeDetails', {
      employeeId: employee.id,
      onEmployeeUpdated: () => {
        loadEmployees();
      }
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

  // Change department filter
  const changeDepartmentFilter = (department: string | null) => {
    setDepartmentFilter(current => current === department ? null : department);
  };

  // Get unique departments
  const uniqueDepartments = Array.from(new Set(employees.map(emp => emp.department)));

  // Employee item render function
  const renderEmployee = ({ item }: { item: Employee }) => {
    console.log('Rendering employee:', item); // Debug log for rendering
    return (
      <TouchableOpacity 
        style={styles.employeeItem}
        onPress={() => handleViewEmployee(item)}
      >
        <View style={styles.employeeHeader}>
          <View style={styles.employeeNameContainer}>
            {item.profile_image ? (
              <Image 
                source={{ uri: item.profile_image }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileInitials}>
                <Text style={styles.initialsText}>
                  {(item.name || '').charAt(0)}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.employeeName}>
                {item.name || 'No Name'}
              </Text>
              <Text style={styles.position}>{item.position || 'No Position'}</Text>
            </View>
          </View>
          <StatusBadge status={item.status} />
        </View>
        
        <View style={styles.employeeDetails}>
          <View style={styles.detailItem}>
            <Icon name="business" size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.department}</Text>
          </View>
          
          {item.email && (
            <View style={styles.detailItem}>
              <Icon name="email" size={14} color="#9CA3AF" />
              <Text style={styles.detailText}>{item.email}</Text>
            </View>
          )}
          
          {item.phone && (
            <View style={styles.detailItem}>
              <Icon name="phone" size={14} color="#9CA3AF" />
              <Text style={styles.detailText}>{item.phone}</Text>
            </View>
          )}
          
          {item.hire_date && (
            <View style={styles.detailItem}>
              <Icon name="event" size={14} color="#9CA3AF" />
              <Text style={styles.detailText}>Hire Date: {item.hire_date}</Text>
            </View>
          )}
        </View>
        
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteEmployee(item.id)}
          >
            <Icon name="delete" size={18} color="#F87171" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employee Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddEmployee}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
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
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Department:</Text>
        <ScrollablePills
          options={uniqueDepartments.map(dept => ({ value: dept, label: dept }))}
          selectedValue={departmentFilter}
          onSelect={changeDepartmentFilter}
        />
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <>
          {filteredEmployees.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="people" size={48} color="#6B7280" />
              <Text style={styles.emptyText}>
                {searchText || departmentFilter
                  ? 'No employees found matching your search criteria.' 
                  : 'No employees found.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredEmployees}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderEmployee}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadEmployees();
                  }}
                  colors={['#3B82F6']}
                  tintColor="#3B82F6"
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
    backgroundColor: '#121212',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333333',
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
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333333',
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
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeeName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  position: {
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
  employeeDetails: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 6,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default EmployeesScreen; 