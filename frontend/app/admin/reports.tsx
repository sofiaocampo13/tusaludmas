import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAllReportsProvider, updateReporteEstadoProvider, ReportsData } from '../../src/services/adminService';
import { parseDbDateTime } from '../../src/utils/datetime';

const ESTADO_LABELS: Record<number, string> = {
    0: 'Pendiente',
    1: 'Revisado',
    2: 'Resuelto',
};

const ESTADO_COLORS: Record<number, string> = {
    0: '#E67E22',
    1: '#3498DB',
    2: '#27AE60',
};

const CATEGORIA_ICONS: Record<string, string> = {
    general: 'information-circle-outline',
    tecnico: 'construct-outline',
    paciente: 'person-outline',
    otro: 'ellipsis-horizontal-outline',
};

export default function ReportsScreen() {
    const router = useRouter();
    const [reports, setReports] = useState<ReportsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReports = useCallback(async () => {
        const response = await getAllReportsProvider();
        if (response.success && response.reports) {
            setReports(response.reports);
        } else {
            Alert.alert('Error', response.message || 'No se pudieron cargar los reportes.');
        }
    }, []);

    useEffect(() => {
        fetchReports().finally(() => setLoading(false));
    }, [fetchReports]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchReports();
        setRefreshing(false);
    };

    const handleUpdateEstado = (reporte: ReportsData, nuevoEstado: number) => {
        const label = ESTADO_LABELS[nuevoEstado];
        Alert.alert(
            'Cambiar estado',
            `¿Marcar este reporte como "${label}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: label, onPress: async () => {
                        const res = await updateReporteEstadoProvider(reporte.id, nuevoEstado);
                        if (res.success) {
                            setReports(prev =>
                                prev.map(r => r.id === reporte.id ? { ...r, estado: nuevoEstado } : r)
                            );
                        } else {
                            Alert.alert('Error', res.message || 'No se pudo actualizar el estado.');
                        }
                    }
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: ReportsData }) => {
        const cuidadorName = [item.first_name, item.last_name].filter(Boolean).join(' ') || item.username || `#${item.caregiver_id}`;
        const fecha = parseDbDateTime(item.created_at)?.toLocaleDateString('es-CO', {
            day: '2-digit', month: 'short', year: 'numeric',
        }) ?? item.created_at;
        const iconName = (CATEGORIA_ICONS[item.categoria] || 'flag-outline') as any;
        const estadoColor = ESTADO_COLORS[item.estado] ?? '#999';
        const estadoLabel = ESTADO_LABELS[item.estado] ?? 'Desconocido';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.catIcon}>
                        <Ionicons name={iconName} size={18} color="#004080" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
                        <Text style={styles.cardMeta}>
                            {cuidadorName} · {fecha}
                        </Text>
                    </View>
                    <View style={[styles.estadoBadge, { backgroundColor: estadoColor + '22', borderColor: estadoColor }]}>
                        <Text style={[styles.estadoText, { color: estadoColor }]}>{estadoLabel}</Text>
                    </View>
                </View>

                <Text style={styles.cardDesc}>{item.descripcion}</Text>

                <View style={styles.cardFooter}>
                    <View style={styles.categoriaPill}>
                        <Text style={styles.categoriaPillText}>
                            {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
                        </Text>
                    </View>
                    <View style={styles.estadoActions}>
                        {item.estado !== 1 && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => handleUpdateEstado(item, 1)}
                            >
                                <Ionicons name="eye-outline" size={14} color="#3498DB" />
                                <Text style={[styles.actionBtnText, { color: '#3498DB' }]}>Revisado</Text>
                            </TouchableOpacity>
                        )}
                        {item.estado !== 2 && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => handleUpdateEstado(item, 2)}
                            >
                                <Ionicons name="checkmark-circle-outline" size={14} color="#27AE60" />
                                <Text style={[styles.actionBtnText, { color: '#27AE60' }]}>Resuelto</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reportes</Text>
                <TouchableOpacity onPress={handleRefresh}>
                    <Ionicons name="refresh-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#004080" style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#004080" />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="flag-outline" size={48} color="#CCC" />
                            <Text style={styles.emptyText}>No hay reportes aún</Text>
                        </View>
                    }
                    ListHeaderComponent={
                        <Text style={styles.listLabel}>
                            {reports.length} reporte{reports.length !== 1 ? 's' : ''} encontrado{reports.length !== 1 ? 's' : ''}
                        </Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F6FA' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF',
        borderBottomWidth: 1, borderBottomColor: '#EEE',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    list: { padding: 16, paddingBottom: 40 },
    listLabel: { fontSize: 13, color: '#888', marginBottom: 12 },

    card: {
        backgroundColor: '#FFF', borderRadius: 14, padding: 16,
        marginBottom: 12, elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07, shadowRadius: 4,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    catIcon: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#E3F0FF', justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#222' },
    cardMeta: { fontSize: 12, color: '#888', marginTop: 2 },
    estadoBadge: {
        paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, borderWidth: 1,
    },
    estadoText: { fontSize: 11, fontWeight: 'bold' },
    cardDesc: { fontSize: 13, color: '#444', lineHeight: 19, marginBottom: 12 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    categoriaPill: {
        backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    },
    categoriaPillText: { fontSize: 12, color: '#666' },
    estadoActions: { flexDirection: 'row', gap: 8 },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 8, backgroundColor: '#F8F9FA',
        borderWidth: 1, borderColor: '#E9ECEF',
    },
    actionBtnText: { fontSize: 12, fontWeight: '600' },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { color: '#BBB', fontSize: 15, marginTop: 12 },
});
