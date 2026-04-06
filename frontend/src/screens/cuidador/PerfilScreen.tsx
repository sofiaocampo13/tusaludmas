import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Modal, ActivityIndicator, Share, Image,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PatientLinked, User } from '../../types/database';
import {
  getCaregiverPatients,
  getUserById,
  updateUserProfile,
  linkPatientToCaregiver,
} from '../../services/dataService';
import { TERMINOS_TEXTO, POLITICA_TEXTO } from '../../constants/legalContent';

// ─── Visor de documentos legales ─────────────────────────────────────────────

function LegalDocModal({
  visible, title, content, onClose,
}: {
  visible: boolean; title: string; content: string; onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <RNSafeAreaView style={legalStyles.container}>
        <View style={legalStyles.header}>
          <Text style={legalStyles.headerTitle} numberOfLines={1}>{title}</Text>
          <TouchableOpacity style={legalStyles.closeBtn} onPress={onClose}>
            <Text style={legalStyles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={legalStyles.body} showsVerticalScrollIndicator>
          <Text style={legalStyles.bodyText}>{content}</Text>
        </ScrollView>
      </RNSafeAreaView>
    </Modal>
  );
}

const legalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#004080',
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#FFF', marginRight: 12 },
  closeBtn: { padding: 6 },
  closeBtnText: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },
  body: { padding: 20, paddingBottom: 40 },
  bodyText: { fontSize: 13, color: '#2C3E50', lineHeight: 22 },
});

type Props = { caregiverId?: number };

const PerfilScreen: React.FC<Props> = ({ caregiverId }) => {
  const router = useRouter();
  const [caregiver, setCaregiver] = useState<User | null>(null);
  const [patients, setPatients] = useState<PatientLinked[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Modal editar perfil
  const [editVisible, setEditVisible] = useState(false);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal vincular paciente
  const [linkVisible, setLinkVisible] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [linking, setLinking] = useState(false);

  // Modales legales
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const caregiverName = useMemo(() => {
    if (!caregiver) return 'Cuidador';
    return `${caregiver.first_name || ''} ${caregiver.last_name || ''}`.trim() || caregiver.username;
  }, [caregiver]);

  // ── Carga de datos ───────────────────────────────────────────────────────
  const loadData = async () => {
    if (!caregiverId) return;
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        getUserById(caregiverId),
        getCaregiverPatients(caregiverId),
      ]);
      setCaregiver(uRes.user);
      setPatients(pRes.patients || []);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // Cargar foto guardada localmente
  const loadPhoto = async () => {
    if (!caregiverId) return;
    try {
      const uri = await AsyncStorage.getItem(`profile_photo_${caregiverId}`);
      if (uri) setPhotoUri(uri);
    } catch {}
  };

  useEffect(() => {
    loadData();
    loadPhoto();
  }, [caregiverId]);

  // ── Foto de perfil ────────────────────────────────────────────────────────
  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      if (caregiverId) {
        await AsyncStorage.setItem(`profile_photo_${caregiverId}`, uri);
      }
    }
  };

  // ── Editar perfil ─────────────────────────────────────────────────────────
  const openEdit = () => {
    setEditFirst(caregiver?.first_name || '');
    setEditLast(caregiver?.last_name || '');
    setEditEmail(caregiver?.email || '');
    setEditPhone(caregiver?.phone || '');
    setEditVisible(true);
  };

  const handleSave = async () => {
    if (!caregiverId) return;
    if (!editFirst.trim() || !editEmail.trim()) {
      return Alert.alert('Campos requeridos', 'El nombre y el correo son obligatorios.');
    }
    setSaving(true);
    try {
      await updateUserProfile(caregiverId, {
        first_name: editFirst.trim(),
        last_name: editLast.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
      });
      await loadData();
      setEditVisible(false);
      Alert.alert('Listo', 'Perfil actualizado correctamente.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  // ── Vincular paciente ─────────────────────────────────────────────────────
  const handleLinkPatient = async () => {
    if (!caregiverId || !linkCode.trim()) {
      return Alert.alert('Código requerido', 'Ingresa el código de vinculación del paciente.');
    }
    setLinking(true);
    try {
      await linkPatientToCaregiver(caregiverId, linkCode.trim());
      setLinkVisible(false);
      setLinkCode('');
      await loadData();
      Alert.alert('Listo', 'Paciente vinculado correctamente.');
    } catch (e: any) {
      Alert.alert('No se pudo vincular', e?.message || 'Ocurrió un error.');
    } finally {
      setLinking(false);
    }
  };

  // ── Cerrar sesión ─────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => router.replace('/') },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <RNSafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.navigate('/cuidador')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color="#004080" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#004080" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>

          {/* ── Tarjeta de perfil ─────────────────────────────────────── */}
          <View style={styles.profileCard}>
            <TouchableOpacity onPress={handlePickPhoto} style={styles.avatarWrapper} activeOpacity={0.8}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color="#004080" />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={12} color="#FFF" />
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>Cuidador</Text>
              </View>
              <Text style={styles.name}>{caregiverName}</Text>
              <Text style={styles.email}>{caregiver?.email || ''}</Text>
            </View>
          </View>

          {/* ── Acciones ──────────────────────────────────────────────── */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={openEdit}>
              <Ionicons name="pencil-outline" size={16} color="#004080" style={{ marginRight: 6 }} />
              <Text style={styles.secondaryBtnText}>Editar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.dangerBtnText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          {/* ── Mis datos ─────────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Mi información</Text>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{caregiver?.phone || 'No registrado'}</Text>
          </View>

          {/* ── Mis pacientes ──────────────────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Pacientes</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setLinkVisible(true)}>
              <Ionicons name="person-add-outline" size={16} color="#FFF" />
              <Text style={styles.addBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {patients.length === 0 ? (
            <View style={styles.emptyPatients}>
              <Ionicons name="people-outline" size={36} color="#CCC" />
              <Text style={styles.emptyText}>Sin pacientes vinculados</Text>
              <Text style={styles.emptySubText}>Agrega uno con el código del paciente</Text>
            </View>
          ) : (
            patients.map((p) => {
              const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Paciente #${p.id}`;
              return (
                <View key={p.id} style={styles.patientCard}>
                  <View style={styles.patientAvatar}>
                    <Ionicons name="person" size={20} color="#004080" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>{name}</Text>
                    {(p as any).email && (
                      <Text style={styles.patientMeta}>{(p as any).email}</Text>
                    )}
                  </View>
                </View>
              );
            })
          )}

          {/* ── Información legal ─────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Información legal</Text>

          <TouchableOpacity style={styles.legalRow} onPress={() => setShowTermsModal(true)}>
            <Ionicons name="document-text-outline" size={18} color="#004080" style={styles.infoIcon} />
            <Text style={styles.legalRowText}>Términos y condiciones de uso</Text>
            <Ionicons name="chevron-forward" size={16} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalRow} onPress={() => setShowPolicyModal(true)}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#004080" style={styles.infoIcon} />
            <Text style={styles.legalRowText}>Política de tratamiento de datos</Text>
            <Ionicons name="chevron-forward" size={16} color="#CCC" />
          </TouchableOpacity>

        </ScrollView>
      )}

      {/* ── Modales de documentos legales ─────────────────────────────── */}
      <LegalDocModal
        visible={showTermsModal}
        title="Términos y Condiciones de Uso"
        content={TERMINOS_TEXTO}
        onClose={() => setShowTermsModal(false)}
      />
      <LegalDocModal
        visible={showPolicyModal}
        title="Política de Tratamiento de Datos Personales"
        content={POLITICA_TEXTO}
        onClose={() => setShowPolicyModal(false)}
      />

      {/* ── Modal editar perfil ────────────────────────────────────────── */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setEditVisible(false)} activeOpacity={1} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Editar Perfil</Text>

          <Text style={styles.fieldLabel}>Nombre *</Text>
          <TextInput style={styles.input} value={editFirst} onChangeText={setEditFirst}
            placeholder="Nombre" autoCapitalize="words" />

          <Text style={styles.fieldLabel}>Apellido</Text>
          <TextInput style={styles.input} value={editLast} onChangeText={setEditLast}
            placeholder="Apellido" autoCapitalize="words" />

          <Text style={styles.fieldLabel}>Correo electrónico *</Text>
          <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail}
            placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.fieldLabel}>Teléfono</Text>
          <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone}
            placeholder="Número de teléfono" keyboardType="phone-pad" />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Guardar cambios</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Modal vincular paciente ────────────────────────────────────── */}
      <Modal visible={linkVisible} transparent animationType="slide" onRequestClose={() => setLinkVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setLinkVisible(false)} activeOpacity={1} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Agregar Paciente</Text>
          <Text style={styles.sheetSubtitle}>
            Ingresa el código de vinculación que aparece en el perfil del paciente.
          </Text>

          <Text style={styles.fieldLabel}>Código de vinculación</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={linkCode}
            onChangeText={setLinkCode}
            placeholder="Ej: AB12CD"
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleLinkPatient} disabled={linking}>
            {linking ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Vincular Paciente</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setLinkVisible(false); setLinkCode(''); }}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </RNSafeAreaView>
  );
};

