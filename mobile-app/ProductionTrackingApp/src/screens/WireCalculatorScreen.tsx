import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

// Spool types with their max capacities
const spoolTable = {
  "BÜYÜK SİLİNDİRİK TAHTA MAKARA (Ø 740 mm)": { maxKg: 110 },
  "ORTA SİLİNDİRİK TAHTA MAKARA (Ø 640 mm)": { maxKg: 85 },
  "KÜÇÜK PLASTİK MAKARA (Ø 350 mm)": { maxKg: 20 },
};

// Utility function to calculate wire production metrics
const calculateWireProductionMetrics = (params: {
  nakedWeightKg: number;
  totalInsulationKg: number;
  insulationPerMeterGr: number;
  wireLengthMeter: number;
  spoolCount: number;
  crossSectionWidthMm: number;
  crossSectionHeightMm: number;
  totalWeightKg: number;
  theoreticalWeightKg: number;
  actualWeightKg: number;
  theoreticalProduction: number;
  actualProduction: number;
}) => {
  const {
    nakedWeightKg,
    totalInsulationKg,
    insulationPerMeterGr,
    wireLengthMeter,
    spoolCount,
    crossSectionWidthMm,
    crossSectionHeightMm,
    totalWeightKg,
    theoreticalWeightKg,
    actualWeightKg,
    theoreticalProduction,
    actualProduction,
  } = params;

  // Calculate metrics
  const insulationTotalFromGr = (insulationPerMeterGr * wireLengthMeter) / 1000;
  const insulationRatio = nakedWeightKg > 0 ? (totalInsulationKg / nakedWeightKg) * 100 : 0;
  const insulationPerSpool = spoolCount > 0 ? totalInsulationKg / spoolCount : 0;
  const effectiveTotalWeight = nakedWeightKg + totalInsulationKg;
  const effectiveWeightEfficiency = totalWeightKg > 0 ? (effectiveTotalWeight / totalWeightKg) * 100 : 0;
  const crossSectionAreaMm2 = crossSectionWidthMm * crossSectionHeightMm;
  const wireWeightKg = (wireLengthMeter * crossSectionAreaMm2 * 8.96) / 1_000_000;
  const fireRate = theoreticalWeightKg > 0 ? ((theoreticalWeightKg - actualWeightKg) / theoreticalWeightKg) * 100 : 0;
  const efficiency = theoreticalProduction > 0 ? (actualProduction / theoreticalProduction) * 100 : 0;

  return {
    insulationTotalFromGr,
    insulationRatio,
    insulationPerSpool,
    effectiveTotalWeight,
    effectiveWeightEfficiency,
    crossSectionAreaMm2,
    wireWeightKg,
    fireRate,
    efficiency,
  };
};

type MainTabParamList = {
  Home: undefined;
  WireProduction: undefined;
};

type WireCalculatorScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'WireProduction'>;

