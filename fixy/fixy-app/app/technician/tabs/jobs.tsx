// app/technician/tabs/jobs.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function JobsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ажлуудын жагсаалт энд орно</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  text: { fontSize: 16, color: '#64748b' }
});