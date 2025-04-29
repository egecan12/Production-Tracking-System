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
import { ordersApi } from '../api/apiService';
import { hasModuleAccess } from '../lib/authUtils';

// Sipariş tipi tanımı
interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  order_date: string;
  delivery_date: string;
  total_amount?: number;
  payment_status?: string;
  products?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

const OrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [canAddEdit, setCanAddEdit] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Kullanıcı yetkilerini kontrol et
  useEffect(() => {
    const checkPermissions = async () => {
      const hasAccess = hasModuleAccess('orders', 'sales') || 
                        hasModuleAccess('orders', 'admin') || 
                        hasModuleAccess('orders', 'manager');
      setCanAddEdit(hasAccess);
    };
    
    checkPermissions();
  }, []);

  // Siparişleri yükle
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll();
      
      // Yanıt formatını kontrol et ve düzenle
      let data = Array.isArray(response) ? response : response.data || [];
      
      // Tarihleri formatlayalım
      data = data.map((order: Order) => ({
        ...order,
        order_date: formatDate(order.order_date),
        delivery_date: formatDate(order.delivery_date)
      }));
      
      setOrders(data);
      applyFilters(data, searchText, statusFilter);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
      Alert.alert('Hata', 'Siparişler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadOrders();
  }, []);

  // Filtre fonksiyonu
  const applyFilters = (data: Order[], search: string, status: string | null) => {
    let result = [...data];
    
    // Metin araması
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(order => 
        order.order_number.toLowerCase().includes(searchLower) ||
        order.customer_name.toLowerCase().includes(searchLower)
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
    applyFilters(orders, searchText, statusFilter);
  }, [searchText, statusFilter, orders]);

  // Tarih formatı
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };
  
  // Para formatı
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '';
    return amount.toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    });
  };

  // Durum gösterimi
  const StatusBadge = ({ status }: { status: string }) => {
    let color;
    switch (status.toLowerCase()) {
      case 'pending':
      case 'bekliyor':
        color = '#FCD34D'; // Sarı
        break;
      case 'processing':
      case 'işleniyor':
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

  // Ödeme durumu gösterimi
  const PaymentStatusBadge = ({ status }: { status?: string }) => {
    if (!status) return null;
    
    let color;
    switch (status.toLowerCase()) {
      case 'paid':
      case 'ödendi':
        color = '#34D399'; // Yeşil
        break;
      case 'pending':
      case 'bekliyor':
        color = '#FCD34D'; // Sarı
        break;
      case 'overdue':
      case 'gecikmiş':
        color = '#F87171'; // Kırmızı
        break;
      default:
        color = '#9CA3AF'; // Gri
    }
    
    return (
      <View style={[styles.paymentBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  // Yeni sipariş ekleme
  const handleAddOrder = () => {
    // Yeni sipariş ekleme sayfasına yönlendir
    Alert.alert('Bilgi', 'Yeni sipariş ekleme sayfası henüz uygulanmadı.');
  };

  // Sipariş detayını göster
  const handleViewOrder = (order: Order) => {
    // Ürünleri formatlayalım
    let productsText = '';
    if (order.products && order.products.length > 0) {
      productsText = 'Ürünler:\n';
      order.products.forEach(product => {
        productsText += `- ${product.name} (${product.quantity} adet, Birim Fiyat: ${formatCurrency(product.price)})\n`;
      });
    }
    
    // Sipariş detay sayfasına yönlendir
    Alert.alert(
      `Sipariş: ${order.order_number}`,
      `Müşteri: ${order.customer_name}\nSipariş Tarihi: ${order.order_date}\nTeslim Tarihi: ${order.delivery_date}\nTutar: ${formatCurrency(order.total_amount)}\nDurum: ${order.status}\nÖdeme Durumu: ${order.payment_status || 'Belirtilmemiş'}\n\n${productsText}`
    );
  };

  // Siparişi sil
  const handleDeleteOrder = (id: string) => {
    Alert.alert(
      'Onay',
      'Bu siparişi silmek istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await ordersApi.delete(id);
              // Listeden kaldır
              setOrders(orders.filter(order => order.id !== id));
              Alert.alert('Başarılı', 'Sipariş silindi.');
            } catch (error) {
              console.error('Sipariş silinirken hata:', error);
              Alert.alert('Hata', 'Sipariş silinirken bir hata oluştu.');
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

  // Sipariş öğesi render fonksiyonu
  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => handleViewOrder(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.order_number}</Text>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.customer}>{item.customer_name}</Text>
        <Text style={styles.dates}>
          Sipariş: {item.order_date} | Teslim: {item.delivery_date}
        </Text>
      </View>
      
      <View style={styles.orderFooter}>
        {item.total_amount !== undefined && (
          <Text style={styles.amount}>{formatCurrency(item.total_amount)}</Text>
        )}
        {item.payment_status && (
          <PaymentStatusBadge status={item.payment_status} />
        )}
      </View>
      
      {canAddEdit && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteOrder(item.id)}
        >
          <Icon name="delete" size={18} color="#F87171" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Siparişler</Text>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddOrder}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Sipariş ara..."
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
        <Text style={styles.filterLabel}>Filtrele:</Text>
        <ScrollablePills
          options={[
            { value: 'pending', label: 'Bekleyen' },
            { value: 'processing', label: 'İşleniyor' },
            { value: 'completed', label: 'Tamamlanan' },
            { value: 'cancelled', label: 'İptal' },
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
              <Icon name="shopping-cart" size={48} color="#6B7280" />
              <Text style={styles.emptyText}>
                {searchText 
                  ? 'Arama kriterlerine uygun sipariş bulunamadı.' 
                  : 'Henüz sipariş bulunmuyor.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderOrder}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadOrders();
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
  orderItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  orderHeader: {
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
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#121212',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
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
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
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

export default OrdersScreen; 