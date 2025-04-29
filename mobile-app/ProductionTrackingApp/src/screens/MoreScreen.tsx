import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authApi } from '../api/apiService';
import { MainStackParamList } from '../navigation/AppNavigator';

type MoreScreenNavigationProp = StackNavigationProp<MainStackParamList, 'More'>;

const MoreScreen = () => {
  const navigation = useNavigation<MoreScreenNavigationProp>();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      // Reset navigation to main tabs
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Icon name="logout" size={24} color="#FFFFFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MoreScreen; 