import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, Modal, Pressable } from 'react-native';
import { Wallet, Star, CheckCircle, Bell, ArrowRight, User, X, AlertTriangle, Info } from 'lucide-react-native'; 
import api from '../../../api/client';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';

export default function TechnicianDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // --- ШИНЭ: МЭДЭГДЛИЙН STATE-УУД ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const [stats, setStats] = useState({
    income: 0,
    completed: 0,
    rating: 0.0
  });

  // --- ШИНЭ: МЭДЭГДЭЛ ТАТАХ ФУНКЦ ---
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        const unread = res.data.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.log("Мэдэгдэл татахад алдаа:", error);
    }
  };

  // --- ШИНЭ: МЭДЭГДЭЛ УНШСАН БОЛГОХ ---
  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.log("Уншсан төлөвт оруулахад алдаа:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      fetchNotifications(); // Мэдэгдлийг давхар татна
      
      const userRes = await api.get('/me');
      let currentDutyStatus = false;
      
      if (userRes.data) {
        const userData = userRes.data.user || userRes.data;
        setUser(userData);
        currentDutyStatus = userData?.is_on_duty === true || userData?.is_on_duty === 1;
        setIsOnline(currentDutyStatus);
        
        setStats(prev => ({
          ...prev,
          income: userData?.balance || 0
        }));
      }

      const statsRes = await api.get('/technician/stats');
      if (statsRes.data.success) {
        setStats(prev => ({
          ...prev,
          completed: statsRes.data.data.completed,
          rating: statsRes.data.data.rating,
          income: userRes.data.user?.balance || statsRes.data.data.income 
        }));
      }

      if (currentDutyStatus) {
        const jobsRes = await api.get('/technician/pending-calls');
        if (jobsRes.data.success) {
          setPendingJobs(jobsRes.data.data);
        }
      } else {
        setPendingJobs([]);
      }
    } catch (error) {
      console.error("Мэдээлэл татахад алдаа:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const toggleDuty = async (newValue: boolean) => {
    if (newValue && user?.contract_status !== 'approved') {
      Alert.alert(
        "Эрх хязгаарлагдсан", 
        "Та дуудлага хүлээж авахын тулд эхлээд Цахим гэрээтэй танилцаж, гарын үсэг зурах шаардлагатай.",
        [
          { text: "Болих", style: "cancel" },
          { text: "Гэрээ рүү очих", onPress: () => router.push('/technician/contract' as any) }
        ]
      );
      return; 
    }

    setIsOnline(newValue);

    try {
      let currentLat = null;
      let currentLon = null;

      if (newValue) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setIsOnline(false);
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
        const serverStatus = response.data.is_on_duty === true || response.data.is_on_duty === 1;
        setIsOnline(serverStatus);
        
        if (!serverStatus) {
           setPendingJobs([]); 
        } else {
           fetchData();
        }
      } else {
        setIsOnline(!newValue);
      }
    } catch (error) {
      setIsOnline(!newValue);
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.name}>{user?.name || 'Засварчин'} 👋</Text>
              
              {/* --- ШИНЭ: МЭДЭГДЛИЙН ХОНХ --- */}
              <TouchableOpacity 
                style={styles.bellButton} 
                onPress={() => setShowNotifModal(true)}
              >
                <Bell size={22} color="#475569" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.onlineToggle}>
            <Text style={[styles.toggleText, isOnline ? {color: '#10b981'} : {color: '#94a3b8'}]}>
              {isOnline ? 'ОНЛАЙН' : 'ОФЛАЙН'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleDuty}
              trackColor={{ false: '#cbd5e1', true: '#34d399' }}
              thumbColor={'#fff'}
            />
          </View>
        </View>

        {!isOnline && (
          <View style={styles.offlineWarning}>
            <Bell size={20} color="#f59e0b" />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningText}>Та одоо офлайн байна.</Text>
              {user?.contract_status !== 'approved' && (
                <Text style={{ fontSize: 12, color: '#b45309', marginTop: 4 }}>
                  Сануулга: Цахим гэрээ батлагдах хүртэл онлайн горимд шилжих боломжгүй.
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Статистик */}
        <Text style={styles.sectionTitle}>Таны үзүүлэлт</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#ecfdf5' }]}
            onPress={() => router.push('/technician/wallet' as any)}
          >
            <View style={styles.statIconBg}><Wallet size={20} color="#10b981" /></View>
            <Text style={styles.statValue}>{Number(stats.income).toLocaleString()}₮</Text>
            <Text style={styles.statLabel}>Миний хэтэвч</Text>
          </TouchableOpacity>

          <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
            <View style={[styles.statIconBg, { backgroundColor: '#dbeafe' }]}><CheckCircle size={20} color="#3b82f6" /></View>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Гүйцэтгэсэн</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
          <View style={[styles.statIconBg, { backgroundColor: '#fef3c7' }]}>
            <Star size={20} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>
            {Number(stats.rating || 0).toFixed(1)}
          </Text>
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
                  onPress={() => router.push(`/technician/request-details?id=${job.id}` as any)}
                >
                  <View style={styles.jobHeader}>
                    <View style={styles.jobBadge}><Text style={styles.jobBadgeText}>{job.service_type || 'ЗАСВАР'}</Text></View>
                    <Text style={styles.jobTime}>Шинэ</Text>
                  </View>

                  <View style={styles.customerRow}>
                    <User size={14} color="#64748b" />
                    <Text style={styles.customerName}>
                      {job.customer?.name ? `Үйлчлүүлэгч: ${job.customer.name}` : 'Үйлчлүүлэгч: Тодорхойгүй'}
                    </Text>
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

      {/* --- ШИНЭ: МЭДЭГДЛИЙН МОДАЛ --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNotifModal}
        onRequestClose={() => setShowNotifModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Мэдэгдлүүд</Text>
              <Pressable onPress={() => setShowNotifModal(false)} style={styles.closeBtn}>
                <X size={24} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView style={styles.notifList} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotif}>
                  <Bell size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
                  <Text style={{ color: '#94a3b8' }}>Одоогоор танд ирсэн мэдэгдэл алга.</Text>
                </View>
              ) : (
                notifications.map((notif: any) => {
                  const isWarning = notif.type === 'warning';
                  return (
                    <TouchableOpacity 
                      key={notif.id} 
                      style={[styles.notifCard, !notif.is_read && styles.notifUnread]}
                      onPress={() => {
                        if (!notif.is_read) markAsRead(notif.id);
                      }}
                    >
                      <View style={styles.notifIcon}>
                        {isWarning ? <AlertTriangle size={20} color="#ef4444" /> : <Info size={20} color="#3b82f6" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[styles.notifTitle, isWarning && { color: '#ef4444' }]}>{notif.title}</Text>
                          {!notif.is_read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notifDesc}>{notif.desc || notif.message}</Text>
                        <Text style={styles.notifTime}>{new Date(notif.created_at).toLocaleString('mn-MN')}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  greeting: { fontSize: 14, color: '#64748b', marginBottom: 4 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  
  // ХОНХНЫ СТИЛЬ
  bellButton: { position: 'relative', padding: 6, backgroundColor: '#f1f5f9', borderRadius: 20 },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  onlineToggle: { alignItems: 'center' },
  toggleText: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
  
  offlineWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', padding: 16, margin: 20, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#fde68a' },
  warningText: { fontSize: 13, color: '#b45309', fontWeight: 'bold' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginHorizontal: 20, marginBottom: 12, marginTop: 10 },
  
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  statIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#64748b', textAlign: 'center' },

  emptyCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { color: '#94a3b8', fontSize: 14 },

  activeJobCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jobBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  jobBadgeText: { color: '#10b981', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  jobTime: { fontSize: 12, color: '#94a3b8' },
  
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  customerName: { fontSize: 13, fontWeight: '600', color: '#475569' },

  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  jobAddress: { fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 18 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  jobDistance: { fontSize: 13, fontWeight: '500', color: '#64748b' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#10b981' },

  // МОДАЛЫН СТИЛЬ
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#f8fafc', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  closeBtn: { padding: 4 },
  notifList: { padding: 20 },
  emptyNotif: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  
  notifCard: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  notifUnread: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  notifIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  notifDesc: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 8 },
  notifTime: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }
});