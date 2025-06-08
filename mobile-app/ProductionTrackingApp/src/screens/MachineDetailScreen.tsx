import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MachinesStackParamList } from '../navigation/AppNavigator';
import { machinesApi } from '../api/apiService';
import { hasMachinePermission } from '../lib/authUtils';

// Types
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
  number?: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  image_url?: string;
}

interface WorkSession {
  id: string;
  machine_id: string;
  employee_id: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
  employee?: Employee;
}

type Props = NativeStackScreenProps<MachinesStackParamList, 'MachineDetail'>;

const MachineDetailScreen = ({ route, navigation }: Props) => {
  const { machineId } = route.params;
  const [machine, setMachine] = useState<Machine | null>(null);
  const [activeOperators, setActiveOperators] = useState<(WorkSession & { employee: Employee })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const editPermission = await hasMachinePermission('edit');
      const deletePermission = await hasMachinePermission('delete');
      
      setCanEdit(editPermission);
      setCanDelete(deletePermission);
    };
    
    checkPermissions();
  }, []);

  const loadMachineData = async () => {
    try {
      setLoading(true);
      
      // Fetch machine details
      const machineResponse = await machinesApi.getById(machineId);
      console.log('Machine data response:', machineResponse);
      
      if (machineResponse.success && machineResponse.data && machineResponse.data.length > 0) {
        setMachine(machineResponse.data[0]);
        
        // Fetch active operators for this machine
        const sessionsResponse = await fetch(`${API_BASE_URL}/api/data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            table: 'work_sessions',
            action: 'read',
            filters: { 
              machine_id: machineId,
              is_active: true 
            }
          })
        });
        
        const sessionsData = await sessionsResponse.json();
        console.log('Work sessions data:', sessionsData);
        
        if (sessionsData.success && sessionsData.data && sessionsData.data.length > 0) {
          // Fetch employee details for each session
          const operatorsWithEmployees = await Promise.all(
            sessionsData.data.map(async (session: WorkSession) => {
              const employeeResponse = await fetch(`${API_BASE_URL}/api/data`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  table: 'employees',
                  action: 'read',
                  filters: { id: session.employee_id }
                })
              });
              
              const employeeData = await employeeResponse.json();
              return {
                ...session,
                employee: employeeData.data[0]
              };
            })
          );
          
          setActiveOperators(operatorsWithEmployees);
        } else {
          setActiveOperators([]);
        }
      } else {
        Alert.alert('Error', 'Machine not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading machine data:', error);
      Alert.alert('Error', 'Failed to load machine data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMachineData();
  }, [machineId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMachineData();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not specified';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'operational':
        return '#34D399'; // Green
      case 'maintenance':
        return '#FCD34D'; // Yellow
      case 'inactive':
      case 'repair':
        return '#F87171'; // Red
      default:
        return '#9CA3AF'; // Gray
    }
  };

  const updateMachineStatus = async (newStatus: string) => {
    if (!machine) return;
    
    // Check if there are active operators
    if (activeOperators.length > 0 && (newStatus === 'inactive' || newStatus === 'maintenance')) {
      Alert.alert(
        'Warning',
        'There are active operators on this machine. Please remove them before changing the status.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      const response = await machinesApi.update(machine.id, { status: newStatus });
      
      if (response.success) {
        setMachine({ ...machine, status: newStatus });
        Alert.alert('Success', `Machine status updated to ${newStatus}`);
      } else {
        throw new Error(response.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating machine status:', error);
      Alert.alert('Error', 'Failed to update machine status');
    }
  };

  const confirmDeleteMachine = () => {
    if (!machine) return;
    
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete the machine ${machine.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await machinesApi.delete(machine.id);
              
              if (response.success) {
                Alert.alert('Success', 'Machine deleted successfully');
                navigation.goBack();
              } else {
                throw new Error(response.error || 'Failed to delete machine');
              }
            } catch (error) {
              console.error('Error deleting machine:', error);
              Alert.alert('Error', 'Failed to delete machine');
            }
          }
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }
  
  if (!machine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Machine not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.machineImageContainer}>
            {machine.image_url ? (
              <Image 
                source={{ uri: machine.image_url }} 
                style={styles.machineImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.machineImagePlaceholder}>
                <Icon name="build" size={60} color="#6B7280" />
              </View>
            )}
          </View>
          
          <View style={styles.machineInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.machineName}>{machine.name}</Text>
              <View 
                style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(machine.status) }
                ]}
              >
                <Text style={styles.statusText}>
                  {(machine.status || '').charAt(0).toUpperCase() + (machine.status || '').slice(1)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.machineDetail}>
              <Text style={styles.detailLabel}>Model: </Text>
              {machine.model}
            </Text>
            
            <Text style={styles.machineDetail}>
              <Text style={styles.detailLabel}>Serial Number: </Text>
              {machine.serial_number}
            </Text>
            
            {machine.number && (
              <Text style={styles.machineDetail}>
                <Text style={styles.detailLabel}>Machine No: </Text>
                {machine.number}
              </Text>
            )}
            
            <Text style={styles.machineDetail}>
              <Text style={styles.detailLabel}>Location: </Text>
              {machine.location || 'Not specified'}
            </Text>
            
            <Text style={styles.machineDetail}>
              <Text style={styles.detailLabel}>Last Maintenance: </Text>
              {formatDate(machine.last_maintenance)}
            </Text>
          </View>
        </View>
        
        {canEdit && (
          <View style={styles.actionContainer}>
            <Text style={styles.sectionTitle}>Status Actions:</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: getStatusColor('active') }
                ]}
                onPress={() => updateMachineStatus('active')}
                disabled={machine.status === 'active'}
              >
                <Text style={styles.statusButtonText}>Set Active</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: getStatusColor('maintenance') }
                ]}
                onPress={() => updateMachineStatus('maintenance')}
                disabled={machine.status === 'maintenance'}
              >
                <Text style={styles.statusButtonText}>Set Maintenance</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: getStatusColor('inactive') }
                ]}
                onPress={() => updateMachineStatus('inactive')}
                disabled={machine.status === 'inactive'}
              >
                <Text style={styles.statusButtonText}>Set Inactive</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Operators:</Text>
          
          {activeOperators.length === 0 ? (
            <View style={styles.emptyOperators}>
              <Icon name="person-off" size={32} color="#6B7280" />
              <Text style={styles.emptyText}>No active operators</Text>
            </View>
          ) : (
            <View style={styles.operatorsList}>
              {activeOperators.map(session => (
                <View key={session.id} style={styles.operatorItem}>
                  <View style={styles.operatorInfo}>
                    {session.employee?.image_url ? (
                      <Image 
                        source={{ uri: session.employee.image_url }} 
                        style={styles.operatorAvatar}
                      />
                    ) : (
                      <View style={styles.operatorAvatarPlaceholder}>
                        <Icon name="person" size={20} color="#FFFFFF" />
                      </View>
                    )}
                    
                    <View style={styles.operatorDetails}>
                      <Text style={styles.operatorName}>{session.employee?.name || 'Unknown'}</Text>
                      <Text style={styles.operatorPosition}>{session.employee?.position || 'Employee'}</Text>
                      <Text style={styles.operatorTime}>
                        Since: {new Date(session.start_time).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  
                  {canEdit && (
                    <TouchableOpacity 
                      style={styles.removeOperatorButton}
                      onPress={() => {
                        Alert.alert(
                          'Remove Operator',
                          `Are you sure you want to remove ${session.employee?.name || 'this operator'}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Remove', 
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  const response = await fetch(`${API_BASE_URL}/api/data`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      table: 'work_sessions',
                                      action: 'update',
                                      data: {
                                        end_time: new Date().toISOString(),
                                        is_active: false
                                      },
                                      filters: { id: session.id }
                                    })
                                  });
                                  
                                  const data = await response.json();
                                  
                                  if (data.success) {
                                    setActiveOperators(activeOperators.filter(op => op.id !== session.id));
                                    Alert.alert('Success', 'Operator removed successfully');
                                  } else {
                                    throw new Error(data.error || 'Failed to remove operator');
                                  }
                                } catch (error) {
                                  console.error('Error removing operator:', error);
                                  Alert.alert('Error', 'Failed to remove operator');
                                }
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Icon name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
        
        {machine.details && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details:</Text>
            <Text style={styles.detailsText}>{machine.details}</Text>
          </View>
        )}
        
        {canDelete && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={confirmDeleteMachine}
          >
            <Icon name="delete" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete Machine</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Need to extract the API_BASE_URL from the API service
const API_BASE_URL = 'http://172.20.10.2:3000';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F87171',
    fontSize: 16,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  machineImageContainer: {
    marginRight: 16,
  },
  machineImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  machineImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  machineInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  machineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  machineDetail: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  actionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyOperators: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 8,
    fontSize: 14,
  },
  operatorsList: {
    marginTop: 8,
  },
  operatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  operatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  operatorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  operatorDetails: {
    flex: 1,
  },
  operatorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  operatorPosition: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  operatorTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeOperatorButton: {
    backgroundColor: '#EF4444',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    margin: 16,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default MachineDetailScreen; 