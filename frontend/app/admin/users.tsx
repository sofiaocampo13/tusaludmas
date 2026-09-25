import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAllUsersProvider, toggleUserStatusProvider, UserData } from '../../src/services/adminService';

export default function UsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showSuspended, setShowSuspended] = useState(false);

  const AZUL_CORRECTO = '#004080'; // El azul que solicitaste

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsersProvider();
      if (response.success && response.users) {
        setUsers(response.users);
      } else {
        Alert.alert("Error", response.message || "No se pudo cargar la lista");
      }
    } catch (error) {
      Alert.alert("Error", "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const toggleManage = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSuspend = (item: UserData) => {
    const targetState = item.state === 1 ? 0 : 1;
    const actionLabel = targetState === 0 ? "suspender" : "activar";

    Alert.alert(
      "Confirmar Acción",
      `¿Estás seguro de que deseas ${actionLabel} a ${item.username}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: targetState === 0 ? "Suspender" : "Activar", 
          style: "destructive", 
          onPress: async () => {
            const result = await toggleUserStatusProvider(item.id, targetState);

            if (!result.success) {
              Alert.alert("Error", "No se pudo actualizar el estado del usuario.");
              return;
            }

            setUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === item.id ? { ...user, state: targetState } : user
              )
            );
            setExpandedId(null);
            Alert.alert("Éxito", targetState === 0 ? "Usuario suspendido correctamente." : "Usuario activado correctamente.");
          }
        }
      ]
    );
  };

  const visibleUsers = users.filter((user) => showSuspended ? user.state === 0 : user.state === 1);

  const renderUserItem = ({ item }: { item: UserData }) => {
    const displayName = item.first_name 
      ? `${item.first_name} ${item.last_name || ''}`.trim() 
      : item.username;

    const initials = item.first_name 
      ? `${item.first_name[0]}${item.last_name?.[0] || ''}`.toUpperCase()
      : item.username.substring(0, 2).toUpperCase();

    return (
      <View style={styles.cardContainer}>
        <View style={styles.userCard}>
          <View style={styles.userInfoContainer}>
            <View style={[styles.avatarCircle, { borderColor: AZUL_CORRECTO }]}>
              <Text style={[styles.avatarText, { color: AZUL_CORRECTO }]}>{initials}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.manageBtn, { backgroundColor: AZUL_CORRECTO }]} 
            onPress={() => toggleManage(item.id)}
          >
            <Text style={styles.manageBtnText}>Gestionar</Text>
            <Ionicons 
              name={expandedId === item.id ? "chevron-up" : "chevron-down"} 
              size={14} 
              color="white" 
              style={{ marginLeft: 5 }} 
            />
          </TouchableOpacity>
        </View>

        {expandedId === item.id && (
          <View style={styles.expandedMenu}>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => handleSuspend(item)}
            >
              <Ionicons name={item.state === 1 ? "ban-outline" : "checkmark-circle-outline"} size={18} color={item.state === 1 ? "#E74C3C" : "#27AE60"} />
              <Text style={[styles.menuOptionText, { color: item.state === 1 ? '#E74C3C' : '#27AE60' }]}>{item.state === 1 ? "Suspender" : "Activar"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity onPress={loadUsers}>
          <Ionicons name="refresh" size={24} color={AZUL_CORRECTO} />
        </TouchableOpacity>
      </View>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>
          {showSuspended ? 'Mostrando suspendidos' : 'Mostrando activos'}
        </Text>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: showSuspended ? '#7F8C8D' : AZUL_CORRECTO }]}
          onPress={() => {
            setExpandedId(null);
            setShowSuspended((prev) => !prev);
          }}
        >
          <Text style={styles.filterButtonText}>
            {showSuspended ? 'Ver activos' : 'Ver suspendidos'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={AZUL_CORRECTO} />
          <Text style={styles.loaderText}>Sincronizando con base de datos...</Text>
        </View>
      ) : (
        <FlatList
          data={visibleUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {showSuspended ? 'No hay usuarios suspendidos.' : 'No hay usuarios activos.'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F7' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 19, fontWeight: 'bold', color: '#333' },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEDEF',
  },
  filterLabel: { color: '#566573', fontWeight: '600' },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
  },
  filterButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#666', fontWeight: '500' },
  listContent: { padding: 15 },
  cardContainer: { 
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    marginBottom: 12, 
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16 
  },
  userInfoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#F0F4F8', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1.5
  },
  avatarText: { fontWeight: 'bold', fontSize: 16 },
  textContainer: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1C2833' },
  userEmail: { fontSize: 13, color: '#566573', marginTop: 1 },
  manageBtn: { 
    flexDirection: 'row',
    paddingHorizontal: 14, 
    paddingVertical: 9, 
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2
  },
  manageBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  expandedMenu: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: '#EBEDEF', 
    backgroundColor: '#FDFEFE',
    paddingVertical: 12,
    justifyContent: 'space-around'
  },
  menuOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15
  },
  menuOptionText: { 
    marginLeft: 8, 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#95A5A6', fontSize: 15 }
});