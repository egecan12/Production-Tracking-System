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

// Çalışan tipi tanımı
interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  email?: string;
  phone?: string;
  hire_date?: string;
  profile_image?: string;
  status: string;
}

const EmployeesScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [canAddEdit, setCanAddEdit] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  // Kullanıcı yetkilerini kontrol et
  useEffect(() => {
    const checkPermissions = async () => {
      const hasAccess = hasModuleAccess('employees', 'hr') || 
                        hasModuleAccess('employees', 'admin') || 
                        hasModuleAccess('employees', 'manager');
      setCanAddEdit(hasAccess);
    };
    
    checkPermissions();
  }, []);

  // Çalışanları yükle
  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      // Use the employees API instead of mock data
      const response = await employeesApi.getAll();
      if (response && response.success && response.data) {
        const data = response.data.map((employee: any) => ({
          ...employee,
          hire_date: formatDate(employee.hire_date)
        }));
        
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

  // İlk yükleme
  useEffect(() => {
    loadEmployees();
  }, []);

  // Filtre fonksiyonu
  const applyFilters = (data: Employee[], search: string, department: string | null) => {
    let result = [...data];
    
    // Metin araması
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(employee => 
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchLower) ||
        employee.position.toLowerCase().includes(searchLower) ||
        (employee.email && employee.email.toLowerCase().includes(searchLower))
      );
    }
    
    // Departman filtresi
    if (department) {
      result = result.filter(employee => employee.department === department);
    }
    
    setFilteredEmployees(result);
  };

  // Arama değiştiğinde
  useEffect(() => {
    applyFilters(employees, searchText, departmentFilter);
  }, [searchText, departmentFilter, employees]);

  // Tarih formatı
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // Durum gösterimi
  const StatusBadge = ({ status }: { status: string }) => {
    let color;
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'active':
      case 'aktif':
        color = '#34D399'; // Yeşil
        break;
      case 'on leave':
      case 'izinde':
        color = '#FCD34D'; // Sarı
        break;
      case 'suspended':
      case 'askıda':
        color = '#F87171'; // Kırmızı
        break;
      default:
        color = '#9CA3AF'; // Gri
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{status || 'Unknown'}</Text>
      </View>
    );
  };

  // Yeni çalışan ekleme
  const handleAddEmployee = () => {
    navigation.navigate('AddEditEmployee', {
      onEmployeeAdded: () => {
        loadEmployees();
      }
    });
  };

  // Çalışan detayını göster
  const handleViewEmployee = (employee: Employee) => {
    navigation.navigate('EmployeeDetails', {
      employeeId: employee.id,
      onEmployeeUpdated: () => {
        loadEmployees();
      }
    });
  };

  // Çalışanı sil
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

  // Departman filtresini değiştir
  const changeDepartmentFilter = (department: string | null) => {
    setDepartmentFilter(current => current === department ? null : department);
  };

  // Benzersiz departmanları alın
  const uniqueDepartments = Array.from(new Set(employees.map(emp => emp.department)));

  // Çalışan öğesi render fonksiyonu
  const renderEmployee = ({ item }: { item: Employee }) => (
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
                {(item.first_name || '').charAt(0)}{(item.last_name || '').charAt(0)}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.employeeName}>{item.first_name} {item.last_name}</Text>
            <Text style={styles.position}>{item.position}</Text>
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
            <Text style={styles.detailText}>İşe Alım: {item.hire_date}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Çalışanlar</Text>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddEmployee}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Çalışan ara..."
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
        <Text style={styles.filterLabel}>Departman:</Text>
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
                  ? 'Arama kriterlerine uygun çalışan bulunamadı.' 
                  : 'Henüz çalışan bulunmuyor.'}
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

// Kaydırılabilir filtreleme pilleri
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