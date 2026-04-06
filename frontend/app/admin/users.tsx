import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAllUsersProvider, UserData } from '../../src/services/adminService';

export default function UsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const handleEdit = (item: UserData) => {
    // Enviamos el objeto 'item' completo como parámetro para que la pantalla 
    // de edición reciba los datos reales y no datos genéricos.
    router.push({
      pathname: '/admin/edit-user' as any,
      params: { user: JSON.stringify(item) }
    });
  };

  const handleSuspend = (item: UserData) => {
    Alert.alert(
      "Confirmar Acción",
      `¿Estás seguro de que deseas suspender a ${item.username}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Suspender", 
          style: "destructive", 
          onPress: () => Alert.alert("Éxito", "Usuario suspendido correctamente.") 
        }
      ]
    );
  };

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
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="create-outline" size={18} color={AZUL_CORRECTO} />
              <Text style={[styles.menuOptionText, { color: AZUL_CORRECTO }]}>Editar Datos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuOption} 
              onPress={() => handleSuspend(item)}
            >
              <Ionicons name="ban-outline" size={18} color="#E74C3C" />
              <Text style={[styles.menuOptionText, { color: '#E74C3C' }]}>Suspender</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity onPress={loadUsers}>
          <Ionicons name="refresh" size={24} color={AZUL_CORRECTO} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={AZUL_CORRECTO} />
          <Text style={styles.loaderText}>Sincronizando con base de datos...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay usuarios registrados.</Text>
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
    paddingVertical: 15,
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 19, fontWeight: 'bold', color: '#333' },
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