// app/technician/tabs/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Wallet, Star, CheckCircle, Bell, ArrowRight } from 'lucide-react-native';

export default function TechnicianDashboard() {
  // Засварчин ажилд гарахад бэлэн эсэхээ (Online/Offline) тохируулах State
  const [isOnline, setIsOnline] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Толгой хэсэг: Мэндчилгээ болон Онлайн горим */}
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
              onValueChange={setIsOnline}
              trackColor={{ false: '#cbd5e1', true: '#34d399' }}
              thumbColor={isOnline ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* Анхааруулга: Офлайн байвал дуудлага ирэхгүй гэдгийг сануулах */}
        {!isOnline && (
          <View style={styles.offlineWarning}>
            <Bell size={20} color="#f59e0b" />
            <Text style={styles.warningText}>Та одоо офлайн байна. Шинэ дуудлага хүлээж авахын тулд Онлайн горимд шилжинэ үү.</Text>
          </View>
        )}

        {/* Статистик мэдээлэл (Орлого, Ажил, Үнэлгээ) */}
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

        {/* Яг одоо идэвхтэй байгаа ажил (Жишээ) */}
        {isOnline && (
          <>
            <Text style={styles.sectionTitle}>Яг одоо</Text>
            <TouchableOpacity style={styles.activeJobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobBadge}><Text style={styles.jobBadgeText}>САНТЕХНИК</Text></View>
                <Text style={styles.jobTime}>10 мин өмнө</Text>
              </View>
              <Text style={styles.jobTitle}>Паарнаас ус гоожоод байна</Text>
              <Text style={styles.jobAddress} numberOfLines={1}>Дархан-Уул аймаг, ШУТИС-ийн дотуур байр</Text>
              
              <View style={styles.jobFooter}>
                <Text style={styles.jobDistance}>📍 2.5 км зайтай</Text>
                <View style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Дэлгэрэнгүй</Text>
                  <ArrowRight size={16} color="#10b981" />
                </View>
              </View>
            </TouchableOpacity>
          </>
        )}

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

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
  
  // px-ийг paddingHorizontal болгож засав
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginHorizontal: 20 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  
  // w, h-ийг width, height болгож засав
  statIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748b' },

  activeJobCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jobBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  jobBadgeText: { color: '#10b981', fontSize: 10, fontWeight: 'bold' },
  jobTime: { fontSize: 12, color: '#94a3b8' },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  jobAddress: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  jobDistance: { fontSize: 13, fontWeight: '500', color: '#64748b' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#10b981' }
});