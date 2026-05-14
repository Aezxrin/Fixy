import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Wallet, CreditCard, Landmark, ChevronRight, Check } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../api/client';

export default function PaymentSelectScreen() {
  const { id } = useLocalSearchParams(); // Дуудлагын ID
  const [method, setMethod] = useState('qpay');

  const options = [
    { id: 'qpay', name: 'QPay', icon: <Wallet color="#10b981" />, desc: 'Бүх банкны апп-аар' },
    { id: 'socialpay', name: 'SocialPay', icon: <CreditCard color="#3b82f6" />, desc: 'Голомт банкны апп' },
    { id: 'bank', name: 'Дансаар шилжүүлэх', icon: <Landmark color="#64748b" />, desc: 'Гүйлгээний утгаар шалгах' },
  ];

  const handleConfirm = async () => {
    try {
      const res = await api.post(`/requests/${id}/pay`, {
        payment_method: method
      });

      if (res.data.success) {
        Alert.alert("Амжилттай", "Төлбөр баталгаажлаа.", [
          { text: "ОК", onPress: () => router.replace('/customer/tabs' as any) }
        ]);
      }
    } catch (error) {
      Alert.alert("Алдаа", "Төлбөр хийхэд алдаа гарлаа.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Төлбөр төлөх</Text>
        <Text style={styles.subtitle}>Дуудлагын баталгаажуулах хураамж: 5,000₮</Text>

        <View style={styles.list}>
          {options.map((opt) => (
            <TouchableOpacity 
              key={opt.id} 
              style={[styles.card, method === opt.id && styles.activeCard]}
              onPress={() => setMethod(opt.id)}
            >
              <View style={styles.iconBox}>{opt.icon}</View>
              <View style={styles.info}>
                <Text style={styles.name}>{opt.name}</Text>
                <Text style={styles.desc}>{opt.desc}</Text>
              </View>
              <View style={[styles.radio, method === opt.id && styles.activeRadio]}>
                {method === opt.id && <Check size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleConfirm}>
          <Text style={styles.btnText}>Төлбөр төлөх</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748b', marginBottom: 32 },
  list: { gap: 12 },
  card: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' 
  },
  activeCard: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  desc: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
  activeRadio: { backgroundColor: '#10b981', borderColor: '#10b981' },
  footer: { padding: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  btn: { backgroundColor: '#10b981', padding: 18, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});