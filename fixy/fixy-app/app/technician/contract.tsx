import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import SignatureScreen from 'react-native-signature-canvas';
import api from '../../api/client';

export default function ContractScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // ШИНЭЭР НЭМСЭН: Гарын үсгийн самбарыг гаднаас удирдах Reference
  const signatureRef = useRef<any>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/me');
      if (response.data) {
        setUser(response.data.user || response.data); 
      }
    } catch (error) {
      Alert.alert('Алдаа', 'Мэдээлэл татахад алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleSignature = async (signature: string) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/technician/contract/sign', { signature });
      if (response.data.success) {
        Alert.alert('Амжилттай', 'Гэрээнд амжилттай гарын үсэг зурлаа. Менежер батлахыг хүлээнэ үү.', [
          { text: 'ОК', onPress: () => fetchProfile() }
        ]);
      }
    } catch (error) {
      Alert.alert('Алдаа', 'Гэрээ илгээхэд алдаа гарлаа.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Гаднах товчноос гарын үсэг хадгалах үйлдлийг дуудах
  const handleSave = () => {
    signatureRef.current?.readSignature();
  };

  // Гаднах товчноос гарын үсэг арилгах үйлдлийг дуудах
  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>;

  const status = user?.contract_status || 'none';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Цахим гэрээ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={true}
        scrollEnabled={scrollEnabled}
      >
        
        {status === 'none' && (
          <View style={styles.statusBox}>
            <Clock size={32} color="#f59e0b" />
            <Text style={styles.statusText}>Менежер таны бичиг баримтыг хянасны дараа энд цахим гэрээ илгээх болно. Түр хүлээнэ үү.</Text>
          </View>
        )}

        {status === 'signed' && (
          <View style={[styles.statusBox, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
            <Clock size={32} color="#d97706" />
            <Text style={[styles.statusText, { color: '#b45309' }]}>
              Та гэрээнд гарын үсэг зурсан байна. Менежер нягтлан шалгасны дараа танд дуудлага авах эрх нээгдэнэ.
            </Text>
          </View>
        )}

        {status === 'approved' && (
          <View style={[styles.statusBox, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
            <CheckCircle size={32} color="#10b981" />
            <Text style={[styles.statusText, { color: '#047857' }]}>
              Таны гэрээ албан ёсоор батлагдсан байна. Та одоо дуудлага авах бүрэн боломжтой.
            </Text>
          </View>
        )}

        {status === 'sent' && (
          <>
            <View style={styles.contractPaper}>
              <Text style={styles.contractTitle}>ЗАСВАРЧИНТАЙ ХАМТРАН АЖИЛЛАХ ГЭРЭЭ</Text>
              <Text style={styles.contractDate}>Огноо: {new Date().toLocaleDateString('mn-MN')}</Text>
              
              <Text style={styles.contractBody}>
                Энэхүү гэрээг нэг талаас "Fixy" платформ (цаашид "Компани" гэх), нөгөө талаас засварчин <Text style={styles.boldText}>{user?.name}</Text> (цаашид "Засварчин" гэх) нар дараах нөхцөлөөр харилцан тохиролцож байгуулав.{"\n\n"}
                
                <Text style={styles.boldText}>НЭГ. НИЙТЛЭГ ҮНДЭС</Text>{"\n"}
                1.1 Засварчин нь платформоор дамжуулан үйлчлүүлэгчээс ирсэн дуудлагыг хүлээн авч, мэргэжлийн өндөр түвшинд, цаг тухайд нь засварын үйлчилгээ үзүүлэх үүрэгтэй.{"\n"}
                1.2 Компани нь засварчинг дуудлагаар хангаж, системийн хэвийн үйл ажиллагааг хариуцна.{"\n\n"}
                
                <Text style={styles.boldText}>ХОЁР. ТӨЛБӨР ТООЦОО</Text>{"\n"}
                2.1 Засварчин нь үйлчилгээний хөлснөөс платформын шимтгэл болох тодорхой хувийг Компанид төлөх үүрэгтэй.{"\n"}
                2.2 Үйлчлүүлэгчээс авах үйлчилгээний хөлс нь ил тод байх бөгөөд засварчин нь хэт өндөр үнэ нэхэх, хууран мэхлэх үйлдэл гаргахыг хатуу хориглоно.{"\n\n"}
                
                <Text style={styles.boldText}>ГУРАВ. ТАЛУУДЫН ЭРХ, ҮҮРЭГ</Text>{"\n"}
                3.1 <Text style={styles.boldText}>Засварчны үүрэг:</Text> Дуудлагын цагийг баримтлах, үйлчлүүлэгчтэй соёлтой харилцах, хийсэн ажилдаа баталгаа гаргаж өгөх. Хувийн мэдээлэл болон баримт бичгийг үнэн зөвөөр мэдүүлэх.{"\n"}
                3.2 <Text style={styles.boldText}>Компанийн эрх:</Text> Засварчин нь дүрэм зөрчсөн, үйлчлүүлэгчээс ноцтой гомдол ирсэн тохиолдолд гэрээг дангаар цуцалж, платформоос хасах эрхтэй.{"\n\n"}
                
                <Text style={styles.boldText}>ДӨРӨВ. ХАРИУЦЛАГА БА БУСАД</Text>{"\n"}
                4.1 Засварчин нь засвар үйлчилгээ хийх явцдаа үйлчлүүлэгчийн эд хөрөнгөд санаатай болон санамсаргүй байдлаар хохирол учруулсан тохиолдолд өөрийн зардлаар бүрэн барагдуулна.{"\n"}
                4.2 Энэхүү гэрээ нь цахимаар гарын үсэг зурсан өдрөөс эхлэн хүчин төгөлдөр болно.{"\n\n"}
                
                Би, <Text style={styles.boldText}>{user?.name}</Text> нь энэхүү гэрээний нөхцөлийг бүрэн уншиж танилцаад, хүлээн зөвшөөрч доорх гарын үсгийг зурлаа.
              </Text>
            </View>

            <Text style={styles.signatureLabel}>Энд хуруугаараа гарын үсгээ зурна уу:</Text>
            
            <View style={styles.signatureContainer}>
              <SignatureScreen
                ref={signatureRef}
                onOK={handleSignature}
                onBegin={() => setScrollEnabled(false)} 
                onEnd={() => setScrollEnabled(true)}   
                descriptionText=""
                // Дотоод товчийг нь бүр мөсөн устгах CSS
                webStyle={`
                  body,html { width: 100%; height: 100%; margin: 0; padding: 0;}
                  .m-signature-pad {box-shadow: none; border: none; margin: 0; padding: 0;}
                  .m-signature-pad--footer {display: none;}
                `}
              />
            </View>

            {/* ШИНЭЭР НЭМСЭН: React Native-ийн өөрийнх нь товчнууд */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear} disabled={isSubmitting}>
                <Text style={styles.clearBtnText}>Арилгах</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={isSubmitting}>
                <Text style={styles.submitBtnText}>Зөвшөөрч, Илгээх</Text>
              </TouchableOpacity>
            </View>
            
            {isSubmitting && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={{ marginTop: 10, color: '#64748b' }}>Гэрээг хадгалж байна...</Text>
              </View>
            )}
            <View style={{ height: 60 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  content: { padding: 20 },
  
  statusBox: { backgroundColor: '#fff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', marginTop: 20, gap: 12 },
  statusText: { fontSize: 15, color: '#475569', textAlign: 'center', lineHeight: 22 },

  contractPaper: { backgroundColor: '#fff', padding: 24, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  contractTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 8, lineHeight: 24 },
  contractDate: { fontSize: 12, color: '#64748b', textAlign: 'right', marginBottom: 20, fontStyle: 'italic' },
  contractBody: { fontSize: 14, color: '#334155', lineHeight: 24, textAlign: 'justify' },
  boldText: { fontWeight: 'bold', color: '#0f172a' },

  signatureLabel: { fontSize: 15, fontWeight: 'bold', color: '#334155', marginBottom: 12, marginLeft: 4 },
  
  // Самбарын хэмжээг багасгасан, учир нь товч нь гадна талдаа гарсан
  signatureContainer: { height: 220, backgroundColor: '#fff', borderRadius: 12, borderWidth: 2, borderColor: '#cbd5e1', overflow: 'hidden', marginBottom: 16 },
  
  // ШИНЭЭР НЭМСЭН ТОВЧНЫ ДИЗАЙН
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  clearBtn: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  clearBtnText: { color: '#64748b', fontWeight: 'bold', fontSize: 15 },
  submitBtn: { flex: 2, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }
});