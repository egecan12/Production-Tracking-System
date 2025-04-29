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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { hasModuleAccess } from '../lib/authUtils';

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [canAddEdit, setCanAddEdit] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  // Mock veri
  const mockEmployees: Employee[] = [
    {
      id: '1',
      first_name: 'Ali',
      last_name: 'Yılmaz',
      position: 'Üretim Operatörü',
      department: 'Üretim',
      email: 'ali.yilmaz@example.com',
      phone: '555-123-4567',
      hire_date: '2020-03-15',
      status: 'Aktif'
    },
    {
      id: '2',
      first_name: 'Ayşe',
      last_name: 'Demir',
      position: 'Satış Uzmanı',
      department: 'Satış',
      email: 'ayse.demir@example.com',
      phone: '555-234-5678',
      hire_date: '2019-07-22',
      status: 'Aktif'
    },
    {
      id: '3',
      first_name: 'Mehmet',
      last_name: 'Kaya',
      position: 'Makine Mühendisi',
      department: 'Mühendislik',
      email: 'mehmet.kaya@example.com',
      phone: '555-345-6789',
      hire_date: '2021-01-10',
      status: 'Aktif'
    },
    {
      id: '4',
      first_name: 'Zeynep',
      last_name: 'Şahin',
      position: 'İK Uzmanı',
      department: 'İnsan Kaynakları',
      email: 'zeynep.sahin@example.com',
      phone: '555-456-7890',
      hire_date: '2018-11-05',
      status: 'İzinde'
    },
    {
      id: '5',
      first_name: 'Mustafa',
      last_name: 'Öztürk',
      position: 'Bakım Teknisyeni',
      department: 'Bakım',
      email: 'mustafa.ozturk@example.com',
      phone: '555-567-8901',
      hire_date: '2019-04-18',
      status: 'Aktif'
    }
  ];

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
      
      // Gerçek API entegrasyonu buraya eklenecek
      // Şimdilik mock veri kullanıyoruz
      const data = mockEmployees.map(employee => ({
        ...employee,
        hire_date: formatDate(employee.hire_date)
      }));
      
      setEmployees(data);
      applyFilters(data, searchText, departmentFilter);
    } catch (error) {
      console.error('Çalışanlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Çalışanlar yüklenirken bir hata oluştu.');
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
    switch (status.toLowerCase()) {
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
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  // Yeni çalışan ekleme
  const handleAddEmployee = () => {
    // Yeni çalışan ekleme sayfasına yönlendir
    Alert.alert('Bilgi', 'Yeni çalışan ekleme sayfası henüz uygulanmadı.');
  };

  // Çalışan detayını göster
  const handleViewEmployee = (employee: Employee) => {
    // Çalışan detay sayfasına yönlendir
    Alert.alert(
      `${employee.first_name} ${employee.last_name}`,
      `Pozisyon: ${employee.position}\nDepartman: ${employee.department}\nE-posta: ${employee.email || 'Belirtilmemiş'}\nTelefon: ${employee.phone || 'Belirtilmemiş'}\nİşe Alım Tarihi: ${employee.hire_date || 'Belirtilmemiş'}\nDurum: ${employee.status}`
    );
  };

  // Çalışanı sil
  const handleDeleteEmployee = (id: string) => {
    Alert.alert(
      'Onay',
      'Bu çalışanı silmek istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            // Mock silme işlemi
            const updatedEmployees = employees.filter(employee => employee.id !== id);
            setEmployees(updatedEmployees);
            Alert.alert('Başarılı', 'Çalışan silindi.');
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
                {item.first_name.charAt(0)}{item.last_name.charAt(0)}
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