export default PerfilScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderColor: '#EEE',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { padding: 20, paddingBottom: 40 },

  // Tarjeta de perfil
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#004080', borderRadius: 16, padding: 16, marginBottom: 12,
  },
  avatarWrapper: { marginRight: 14, position: 'relative' },
  avatarImage: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
  avatarPlaceholder: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#004080', borderRadius: 10, width: 20, height: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FFF',
  },
  rolePill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 6,
  },
  rolePillText: { fontSize: 12, fontWeight: 'bold', color: '#004080' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  email: { marginTop: 2, fontSize: 12, color: 'rgba(255,255,255,0.9)' },

  // Botones
  buttonsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#004080',
    paddingVertical: 10, borderRadius: 18,
  },
  secondaryBtnText: { color: '#004080', fontWeight: 'bold' },
  dangerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF5A5A', paddingVertical: 10, borderRadius: 18,
  },
  dangerBtnText: { color: '#FFF', fontWeight: 'bold' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#004080', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18,
  },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F0F0F0', marginBottom: 8,
  },
  infoIcon: { marginRight: 10 },
  infoLabel: { fontSize: 14, color: '#666', flex: 1 },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500' },

  // Pacientes
  patientCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F9FA', borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#E9ECEF',
  },
  patientAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E3F0FF', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  patientName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  patientMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  emptyPatients: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: '#999', fontSize: 15, marginTop: 10, fontWeight: '600' },
  emptySubText: { color: '#BBB', fontSize: 13, marginTop: 4 },

  // Legal
  legalRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F0F0F0',
  },
  legalRowText: { flex: 1, fontSize: 14, color: '#333' },

  // Modal
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 34,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  sheetSubtitle: { fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    backgroundColor: '#F8F9FA', borderRadius: 10, padding: 13,
    borderWidth: 1, borderColor: '#E9ECEF', marginBottom: 14, fontSize: 15,
  },
  codeInput: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2, textAlign: 'center' },
  saveBtn: {
    backgroundColor: '#004080', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 4,
  },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 14, alignItems: 'center', marginTop: 4 },
  cancelBtnText: { color: '#666', fontSize: 14 },
});
