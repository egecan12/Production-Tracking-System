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

// Müşteri tipi tanımı
interface Customer {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  status: string;
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

  // Mock veri
  const mockCustomers: Customer[] = [
    {
      id: '1',
      company_name: 'ABC Metal Ltd.',
      contact_name: 'Ahmet Yıldız',
      contact_email: 'ahmet@abcmetal.com',
      contact_phone: '555-123-4567',
      address: 'Organize Sanayi Bölgesi No:45',
      city: 'İstanbul',
      country: 'Türkiye',
      status: 'Aktif',
      total_orders: 12,
      last_order_date: '2023-11-15'
    },
    {
      id: '2',
      company_name: 'Demir Sanayi A.Ş.',
      contact_name: 'Ayşe Kaya',
      contact_email: 'ayse@demirsanayi.com',
      contact_phone: '555-234-5678',
      address: 'İkitelli Sanayi Sitesi B Blok No:8',
      city: 'İstanbul',
      country: 'Türkiye',
      status: 'Aktif',
      total_orders: 8,
      last_order_date: '2023-12-05'
    },
    {
      id: '3',
      company_name: 'Yıldız Çelik',
      contact_name: 'Mustafa Demir',
      contact_email: 'mustafa@yildizcelik.com',
      contact_phone: '555-345-6789',
      address: 'Ankara Caddesi No:25',
      city: 'Ankara',
      country: 'Türkiye',
      status: 'Pasif',
      total_orders: 3,
      last_order_date: '2023-06-22'
    },
    {
      id: '4',
      company_name: 'Global Metals GmbH',
      contact_name: 'Stefan Müller',
      contact_email: 'stefan@globalmetals.de',
      contact_phone: '555-456-7890',
      address: 'Industriestrasse 45',
      city: 'Berlin',
      country: 'Almanya',
      status: 'Aktif',
      total_orders: 5,
      last_order_date: '2023-10-30'
    },
    {
      id: '5',
      company_name: 'İnci Metal Sanayi',
      contact_name: 'Zeynep Kılıç',
      contact_email: 'zeynep@incimetal.com',
      contact_phone: '555-567-8901',
      address: 'Atatürk Bulvarı No:78',
      city: 'İzmir',
      country: 'Türkiye',
      status: 'Aktif',
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

  // Müşterileri yükle
  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      // Gerçek API entegrasyonu buraya eklenecek
      // Şimdilik mock veri kullanıyoruz
      const data = mockCustomers.map(customer => ({
        ...customer,
        last_order_date: customer.last_order_date ? formatDate(customer.last_order_date) : '',
      }));
      
      setCustomers(data);
      applyFilters(data, searchText, statusFilter);
    } catch (error) {
      console.error('Error loading customers:', error);
      Alert.alert('Error', 'An error occurred while loading customers.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadCustomers();
  }, []);

  // Filtre fonksiyonu
  const applyFilters = (data: Customer[], search: string, status: string | null) => {
    let result = [...data];
    
    // Metin araması
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(customer => 
        customer.company_name.toLowerCase().includes(searchLower) ||
        customer.contact_name.toLowerCase().includes(searchLower) ||
        (customer.contact_email && customer.contact_email.toLowerCase().includes(searchLower)) ||
        (customer.city && customer.city.toLowerCase().includes(searchLower))
      );
    }
    
    // Durum filtresi
    if (status) {
      result = result.filter(customer => customer.status === status);
    }
    
    setFilteredCustomers(result);
  };

  // Arama/filtre değiştiğinde
  useEffect(() => {
    applyFilters(customers, searchText, statusFilter);
  }, [searchText, statusFilter, customers]);

  // Tarih formatı
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // Durum gösterimi
  const StatusBadge = ({ status }: { status: string }) => {
    let color;
    switch (status.toLowerCase()) {
      case 'active':
      case 'aktif':
        color = '#34D399'; // Yeşil
        break;
      case 'inactive':
      case 'pasif':
        color = '#F87171'; // Kırmızı
        break;
      case 'pending':
      case 'beklemede':
        color = '#FCD34D'; // Sarı
        break;
      default:
        color = '#9CA3AF'; // Gri
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  // Yeni müşteri ekleme
  const handleAddCustomer = () => {
    navigation.navigate('AddEditCustomer', {});
  };

  // Müşteri detayını göster
  const handleViewCustomer = (customer: Customer) => {
    Alert.alert(
      customer.company_name,
      `İletişim: ${customer.contact_name}\nE-posta: ${customer.contact_email || 'Belirtilmemiş'}\nTelefon: ${customer.contact_phone || 'Belirtilmemiş'}\n\nAdres: ${customer.address || 'Belirtilmemiş'}\n${customer.city || ''}, ${customer.country || ''}\n\nToplam Sipariş: ${customer.total_orders || 0}\nSon Sipariş: ${customer.last_order_date || 'Yok'}\nDurum: ${customer.status}`
    );
  };

  // Müşteriyi düzenle
  const handleEditCustomer = (customer: Customer) => {
    navigation.navigate('AddEditCustomer', { customerId: customer.id });
  };

  // Müşteriyi sil
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
            // Mock silme işlemi
            const updatedCustomers = customers.filter(customer => customer.id !== id);
            setCustomers(updatedCustomers);
            Alert.alert('Success', 'Customer deleted successfully.');
          }
        }
      ]
    );
  };

  // Durum filtresini değiştir
  const changeStatusFilter = (status: string) => {
    setStatusFilter(current => current === status ? null : status);
  };

  // Müşteri öğesi render fonksiyonu
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
            <Text style={styles.contactName}>{item.contact_name}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.customerDetails}>
        {item.contact_email && (
          <View style={styles.detailItem}>
            <Icon name="email" size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.contact_email}</Text>
          </View>
        )}
        
        {item.contact_phone && (
          <View style={styles.detailItem}>
            <Icon name="phone" size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.contact_phone}</Text>
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
              {item.total_orders} Sipariş | Son sipariş: {item.last_order_date || 'Yok'}
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
        <Text style={styles.title}>Müşteriler</Text>
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
          placeholder="Müşteri ara..."
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
        <Text style={styles.filterLabel}>Durum:</Text>
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
                  ? 'Arama kriterlerine uygun müşteri bulunamadı.' 
                  : 'Henüz müşteri bulunmuyor.'}
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