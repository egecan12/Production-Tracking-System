# Performance Testing Methodology
## Web vs Mobile Application Comparison for Thesis Research

### 📋 **ARAŞTIRMA KAPSAMI**

Bu çalışma, **Next.js tabanlı web uygulaması** ile **React Native tabanlı mobile uygulaması** arasındaki performans farklarını ölçmek için geliştirilmiştir. Araştırma, Production Tracking System'in Employee Management modülü üzerinde gerçekleştirilmiştir.

---

## 🎯 **1. ARAŞTIRMA HEDEFLERİ**

### Ana Araştırma Soruları:
1. **Web uygulaması ile mobile uygulama arasında anlamlı performans farkı var mıdır?**
2. **Hangi platform daha hızlı veri yükleme sağlamaktadır?**
3. **Farklı veri setleri (çalışan sayısı) performansı nasıl etkilemektedir?**
4. **Cross-platform development tercihlerinde performans faktörü nasıl değerlendirilmelidir?**

### Hipotezler:
- **H1**: Web uygulaması mobile uygulamadan daha hızlı yükleme süresi sağlar
- **H2**: Büyük veri setlerinde performans farkı daha belirgin hale gelir
- **H3**: Mobile uygulamada daha tutarlı (düşük standart sapma) performans gözlenir

---

## 🔬 **2. TEKNİK ALTYAPI**

### Platformlar:
```
Web Application:
- Framework: Next.js 14
- Language: TypeScript
- Runtime: Node.js
- Browser: Chrome (latest)
- Rendering: Server-Side + Client-Side

Mobile Application:
- Framework: React Native (Expo)
- Language: TypeScript
- Platform: iOS/Android
- Runtime: Hermes/JSC
- Rendering: Native Components
```

### Test Ortamı:
```
Hardware:
- Device: MacBook Pro M1/M2
- Mobile: iPhone 14/15 Pro
- RAM: 16GB+
- Storage: SSD

Network:
- Connection: WiFi 802.11ac
- Speed: 100+ Mbps
- Latency: <10ms
```

---

## 📊 **3. ÖLÇÜM METRİKLERİ**

### Ana Performans Göstergeleri:

#### A. **Page Load Time (Total Load Time)**
```javascript
// Web App Implementation (app/employees/page.tsx)
const pageLoadStart = performance.now();
// ... page loading process
const renderComplete = performance.now();
const totalLoadTime = renderComplete - pageLoadStart;
```

#### B. **Data Fetch Time**
```javascript
// Web App
const dataFetchStart = performance.now();
const data = await getData<Employee>("employees", { is_active: true });
const dataFetchEnd = performance.now();
const dataFetchTime = dataFetchEnd - dataFetchStart;
```

```javascript
// Mobile App (mobile-app/ProductionTrackingApp/src/screens/EmployeesScreen.tsx)
const dataFetchStart = Date.now();
const response = await employeesApi.getAll();
const dataFetchEnd = Date.now();
const dataFetchTime = dataFetchEnd - dataFetchStart;
```

#### C. **Render Completion Time**
- Web: DOM render completion
- Mobile: Screen render completion

#### D. **Employee Count**
- Veri seti büyüklüğü kontrolü
- Scalability analizi için

---

## 🛠 **4. ÖLÇÜM ARAÇLARI VE KODLAR**

### A. **Performance Tracking Implementation**

#### Web App Performance Code:
```typescript
// Performance measurement state
const [performanceMetrics, setPerformanceMetrics] = useState({
  pageLoadStart: 0,
  dataFetchStart: 0,
  dataFetchEnd: 0,
  renderComplete: 0,
  totalLoadTime: 0
});

// Page load start tracking
useEffect(() => {
  const pageLoadStart = performance.now();
  setPerformanceMetrics(prev => ({ ...prev, pageLoadStart }));
  fetchEmployees();
}, []);

// Render completion tracking
useEffect(() => {
  if (!loading && employees.length > 0) {
    const renderComplete = performance.now();
    setPerformanceMetrics(prev => {
      const totalLoadTime = renderComplete - prev.pageLoadStart;
      const updated = { ...prev, renderComplete, totalLoadTime };
      
      // Console logging for data collection
      console.log('📊 EMPLOYEES PAGE PERFORMANCE METRICS (WEB):', {
        pageLoadStart: `${prev.pageLoadStart.toFixed(2)}ms`,
        dataFetchTime: `${(prev.dataFetchEnd - prev.dataFetchStart).toFixed(2)}ms`,
        totalLoadTime: `${totalLoadTime.toFixed(2)}ms`,
        employeesCount: employees.length,
        timestamp: new Date().toISOString()
      });
      
      return updated;
    });
  }
}, [loading, employees]);

// Data fetch tracking
async function fetchEmployees() {
  try {
    const dataFetchStart = performance.now();
    setPerformanceMetrics(prev => ({ ...prev, dataFetchStart }));
    
    const data = await getData<Employee>("employees", { is_active: true });
    
    const dataFetchEnd = performance.now();
    setPerformanceMetrics(prev => ({ ...prev, dataFetchEnd }));
    
    setEmployees(data || []);
    setFilteredEmployees(data || []);
  } catch (error) {
    // Error handling
  } finally {
    setLoading(false);
  }
}
```

