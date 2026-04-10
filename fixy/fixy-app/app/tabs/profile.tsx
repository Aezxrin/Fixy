import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { User, Settings, ShieldQuestion, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  
  const handleLogout = () => {
    Alert.alert('Гарах', 'Та системээс гарахдаа итгэлтэй байна уу?', [
      { text: 'Буцах', style: 'cancel' },
      { 
        text: 'Гарах', 
        style: 'destructive',
        onPress: () => {
          // Энд токен устгах код бичигдэнэ
          router.replace('/'); // Буцаад нэвтрэх хуудас руу шиднэ
        }
      }
    ]);
  };

  const MenuItem = ({ icon: Icon, title, isDestructive = false }: any) => (
    <TouchableOpacity style={styles.menuItem}>
      <View style={[styles.menuIcon, isDestructive && { backgroundColor: '#fef2f2' }]}>
        <Icon size={20} color={isDestructive ? '#ef4444' : '#64748b'} />
      </View>
      <Text style={[styles.menuText, isDestructive && { color: '#ef4444' }]}>{title}</Text>
      <ChevronRight size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>Б</Text>
        </View>
        <Text style={styles.name}>Батаа</Text>
        <Text style={styles.phone}>+976 99112233</Text>
      </View>

      <View style={styles.menuContainer}>
        <MenuItem icon={User} title="Хувийн мэдээлэл" />
        <MenuItem icon={Settings} title="Тохиргоо" />
        <MenuItem icon={ShieldQuestion} title="Тусламж" />
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Системээс гарах</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  phone: { fontSize: 14, color: '#64748b' },
  menuContainer: { padding: 16, gap: 8, marginTop: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#1e293b' },
  logoutContainer: { padding: 16, marginTop: 'auto', marginBottom: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, backgroundColor: '#fef2f2', gap: 8 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});