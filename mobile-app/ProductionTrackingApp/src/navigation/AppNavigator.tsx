import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasModuleAccess } from '../lib/authUtils';
import { authApi } from '../api/apiService';
import { ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import WorkOrdersScreen from '../screens/WorkOrdersScreen';
import MachinesScreen from '../screens/MachinesScreen';
import MachineDetailScreen from '../screens/MachineDetailScreen';
import EmployeesScreen from '../screens/EmployeesScreen';
import CustomersScreen from '../screens/CustomersScreen';
import WireProductionScreen from '../screens/WireProductionScreen';
import MoreScreen from '../screens/MoreScreen';
import EmployeeDetailScreen from '../screens/EmployeeDetailScreen';
import WorkOrderDetailScreen from '../screens/WorkOrderDetailScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';

// Import types
import { AuthStackParamList, MainStackParamList, MainTabParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
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
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
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
            tabBarIcon: ({ color, size }) => (
              <Icon name="assignment" size={size} color={color} />
            ),
          }}
        />
      )}
      
      {hasModuleAccess('machines', userRole) && (
        <Tab.Screen
          name="Machines"
          component={MachinesScreen}
          options={{
            title: 'Machines',
            tabBarIcon: ({ color, size }) => (
              <Icon name="build" size={size} color={color} />
            ),
          }}
        />
      )}
      
      {hasModuleAccess('employees', userRole) && (
        <Tab.Screen
          name="Employees"
          component={EmployeesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="people" size={size} color={color} />
            ),
          }}
        />
      )}
      
      {hasModuleAccess('customers', userRole) && (
        <Tab.Screen
          name="Customers"
          component={CustomersScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="business" size={size} color={color} />
            ),
          }}
        />
      )}
      
      {hasModuleAccess('wire-production', userRole) && (
        <Tab.Screen
          name="WireProduction"
          component={WireProductionScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="settings" size={size} color={color} />
            ),
          }}
        />
      )}
      
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="more-horiz" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const authStatus = await authApi.isAuthenticated();
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
        <MainStack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <MainStack.Screen name="MainTabs" component={MainTabs} />
          <MainStack.Screen 
            name="MachineDetail" 
            component={MachineDetailScreen}
            options={{ headerShown: true, title: 'Machine Details' }}
          />
          <MainStack.Screen 
            name="EmployeeDetail" 
            component={EmployeeDetailScreen}
            options={{ headerShown: true, title: 'Employee Details' }}
          />
          <MainStack.Screen 
            name="WorkOrderDetail" 
            component={WorkOrderDetailScreen}
            options={{ headerShown: true, title: 'Work Order Details' }}
          />
          <MainStack.Screen 
            name="CustomerDetail" 
            component={CustomerDetailScreen}
            options={{ headerShown: true, title: 'Customer Details' }}
          />
        </MainStack.Navigator>
      ) : (
        <AuthStack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator; 