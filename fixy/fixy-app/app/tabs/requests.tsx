import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Image, Alert, Modal, TextInput, Platform 
} from 'react-native';
import { 
  Wrench, CheckCircle2, Clock, User, XCircle, ChevronRight, 
  MapPin, CreditCard, Calculator, Star // ШИНЭ: Star icon нэмсэн
} from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import api from '../../api/client';

export default function RequestsScreen() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<'fee' | 'final'>('fee'); 
  const [inputAmount, setInputAmount] = useState('0'); 
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  // ШИНЭЭР НЭМСЭН: Үнэлгээний State-үүд
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewCall, setReviewCall] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const paymentMethods = [
    { id: 'qpay', name: 'QPay', logo: require('../../assets/images/qpay.png') },
    { id: 'socialpay', name: 'SocialPay', logo: require('../../assets/images/socialpay.png') },
    { id: 'khanbank', name: 'Хаан Банк', logo: require('../../assets/images/khanbank.png') },
    { id: 'xacbank', name: 'Хасбанк', logo: require('../../assets/images/xacbank.png') },
    { id: 'golomt', name: 'Голомт Банк', logo: require('../../assets/images/golomtbank.png') },
    { id: 'mbank', name: 'М Банк', logo: require('../../assets/images/mbank.jpg') }, 
    { id: 'cash', name: 'Бэлнээр өгөх', logo: require('../../assets/images/cash.png') }, 
  ];

  const fetchMyCalls = async () => {
    try {
      const response = await api.get('/customer/my-calls');
      if (response.data.success) {
        setCalls(response.data.data);
      }
    } catch (error) {
      console.error('Дуудлага татахад алдаа:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyCalls();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyCalls();
  };

  const handleOpenPayment = (call: any, type: 'fee' | 'final') => {
    setSelectedCall(call);
    setPaymentType(type);
    setInputAmount(type === 'fee' ? '5000' : (call.repair_fee?.toString() || ''));
    setSelectedBank(null); 
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedBank) return Alert.alert("Анхаар", "Төлбөр төлөх банк эсвэл хэтэвчээ сонгоно уу.");
    
    // Бэлнээр төлөх үеийн логик
    if (selectedBank === 'cash') {
       setShowPaymentModal(false);
       Alert.alert(
         "Бэлнээр төлөх", 
         "Та төлбөрөө засварчинд бэлнээр өгнө үү. Засварчин мөнгөө хүлээж авснаар дуудлага албан ёсоор дуусах болно."
       );
       return;
    }

    if (!inputAmount || Number(inputAmount) <= 0) return Alert.alert("Анхаар", "Төлбөрийн дүнг зөв оруулна уу.");

    setIsPaying(true);
    try {
      const endpoint = paymentType === 'fee' 
        ? `/calls/${selectedCall.id}/pay` 
        : `/calls/${selectedCall.id}/finalize-payment`;

      const response = await api.post(endpoint, { 
        payment_method: selectedBank,
        amount: inputAmount 
      });

      if (response.data.success) {
        setShowPaymentModal(false);
        Alert.alert("Амжилттай", "Төлбөр төлөгдлөө.");
        fetchMyCalls();
      }
    } catch (error) {
      Alert.alert("Алдаа", "Төлбөр баталгаажуулахад алдаа гарлаа.");
    } finally {
      setIsPaying(false);
    }
  };

  // ШИНЭЭР НЭМСЭН: Үнэлгээний цонх нээх болон илгээх
  const openReviewModal = (call: any) => {
    setReviewCall(call);
    setRating(0);
    setReviewText('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (rating === 0) return Alert.alert('Анхаар', 'Та үнэлгээгээ одоор сонгоно уу.');
    
    setIsSubmittingReview(true);
    try {
      const res = await api.post(`/calls/${reviewCall.id}/review`, { 
        rating: rating, 
        review: reviewText 
      });
      if (res.data.success) {
        Alert.alert('Баярлалаа', res.data.message);
        setShowReviewModal(false);
        fetchMyCalls(); // Үнэлгээ өгсний дараа жагсаалтыг шинэчлэх
      }
    } catch (error: any) {
      const serverErrorMsg = error.response?.data?.message || "Үнэлгээ илгээхэд алдаа гарлаа.";
      Alert.alert("Алдаа", serverErrorMsg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCancelRequest = (call: any) => {
    let message = "Та дуудлагыг цуцлахдаа итгэлтэй байна уу?";
    if (call.status === 'on_the_way') {
      message = "Засварчин хэдийн замдаа гарсан байна. Одоо цуцалбал таны төлсөн 5,000₮ буцаагдахгүй бөгөөд засварчны замын зардалд суутгагдахыг анхаарна уу!";
    }

    Alert.alert(
      "Дуудлага цуцлах",
      message,
      [
        { text: "Болих", style: "cancel" },
        { 
          text: "Тийм, цуцал", 
          style: "destructive", 
          onPress: async () => {
            try {
              const res = await api.post(`/calls/${call.id}/cancel`);
              if (res.data.success) {
                Alert.alert("Мэдэгдэл", res.data.message);
                fetchMyCalls();
              }
            } catch (error: any) {
              const serverErrorMsg = error.response?.data?.message || "Сүлжээний холболт эсвэл серверт алдаа гарлаа.";
              Alert.alert("Дэлгэрэнгүй алдаа", serverErrorMsg);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Хүлээгдэж буй', color: '#f59e0b', bgColor: '#fef3c7', Icon: Clock };
      case 'awaiting_payment': return { label: 'Төлбөр хүлээгдэж буй', color: '#8b5cf6', bgColor: '#f5f3ff', Icon: CreditCard };
      case 'accepted': return { label: 'Засварчин ирж яваа', color: '#3b82f6', bgColor: '#dbeafe', Icon: User };
      case 'on_the_way': return { label: 'Засварчин замдаа', color: '#3b82f6', bgColor: '#dbeafe', Icon: User };
      case 'waiting_final_payment': return { label: 'Нэхэмжлэх ирсэн', color: '#10b981', bgColor: '#ecfdf5', Icon: Calculator };
      case 'completed': return { label: 'Дууссан', color: '#10b981', bgColor: '#ecfdf5', Icon: CheckCircle2 };
      case 'rejected': case 'cancelled': return { label: 'Цуцлагдсан', color: '#ef4444', bgColor: '#fee2e2', Icon: XCircle };
      default: return { label: 'Тодорхойгүй', color: '#64748b', bgColor: '#f1f5f9', Icon: Clock };
    }
  };

  const renderItem = ({ item }: any) => {
    const config = getStatusConfig(item.status);
    const StatusIcon = config.Icon;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
            <View style={[styles.iconBg, { backgroundColor: config.bgColor }]}>
              <Wrench size={20} color={config.color} />
            </View>
            <View>
              <Text style={styles.serviceTitle}>{item.service_type || 'Засвар'}</Text>
              <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            <StatusIcon size={12} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
          <View style={styles.addressRow}>
            <MapPin size={14} color="#94a3b8" />
            <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>

        {item.status === 'awaiting_payment' && (
          <TouchableOpacity style={styles.payButton} onPress={() => handleOpenPayment(item, 'fee')} disabled={isPaying}>
            <CreditCard size={18} color="#fff" />
            <Text style={styles.payButtonText}>Баталгаажуулах төлбөр (5,000₮)</Text>
          </TouchableOpacity>
        )}

        {item.status === 'waiting_final_payment' && (
          <TouchableOpacity style={[styles.payButton, { backgroundColor: '#10b981' }]} onPress={() => handleOpenPayment(item, 'final')} disabled={isPaying}>
            <Calculator size={18} color="#fff" />
            <Text style={styles.payButtonText}>Нэхэмжлэх төлөх ({Number(item.repair_fee).toLocaleString()}₮)</Text>
          </TouchableOpacity>
        )}

        {/* ШИНЭЭР НЭМСЭН: Үнэлгээ өгөх товч болон Үнэлгээний харагдац */}
        {item.status === 'completed' && !item.rating && (
          <TouchableOpacity style={styles.reviewButton} onPress={() => openReviewModal(item)}>
            <Star size={16} color="#f59e0b" />
            <Text style={styles.reviewButtonText}>Үнэлгээ өгөх</Text>
          </TouchableOpacity>
        )}

        {item.status === 'completed' && item.rating && (
          <View style={styles.ratedContainer}>
            <View style={{flexDirection: 'row'}}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={14} 
                  color={star <= item.rating ? "#f59e0b" : "#cbd5e1"} 
                  fill={star <= item.rating ? "#f59e0b" : "transparent"} 
                />
              ))}
            </View>
            <Text style={styles.ratedText}>Таны үнэлгээ</Text>
          </View>
        )}

        {(item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'rejected') && (
           <TouchableOpacity style={{marginTop: 10, alignSelf: 'center'}} onPress={() => handleCancelRequest(item)}>
             <Text style={{color: '#ef4444', fontSize: 13}}>Захиалга цуцлах</Text>
           </TouchableOpacity>
        )}

        {item.technician && (
          <View style={styles.technicianSection}>
            <View style={styles.technicianInfo}>
              <View style={[styles.techAvatar, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                 <User size={16} color="#94a3b8" />
              </View>
              <View>
                <Text style={styles.techLabel}>Хариуцсан засварчин:</Text>
                <Text style={styles.techName}>{item.technician.name}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Миний дуудлагууд</Text>
      </View>

      <FlatList
        data={calls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
        ListEmptyComponent={!loading ? <Text style={{textAlign:'center', marginTop: 20, color:'#94a3b8'}}>Дуудлага олдсонгүй</Text> : null}
      />

      {/* Төлбөрийн цонх */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentSheet}>
            <Text style={styles.sheetTitle}>Төлбөр төлөх</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Төлөх дүн (₮):</Text>
              <TextInput 
                style={styles.amountInput}
                keyboardType="numeric"
                value={inputAmount}
                onChangeText={setInputAmount}
                editable={paymentType === 'final'} 
                selectTextOnFocus={true}
              />
            </View>
            
            <Text style={styles.inputLabel}>Төлбөрийн хэрэгсэл сонгох:</Text>
            
            {isPaying ? (
              <View style={{padding: 40}}><ActivityIndicator size="large" color="#10b981" /></View>
            ) : (
              <View>
                <View style={styles.bankGrid}>
                  {paymentMethods.map((method) => {
                    if (paymentType === 'fee' && method.id === 'cash') return null;

                    return (
                      <TouchableOpacity 
                        key={method.id} 
                        style={[
                          styles.bankCard, 
                          selectedBank === method.id && styles.bankCardSelected
                        ]}
                        onPress={() => setSelectedBank(method.id)}
                      >
                        <Image source={method.logo} style={styles.bankLogo} resizeMode="contain" />
                        <Text style={[
                          styles.bankName, 
                          selectedBank === method.id && { color: '#10b981', fontWeight: 'bold' }
                        ]}>
                          {method.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity 
                  style={[styles.confirmPayBtn, !selectedBank && { backgroundColor: '#cbd5e1' }]} 
                  onPress={processPayment}
                  disabled={!selectedBank || isPaying}
                >
                  <Text style={styles.confirmPayBtnText}>
                    {Number(inputAmount).toLocaleString()} ₮ Төлөх
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.cancelBtnText}>Болих</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ШИНЭЭР НЭМСЭН: Үнэлгээ өгөх Modal */}
      <Modal visible={showReviewModal} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={styles.reviewBox}>
            <Text style={styles.sheetTitle}>Сэтгэгдэл үлдээх</Text>
            <Text style={{textAlign: 'center', color: '#64748b', marginBottom: 20}}>
              Засварчны үйлчилгээ танд хэр санагдсан бэ?
            </Text>

            {/* Одоор үнэлэх */}
            <View style={{flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20}}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star 
                    size={40} 
                    color={star <= rating ? "#f59e0b" : "#e2e8f0"} 
                    fill={star <= rating ? "#f59e0b" : "transparent"} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Санал гомдол бичих */}
            <TextInput 
              style={styles.reviewInput}
              placeholder="Санал гомдол болон сэтгэгдлээ энд бичнэ үү (Сонголттой)"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity 
              style={[styles.confirmPayBtn, {marginTop: 10}]} 
              onPress={submitReview}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                 <ActivityIndicator color="#fff" />
              ) : (
                 <Text style={styles.confirmPayBtnText}>Үнэлгээ илгээх</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReviewModal(false)}>
              <Text style={styles.cancelBtnText}>Болих</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  listContainer: { padding: 16, gap: 12, paddingBottom: Platform.OS === 'android' ? 90 : 40 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  serviceInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  dateText: { fontSize: 12, color: '#64748b' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardBody: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  descText: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressText: { fontSize: 13, color: '#94a3b8', flex: 1 },
  payButton: { backgroundColor: '#8b5cf6', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 12, marginTop: 15, gap: 8 },
  payButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  // ШИНЭ: Үнэлгээний стилүүд
  reviewButton: { backgroundColor: '#fffbeb', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 12, marginTop: 15, gap: 8, borderWidth: 1, borderColor: '#fde68a' },
  reviewButtonText: { color: '#d97706', fontWeight: 'bold', fontSize: 14 },
  ratedContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, gap: 8, backgroundColor: '#f8fafc', paddingVertical: 8, borderRadius: 10 },
  ratedText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  reviewBox: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  reviewInput: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e2e8f0', color: '#0f172a' },

  technicianSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f8fafc' },
  technicianInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  techAvatar: { width: 36, height: 36, borderRadius: 18 },
  techLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
  techName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  paymentSheet: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'android' ? 40 : 60 },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 8 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  amountInput: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, fontSize: 24, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  bankCard: { width: '31%', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  bankCardSelected: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
  bankLogo: { width: 40, height: 40, borderRadius: 10, marginBottom: 8 },
  bankName: { fontSize: 11, color: '#475569', textAlign: 'center' },
  confirmPayBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 10 },
  confirmPayBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { marginTop: 10, paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { fontSize: 16, color: '#ef4444', fontWeight: '600' },
});