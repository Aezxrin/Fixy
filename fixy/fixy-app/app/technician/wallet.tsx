import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, 
  RefreshControl, Platform, Alert, Modal, TextInput, ActivityIndicator, Image 
} from 'react-native';
import { ArrowLeft, Wallet, Banknote, History, X, CheckCircle2 } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import api from '../../api/client';

export default function TechnicianWallet() {
  const [balance, setBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [accountNo, setAccountNo] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(false);
  
  interface Transaction {
  id: number;
  amount: number;
  bank_name: string;
  status: string;
  created_at: string;
}
  // Банкны жагсаалт (Qpay, SocialPay, Бэлэн мөнгийг хассан)
  const banks = [
    { id: 'Хаан банк', logo: require('../../assets/images/khanbank.png') },
    { id: 'Хас банк', logo: require('../../assets/images/xacbank.png') },
    { id: 'Голомт банк', logo: require('../../assets/images/golomtbank.png') },
    { id: 'М банк', logo: require('../../assets/images/mbank.jpg') },
  ];

  const fetchWallet = async () => {
    try {
      const res = await api.get('/me');
      setBalance(res.data.user?.balance || 0);
    } catch (e) { console.error(e); } finally { setRefreshing(false); }
  };

  
  useFocusEffect(useCallback(() => { fetchWallet(); }, []));

  const handleWithdrawRequest = async () => {
    if (!amount || !selectedBank || !accountNo || !accountHolder) {
      Alert.alert("Анхаар", "Бүх мэдээллийг бүрэн оруулна уу.");
      return;
    }
    if (Number(amount) > balance) {
      Alert.alert("Алдаа", "Үлдэгдэл хүрэлцэхгүй байна.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/technician/withdraw-request', {
        amount: Number(amount),
        bank_name: selectedBank,
        account_number: accountNo,
        account_holder: accountHolder
      });

      if (response.data.success) {
        Alert.alert("Амжилттай", "Таны хүсэлт илгээгдлээ.");
        setShowModal(false);
        setAmount(''); setSelectedBank(null); setAccountNo(''); setAccountHolder('');
        fetchWallet();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || JSON.stringify(error.response?.data) || error.message;
      Alert.alert("Алдаа", `Серверийн хариу: ${errorMessage}`);
    } finally { setLoading(false); }
  };  
    const [history, setHistory] = useState<Transaction[]>([]);

      const fetchHistory = async () => {
        try {
          const res = await api.get('/technician/withdraw-history');
          if (res.data.success) {
            setHistory(res.data.data);
          }
        } catch (err) {
          console.error("Түүх татахад алдаа гарлаа", err);
        }
      };
      useEffect(() => {
      fetchHistory();
    }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Миний хэтэвч</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWallet(); }} />}
      >
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Wallet color="rgba(255,255,255,0.7)" size={20} />
            <Text style={styles.balanceLabel}>Боломжит үлдэгдэл</Text>
          </View>
          <Text style={styles.amountText}>{Number(balance).toLocaleString()} ₮</Text>
          <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowModal(true)}>
            <Banknote size={20} color="#10b981" />
            <Text style={styles.withdrawText}>Данс руу татах</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Хүлээгдэж буй (Pending) гүйлгээнүүд */}
      <Text style={styles.sectionTitle}>Хүлээгдэж буй</Text>
      {history.filter(item => item.status === 'pending').length > 0 ? (
        history.filter(item => item.status === 'pending').map((item: any) => (
          <View key={item.id} style={{ 
            padding: 15, 
            backgroundColor: '#fffbe6', 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#ffe58f',
            marginBottom: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <View>
              <Text style={{ fontWeight: '600' }}>{Number(item.amount).toLocaleString()} ₮</Text>
              <Text style={{ fontSize: 12, color: '#854d0e' }}>Хяналтад байна...</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#a16207' }}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Одоогоор хүлээгдэж буй гүйлгээ байхгүй.</Text>
        </View>
      )}

      {/* 2. Гүйлгээний түүх (Бүх түүх) */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Гүйлгээний түүх</Text>
        {history.length > 0 ? (
          history.map((item: any) => (
            <View key={item.id} style={{ 
              padding: 15, 
              backgroundColor: '#fff', 
              borderBottomWidth: 1, 
              borderBottomColor: '#eee',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View>
                <Text style={{ fontWeight: '600' }}>Мөнгө таталт ({item.bank_name})</Text>
                <Text style={{ fontSize: 12, color: '#888' }}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: 'bold', color: '#e74c3c' }}>-{Number(item.amount).toLocaleString()} ₮</Text>
                <Text style={{ 
                  fontSize: 10, 
                  color: item.status === 'approved' ? '#2ecc71' : '#f1c40f',
                  textTransform: 'uppercase'
                }}>
                  {item.status === 'approved' ? 'Батлагдсан' : 'Хүлээгдэж буй'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 20 }}>Одоогоор гүйлгээний түүх байхгүй байна.</Text>
        )}
      </View>
      </ScrollView>

      {/* Мөнгө татах Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Мөнгө татах хүсэлт</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><X size={24} color="#64748b" /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={styles.label}>Татах дүн (₮)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="0" 
                keyboardType="numeric" 
                value={amount} 
                onChangeText={setAmount} 
              />

              <Text style={styles.label}>Банк сонгох</Text>
              <View style={styles.bankGrid}>
                {banks.map((bank) => (
                  <TouchableOpacity 
                    key={bank.id} 
                    style={[styles.bankItem, selectedBank === bank.id && styles.selectedBankItem]}
                    onPress={() => setSelectedBank(bank.id)}
                  >
                    <Image source={bank.logo} style={styles.bankLogo} />
                    <Text style={styles.bankName} numberOfLines={1}>{bank.id}</Text>
                    {selectedBank === bank.id && (
                      <View style={styles.checkIcon}><CheckCircle2 size={16} color="#10b981" /></View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Дансны дугаар</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={accountNo} onChangeText={setAccountNo} />

              <Text style={styles.label}>Хүлээн авагчийн нэр</Text>
              <TextInput style={styles.input} value={accountHolder} onChangeText={setAccountHolder} />

              <TouchableOpacity style={styles.submitBtn} onPress={handleWithdrawRequest} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Хүсэлт илгээх</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 40 : 16 },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  content: { padding: 20 },
  balanceCard: { backgroundColor: '#10b981', padding: 24, borderRadius: 24, marginBottom: 30 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  balanceLabel: { color: '#fff', opacity: 0.8, fontSize: 14 },
  amountText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  withdrawBtn: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16, gap: 8 },
  withdrawText: { color: '#10b981', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  emptyBox: { padding: 50, alignItems: 'center', gap: 10 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 14, color: '#64748b', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16 },
  
  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  bankItem: { width: '31%', backgroundColor: '#f8fafc', padding: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', position: 'relative' },
  selectedBankItem: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
  bankLogo: { width: 40, height: 40, borderRadius: 8, marginBottom: 6 },
  bankName: { fontSize: 10, fontWeight: '600', color: '#475569' },
  checkIcon: { position: 'absolute', top: 5, right: 5 },
  
  submitBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});