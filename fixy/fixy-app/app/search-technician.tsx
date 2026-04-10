import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Search, User, Star, MapPin, ChevronRight, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { Alert } from 'react-native';

export default function SearchTechnicianScreen() {
  const { requestId, serviceType } = useLocalSearchParams();
  const [searching, setSearching] = useState(true);
  const [technicians, setTechnicians] = useState<any[]>([]);
  
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Радар анимейшн
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

    // 2. Засварчдыг АПИ-аас хайх
    const findTechs = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/find-technicians?service_type=${serviceType}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        // 3 секунд радар харуулаад үр дүнг харуулна
        setTimeout(() => {
          setTechnicians(data.data || []);
          setSearching(false);
        }, 3000); 
      } catch (error) {
        console.error(error);
      }
    };
    findTechs();
  }, []);

  const renderTechCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.techCard}
      onPress={() => {
          // Дараагийн шат: Засварчны профайл руу үсэрнэ
          Alert.alert("Мэдээлэл", `${item.name}-н профайл удахгүй бэлэн болно.`);
      }}
    >
      <View style={styles.techInfo}>
        <View style={styles.avatarContainer}>
          <User size={24} color="#64748b" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.techName}>{item.name}</Text>
          <View style={styles.techStats}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.statText}>4.9 (120+ засвар)</Text>
          </View>
          <View style={styles.locationRow}>
            <MapPin size={12} color="#94a3b8" />
            <Text style={styles.locationText}>1.2 км ойрхон</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
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
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={styles.title}>Боломжтой засварчид</Text>
          <Text style={styles.description}>Өөрт таалагдсан засварчныг сонгон профайлыг нь үзнэ үү.</Text>
          
          <FlatList
            data={technicians}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTechCard}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 50, color: '#94a3b8'}}>Уучлаарай, одоогоор идэвхтэй засварчин алга.</Text>}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  closeBtn: { padding: 20, alignSelf: 'flex-start' },
  radarContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#10b981' },
  radarCenter: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: '#10b981', shadowOpacity: 0.5, shadowRadius: 15 },
  searchingText: { marginTop: 40, fontSize: 16, fontWeight: '700', color: '#0f172a', textAlign: 'center', paddingHorizontal: 40 },
  subText: { marginTop: 8, fontSize: 14, color: '#64748b' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  description: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 20 },
  techCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  techInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  techName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  techStats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 12, color: '#94a3b8' },
});