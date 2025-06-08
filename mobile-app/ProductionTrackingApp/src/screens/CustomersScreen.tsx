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
        (customer.city && customer.city.toLowerCase().includes(searchLower))
      );
    }
    
    // Status filter
    if (status) {
      const isActive = status === 'Active';
      result = result.filter(customer => customer.is_active === isActive);
    }
    
    setFilteredCustomers(result);
  };

  // When search/filter changes
  useEffect(() => {
    applyFilters(customers, searchText, statusFilter);
  }, [searchText, statusFilter, customers]);

  // Date format
  const formatDate = (dateStr: string) => {
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
    Alert.alert(
      customer.company_name,
      `Contact: ${customer.name}\nEmail: ${customer.contact_email}\nPhone: ${customer.phone_number}\n\nAddress: ${customer.address || 'Not specified'}\n${customer.city || ''}, ${customer.country || ''}\n\nTotal Orders: ${customer.total_orders || 0}\nLast Order: ${customer.last_order_date || 'None'}\nStatus: ${customer.is_active ? 'Active' : 'Inactive'}`
    );
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
          onPress: () => {
            // Mock delete operation
            const updatedCustomers = customers.filter(customer => customer.id !== id);
            setCustomers(updatedCustomers);
            Alert.alert('Success', 'Customer deleted successfully.');
          }
        }
      ]
    );
  };

  // Change status filter
  const changeStatusFilter = (status: string) => {
    setStatusFilter(current => current === status ? null : status);
  };

  // Customer item render function
  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      style={styles.customerItem}
      onPress={() => handleViewCustomer(item)}
    >
      <View style={styles.customerHeader}>
        <View style={styles.customerNameContainer}>
          {item.profile_image ? (
            <Image 
              source={{ uri: item.profile_image }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileInitials}>
              <Text style={styles.initialsText}>
                {(item.company_name || '').charAt(0)}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.companyName}>{item.company_name}</Text>
            <Text style={styles.contactName}>{item.name}</Text>
          </View>
        </View>
        <StatusBadge isActive={item.is_active} />
      </View>
      
      <View style={styles.customerDetails}>
        {item.contact_email && (
          <View style={styles.detailItem}>
            <Icon name="email" size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.contact_email}</Text>
          </View>
        )}
        
        {item.phone_number && (
          <View style={styles.detailItem}>
            <Icon name="phone" size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.phone_number}</Text>
          </View>
        )}
        
        {item.city && (
          <View style={styles.detailItem}>
            <Icon name="location-on" size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.city}, {item.country}</Text>
          </View>
        )}
        
        {item.total_orders !== undefined && (
          <View style={styles.detailItem}>
            <Icon name="shopping-bag" size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>
              {item.total_orders} Orders | Last order: {item.last_order_date || 'None'}
            </Text>
          </View>
        )}
      </View>
      
      {canAddEdit && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditCustomer(item)}
          >
            <Icon name="edit" size={18} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteCustomer(item.id)}
          >
            <Icon name="delete" size={18} color="#F87171" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  // Statü listesi
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Pending', label: 'Pending' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCustomer}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
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
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
            { value: 'Pending', label: 'Pending' },
          ]}
          selectedValue={statusFilter}
          onSelect={changeStatusFilter}
        />
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <>
          {filteredCustomers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="business" size={48} color="#6B7280" />
              <Text style={styles.emptyText}>
                {searchText || statusFilter
                  ? 'No customers found matching your criteria.' 
                  : 'No customers yet.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCustomer}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadCustomers();
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
    flexWrap: 'wrap',
    flex: 1,
  },
  pill: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
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
  customerItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  profileInitials: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactName: {
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
  customerDetails: {
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
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
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

export default CustomersScreen; 