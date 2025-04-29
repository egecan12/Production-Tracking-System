import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasModuleAccess } from '../lib/authUtils';
import { authApi } from '../api/apiService';
import { ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens (these will be created later)
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import WorkOrdersScreen from '../screens/WorkOrdersScreen';
import OrdersScreen from '../screens/OrdersScreen';
import MachinesScreen from '../screens/MachinesScreen';
import MachineDetailScreen from '../screens/MachineDetailScreen';
import EmployeesScreen from '../screens/EmployeesScreen';
import CustomersScreen from '../screens/CustomersScreen';
import WireProductionScreen from '../screens/WireProductionScreen';

// Define the navigation types
export type AuthStackParamList = {
  Login: undefined;
};

export type MachinesStackParamList = {
  MachinesList: undefined;
  MachineDetail: { machineId: string };
};

export type MainStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  WorkOrders: undefined;
  Orders: undefined;
  Machines: undefined;
  MachineDetail: { machineId: string };
  Employees: undefined;
  Customers: undefined;
  WireProduction: undefined;
  More: undefined;
};

export type TabParamList = {
  Home: undefined;
  WorkOrders: undefined;
  Orders: undefined;
  Machines: undefined;
  More: undefined;
};

// Create the navigation stacks
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const MachinesStack = createNativeStackNavigator<MachinesStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Auth Stack Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

// More Stack Navigator (for additional modules)
const MoreNavigator = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    };

    getUserRole();
  }, []);

  return (
    <MainStack.Navigator>
      <MainStack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Production Tracking' }}
      />
      {hasModuleAccess('employees', userRole) && (
        <MainStack.Screen 
          name="Employees" 
          component={EmployeesScreen} 
          options={{ title: 'Employee Management' }}
        />
      )}
      {hasModuleAccess('customers', userRole) && (
        <MainStack.Screen 
          name="Customers" 
          component={CustomersScreen} 
          options={{ title: 'Customer Management' }}
        />
      )}
      {hasModuleAccess('wire-production', userRole) && (
        <MainStack.Screen 
          name="WireProduction" 
          component={WireProductionScreen} 
          options={{ title: 'Wire Production Calculator' }}
        />
      )}
    </MainStack.Navigator>
  );
};

// Machines Navigator
const MachinesNavigator = () => {
  return (
    <MachinesStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E1E1E',
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <MachinesStack.Screen
        name="MachinesList"
        component={MachinesScreen}
        options={{ title: 'Machines' }}
      />
      <MachinesStack.Screen
        name="MachineDetail"
        component={MachineDetailScreen}
        options={{ title: 'Machine Details' }}
      />
    </MachinesStack.Navigator>
  );
};

// Tab Navigator
const TabNavigator = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    };

    getUserRole();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#5C6BC0',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333333',
        },
        headerStyle: {
          backgroundColor: '#1E1E1E',
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      
      {hasModuleAccess('work-orders', userRole) && (
        <Tab.Screen
          name="WorkOrders"
          component={WorkOrdersScreen}
          options={{
            title: 'Work Orders',
            tabBarIcon: ({ color, size }) => (
              <Icon name="assignment" size={size} color={color} />
            ),
          }}
        />
      )}
      
      {hasModuleAccess('orders', userRole) && (
        <Tab.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, size }) => (
              <Icon name="shopping-cart" size={size} color={color} />
            ),
          }}
        />
      )}
      
      {hasModuleAccess('machines', userRole) && (
        <Tab.Screen
          name="Machines"
          component={MachinesNavigator}
          options={{
            headerShown: false,
            title: 'Machines',
            tabBarIcon: ({ color, size }) => (
              <Icon name="build" size={size} color={color} />
            ),
          }}
        />
      )}
      
      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="more-horiz" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const authStatus = await authApi.isAuthenticated();
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
      console.log('Auth status check:', authStatus);
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainStack.Navigator>
          <MainStack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          {hasModuleAccess('employees', userRole) && (
            <MainStack.Screen 
              name="Employees" 
              component={EmployeesScreen} 
              options={{ title: 'Employee Management' }}
            />
          )}
          {hasModuleAccess('customers', userRole) && (
            <MainStack.Screen 
              name="Customers" 
              component={CustomersScreen} 
              options={{ title: 'Customer Management' }}
            />
          )}
          {hasModuleAccess('wire-production', userRole) && (
            <MainStack.Screen 
              name="WireProduction" 
              component={WireProductionScreen} 
              options={{ title: 'Wire Production Calculator' }}
            />
          )}
        </MainStack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator; 