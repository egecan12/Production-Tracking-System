import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

// Malzeme yoğunlukları (g/cm³)
const MATERIAL_DENSITIES = {
  steel: 7.85,
  stainless_steel: 8.0,
  copper: 8.96,
  aluminum: 2.7,
  brass: 8.4,
  titanium: 4.5,
  gold: 19.32,
  silver: 10.49,
  tungsten: 19.25,
};

// Malzeme tiplerinin görünen isimleri
const MATERIAL_NAMES = {
  steel: 'Çelik',
  stainless_steel: 'Paslanmaz Çelik',
  copper: 'Bakır',
  aluminum: 'Alüminyum',
  brass: 'Pirinç',
  titanium: 'Titanyum',
  gold: 'Altın',
  silver: 'Gümüş',
  tungsten: 'Tungsten',
};

// Hesaplama geçmişi kaydı için tip
interface CalculationHistory {
  id: string;
  date: string;
  material: string;
  diameter: number;
  length: number;
  quantity: number;
  weight: number;
}

const WireCalculatorScreen = () => {
  // Temel hesaplama parametreleri
  const [material, setMaterial] = useState<keyof typeof MATERIAL_DENSITIES>('steel');
  const [diameter, setDiameter] = useState<string>(''); // mm cinsinden
  const [length, setLength] = useState<string>(''); // m cinsinden
  const [quantity, setQuantity] = useState<string>('1');
  
  // Hesaplama sonuçları
  const [weight, setWeight] = useState<number | null>(null);
  const [surfaceArea, setSurfaceArea] = useState<number | null>(null);
  const [volume, setVolume] = useState<number | null>(null);
  
  // Geçmiş hesaplamalar
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // UI durumları
  const [loading, setLoading] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);

  // Hesaplama yap
  const calculateWire = () => {
    // Boş veya geçersiz girdileri kontrol et
    if (!diameter || !length || !quantity) {
      Alert.alert('Hata', 'Lütfen tüm değerleri girin.');
      return;
    }
    
    // Sayısal değerlere dönüştür
    const diameterVal = parseFloat(diameter);
    const lengthVal = parseFloat(length);
    const quantityVal = parseInt(quantity, 10);
    
    if (isNaN(diameterVal) || isNaN(lengthVal) || isNaN(quantityVal)) {
      Alert.alert('Hata', 'Lütfen geçerli sayısal değerler girin.');
      return;
    }
    
    if (diameterVal <= 0 || lengthVal <= 0 || quantityVal <= 0) {
      Alert.alert('Hata', 'Lütfen pozitif değerler girin.');
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      // Hesaplamalar
      // - Çapı mm'den cm'ye çevir (yoğunluk g/cm³ cinsinden)
      const diameterCm = diameterVal / 10;
      // - Uzunluğu m'den cm'ye çevir
      const lengthCm = lengthVal * 100;
      // - Yarıçap
      const radiusCm = diameterCm / 2;
      
      // Hacim hesapla (cm³): π * r² * uzunluk
      const volumeVal = Math.PI * radiusCm * radiusCm * lengthCm;
      
      // Yüzey alanı hesapla (cm²): 2 * π * r * uzunluk
      const surfaceAreaVal = 2 * Math.PI * radiusCm * lengthCm;
      
      // Ağırlık hesapla (g): hacim * yoğunluk
      const densityGCm3 = MATERIAL_DENSITIES[material];
      const weightVal = volumeVal * densityGCm3;
      
      // Adet sayısı ile çarp
      const totalWeight = weightVal * quantityVal;
      
      // Sonuçları ayarla
      setVolume(volumeVal * quantityVal);
      setSurfaceArea(surfaceAreaVal * quantityVal);
      setWeight(totalWeight);
      
      // Geçmişe ekle
      const newHistory: CalculationHistory = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        material,
        diameter: diameterVal,
        length: lengthVal,
        quantity: quantityVal,
        weight: totalWeight,
      };
      
      setHistory(prev => [newHistory, ...prev].slice(0, 10)); // Son 10 kaydı tut
      
      setLoading(false);
      setResultsVisible(true);
    }, 500); // Hesaplama efekti için kısa gecikme
  };
  
  // Temizle
  const resetCalculator = () => {
    setDiameter('');
    setLength('');
    setQuantity('1');
    setWeight(null);
    setSurfaceArea(null);
    setVolume(null);
    setResultsVisible(false);
  };
  
  // Geçmiş hesaplamayı yükle
  const loadHistoryItem = (item: CalculationHistory) => {
    setMaterial(item.material as keyof typeof MATERIAL_DENSITIES);
    setDiameter(item.diameter.toString());
    setLength(item.length.toString());
    setQuantity(item.quantity.toString());
    setWeight(item.weight);
    
    // Diğer değerleri yeniden hesapla
    const diameterCm = item.diameter / 10;
    const lengthCm = item.length * 100;
    const radiusCm = diameterCm / 2;
    
    const volumeVal = Math.PI * radiusCm * radiusCm * lengthCm * item.quantity;
    const surfaceAreaVal = 2 * Math.PI * radiusCm * lengthCm * item.quantity;
    
    setVolume(volumeVal);
    setSurfaceArea(surfaceAreaVal);
    
    setResultsVisible(true);
    setShowHistory(false);
  };
  
  // Geçmiş hesaplamayı sil
  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };
  
  // Sonuç görünümü
  const renderResults = () => {
    if (!resultsVisible) return null;
    
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Hesaplama Sonuçları</Text>
          <TouchableOpacity onPress={resetCalculator}>
            <Icon name="refresh" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Toplam Ağırlık:</Text>
          <Text style={styles.resultValue}>
            {weight !== null ? `${(weight / 1000).toFixed(3)} kg` : '-'}
          </Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Birim Ağırlık:</Text>
          <Text style={styles.resultValue}>
            {weight !== null && parseInt(quantity) > 0 
              ? `${((weight / parseInt(quantity)) / 1000).toFixed(3)} kg/adet` 
              : '-'}
          </Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Toplam Hacim:</Text>
          <Text style={styles.resultValue}>
            {volume !== null ? `${volume.toFixed(2)} cm³` : '-'}
          </Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Yüzey Alanı:</Text>
          <Text style={styles.resultValue}>
            {surfaceArea !== null ? `${surfaceArea.toFixed(2)} cm²` : '-'}
          </Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Malzeme:</Text>
          <Text style={styles.resultValue}>{MATERIAL_NAMES[material]}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => {
            Alert.alert('Bilgi', 'Bu özellik henüz tamamlanmadı. Hesaplama otomatik olarak geçmişe kaydedildi.');
          }}
        >
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Geçmiş görünümü
  const renderHistory = () => {
    if (!showHistory) return null;
    
    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Geçmiş Hesaplamalar</Text>
          <TouchableOpacity onPress={() => setShowHistory(false)}>
            <Icon name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        
        {history.length === 0 ? (
          <Text style={styles.emptyText}>Henüz kaydedilmiş hesaplama yok.</Text>
        ) : (
          <ScrollView style={styles.historyList}>
            {history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <TouchableOpacity 
                  style={styles.historyContent}
                  onPress={() => loadHistoryItem(item)}
                >
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyMaterial}>{MATERIAL_NAMES[item.material as keyof typeof MATERIAL_NAMES]}</Text>
                  <Text style={styles.historyDetails}>
                    {`Ø ${item.diameter}mm × ${item.length}m × ${item.quantity} adet`}
                  </Text>
                  <Text style={styles.historyWeight}>
                    {`${(item.weight / 1000).toFixed(3)} kg`}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteHistoryButton}
                  onPress={() => deleteHistoryItem(item.id)}
                >
                  <Icon name="delete" size={18} color="#F87171" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const handleMaterialChange = (itemValue: keyof typeof MATERIAL_DENSITIES) => {
    setMaterial(itemValue);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Tel Hesaplama Aracı</Text>
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => setShowHistory(!showHistory)}
            >
              <Icon name="history" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {renderHistory()}
          
          {!showHistory && (
            <>
              <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>Temel Parametreler</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Malzeme</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={material}
                      style={styles.picker}
                      dropdownIconColor="#FFFFFF"
                      onValueChange={handleMaterialChange}
                    >
                      {Object.entries(MATERIAL_NAMES).map(([key, name]) => (
                        <Picker.Item key={key} label={name} value={key} color="#FFFFFF" />
                      ))}
                    </Picker>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Çap (mm)</Text>
                  <TextInput
                    style={styles.input}
                    value={diameter}
                    onChangeText={setDiameter}
                    placeholder="Örn: 2.5"
                    placeholderTextColor="#6B7280"
                    keyboardType="decimal-pad"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Uzunluk (m)</Text>
                  <TextInput
                    style={styles.input}
                    value={length}
                    onChangeText={setLength}
                    placeholder="Örn: 100"
                    placeholderTextColor="#6B7280"
                    keyboardType="decimal-pad"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Adet</Text>
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="Örn: 1"
                    placeholderTextColor="#6B7280"
                    keyboardType="number-pad"
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.calculateButton}
                  onPress={calculateWire}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.calculateButtonText}>Hesapla</Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {renderResults()}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
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
  historyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
  },
  formContainer: {
    backgroundColor: '#1E1E1E',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#9CA3AF',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#2C2C2C',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  pickerContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
    backgroundColor: '#2C2C2C',
  },
  calculateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: '#1E1E1E',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  resultLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  resultValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#059669',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  historyContainer: {
    backgroundColor: '#1E1E1E',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 24,
  },
  historyList: {
    maxHeight: 400,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  historyMaterial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyDetails: {
    color: '#D1D5DB',
    fontSize: 13,
  },
  historyWeight: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  deleteHistoryButton: {
    padding: 8,
  },
});

export default WireCalculatorScreen; 