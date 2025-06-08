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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { hasModuleAccess } from '../lib/authUtils';
import { MainStackParamList } from '../navigation/types';
import { customersApi } from '../api/apiService';

// Customer type definition
interface Customer {
  id: string;
  name: string;
  company_name: string;
  contact_email: string;
  phone_number: string;
  address?: string;
  city?: string;
  country?: string;
  is_active: boolean;
  total_orders?: number;
  last_order_date?: string;
  logo_url?: string;
  profile_image?: string;
}

const CustomersScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [canAddEdit, setCanAddEdit] = useState(false);

  // Mock data
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'Ahmet Yıldız',
      company_name: 'ABC Metal Ltd.',
      contact_email: 'ahmet@abcmetal.com',
      phone_number: '555-123-4567',
      address: 'Organize Sanayi Bölgesi No:45',
      city: 'İstanbul',
      country: 'Türkiye',
      is_active: true,
      total_orders: 12,
      last_order_date: '2023-11-15'
    },
    {
      id: '2',
      name: 'Ayşe Kaya',
      company_name: 'Demir Sanayi A.Ş.',
      contact_email: 'ayse@demirsanayi.com',
      phone_number: '555-234-5678',
      address: 'İkitelli Sanayi Sitesi B Blok No:8',
      city: 'İstanbul',
      country: 'Türkiye',
      is_active: true,
      total_orders: 8,
      last_order_date: '2023-12-05'
    },
    {
      id: '3',
      name: 'Mustafa Demir',
      company_name: 'Yıldız Çelik',
      contact_email: 'mustafa@yildizcelik.com',
      phone_number: '555-345-6789',
      address: 'Ankara Caddesi No:25',
      city: 'Ankara',
      country: 'Türkiye',
      is_active: false,
      total_orders: 3,
      last_order_date: '2023-06-22'
    },
    {
      id: '4',
      name: 'Stefan Müller',
      company_name: 'Global Metals GmbH',
      contact_email: 'stefan@globalmetals.de',
      phone_number: '555-456-7890',
      address: 'Industriestrasse 45',
      city: 'Berlin',
      country: 'Almanya',
      is_active: true,
      total_orders: 5,
      last_order_date: '2023-10-30'
    },
    {
      id: '5',
      name: 'Zeynep Kılıç',
      company_name: 'İnci Metal Sanayi',
      contact_email: 'zeynep@incimetal.com',
      phone_number: '555-567-8901',
      address: 'Atatürk Bulvarı No:78',
      city: 'İzmir',
      country: 'Türkiye',
      is_active: true,
      total_orders: 7,
      last_order_date: '2023-11-28'
    }
  ];

  // Kullanıcı yetkilerini kontrol et
  useEffect(() => {
    const checkPermissions = async () => {
      const hasAccess = hasModuleAccess('customers', 'sales') || 
                        hasModuleAccess('customers', 'admin') || 
                        hasModuleAccess('customers', 'manager');
      setCanAddEdit(hasAccess);
    };
    
    checkPermissions();
  }, []);

  // Load customers
  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      // Get customers from API
      const response = await customersApi.getAll();
      let data = [];
      
      if (response && response.data && Array.isArray(response.data)) {
        data = response.data.map((customer: any) => ({
          id: customer.id,
          name: customer.name,
          company_name: customer.company_name,
          contact_email: customer.contact_email,
          phone_number: customer.phone_number,
          address: customer.address || '',
          city: customer.city || '',
          country: customer.country || '',
          is_active: customer.is_active !== false,
          total_orders: customer.total_orders || 0,
          last_order_date: customer.last_order_date ? formatDate(customer.last_order_date) : '',
        }));
      } else {
        // Fallback to mock data if API fails
        console.log('Using mock data as fallback');
        data = mockCustomers.map(customer => ({
          ...customer,
          last_order_date: customer.last_order_date ? formatDate(customer.last_order_date) : '',
        }));
      }
      
      setCustomers(data);
      applyFilters(data, searchText, statusFilter);
    } catch (error) {
      console.error('Error loading customers:', error);
      
      // Use mock data as fallback
      console.log('Using mock data due to error');
      const data = mockCustomers.map(customer => ({
        ...customer,
        last_order_date: customer.last_order_date ? formatDate(customer.last_order_date) : '',
      }));
      
      setCustomers(data);
      applyFilters(data, searchText, statusFilter);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter function
  const applyFilters = (data: Customer[], search: string, status: string | null) => {
    let result = [...data];
    
    // Text search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(customer => 
        customer.company_name.toLowerCase().includes(searchLower) ||
        customer.name.toLowerCase().includes(searchLower) ||
        customer.contact_email.toLowerCase().includes(searchLower) ||
        customer.phone_number.toLowerCase().includes(searchLower) ||
        (customer.city && customer.city.toLowerCase().includes(searchLower))
      );
    }
    
    // Status filter
    if (status) {
      const isActiveFilter = status === 'active';
      result = result.filter(customer => customer.is_active === isActiveFilter);
    }
    
    setFilteredCustomers(result);
  };

  // When search/filter changes
  useEffect(() => {
    applyFilters(customers, searchText, statusFilter);
  }, [searchText, statusFilter, customers]);

  // Date format
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // Status display
  const StatusBadge = ({ isActive }: { isActive: boolean }) => {
    const color = isActive ? '#34D399' : '#6B7280'; // Green or Gray
    const text = isActive ? 'Active' : 'Inactive';
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{text}</Text>
      </View>
    );
  };

  // Add new customer
  const handleAddCustomer = () => {
    navigation.navigate('AddEditCustomer', {});
  };

  // Show customer details
  const handleViewCustomer = (customer: Customer) => {
    navigation.navigate('CustomerDetail', {
      customerId: customer.id
    });
  };

  // Edit customer
  const handleEditCustomer = (customer: Customer) => {
    navigation.navigate('AddEditCustomer', { customerId: customer.id });
  };

  // Delete customer
  const handleDeleteCustomer = (id: string) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this customer?',
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
              const response = await customersApi.delete(id);
              if (response && response.success) {
                loadCustomers();
                Alert.alert('Success', 'Customer has been deleted.');
              } else {
                throw new Error('Failed to delete customer');
              }
            } catch (error) {
              console.error('Error deleting customer:', error);
              Alert.alert('Error', 'An error occurred while deleting the customer.');
            }
          }
        }
      ]
    );
  };

  // Change status filter
  const changeStatusFilter = (status: string | null) => {
    setStatusFilter(status === 'all' ? null : status);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Format phone number
  const formatPhoneNumber = (phoneNumber: string): string => {
    const numbers = phoneNumber.replace(/\D/g, "");
    
    if (numbers.length === 10) {
      return `0(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
    } else if (numbers.length === 11 && numbers.startsWith("0")) {
      return `0(${numbers.slice(1, 4)}) ${numbers.slice(4, 7)} ${numbers.slice(7, 9)} ${numbers.slice(9, 11)}`;
    }
    
    return phoneNumber;
  };

  // Customer item render function
  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      style={styles.customerItem}
      onPress={() => handleViewCustomer(item)}
      activeOpacity={0.7}
    >
      <View style={styles.customerHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.company_name)}</Text>
        </View>
        <View style={styles.customerHeaderText}>
          <Text style={styles.companyName}>{item.company_name}</Text>
          <Text style={styles.customerName}>{item.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#10B981' : '#EF4444' }]}>
          <Text style={styles.statusText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      
      <View style={styles.customerDetailsSection}>
        <View style={styles.detailRow}>
          <Icon name="email" size={16} color="#9CA3AF" />
          <Text style={styles.detailText}>{item.contact_email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="phone" size={16} color="#9CA3AF" />
          <Text style={styles.detailText}>{formatPhoneNumber(item.phone_number)}</Text>
        </View>
        {item.city && (
          <View style={styles.detailRow}>
            <Icon name="location-on" size={16} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.city}, {item.country}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditCustomer(item)}
            activeOpacity={0.7}
          >
            <Icon name="edit" size={16} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteCustomer(item.id)}
            activeOpacity={0.7}
          >
            <Icon name="delete" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  // Statü listesi
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCustomer}
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
          placeholder="Search customers..."
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
        <Text style={styles.filterLabel}>Status:</Text>
        <ScrollablePills
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          selectedValue={statusFilter || 'all'}
          onSelect={changeStatusFilter}
        />
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : (
        <>
          {filteredCustomers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="business" size={64} color="#6B7280" />
              <Text style={styles.emptyTitle}>
                {searchText || statusFilter 
                  ? 'No customers found' 
                  : 'No customers registered yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchText || statusFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first customer to get started'}
              </Text>
              {!searchText && !statusFilter && canAddEdit && (
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={handleAddCustomer}
                  activeOpacity={0.8}
                >
                  <Icon name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyActionText}>Add First Customer</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCustomer}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadCustomers();
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
    <View style={styles.pillsContainer}>
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
    </View>
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
    flexWrap: 'wrap',
    flex: 1,
  },
  pill: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
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
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  customerItem: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerHeaderText: {
    flex: 1,
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerName: {
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
  customerDetailsSection: {
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
    gap: 8,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  emptyActionButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CustomersScreen; 