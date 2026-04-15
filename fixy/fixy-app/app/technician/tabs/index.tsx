import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { Wallet, Star, CheckCircle, Bell, ArrowRight } from 'lucide-react-native';
import api from '../../../api/client';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';

export default function TechnicianDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Шинэ дуудлагуудыг татах (Зөвхөн онлайн үед)
  const fetchPendingJobs = async () => {
    if (!isOnline) return;
    setLoading(true);
    try {
      const response = await api.get('/technician/pending-calls');
      if (response.data.success) {
        setPendingJobs(response.data.data);
      }
    } catch (error) {
      console.error("Шинэ дуудлага татахад алдаа:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPendingJobs();
    }, [isOnline]) // Онлайн төлөв өөрчлөгдөх бүрт дахин татна
  );

  // 2. Онлайн/Офлайн төлөв солих
  const toggleDuty = async () => {
    try {
      let currentLat = null;
      let currentLon = null;

      if (!isOnline) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Алдаа', 'Байршил тогтоох эрх олгогдсонгүй.');
          return; 
        }
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        currentLat = location.coords.latitude;
        currentLon = location.coords.longitude;
      }

      const response = await api.post('/technician/toggle-duty', {
        latitude: currentLat,
        longitude: currentLon,
      });

      if (response.data.success) {
        setIsOnline(response.data.is_on_duty);
        if (!response.data.is_on_duty) {
           setPendingJobs([]); // Офлайн болбол жагсаалтыг цэвэрлэх
        }
      }
    } catch (error) {
      Alert.alert('Алдаа', 'Сервертэй холбогдоход алдаа гарлаа.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Толгой хэсэг */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Өглөөний мэнд,</Text>
            <Text style={styles.name}>Засварчин аа! 👋</Text>
          </View>
          <View style={styles.onlineToggle}>
            <Text style={[styles.toggleText, isOnline ? {color: '#10b981'} : {color: '#94a3b8'}]}>
              {isOnline ? 'ОНЛАЙН' : 'ОФЛАЙН'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleDuty} 
              trackColor={{ false: '#cbd5e1', true: '#34d399' }}
              thumbColor={isOnline ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {!isOnline && (
          <View style={styles.offlineWarning}>
            <Bell size={20} color="#f59e0b" />
            <Text style={styles.warningText}>Та одоо офлайн байна. Шинэ дуудлага хүлээж авахын тулд Онлайн горимд шилжинэ үү.</Text>
          </View>
        )}

        {/* Статистик */}
        <Text style={styles.sectionTitle}>Өнөөдрийн үзүүлэлт</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#ecfdf5' }]}>
            <View style={styles.statIconBg}><Wallet size={20} color="#10b981" /></View>
            <Text style={styles.statValue}>125,000₮</Text>
            <Text style={styles.statLabel}>Орлого</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
            <View style={[styles.statIconBg, { backgroundColor: '#dbeafe' }]}><CheckCircle size={20} color="#3b82f6" /></View>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Гүйцэтгэсэн</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
            <View style={[styles.statIconBg, { backgroundColor: '#fef3c7' }]}><Star size={20} color="#f59e0b" /></View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Үнэлгээ</Text>
          </View>
        </View>

        {/* ЯГ ОДОО - Шинэ дуудлагууд */}
        {isOnline && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Яг одоо (Шинэ дуудлага)</Text>
              {loading && <ActivityIndicator size="small" color="#10b981" style={{ marginRight: 20 }} />}
            </View>

            {pendingJobs.length === 0 && !loading ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Одоогоор шинэ дуудлага ирээгүй байна.</Text>
              </View>
            ) : (
              pendingJobs.map((job: any) => (
                <TouchableOpacity 
                  key={job.id} 
                  style={styles.activeJobCard}
                  // Дэлгэрэнгүй хуудас руу шилжих
                  onPress={() => router.push(`/technician/request-details?id=${job.id}`)}
                >
                  <View style={styles.jobHeader}>
                    <View style={styles.jobBadge}><Text style={styles.jobBadgeText}>{job.service_type || 'ЗАСВАР'}</Text></View>
                    <Text style={styles.jobTime}>Шинэ</Text>
                  </View>
                  <Text style={styles.jobTitle} numberOfLines={1}>{job.description}</Text>
                  <Text style={styles.jobAddress} numberOfLines={2}>{job.address}</Text>
                  
                  <View style={styles.jobFooter}>
                    <Text style={styles.jobDistance}>📍 Ойролцоо</Text>
                    <View style={styles.actionBtn}>
                      <Text style={styles.actionBtnText}>Дэлгэрэнгүй</Text>
                      <ArrowRight size={16} color="#10b981" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  greeting: { fontSize: 14, color: '#64748b', marginBottom: 4 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  onlineToggle: { alignItems: 'center' },
  toggleText: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
  
  offlineWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', padding: 16, margin: 20, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#fde68a' },
  warningText: { flex: 1, fontSize: 13, color: '#b45309', lineHeight: 20 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginHorizontal: 20 },
  
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  statIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748b' },

  emptyCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { color: '#94a3b8', fontSize: 14 },

  activeJobCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jobBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  jobBadgeText: { color: '#10b981', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  jobTime: { fontSize: 12, color: '#94a3b8' },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  jobAddress: { fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 18 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  jobDistance: { fontSize: 13, fontWeight: '500', color: '#64748b' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#10b981' }
});