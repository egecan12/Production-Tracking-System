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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { workOrdersApi } from '../api/apiService';
import { hasMachinePermission } from '../lib/authUtils';

// İş emri tipi tanımı
interface WorkOrder {
  id: string;
  order_number: string;
  customer: string;
  status: string;
  priority: string;
  start_date: string;
  due_date: string;
  machine_id?: string;
  machine_name?: string;
  product?: string;
  quantity?: number;
}

const WorkOrdersScreen = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [canAddEdit, setCanAddEdit] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Kullanıcı yetkilerini kontrol et
  useEffect(() => {
    const checkPermissions = async () => {
      const canEdit = await hasMachinePermission('edit');
      setCanAddEdit(canEdit);
    };
    
    checkPermissions();
  }, []);

  // İş emirlerini yükle
  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await workOrdersApi.getAll();
      
      // Yanıt formatını kontrol et ve düzenle
      let data = Array.isArray(response) ? response : response.data || [];
      
      // Tarihleri formatlayalım
      data = data.map((order: WorkOrder) => ({
        ...order,
        start_date: formatDate(order.start_date),
        due_date: formatDate(order.due_date)
      }));
      
      setWorkOrders(data);
      applyFilters(data, searchText, statusFilter);
    } catch (error) {
      console.error('Error loading work orders:', error);
      Alert.alert('Error', 'An error occurred while loading work orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadWorkOrders();
  }, []);

  // Filtre fonksiyonu
  const applyFilters = (data: WorkOrder[], search: string, status: string | null) => {
    let result = [...data];
    
    // Metin araması
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(order => 
        order.order_number.toLowerCase().includes(searchLower) ||
        order.customer.toLowerCase().includes(searchLower) ||
        (order.product && order.product.toLowerCase().includes(searchLower))
      );
    }
    
    // Durum filtresi
    if (status) {
      result = result.filter(order => order.status === status);
    }
    
    setFilteredOrders(result);
  };

  // Arama değiştiğinde
  useEffect(() => {
    applyFilters(workOrders, searchText, statusFilter);
  }, [searchText, statusFilter, workOrders]);

  // Tarih formatı
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // Durum gösterimi
  const StatusBadge = ({ status }: { status: string }) => {
    let color;
    switch (status.toLowerCase()) {
      case 'pending':
      case 'bekliyor':
        color = '#FCD34D'; // Sarı
        break;
      case 'in progress':
      case 'devam ediyor':
        color = '#60A5FA'; // Mavi
        break;
      case 'completed':
      case 'tamamlandı':
        color = '#34D399'; // Yeşil
        break;
      case 'cancelled':
      case 'iptal':
        color = '#F87171'; // Kırmızı
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

  // Yeni iş emri ekleme
  const handleAddWorkOrder = () => {
    // Yeni iş emri ekleme sayfasına yönlendir
    Alert.alert('Bilgi', 'Yeni iş emri ekleme sayfası henüz uygulanmadı.');
  };

  // İş emri detayını göster
  const handleViewWorkOrder = (workOrder: WorkOrder) => {
    // İş emri detay sayfasına yönlendir
    Alert.alert(
      `İş Emri: ${workOrder.order_number}`,
      `Müşteri: ${workOrder.customer}\nÜrün: ${workOrder.product || 'Belirtilmemiş'}\nDurum: ${workOrder.status}\nÖncelik: ${workOrder.priority}\nBaşlangıç: ${workOrder.start_date}\nBitiş: ${workOrder.due_date}\nMiktar: ${workOrder.quantity || 'Belirtilmemiş'}`
    );
  };

  // İş emrini sil
  const handleDeleteWorkOrder = (id: string) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this work order?',
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
              await workOrdersApi.delete(id);
              // Listeden kaldır
              setWorkOrders(workOrders.filter(order => order.id !== id));
              Alert.alert('Success', 'Work order deleted successfully.');
            } catch (error) {
              console.error('Error deleting work order:', error);
              Alert.alert('Error', 'An error occurred while deleting the work order.');
            }
          }
        }
      ]
    );
  };

  // Durum filtresini değiştir
  const changeStatusFilter = (status: string | null) => {
    setStatusFilter(current => current === status ? null : status);
  };

  // İş emri öğesi render fonksiyonu
  const renderWorkOrder = ({ item }: { item: WorkOrder }) => (
    <TouchableOpacity 
      style={styles.workOrderItem}
      onPress={() => handleViewWorkOrder(item)}
    >
      <View style={styles.workOrderHeader}>
        <Text style={styles.orderNumber}>{item.order_number}</Text>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.workOrderDetails}>
        <Text style={styles.customer}>{item.customer}</Text>
        <Text style={styles.dates}>
          {item.start_date} - {item.due_date}
        </Text>
      </View>
      
      <View style={styles.workOrderFooter}>
        {item.product && (
          <Text style={styles.product}>Ürün: {item.product}</Text>
        )}
        {item.quantity && (
          <Text style={styles.quantity}>Miktar: {item.quantity}</Text>
        )}
      </View>
      
      {canAddEdit && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteWorkOrder(item.id)}
        >
          <Icon name="delete" size={18} color="#F87171" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Work Orders</Text>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddWorkOrder}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="İş emri ara..."
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
        <Text style={styles.filterLabel}>Filter:</Text>
        <ScrollablePills
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'in progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
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
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={48} color="#6B7280" />
              <Text style={styles.emptyText}>
                {searchText 
                  ? 'Arama kriterlerine uygun iş emri bulunamadı.' 
                  : 'Henüz iş emri bulunmuyor.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderWorkOrder}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadWorkOrders();
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
  workOrderItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  workOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  workOrderDetails: {
    marginBottom: 8,
  },
  customer: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  dates: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  workOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  product: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  quantity: {
    color: '#9CA3AF',
    fontSize: 12,
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

export default WorkOrdersScreen; 