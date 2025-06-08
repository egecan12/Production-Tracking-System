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
import { machinesApi } from '../api/apiService';
import { hasMachinePermission } from '../lib/authUtils';
import { MainStackParamList } from '../navigation/types';

// Machine type definition
interface Machine {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  status: string;
  location?: string;
  maintenance_date?: string;
  operator_id?: string;
  operator_name?: string;
  image_url?: string;
  details?: string;
  last_maintenance?: string;
}

const MachinesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [canAddEdit, setCanAddEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Check user permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const editPermission = await hasMachinePermission('edit');
      const deletePermission = await hasMachinePermission('delete');
      
      setCanAddEdit(editPermission);
      setCanDelete(deletePermission);
    };
    
    checkPermissions();
  }, []);

  // Load machines
  const loadMachines = async () => {
    try {
      setLoading(true);
      const response = await machinesApi.getAll();
      
      // Check and format response data
      let data = response.data || [];
      console.log("Machines data received:", data);
      
      // Format dates
      data = data.map((machine: Machine) => ({
        ...machine,
        maintenance_date: formatDate(machine.maintenance_date),
        last_maintenance: formatDate(machine.last_maintenance)
      }));
      
      setMachines(data);
      applyFilters(data, searchText, statusFilter);
    } catch (error) {
      console.error('Error loading machines:', error);
      Alert.alert('Error', 'An error occurred while loading machines.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial loading
  useEffect(() => {
    loadMachines();
  }, []);

  // Filter function
  const applyFilters = (data: Machine[], search: string, status: string | null) => {
    let result = [...data];
    
    // Text search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(machine => 
        machine.name.toLowerCase().includes(searchLower) ||
        machine.model.toLowerCase().includes(searchLower) ||
        machine.serial_number.toLowerCase().includes(searchLower) ||
        (machine.location && machine.location.toLowerCase().includes(searchLower))
      );
    }
    
    // Status filter
    if (status) {
      result = result.filter(machine => machine.status === status);
    }
    
    setFilteredMachines(result);
  };

  // When search changes
  useEffect(() => {
    applyFilters(machines, searchText, statusFilter);
  }, [searchText, statusFilter, machines]);

  // Date format
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // Status display
  const StatusBadge = ({ status }: { status: string }) => {
    let color;
    switch (status.toLowerCase()) {
      case 'operational':
      case 'active':
        color = '#34D399'; // Green
        break;
      case 'maintenance':
        color = '#FCD34D'; // Yellow
        break;
      case 'repair':
      case 'inactive':
        color = '#F87171'; // Red
        break;
      case 'idle':
        color = '#60A5FA'; // Blue
        break;
      default:
        color = '#9CA3AF'; // Gray
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  // Add new machine
  const handleAddMachine = () => {
    // Navigate to add machine page
    navigation.navigate('AddEditMachine', {});
  };

  // Show machine details
  const handleViewMachine = (machine: Machine) => {
    // Navigate to machine detail screen
    navigation.navigate('MachineDetail', { machineId: machine.id });
  };

  // Edit machine
  const handleEditMachine = (machine: Machine) => {
    // Navigate to edit machine screen
    navigation.navigate('AddEditMachine', { machineId: machine.id });
  };

  // Delete machine
  const handleDeleteMachine = (id: string) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this machine?',
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
              const response = await machinesApi.delete(id);
              if (response.success) {
                // Remove from list
                setMachines(machines.filter(machine => machine.id !== id));
                Alert.alert('Success', 'Machine deleted successfully.');
              } else {
                throw new Error(response.error || 'Delete operation failed');
              }
            } catch (error) {
              console.error('Error deleting machine:', error);
              Alert.alert('Error', 'An error occurred while deleting the machine.');
            }
          }
        }
      ]
    );
  };

  // Change status filter
  const changeStatusFilter = (status: string | null) => {
    setStatusFilter(current => current === status ? null : status);
  };

  // Machine item render function
  const renderMachine = ({ item }: { item: Machine }) => (
    <TouchableOpacity 
      style={styles.machineItem}
      onPress={() => handleViewMachine(item)}
    >
      <View style={styles.machineHeader}>
        <Text style={styles.machineName}>{item.name}</Text>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.machineBody}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.machineImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="build" size={24} color="#6B7280" />
          </View>
        )}
        
        <View style={styles.machineDetails}>
          <Text style={styles.model}>{item.model}</Text>
          <Text style={styles.serialNumber}>SN: {item.serial_number}</Text>
          {item.location && (
            <Text style={styles.location}>
              <Icon name="location-on" size={12} color="#9CA3AF" /> {item.location}
            </Text>
          )}
          {item.operator_name && (
            <Text style={styles.operator}>
              <Icon name="person" size={12} color="#9CA3AF" /> {item.operator_name}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditMachine(item)}
          >
            <Icon name="edit" size={18} color="#3B82F6" />
          </TouchableOpacity>
        )}
        {canDelete && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteMachine(item.id)}
          >
            <Icon name="delete" size={18} color="#F87171" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Machines</Text>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddMachine}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search machines..."
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
            { value: 'operational', label: 'Operational' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'repair', label: 'Repair' },
            { value: 'idle', label: 'Idle' },
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
          {filteredMachines.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="build" size={48} color="#6B7280" />
              <Text style={styles.emptyText}>
                {searchText 
                  ? 'No machines matching your search criteria.' 
                  : 'No machines available yet.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredMachines}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMachine}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadMachines();
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

// Scrollable filter pills
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
  machineItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  machineName: {
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
  machineBody: {
    flexDirection: 'row',
  },
  machineImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  machineDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  model: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  serialNumber: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  location: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  operator: {
    color: '#9CA3AF',
    fontSize: 12,
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

export default MachinesScreen; 