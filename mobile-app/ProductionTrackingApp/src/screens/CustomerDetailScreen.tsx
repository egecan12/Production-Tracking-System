import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'CustomerDetail'>;

const CustomerDetailScreen: React.FC<Props> = ({ route }) => {
  const { customerId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Details</Text>
      <View style={styles.content}>
        <Text style={styles.label}>Customer ID:</Text>
        <Text style={styles.value}>{customerId}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  content: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default CustomerDetailScreen; 