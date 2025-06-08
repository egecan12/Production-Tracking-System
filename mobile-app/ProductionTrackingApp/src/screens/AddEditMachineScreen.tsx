import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { machinesApi } from '../api/apiService';
import { hasMachinePermission } from '../lib/authUtils';
import { Picker } from '@react-native-picker/picker';

// Machine type definition
interface Machine {
  id?: string;
  name: string;
  model?: string;
  number?: string;
  location?: string;
  status: 'active' | 'inactive' | 'maintenance';
}

// Navigation type
type RootStackParamList = {
  AddEditMachine: { machineId?: string };
  Machines: undefined;
};

type AddEditMachineScreenRouteProp = RouteProp<RootStackParamList, 'AddEditMachine'>;
type AddEditMachineScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddEditMachine'>;

const AddEditMachineScreen = () => {
  const navigation = useNavigation<AddEditMachineScreenNavigationProp>();
  const route = useRoute<AddEditMachineScreenRouteProp>();
  const { machineId } = route.params || {};
  
  const isEditing = !!machineId;
  
  const [machine, setMachine] = useState<Machine>({
    name: '',
    model: '',
    number: '',
    location: '',
    status: 'active',
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Check permissions and load machine data
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Check permissions
        const permission = isEditing 
          ? await hasMachinePermission('edit') 
          : await hasMachinePermission('add');
        
        setHasPermission(permission);
        
        if (!permission) {
          Alert.alert('Access Denied', 'You do not have permission to perform this action.');
          navigation.goBack();
          return;
        }

        // Load machine data if editing
        if (isEditing && machineId) {
          setLoading(true);
          try {
            const response = await machinesApi.getById(machineId);
            if (response.data && response.data.length > 0) {
              const machineData = response.data[0];
              setMachine({
                name: machineData.name || '',
                model: machineData.model || '',
                number: machineData.number || '',
                location: machineData.location || '',
                status: machineData.status || 'active',
              });
            }
          } catch (error) {
            console.error('Error loading machine:', error);
            Alert.alert('Error', 'Failed to load machine data.');
            navigation.goBack();
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing screen:', error);
        Alert.alert('Error', 'Failed to initialize screen.');
        navigation.goBack();
      }
    };

    initializeScreen();
  }, [isEditing, machineId, navigation]);

  const handleInputChange = (field: keyof Machine, value: string) => {
    setMachine(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!machine.name.trim()) {
      Alert.alert('Validation Error', 'Machine name is required.');
      return;
    }

    setSaving(true);
    try {
      let response;
      
      if (isEditing && machineId) {
        // Update existing machine
        response = await machinesApi.update(machineId, machine);
      } else {
        // Create new machine
        response = await machinesApi.create(machine);
      }

      if (response.success !== false) {
        Alert.alert(
          'Success',
          `Machine ${isEditing ? 'updated' : 'created'} successfully!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Machines'),
            },
          ]
        );
      } else {
        throw new Error(response.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving machine:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} machine.`);
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Access Denied</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading machine data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Edit Machine' : 'Add New Machine'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Machine Name *</Text>
            <TextInput
              style={styles.input}
              value={machine.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter machine name"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              value={machine.model}
              onChangeText={(value) => handleInputChange('model', value)}
              placeholder="Enter machine model"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number</Text>
            <TextInput
              style={styles.input}
              value={machine.number}
              onChangeText={(value) => handleInputChange('number', value)}
              placeholder="Enter machine number"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={machine.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="Enter machine location"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={machine.status}
                onValueChange={(value: 'active' | 'inactive' | 'maintenance') => 
                  handleInputChange('status', value)
                }
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Active" value="active" color="#fff" />
                <Picker.Item label="Inactive" value="inactive" color="#fff" />
                <Picker.Item label="Maintenance" value="maintenance" color="#fff" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Machine' : 'Add Machine'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 8,
  },
  picker: {
    color: '#fff',
    backgroundColor: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddEditMachineScreen; 