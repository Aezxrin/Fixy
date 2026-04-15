import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView, Alert, Platform, ActivityIndicator } from 'react-native';
import { MapPin, Clock, CheckCircle, Camera, ChevronRight } from 'lucide-react-native';
import api from '../../../api/client';
import { useFocusEffect, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function JobsScreen() {
  const [activeTab, setActiveTab] = useState<'accepted' | 'completed'>('accepted');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState<number | null>(null); // Аль ажил дуусаж байгааг хянах

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

  // Камер эсвэл Галерейгаас зураг авах функц
  const handlePickImageAndComplete = async (id: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Эрх шаардлагатай', 'Зургийн санд хандах эрх өгнө үү.');
      return;
    }

    Alert.alert(
      "Ажил дуусгах",
      "Хийж гүйцэтгэсэн ажлынхаа зургийг хавсаргана уу.",
      [
        { text: "Цуцлах", style: "cancel" },
        { 
          text: "Зураг сонгох", 
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.7,
            });

            if (!result.canceled) {
              uploadAndComplete(id, result.assets[0].uri);
            }
          } 
        }
      ]
    );
  };

  // Backend рүү зурагтай хамт илгээх
  const uploadAndComplete = async (id: number, imageUri: string) => {
    setIsFinishing(id);
    try {
      const formData = new FormData();
      
      const filename = imageUri.split('/').pop() || 'finish_job.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // FormData-д зураг нэмэх
      formData.append('completed_image', {
        uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
        name: filename,
        type,
      } as any);

      const response = await api.post(`/technician/calls/${id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        Alert.alert("Амжилттай", "Ажил амжилттай дууслаа!");
        fetchJobs();
      }
    } catch (error) {
      Alert.alert("Алдаа", "Зургийг илгээхэд алдаа гарлаа.");
    } finally {
      setIsFinishing(null);
    }
  };

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/technician/job-details',
        params: { id: item.id }
      } as any)}
      style={styles.activeJobCard}
    >
      <View style={styles.jobHeader}>
        <View style={[styles.jobBadge, activeTab === 'completed' ? styles.badgeGray : styles.badgeGreen]}>
          <Text style={[styles.jobBadgeText, activeTab === 'completed' ? styles.textGray : styles.textGreen]}>
            {item.service_type || 'ЗАСВАР'}
          </Text>
        </View>
        <View style={styles.row}>
          <Clock size={12} color="#94a3b8" /> 
          <Text style={styles.jobTime}> {activeTab === 'completed' ? 'Дууссан' : 'Очиж байна'}</Text>
          <ChevronRight size={16} color="#cbd5e1" style={{marginLeft: 5}} />
        </View>
      </View>
      
      <Text style={styles.jobTitle} numberOfLines={1}>{item.description}</Text>
      <Text style={styles.jobAddress} numberOfLines={2}>{item.address}</Text>
      
      {activeTab === 'accepted' && (
        <View style={styles.jobFooter}>
          <TouchableOpacity 
            style={styles.completeBtn} 
            onPress={() => handlePickImageAndComplete(item.id)}
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
  badgeGreen: { backgroundColor: '#ecfdf5' },
  badgeGray: { backgroundColor: '#f1f5f9' },
  jobBadgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  textGreen: { color: '#10b981' },
  textGray: { color: '#64748b' },
  jobTime: { fontSize: 12, color: '#94a3b8' },
  jobTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  jobAddress: { fontSize: 14, color: '#64748b', marginBottom: 16, lineHeight: 20 },
  jobFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  completeBtn: { backgroundColor: '#10b981', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 14, gap: 10 },
  completeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});