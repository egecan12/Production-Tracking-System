import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Logo from '../components/Logo';
import LogoutButton from '../components/LogoutButton';
import { hasModuleAccess } from '../lib/authUtils';

type ModuleItem = {
  id: string;
  route: string;
  title: string;
  description: string;
  color: string;
};

// Define modules with English text
const modules: ModuleItem[] = [
  {
    id: 'workorders',
    route: 'WorkOrders',
    title: 'Work Order Management',
    description: 'Create work orders, track them and monitor production metrics',
    color: '#A78BFA', // purple-400
  },
  {
    id: 'orders',
    route: 'Orders',
    title: 'Order Management',
    description: 'Create new orders and track existing ones',
    color: '#818CF8', // indigo-400
  },
  {
    id: 'machines',
    route: 'Machines',
    title: 'Machine Management',
    description: 'View your machines and manage operators',
    color: '#60A5FA', // blue-400
  },
  {
    id: 'employees',
    route: 'Employees',
    title: 'Employee Management',
    description: 'Add and manage employee records',
    color: '#34D399', // green-400
  },
  {
    id: 'customers',
    route: 'Customers',
    title: 'Customer Management',
    description: 'Add and manage customer records',
    color: '#FBBF24', // yellow-400
  },
  {
    id: 'wire-production',
    route: 'WireProduction',
    title: 'Wire Production Calculator',
    description: 'Calculate and analyze wire production metrics',
    color: '#F87171', // red-400
  },
];

const HomeScreen = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [accessibleModules, setAccessibleModules] = useState<ModuleItem[]>([]);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  // Calculate how many modules to show per row based on screen width
  const itemsPerRow = width > 600 ? 2 : 1;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedRole = await AsyncStorage.getItem('userRole');

        if (storedUsername) {
          setUsername(storedUsername);
        }

        if (storedRole) {
          setRole(storedRole);

          // Filter modules that the user has access to
          const filteredModules = modules.filter((module) => {
            return hasModuleAccess(module.id, storedRole);
          });

          setAccessibleModules(filteredModules);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleModulePress = (route: string) => {
    // @ts-ignore - Navigation typing issue
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>User:</Text>
            <Text style={styles.username}>{username}</Text>
          </View>
          <LogoutButton />
        </View>

        <Logo />

        <Text style={styles.subtitle}>
          Easily manage your machines, operators and production processes
        </Text>

        <View style={styles.modulesContainer}>
          {accessibleModules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={[
                styles.moduleCard,
                { width: `${100 / itemsPerRow - 4}%` },
              ]}
              onPress={() => handleModulePress(module.route)}
              activeOpacity={0.7}
            >
              <Text style={[styles.moduleTitle, { color: module.color }]}>
                {module.title}
              </Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userLabel: {
    color: '#6B7280',
    marginRight: 4,
  },
  username: {
    color: '#D1D5DB',
  },
  subtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  modulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#374151',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  moduleDescription: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default HomeScreen; 