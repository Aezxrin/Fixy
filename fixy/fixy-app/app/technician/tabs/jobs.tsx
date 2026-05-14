import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, 
  SafeAreaView, Alert, Platform, ActivityIndicator, Modal, TextInput // ШИНЭ: Modal болон TextInput нэмсэн
} from 'react-native';
import { Clock, Camera, ChevronRight, User } from 'lucide-react-native';
import api from '../../../api/client';
import { useFocusEffect, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function JobsScreen() {
  const [activeTab, setActiveTab] = useState<'accepted' | 'completed'>('accepted');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState<number | null>(null);
  
  // ШИНЭЭР НЭМСЭН STATE-ҮҮД:
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [finishJobId, setFinishJobId] = useState<number | null>(null);
  const [repairPrice, setRepairPrice] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/technician/my-jobs?status=${activeTab}`);
      if (response.data.success) {
        setJobs(response.data.data);
      }
    } catch (error) {
      console.error("Ажил татахад алдаа:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [activeTab])
  );

  // 1. Дуусгах товч дарах үед Үнэ оруулах цонх нээх
  const openFinishModal = (id: number) => {
    setFinishJobId(id);
    setRepairPrice(''); // Өмнөх үнийг цэвэрлэх
    setShowPriceModal(true);
  };

  // 2. Үнээ бичээд "Зураг хавсаргаж илгээх" дарах үед
  const handlePickImageAndComplete = async () => {
    if (!repairPrice || Number(repairPrice) <= 0) {
      Alert.alert("Анхаар", "Засварын хөлсийг зөв оруулна уу.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Эрх шаардлагатай', 'Зургийн санд хандах эрх өгнө үү.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setShowPriceModal(false); // Modal-ийг хаах
      uploadAndComplete(finishJobId!, result.assets[0].uri, repairPrice);
    }
  };

  // ЗАСВАР: price гэдэг утгыг гаднаас хүлээж авдаг болголоо
  const uploadAndComplete = async (id: number, imageUri: string, price: string) => {
    setIsFinishing(id);
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'finish_job.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('completed_image', {
        uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
        name: filename,
        type,
      } as any);
      
      // Засварчны оруулсан үнийг баканд руу илгээх
      formData.append('price', price);

      const response = await api.post(`/technician/calls/${id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        Alert.alert("Амжилттай", "Нэхэмжлэх илгээгдлээ. Иргэн төлбөр төлөхийг хүлээнэ үү.");
        fetchJobs();
      }
    } catch (error) {
      Alert.alert("Алдаа", "Мэдээллийг илгээхэд алдаа гарлаа.");
    } finally {
      setIsFinishing(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'accepted': return { label: 'Замдаа', color: '#3b82f6', bg: '#dbeafe' };
      case 'on_the_way': return { label: 'Очсон', color: '#8b5cf6', bg: '#f5f3ff' };
      case 'waiting_final_payment': return { label: 'Төлбөр хүлээгдэж буй', color: '#f59e0b', bg: '#fef3c7' };
      case 'completed': return { label: 'Дууссан', color: '#10b981', bg: '#ecfdf5' };
      default: return { label: 'ЗАСВАР', color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const renderJobItem = ({ item }: { item: any }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => router.push({
          pathname: '/technician/job-details',
          params: { id: item.id }
        } as any)}
        style={styles.activeJobCard}
      >
        <View style={styles.jobHeader}>
          <View style={[styles.jobBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.jobBadgeText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
          <View style={styles.row}>
            <Clock size={12} color="#94a3b8" /> 
            <Text style={styles.jobTime}> {item.service_type || 'Засвар'}</Text>
            <ChevronRight size={16} color="#cbd5e1" style={{marginLeft: 5}} />
          </View>
        </View>

        <View style={styles.customerRow}>
          <User size={14} color="#64748b" />
          <Text style={styles.customerName}>
            {item.customer?.name || 'Үйлчлүүлэгч: Тодорхойгүй'}
          </Text>
        </View>
        
        <Text style={styles.jobTitle} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.jobAddress} numberOfLines={2}>{item.address}</Text>
        
        {(item.status === 'accepted' || item.status === 'on_the_way') && activeTab === 'accepted' && (
          <View style={styles.jobFooter}>
            <TouchableOpacity 
              style={styles.completeBtn} 
              onPress={() => openFinishModal(item.id)} // ЗАСВАР: Модал дууддаг болгосон
              disabled={isFinishing === item.id}
            >
              {isFinishing === item.id ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Camera size={18} color="white" />
                  <Text style={styles.completeBtnText}>Зураг авч дуусгах</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Миний ажлууд</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'accepted' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('accepted')}
          >
            <Text style={[styles.tabText, activeTab === 'accepted' && styles.activeTabText]}>Хийгдэж буй</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'completed' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Дууссан</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {jobs.length === 0 && !loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Одоогоор {activeTab === 'accepted' ? 'хийгдэж буй' : 'дууссан'} ажил алга.</Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderJobItem}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchJobs} />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* ШИНЭЭР НЭМЭГДСЭН: Үнэ оруулах Modal цонх */}
      <Modal visible={showPriceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentSheet}>
            <Text style={styles.sheetTitle}>Нэхэмжлэх үүсгэх</Text>
            <Text style={{textAlign: 'center', color: '#64748b', marginBottom: 20}}>
              Та ажлынхаа нийт хөлсийг оруулж зургаар баталгаажуулна уу.
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 }}>
                Засварын нийт хөлс (₮):
              </Text>
              <TextInput 
                style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, fontSize: 24, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', borderWidth: 1, borderColor: '#e2e8f0' }}
                keyboardType="numeric"
                value={repairPrice}
                onChangeText={setRepairPrice}
                placeholder="Жишээ нь: 45000"
              />
            </View>
            
            <TouchableOpacity 
              style={{ backgroundColor: '#10b981', padding: 16, borderRadius: 16, alignItems: 'center' }} 
              onPress={handlePickImageAndComplete}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                Зураг хавсаргаж нэхэмжлэх
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={{ marginTop: 15, paddingVertical: 10, alignItems: 'center' }} onPress={() => setShowPriceModal(false)}>
              <Text style={{ fontSize: 16, color: '#ef4444', fontWeight: '600' }}>Болих</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontWeight: '600', color: '#64748b', fontSize: 13 },
  activeTabText: { color: '#0f172a' },
  row: { flexDirection: 'row', alignItems: 'center' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginTop: 20 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  activeJobCard: { backgroundColor: '#fff', marginTop: 15, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jobBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  jobBadgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  jobTime: { fontSize: 12, color: '#94a3b8' },
  
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  customerName: { fontSize: 13, fontWeight: '600', color: '#475569' },

  jobTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  jobAddress: { fontSize: 14, color: '#64748b', marginBottom: 16, lineHeight: 20 },
  jobFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  completeBtn: { backgroundColor: '#10b981', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 14, gap: 10 },
  completeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Модалын стилүүд
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  paymentSheet: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'android' ? 40 : 60 },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 8 },
});