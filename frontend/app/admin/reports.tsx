import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Asegúrate de que estos nombres existan en tu adminService.ts
import { getAllReportsProvider, ReportsData } from '../../src/services/adminService';

export default function ReportsScreen() {
    const router = useRouter();
    const [reports, setReports] = useState<ReportsData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        const response = await getAllReportsProvider();
        if (response.success && response.reports) {
            setReports(response.reports);
        } else {
            // Datos de prueba por si el backend no responde aún
            setReports([
                { id: 1, userName: 'María González', reason: '0340 1208 4500 2680', date: '20-04-2025' },
                { id: 2, userName: 'Camila López', reason: '0340 1208 4500 2680', date: '19-04-2025' },
            ]);
        }
        setLoading(false);
    };

    // CORRECCIÓN 1: Se agregó el 'return' que faltaba y se corrigió 'styles'
    const renderReportItem = ({ item }: { item: ReportsData }) => (
        <View style={styles.tableRow}>
            <Text style={styles.cell}>{item.userName}</Text>
            <Text style={styles.cell}>{item.reason}</Text>
            <Text style={styles.cell}>{item.date}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reportes</Text>
                <TouchableOpacity onPress={() => Alert.alert("Filtro", "Opciones de filtrado")}>
                    <Ionicons name="filter-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.listLabel}>Lista de reportes</Text>
                
                <View style={styles.tableHeader}>
                    <Text style={styles.headerText}>De</Text>
                    <Text style={styles.headerText}>Razon</Text>
                    <Text style={styles.headerText}>Fecha</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#3498DB" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={reports}
                        renderItem={renderReportItem} // CORRECCIÓN 2: Nombre coincidente
                        keyExtractor={item => item.id.toString()}
                        ListEmptyComponent={<Text style={styles.empty}>No hay reportes hoy.</Text>}
                    />
                )}

                <TouchableOpacity 
                    style={styles.exportBtn}
                    onPress={() => Alert.alert("Exportar", "Generando archivo de reporte...")}
                >
                    <Text style={styles.exportBtnText}>Exportar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// CORRECCIÓN 3: El StyleSheet va fuera de la función principal
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 20 
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    content: { paddingHorizontal: 20, flex: 1 },
    listLabel: { fontSize: 16, marginBottom: 15, color: '#333' },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#AED6F1',
        padding: 12,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderWidth: 1,
        borderColor: '#3498DB'
    },
    headerText: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#2C3E50' },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#EBF5FB',
        padding: 15,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#3498DB',
        minHeight: 60,
        alignItems: 'center'
    },
    cell: { flex: 1, textAlign: 'center', fontSize: 13, color: '#2C3E50' },
    exportBtn: {
        backgroundColor: '#3498DB',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 30,
        width: '60%',
        alignSelf: 'center'
    },
    exportBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    empty: { textAlign: 'center', marginTop: 30, color: '#999' }
});