#### Mobile App Performance Code:
```typescript
// Performance measurement state
const [performanceMetrics, setPerformanceMetrics] = useState({
  pageLoadStart: 0,
  dataFetchStart: 0,
  dataFetchEnd: 0,
  renderComplete: 0,
  totalLoadTime: 0
});

// Screen load start tracking
useEffect(() => {
  const pageLoadStart = Date.now();
  setPerformanceMetrics(prev => ({ ...prev, pageLoadStart }));
  loadEmployees();
}, []);

// Render completion tracking
useEffect(() => {
  if (!loading && employees.length > 0) {
    const renderComplete = Date.now();
    setPerformanceMetrics(prev => {
      const totalLoadTime = renderComplete - prev.pageLoadStart;
      const updated = { ...prev, renderComplete, totalLoadTime };
      
      // Console logging for data collection
      console.log('📊 EMPLOYEES PAGE PERFORMANCE METRICS (MOBILE):', {
        pageLoadStart: `${prev.pageLoadStart}ms`,
        dataFetchTime: `${prev.dataFetchEnd - prev.dataFetchStart}ms`,
        totalLoadTime: `${totalLoadTime}ms`,
        employeesCount: employees.length,
        timestamp: new Date().toISOString()
      });
      
      return updated;
    });
  }
}, [loading, employees]);

// Data fetch tracking
const loadEmployees = async () => {
  try {
    setLoading(true);
    
    const dataFetchStart = Date.now();
    setPerformanceMetrics(prev => ({ ...prev, dataFetchStart }));
    
    const response = await employeesApi.getAll();
    
    const dataFetchEnd = Date.now();
    setPerformanceMetrics(prev => ({ ...prev, dataFetchEnd }));
    
    if (response && response.success && response.data) {
      setEmployees(response.data);
    }
  } catch (error) {
    // Error handling
  } finally {
    setLoading(false);
  }
};
```

### B. **Unified Performance Testing System**

Test verilerini toplamak için özel geliştirilmiş web aracı:

```html
<!-- unified-performance-tester.html -->
```

#### Özellikler:
- **Side-by-side comparison**: İki platform yan yana test
- **Real-time metrics**: Anlık metrik gösterimi
- **Statistical analysis**: İstatistiksel analiz
- **Academic reporting**: Tez formatında rapor
- **CSV export**: Excel analizi için veri dışa aktarma

#### Test Data Structure:
```javascript
testData = {
  web: [
    {
      loadTime: 1234.56,
      employeeCount: 15,
      timestamp: "2024-06-09T12:34:56.789Z",
      testNumber: 1
    }
  ],
  mobile: [
    {
      loadTime: 1567.89,
      employeeCount: 15,
      timestamp: "2024-06-09T12:35:12.345Z",
      testNumber: 1
    }
  ]
}
```

---

## 📈 **5. VERİ TOPLAMA YÖNTEMİ**

### A. **Otomatik Veri Toplama**
```javascript
// Console log monitoring
const originalConsoleLog = console.log;
console.log = function(...args) {
  originalConsoleLog.apply(console, args);
  
  if (args[0] && args[0].includes('EMPLOYEES PAGE PERFORMANCE METRICS')) {
    const metricData = args[1];
    if (metricData && metricData.totalLoadTime) {
      const loadTime = parseFloat(metricData.totalLoadTime);
      const empCount = parseInt(metricData.employeesCount) || 0;
      
      if (args[0].includes('WEB')) {
        testData.web.push({
          loadTime: loadTime,
          employeeCount: empCount,
          timestamp: new Date().toISOString()
        });
      } else if (args[0].includes('MOBILE')) {
        testData.mobile.push({
          loadTime: loadTime,
          employeeCount: empCount,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
};
```

### B. **Manuel Veri Girişi**
- Test aracında manuel input alanları
- Doğrudan ölçüm sonuçları girişi
- Validation ve error handling

### C. **Test Senaryoları**
1. **Baseline Test**: 10-50 çalışan
2. **Medium Scale**: 100-200 çalışan  
3. **Large Scale**: 500+ çalışan
4. **Network Variations**: Farklı network koşulları

---

## 📊 **6. İSTATİSTİKSEL ANALİZ**

### A. **Descriptive Statistics**
```javascript
function calculateStats(data) {
  const sorted = data.slice().sort((a, b) => a - b);
  const mean = data.reduce((a, b) => a + b) / data.length;
  const stdDev = Math.sqrt(
    data.map(x => Math.pow(x - mean, 2))
        .reduce((a, b) => a + b) / data.length
  );
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  
  return {
    mean: mean.toFixed(2),
    stdDev: stdDev.toFixed(2),
    median: median.toFixed(2),
    min: Math.min(...data),
    max: Math.max(...data),
    p95: p95.toFixed(2)
  };
}
```

