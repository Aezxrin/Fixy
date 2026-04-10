import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Wrench, CheckCircle2, Clock, ChevronRight } from 'lucide-react-native';

// Жишээ Дата (Backend-тэй холбогдтол үүнийг ашиглана)
const MOCK_REQUESTS = [
  { id: 'REQ-001', service: 'Цахилгаан засвар', date: '2026-04-05', status: 'pending', desc: 'Угаалгын өрөөний гэрэл асахгүй байна' },
  { id: 'REQ-002', service: 'Сантехник засвар', date: '2026-04-01', status: 'completed', desc: 'Угаалтуур бөглөрсөн' },
];

export default function RequestsScreen() {
  const [activeTab, setActiveTab] = useState('active');

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceInfo}>
          <View style={[styles.iconBg, item.status === 'completed' ? {backgroundColor: '#f1f5f9'} : {}]}>
            <Wrench size={20} color={item.status === 'completed' ? '#64748b' : '#10b981'} />
          </View>
          <View>
            <Text style={styles.serviceTitle}>{item.service}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, item.status === 'completed' ? styles.statusCompleted : styles.statusPending]}>
          {item.status === 'completed' ? <CheckCircle2 size={12} color="#10b981" /> : <Clock size={12} color="#f59e0b" />}
          <Text style={[styles.statusText, item.status === 'completed' ? {color: '#10b981'} : {color: '#f59e0b'}]}>
            {item.status === 'completed' ? 'Дууссан' : 'Хүлээгдэж буй'}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.descText} numberOfLines={2}>{item.desc}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Миний дуудлагууд</Text>
      </View>

      <FlatList
        data={MOCK_REQUESTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  listContainer: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  serviceInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  dateText: { fontSize: 12, color: '#64748b' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  statusPending: { backgroundColor: '#fef3c7' },
  statusCompleted: { backgroundColor: '#ecfdf5' },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardBody: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  descText: { fontSize: 14, color: '#475569', lineHeight: 20 },
});