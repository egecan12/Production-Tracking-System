import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { 
  Rect, 
  Circle, 
  Path, 
  Text as SvgText,
} from 'react-native-svg';

const Logo = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Svg 
          width={240} 
          height={80} 
          viewBox="0 0 512 512"
        >
          {/* Background */}
          <Rect width="512" height="512" rx="128" fill="#111827"/>
          
          {/* Main circle */}
          <Circle 
            cx="256" 
            cy="256" 
            r="160" 
            fill="none" 
            stroke="#1E293B" 
            strokeWidth="24"
          />
          
          {/* Progress circle */}
          <Path 
            d="M256 96A160 160 0 0 1 416 256"
            stroke="#6366F1" 
            strokeWidth="24" 
            strokeLinecap="round"
          />
          
          {/* Bar chart */}
          <Rect x="180" y="288" width="32" height="80" rx="12" fill="#F59E0B"/>
          <Rect x="240" y="256" width="32" height="112" rx="12" fill="#F59E0B"/>
          <Rect x="300" y="224" width="32" height="144" rx="12" fill="#EF4444"/>
          
          {/* Analytics line */}
          <Path
            d="M170 208C190 198 210 170 230 184C250 198 270 136 290 152C310 168 330 184 350 174"
            stroke="#10B981"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Small gear */}
          <Circle cx="186" cy="168" r="24" fill="none" stroke="#9CA3AF" strokeWidth="8"/>
          <Path
            d="M186 144v-12M186 204v-12M210 168h12M150 168h12M202 152l8-8M162 184l-8 8M202 184l8 8M162 152l-8-8"
            stroke="#9CA3AF"
            strokeWidth="6"
            strokeLinecap="round"
          />
          
          {/* Text */}
          <SvgText
            x="256"
            y="430"
            fontSize="60"
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            ProdTrack
          </SvgText>
        </Svg>
      </View>
      <Text style={styles.logoSubtext}>Production Management System</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoContainer: {
    backgroundColor: '#111827',
    width: 240,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoSubtext: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Logo; 