const WireCalculatorScreen = () => {
  const navigation = useNavigation<WireCalculatorScreenNavigationProp>();

  // State for input values
  const [inputs, setInputs] = useState({
    nakedWeightKg: '',
    totalInsulationKg: '',
    insulationPerMeterGr: '',
    wireLengthMeter: '',
    spoolCount: '',
    crossSectionWidthMm: '',
    crossSectionHeightMm: '',
    totalWeightKg: '',
    theoreticalWeightKg: '',
    actualWeightKg: '',
    theoreticalProduction: '',
    actualProduction: '',
  });

  // State for selected spool type
  const [selectedSpool, setSelectedSpool] = useState<string>('');

  // State for calculated metrics
  const [metrics, setMetrics] = useState({
    insulationTotalFromGr: 0,
    insulationRatio: 0,
    insulationPerSpool: 0,
    effectiveTotalWeight: 0,
    effectiveWeightEfficiency: 0,
    crossSectionAreaMm2: 0,
    wireWeightKg: 0,
    fireRate: 0,
    efficiency: 0,
  });

  // Update metrics when inputs change
  useEffect(() => {
    const numericInputs = {
      nakedWeightKg: parseFloat(inputs.nakedWeightKg) || 0,
      totalInsulationKg: parseFloat(inputs.totalInsulationKg) || 0,
      insulationPerMeterGr: parseFloat(inputs.insulationPerMeterGr) || 0,
      wireLengthMeter: parseFloat(inputs.wireLengthMeter) || 0,
      spoolCount: parseFloat(inputs.spoolCount) || 0,
      crossSectionWidthMm: parseFloat(inputs.crossSectionWidthMm) || 0,
      crossSectionHeightMm: parseFloat(inputs.crossSectionHeightMm) || 0,
      totalWeightKg: parseFloat(inputs.totalWeightKg) || 0,
      theoreticalWeightKg: parseFloat(inputs.theoreticalWeightKg) || 0,
      actualWeightKg: parseFloat(inputs.actualWeightKg) || 0,
      theoreticalProduction: parseFloat(inputs.theoreticalProduction) || 0,
      actualProduction: parseFloat(inputs.actualProduction) || 0,
    };
    setMetrics(calculateWireProductionMetrics(numericInputs));
  }, [inputs]);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Check if the weight exceeds spool capacity
  const isOverCapacity = () => {
    if (!selectedSpool || !metrics.effectiveTotalWeight) return false;

    const spoolCapacity = spoolTable[selectedSpool as keyof typeof spoolTable]?.maxKg || 0;
    const spoolCount = parseFloat(inputs.spoolCount) || 0;
    const weightPerSpool = spoolCount > 0 ? metrics.effectiveTotalWeight / spoolCount : metrics.effectiveTotalWeight;

    return weightPerSpool > spoolCapacity;
  };

  // Check if cross section area exceeds maximum for hadde
  const isHaddeExceeded = () => {
    return metrics.crossSectionAreaMm2 > 100;
  };

  // Format numbers for display
  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  // Clear all inputs
  const clearInputs = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all input fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setInputs({
              nakedWeightKg: '',
              totalInsulationKg: '',
              insulationPerMeterGr: '',
              wireLengthMeter: '',
              spoolCount: '',
              crossSectionWidthMm: '',
              crossSectionHeightMm: '',
              totalWeightKg: '',
              theoreticalWeightKg: '',
              actualWeightKg: '',
              theoreticalProduction: '',
              actualProduction: '',
            });
            setSelectedSpool('');
          },
        },
      ]
    );
  };

  const renderInputField = (
    field: string,
    label: string,
    placeholder: string,
    keyboardType: 'numeric' | 'default' = 'numeric'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={inputs[field as keyof typeof inputs]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderMetricCard = (title: string, value: string, isWarning = false, warningIcon = false) => (
    <View style={[styles.metricCard, isWarning && styles.warningCard]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, isWarning && styles.warningText]}>
        {value}
        {warningIcon && <Text style={styles.warningIcon}> ⚠️</Text>}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Wire Calculator</Text>
        <TouchableOpacity onPress={clearInputs} style={styles.clearButton}>
          <Icon name="clear" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Input Parameters Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Parameters</Text>
          
          {renderInputField('nakedWeightKg', 'Raw Weight (kg)', 'Enter raw weight')}
          {renderInputField('totalInsulationKg', 'Total Insulation (kg)', 'Enter total insulation')}
          {renderInputField('insulationPerMeterGr', 'Insulation per Meter (gr)', 'Enter insulation per meter')}
          {renderInputField('wireLengthMeter', 'Wire Length (m)', 'Enter wire length')}
          {renderInputField('spoolCount', 'Spool Count', 'Enter spool count')}
          {renderInputField('crossSectionWidthMm', 'Cross Section Width (mm)', 'Enter width')}
          {renderInputField('crossSectionHeightMm', 'Cross Section Height (mm)', 'Enter height')}
          {renderInputField('totalWeightKg', 'Total Weight (kg)', 'Enter total weight')}
          {renderInputField('theoreticalWeightKg', 'Theoretical Weight (kg)', 'Enter theoretical weight')}
          {renderInputField('actualWeightKg', 'Actual Weight (kg)', 'Enter actual weight')}
          {renderInputField('theoreticalProduction', 'Theoretical Production', 'Enter theoretical production')}
          {renderInputField('actualProduction', 'Actual Production', 'Enter actual production')}

          {/* Spool Type Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Spool Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSpool}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedSpool(itemValue)}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Select Spool Type" value="" />
                {Object.entries(spoolTable).map(([spoolType, config]) => (
                  <Picker.Item
                    key={spoolType}
                    label={`${spoolType} - (Max: ${config.maxKg} kg)`}
                    value={spoolType}
                  />
                ))}
              </Picker>
            </View>
            {isOverCapacity() && (
              <Text style={styles.errorText}>❗ Selected spool capacity is exceeded!</Text>
            )}
          </View>
        </View>

        {/* Results Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculated Metrics</Text>
          
          <View style={styles.metricsGrid}>
            {renderMetricCard('Insulation Total (gr to kg)', `${formatNumber(metrics.insulationTotalFromGr)} kg`)}
            {renderMetricCard('Insulation Ratio', `${formatNumber(metrics.insulationRatio)}%`)}
            {renderMetricCard('Spool Insulation', `${formatNumber(metrics.insulationPerSpool)} kg/spool`)}
            {renderMetricCard('Effective Total Weight', `${formatNumber(metrics.effectiveTotalWeight)} kg`)}
            {renderMetricCard('Effective Weight Efficiency', `${formatNumber(metrics.effectiveWeightEfficiency)}%`)}
            {renderMetricCard(
              'Cross Section Area',
              `${formatNumber(metrics.crossSectionAreaMm2)} mm²`,
              isHaddeExceeded(),
              isHaddeExceeded()
            )}
            {renderMetricCard('Wire Weight', `${formatNumber(metrics.wireWeightKg)} kg`)}
            {renderMetricCard('Fire Rate', `${formatNumber(metrics.fireRate)}%`)}
            {renderMetricCard('Efficiency', `${formatNumber(metrics.efficiency)}%`)}
            {renderMetricCard(
              'Spool Weight',
              `${parseFloat(inputs.spoolCount) > 0 
                ? formatNumber(metrics.effectiveTotalWeight / parseFloat(inputs.spoolCount))
                : formatNumber(metrics.effectiveTotalWeight)
              } kg/spool`,
              isOverCapacity(),
              isOverCapacity()
            )}
          </View>

          {/* Hadde warning */}
          {isHaddeExceeded() && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningTitle}>⚠️ Hadde Control:</Text>
              <Text style={styles.warningDescription}>
                This cross section is too large – it may not fit in the hadde.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#F9FAFB',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: '#F9FAFB',
    backgroundColor: '#374151',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  warningCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#451A03',
  },
  metricTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  warningText: {
    color: '#F59E0B',
  },
  warningIcon: {
    fontSize: 14,
  },
  warningContainer: {
    backgroundColor: '#451A03',
    borderWidth: 1,
    borderColor: '#92400E',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 8,
  },
  warningDescription: {
    fontSize: 14,
    color: '#FCD34D',
  },
});

export default WireCalculatorScreen; 