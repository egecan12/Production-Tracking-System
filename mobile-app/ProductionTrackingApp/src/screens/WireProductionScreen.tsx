import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type MainStackParamList = {
  WireCalculator: undefined;
};

type WireProductionScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'WireCalculator'>;

const WireProductionScreen = () => {
  const navigation = useNavigation<WireProductionScreenNavigationProp>();

  useEffect(() => {
    // Immediately navigate to WireCalculator when this screen loads
    const timer = setTimeout(() => {
      navigation.navigate('WireCalculator');
    }, 100);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Loading Wire Calculator...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});

export default WireProductionScreen; 