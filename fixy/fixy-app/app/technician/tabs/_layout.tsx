// app/technician/tabs/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Briefcase, User } from 'lucide-react-native';

export default function TechnicianTabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#10b981', // Emerald 500 өнгө (Засварчны үндсэн өнгө)
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Нүүр',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="jobs" 
        options={{
          title: 'Ажлууд',
          tabBarIcon: ({ color }) => <Briefcase size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Профайл',
          tabBarIcon: ({ color }) => <User size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}