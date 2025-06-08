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
    setStatusFilter(status === 'all' ? null : status);
  };

  // Machine item render function
  const renderMachine = ({ item }: { item: Machine }) => (
    <TouchableOpacity 
      style={styles.machineItem}
      onPress={() => handleViewMachine(item)}
      activeOpacity={0.7}
    >
      <View style={styles.machineHeader}>
        <View style={styles.machineIconContainer}>
          <Icon name="precision-manufacturing" size={24} color="#60A5FA" />
        </View>
        <View style={styles.machineHeaderText}>
          <Text style={styles.machineName}>{item.name}</Text>
          <Text style={styles.serialNumber}>No: {item.serial_number}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.machineDetailsSection}>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={16} color="#9CA3AF" />
          <Text style={styles.detailText}>{item.location || "Not specified"}</Text>
        </View>
        {item.operator_name && (
          <View style={styles.detailRow}>
            <Icon name="person" size={16} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.operator_name}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Icon name="settings" size={16} color="#9CA3AF" />
          <Text style={styles.detailText}>{item.model}</Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditMachine(item)}
            activeOpacity={0.7}
          >
            <Icon name="edit" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {canDelete && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteMachine(item.id)}
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
        <Text style={styles.title}>Machines</Text>
        {canAddEdit && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddMachine}
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
        <Text style={styles.filterLabel}>Status:</Text>
        <ScrollablePills
          options={[
            { value: 'all', label: 'All' },
            { value: 'operational', label: 'Active' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'repair', label: 'Repair' },
            { value: 'idle', label: 'Idle' },
          ]}
          selectedValue={statusFilter || 'all'}
          onSelect={changeStatusFilter}
        />
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Loading machines...</Text>
        </View>
      ) : (
        <>
          {filteredMachines.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="precision-manufacturing" size={64} color="#6B7280" />
              <Text style={styles.emptyTitle}>
                {searchText || statusFilter 
                  ? 'No machines found' 
                  : 'No machines available yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchText || statusFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first machine to get started'}
              </Text>
              {!searchText && !statusFilter && canAddEdit && (
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={handleAddMachine}
                  activeOpacity={0.8}
                >
                  <Icon name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyActionText}>Add First Machine</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredMachines}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMachine}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadMachines();
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  machineItem: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  machineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  machineHeaderText: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 12,
  },
  machineName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  serialNumber: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
  machineDetailsSection: {
    marginTop: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  emptySubtitle: {
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
  },
  emptyActionButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
  },
});

export default MachinesScreen; 