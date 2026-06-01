import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { ArrowLeft, MapPin, Clock, Info, CheckCircle, XCircle, CreditCard } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../api/client';

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);

  // 1. Дуудлагын мэдээллийг татах
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get('/technician/pending-calls');
        if (response.data.success) {
          const foundJob = response.data.data.find((item: any) => item.id.toString() === id);
          if (foundJob) {
            setJob(foundJob);
            if (foundJob.status === 'awaiting_payment') {
              setIsWaitingPayment(true);
            }
          } else {
            Alert.alert("Алдаа", "Энэ дуудлага олдсонгүй.");
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

  useEffect(() => {
    let interval: any;
    if (isWaitingPayment) {
      interval = setInterval(async () => {
        try {
          const response = await api.get('/technician/my-jobs?status=accepted');
          
          if (response.data.success) {
            const confirmedJob = response.data.data.find((item: any) => item.id.toString() === id);
            
            if (confirmedJob) {
              clearInterval(interval);
              setIsWaitingPayment(false);
              
              Alert.alert("Амжилттай", "Иргэн төлбөрөө төлж, дуудлага баталгаажлаа!");
              
              router.replace({
                pathname: '/technician/route-map',
                params: { 
                  id: id, 
                  destLat: confirmedJob.latitude, 
                  destLng: confirmedJob.longitude 
                }
              } as any);
            }
          }
        } catch (error) {
          console.log("Polling error:", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isWaitingPayment, id]);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await api.post(`/technician/calls/${id}/accept`);
      if (response.data.success) {
        setIsWaitingPayment(true);
      }
    } catch (error) {
      Alert.alert("Алдаа", "Ажлыг хүлээн авахад алдаа гарлаа.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#10b981" /></View>;
  if (!job) return null;

  if (isWaitingPayment) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <View style={styles.waitingCard}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <CreditCard size={48} color="#3b82f6" style={{ marginTop: 20 }} />
          <Text style={styles.waitingTitle}>Төлбөр хүлээж байна</Text>
          <Text style={styles.waitingSubtitle}>
            Иргэн дуудлагыг баталгаажуулж 5,000₮ төлөхийг хүлээж байна. Төлбөр төлөгдсөн даруйд таны газрын зураг нээгдэнэ.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ЗУРГИЙН ЗАМЫГ БЭЛДЭХ
  const imageUrl = job.image_path ? `http://192.168.1.4:8000/storage/${job.image_path}` : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Дуудлагын дэлгэрэнгүй</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.typeCard}>
          <View style={styles.typeHeader}>
            <View style={styles.badge}><Text style={styles.badgeText}>{job.service_type || 'ЗАСВАР'}</Text></View>
            <View style={styles.timeRow}>
              <Clock size={16} color="#94a3b8" />
              <Text style={styles.timeText}>{job.created_at ? new Date(job.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Саяхан'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Асуудлын тайлбар</Text>
        <View style={styles.infoCard}>
          <View style={styles.iconBox}><Info size={20} color="#3b82f6" /></View>
          <Text style={styles.infoText}>{job.description}</Text>
        </View>

        {/* ШИНЭЭР НЭМЭГДСЭН ЗУРАГ ХАРУУЛАХ ХЭСЭГ */}
        {imageUrl && (
          <>
            <Text style={styles.sectionTitle}>Хавсаргасан зураг</Text>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.attachedImage} 
              resizeMode="cover" 
            />
          </>
        )}

        <Text style={styles.sectionTitle}>Очих хаяг</Text>
        <View style={styles.infoCard}>
          <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}><MapPin size={20} color="#ef4444" /></View>
          <Text style={styles.infoText}>{job.address}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.declineBtn} onPress={() => router.back()} disabled={isProcessing}>
          <XCircle size={20} color="#ef4444" />
          <Text style={styles.declineBtnText}>Татгалзах</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.acceptBtn, isProcessing && { opacity: 0.7 }]} 
          onPress={handleAccept}
          disabled={isProcessing}
        >
          {isProcessing ? <ActivityIndicator color="#fff" /> : (
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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  typeCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  typeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: '#10b981', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 12, marginLeft: 4 },
  infoCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0', gap: 16, alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  infoText: { flex: 1, fontSize: 15, color: '#1e293b' },
  
  // ЗУРГИЙН СТИЛЬ
  attachedImage: { width: '100%', height: 220, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  
  footer: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 12 },
  declineBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 14, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', gap: 8 },
  declineBtnText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  acceptBtn: { flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 14, backgroundColor: '#10b981', gap: 8 },
  acceptBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  waitingCard: { alignItems: 'center', backgroundColor: '#fff', padding: 30, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, width: '100%' },
  waitingTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 20 },
  waitingSubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 12, lineHeight: 22 },
});