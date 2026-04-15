import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, MapPin, Clock, Info, CheckCircle, XCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../api/client';

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Дуудлагын мэдээллийг татах
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // Одоогоор бидэнд нэг дуудлага татдаг API байхгүй тул 'pending-calls'-аас хайж авъя
        const response = await api.get('/technician/pending-calls');
        if (response.data.success) {
          const foundJob = response.data.data.find((item: any) => item.id.toString() === id);
          if (foundJob) {
            setJob(foundJob);
          } else {
            Alert.alert("Алдаа", "Энэ дуудлага олдсонгүй эсвэл цуцлагдсан байна.");
            router.back();
          }
        }
      } catch (error) {
        Alert.alert("Алдаа", "Мэдээлэл татахад алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  // 2. Хүлээн авах
  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await api.post(`/technician/calls/${id}/accept`);
      if (response.data.success) {
        // Амжилттай болбол "Чиглүүлэгч Мап" хуудас руу шилжинэ
        router.replace({
          pathname: '/technician/navigate-map',
          params: { id: id }
        } as any); 
      }
    } catch (error) {
      Alert.alert("Алдаа", "Ажлыг хүлээн авахад алдаа гарлаа.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Татгалзах
  const handleDecline = () => {
    Alert.alert("Татгалзах", "Та энэ дуудлагаас татгалзахдаа итгэлтэй байна уу?", [
      { text: "Үгүй", style: "cancel" },
      { 
        text: "Тийм", 
        style: "destructive",
        onPress: () => {
          // Энд татгалзах API дуудаж болно. Одоогоор зүгээр л буцна.
          router.back();
        } 
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!job) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Толгой хэсэг */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Дуудлагын дэлгэрэнгүй</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Ажлын төрөл ба хугацаа */}
        <View style={styles.typeCard}>
          <View style={styles.typeHeader}>
            <View style={styles.badge}><Text style={styles.badgeText}>{job.service_type || 'ЗАСВАР'}</Text></View>
            <View style={styles.timeRow}>
              <Clock size={16} color="#94a3b8" />
              <Text style={styles.timeText}>Саяхан</Text>
            </View>
          </View>
        </View>

        {/* Асуудлын тайлбар */}
        <Text style={styles.sectionTitle}>Асуудлын тайлбар</Text>
        <View style={styles.infoCard}>
          <View style={styles.iconBox}><Info size={20} color="#3b82f6" /></View>
          <Text style={styles.infoText}>{job.description}</Text>
        </View>

        {/* Байршил */}
        <Text style={styles.sectionTitle}>Очих хаяг</Text>
        <View style={styles.infoCard}>
          <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}><MapPin size={20} color="#ef4444" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoText}>{job.address}</Text>
            <Text style={styles.distanceText}>📍 Ойролцоогоор 2.5 км зайтай</Text>
          </View>
        </View>

      </ScrollView>

      {/* Доод хэсгийн товчнууд (Хүлээн авах / Татгалзах) */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.declineBtn} 
          onPress={handleDecline}
          disabled={isProcessing}
        >
          <XCircle size={20} color="#ef4444" />
          <Text style={styles.declineBtnText}>Татгалзах</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.acceptBtn, isProcessing && { opacity: 0.7 }]} 
          onPress={handleAccept}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.acceptBtnText}>Хүлээн авах</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  typeCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  typeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: '#10b981', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 14, color: '#64748b', fontWeight: '500' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 12, marginLeft: 4 },
  
  infoCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0', gap: 16, alignItems: 'flex-start' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  infoText: { flex: 1, fontSize: 15, color: '#1e293b', lineHeight: 22, marginTop: 8 },
  distanceText: { fontSize: 13, color: '#64748b', marginTop: 8, fontWeight: '500' },

  footer: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 12 },
  declineBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 14, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', gap: 8 },
  declineBtnText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  
  acceptBtn: { flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 14, backgroundColor: '#10b981', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4, gap: 8 },
  acceptBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});