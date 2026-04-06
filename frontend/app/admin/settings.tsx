import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => router.replace('/') }
    ]);
  };

  const menuOptions = [
    { id: 'profile', title: 'Mi Perfil', icon: 'person-outline', route: '/admin/profile' },
    { id: 'security', title: 'Seguridad y Contraseña', icon: 'lock-closed-outline', route: '/admin/security' },
    { id: 'help', title: 'Centro de Ayuda', icon: 'help-circle-outline', route: '/admin/help' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* FRANJA AZUL SUPERIOR (Consistencia) */}
      <View style={styles.blueBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.blueBarText}>Configuración</Text>
        <View style={{ width: 28 }} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.sectionTitle}>Cuenta</Text>
          
          {menuOptions.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => Alert.alert("Próximamente", `Sección de ${item.title}`)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon as any} size={20} color="#004080" />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          {/* BOTÓN DE CIERRE DE SESIÓN */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FDEDEC' }]}>
                <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
              </View>
              <Text style={[styles.menuText, { color: '#E74C3C', fontWeight: 'bold' }]}>
                Cerrar Sesión
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.versionText}>TuSalud+ Admin v1.0.2</Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  blueBar: { 
    backgroundColor: '#004080', 
    height: 100, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40
  },
  blueBarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 5 },

  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2'
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  menuText: { fontSize: 16, color: '#333' },
  
  divider: { height: 20 },
  
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    marginTop: 10
  },
  versionText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#BBB',
    fontSize: 12
  }
});