### B. **Comparative Analysis**
```javascript
function generateComparativeAnalysis(webStats, mobileStats) {
  const diff = Math.abs(webStats.mean - mobileStats.mean);
  const faster = webStats.mean < mobileStats.mean ? "Web" : "Mobile";
  const percentage = ((diff / Math.min(webStats.mean, mobileStats.mean)) * 100).toFixed(1);
  
  return {
    leader: faster,
    difference: diff.toFixed(2),
    percentageImprovement: percentage,
    consistency: webStats.stdDev < mobileStats.stdDev ? 'Web' : 'Mobile'
  };
}
```

### C. **Statistical Significance**
- **Sample Size**: Minimum 30 ölçüm per platform
- **Confidence Level**: 95%
- **Effect Size**: Cohen's d hesaplaması
- **T-test**: Platform ortalamaları karşılaştırması

---

## 🎯 **7. TEST PROTOKOLÜ**

### A. **Pre-Test Setup**
1. **Environment Preparation**:
   - Browser cache temizleme
   - Mobile app restart
   - Network stability kontrolü
   - Background processes kapatma

2. **Test Tool Initialization**:
   - `unified-performance-tester.html` açma
   - Console monitoring aktivasyonu
   - Data collection başlatma

### B. **Test Execution**
```
For each platform:
1. Load/refresh application
2. Navigate to employees page
3. Wait for complete loading
4. Record metrics automatically/manually
5. Wait 30 seconds between tests
6. Repeat 5-10 times per session
7. Conduct multiple sessions for statistical validity
```

### C. **Post-Test Analysis**
1. **Data Validation**: Outlier detection ve removal
2. **Statistical Analysis**: Descriptive ve comparative statistics
3. **Report Generation**: Academic format thesis report
4. **Data Export**: CSV format Excel analizi için

---

## 📋 **8. RAPOR FORMATI**

### A. **Thesis Report Structure**
```
1. Research Summary
   - Platform comparison details
   - Sample sizes
   - Testing methodology

2. Quantitative Results
   - Web Application Statistics
   - Mobile Application Statistics
   - Comparative Analysis

3. Statistical Analysis
   - Hypothesis testing results
   - Effect size calculation
   - Confidence intervals

4. Academic Contribution
   - Literature relevance
   - Practical implications
   - Future research directions
```

### B. **Data Export Format**
```csv
Platform,Test_Number,Load_Time_ms,Employee_Count,Timestamp,Performance_Category
Web,1,1234.56,15,2024-06-09T12:34:56.789Z,Good
Mobile,1,1567.89,15,2024-06-09T12:35:12.345Z,Fair
```

---

## 🔧 **9. ARAÇLAR VE TEKNOLOJİLER**

### A. **Performance Measurement**
- **Web**: `performance.now()` API
- **Mobile**: `Date.now()` timing
- **Console logging**: Structured data output

### B. **Data Collection**
- **Unified Performance Tester**: Custom HTML/JavaScript tool
- **Real-time monitoring**: Console log interception
- **Manual entry**: Input validation and processing

### C. **Analysis Tools**
- **JavaScript**: Statistical calculations
- **CSV Export**: Excel compatible format
- **Report Generation**: Academic standard formatting

---

## ✅ **10. VALİDİTE VE RELİABİLİTE**

### A. **Internal Validity**
- **Controlled environment**: Same network, device specs
- **Consistent methodology**: Standardized test protocol
- **Multiple measurements**: Reduced random error

### B. **External Validity**
- **Real-world application**: Production tracking system
- **Practical relevance**: Enterprise software context
- **Generalizable findings**: Cross-platform development insights

### C. **Reliability**
- **Test-retest consistency**: Multiple sessions
- **Inter-measurement reliability**: Low coefficient of variation
- **Tool reliability**: Validated measurement instruments

---

## 📚 **11. LİTERATÜR VE REFERANSLAR**

Bu metodoloji aşağıdaki akademik standartlara uygun olarak geliştirilmiştir:

- **Performance Testing Standards**: ISO/IEC 25010
- **Statistical Analysis**: Academic research methodology
- **Cross-platform Comparison**: Mobile vs Web performance literature
- **Empirical Software Engineering**: Evidence-based development practices

---

## 🎓 **12. TEZ KATKISI**

Bu araştırma aşağıdaki alanlara katkı sağlamaktadır:

1. **Cross-platform Development**: Web vs Mobile performance comparison
2. **React Ecosystem**: Next.js vs React Native performance insights
3. **Enterprise Applications**: Production system performance analysis
4. **Development Decision Making**: Platform selection criteria

---

*Bu metodoloji dokümanı, thesis research için comprehensive performance testing yaklaşımını detaylandırmaktadır. Tüm kod implementasyonları ve ölçüm araçları academic standards'a uygun olarak geliştirilmiştir.* 