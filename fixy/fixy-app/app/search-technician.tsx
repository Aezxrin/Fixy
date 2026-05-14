import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Search, User, Star, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../config';

const MapComponent = Platform.OS === 'web' ? View : MapView;
const MarkerComponent = Platform.OS === 'web' ? View : Marker;
const { width, height } = Dimensions.get('window');

export default function SearchTechnicianScreen() {
  // 1. ЗАСВАР: latitude болон longitude-г давхар хүлээж авах
  const { serviceType, description, address, imageUri, latitude, longitude } = useLocalSearchParams();
  
  console.log("--- 2. SEARCH-TECH хуудаст орж ирсэн дата ---", { serviceType, description, address, latitude, longitude });
  
  const [searching, setSearching] = useState(true);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<any | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    })();

    const startPulse = () => {
      pulseAnim.setValue(0);
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => startPulse());
    };
    startPulse();

    const findTechs = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/customer/online-technicians?type=${serviceType}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        setTimeout(() => {
          setTechnicians(data.data || []);
          setSearching(false);
        }, 3000); 
      } catch (error) {
        console.error("Хайлт амжилтгүй:", error);
        setSearching(false);
      }
    };
    findTechs();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.replace('/tabs')}>
        <X size={24} color="#0f172a" />
      </TouchableOpacity>

      {searching ? (
        <View style={styles.radarContainer}>
          <Animated.View style={[styles.pulse, {
            transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 4] }) }],
            opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] })
          }]} />
          <View style={styles.radarCenter}>
            <Search size={32} color="#fff" />
          </View>
          <Text style={styles.searchingText}>Танд ойрхон идэвхтэй засварчдыг хайж байна...</Text>
          <Text style={styles.subText}>{serviceType} чиглэлээр</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapComponent
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region || undefined}
            showsUserLocation={true}
            onPress={() => setSelectedTech(null)}
          >
            {technicians.map((tech) => (
              <MarkerComponent
                key={tech.id}
                coordinate={{
                  latitude: parseFloat(tech.latitude),
                  longitude: parseFloat(tech.longitude),
                }}
                pinColor="#10b981" 
                onPress={(e) => {
                  e.stopPropagation(); 
                  setSelectedTech(tech);
                }}
              />
            ))}
          </MapComponent>

          {technicians.length === 0 && (
            <View style={styles.noDataCard}>
              <Text style={styles.noDataText}>Уучлаарай, яг одоо энэ төрлийн идэвхтэй засварчин алга байна.</Text>
            </View>
          )}

          {selectedTech && (
            <View style={styles.techCardContainer}>
              <View style={styles.techCard}>
                <TouchableOpacity style={styles.cardCloseButton} onPress={() => setSelectedTech(null)}>
                  <X size={18} color="#64748b" />
                </TouchableOpacity>
                
                <View style={styles.techInfoRow}>
                  <View style={styles.avatarPlaceholder}>
                    <User color="#10b981" size={24} />
                  </View>
                  <View style={{ marginLeft: 15 }}>
                    <Text style={styles.techName}>{selectedTech.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <Text style={{ fontSize: 13, color: '#475569', fontWeight: 'bold', marginLeft: 4 }}>4.9</Text>
                      <Text style={{ fontSize: 13, color: '#94a3b8', marginLeft: 4 }}>(120+ засвар)</Text>
                    </View>
                    <Text style={styles.techPhone}>📞 {selectedTech.phone || 'Утас байхгүй'}</Text>
                  </View>
                </View>

                {/* 2. ЗАСВАР: Профайл руу latitude болон longitude-г давхар дамжуулах */}
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => router.push({
                    pathname: '/technician-profile',
                    params: { 
                      id: selectedTech.id,
                      serviceType: serviceType,
                      description: description,
                      address: address,
                      imageUri: imageUri || '',
                      latitude: latitude,   // ЦААШ НЬ ДАМЖУУЛЖ БАЙНА
                      longitude: longitude  // ЦААШ НЬ ДАМЖУУЛЖ БАЙНА
                    }
                  } as any)}
                >
                  <Text style={styles.detailButtonText}>Дэлгэрэнгүй үзэх</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  closeBtn: { padding: 15, alignSelf: 'flex-start', zIndex: 10, position: 'absolute', top: 10, left: 10 },
  radarContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#10b981' },
  radarCenter: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: '#10b981', shadowOpacity: 0.5, shadowRadius: 15 },
  searchingText: { marginTop: 40, fontSize: 16, fontWeight: '700', color: '#0f172a', textAlign: 'center', paddingHorizontal: 40 },
  subText: { marginTop: 8, fontSize: 14, color: '#64748b' },
  mapContainer: { flex: 1 },
  map: { width: width, height: height },
  noDataCard: { position: 'absolute', top: 80, alignSelf: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, width: '90%' },
  noDataText: { textAlign: 'center', color: '#ef4444', fontWeight: '500' },
  techCardContainer: { position: 'absolute', bottom: 30, width: '100%', paddingHorizontal: 20 },
  techCard: { backgroundColor: '#fff', padding: 20, borderRadius: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15, shadowRadius: 15 },
  cardCloseButton: { position: 'absolute', top: 15, right: 15, padding: 5, zIndex: 10 },
  techInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center' },
  techName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  techPhone: { fontSize: 13, color: '#64748b', marginTop: 4 },
  detailButton: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 5 },
  detailButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});