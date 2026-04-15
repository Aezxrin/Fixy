import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView, Alert } from 'react-native';
import { MapPin, Clock, CheckCircle } from 'lucide-react-native';
import api from '../../../api/client';
import { useFocusEffect } from 'expo-router';

export default function JobsScreen() {
  const [activeTab, setActiveTab] = useState<'accepted' | 'completed'>('accepted');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Танай Backend-д 'status' параметрээр шүүдэг тохиргоо байгаа гэж үзэв
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

  const handleComplete = (id: number) => {
    Alert.alert("Ажил дуусгах", "Та энэ ажлыг бүрэн хийж дуусгасан уу?", [
      { text: "Үгүй", style: "cancel" },
      { 
        text: "Тийм", 
        onPress: async () => {
          try {
            const response = await api.post(`/technician/calls/${id}/complete`);
            if (response.data.success) {
              fetchJobs(); 
            }
          } catch (error) {
            Alert.alert("Алдаа", "Алдаа гарлаа.");
          }
        } 
      }
    ]);
  };

  const renderJobItem = ({ item }: { item: any }) => (
    <View style={styles.activeJobCard}>
      <View style={styles.jobHeader}>
        <View style={[styles.jobBadge, activeTab === 'completed' ? styles.badgeGray : styles.badgeGreen]}>
          <Text style={[styles.jobBadgeText, activeTab === 'completed' ? styles.textGray : styles.textGreen]}>
            {item.service_type || 'ЗАСВАР'}
          </Text>
        </View>
        <Text style={styles.jobTime}>
          <Clock size={12} color="#94a3b8" /> {activeTab === 'completed' ? 'Дууссан' : 'Очиж байна'}
        </Text>
      </View>
      
      <Text style={styles.jobTitle} numberOfLines={1}>{item.description}</Text>
      <Text style={styles.jobAddress} numberOfLines={2}>{item.address}</Text>
      
      {activeTab === 'accepted' && (
        <View style={styles.jobFooter}>
          <TouchableOpacity style={styles.completeBtn} onPress={() => handleComplete(item.id)}>
            <CheckCircle size={18} color="white" />
            <Text style={styles.completeBtnText}>Ажлыг дуусгах</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Ажлын жагсаалт</Text>
        
        {/* Toggle Buttons */}
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
  headerContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#0f172a' },
  
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginTop: 20 },
  emptyText: { color: '#94a3b8', fontSize: 14 },

  // Нүүр хуудастай адилхан Картын дизайн
  activeJobCard: { backgroundColor: '#fff', marginTop: 15, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jobBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeGreen: { backgroundColor: '#ecfdf5' },
  badgeGray: { backgroundColor: '#f1f5f9' },
  jobBadgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  textGreen: { color: '#10b981' },
  textGray: { color: '#64748b' },
  jobTime: { fontSize: 12, color: '#94a3b8', flexDirection: 'row', alignItems: 'center' },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  jobAddress: { fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 18 },
  
  jobFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16, marginTop: 4 },
  completeBtn: { backgroundColor: '#0f172a', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  completeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});