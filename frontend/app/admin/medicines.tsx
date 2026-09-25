import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import { getAllMedicinesProvider } from '../../src/services/adminService'; 

const BRAND_COLOR = '#004080';

const AdminMedicines = () => {
    const insets = useSafeAreaInsets();
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const result = await getAllMedicinesProvider();
            
            if (result.success && result.medicines) {
                // ELIMINAR REPETIDOS: Filtro manual para evitar que la app se quede cargando
                const listaLimpia = [];
                const nombresVistos = new Set();

                for (const item of result.medicines) {
                    // Si el nombre no ha sido visto, lo agregamos
                    if (item.name && !nombresVistos.has(item.name.trim().toLowerCase())) {
                        nombresVistos.add(item.name.trim().toLowerCase());
                        listaLimpia.push(item);
                    }
                }
                setMedicines(listaLimpia);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                {/* Icono de pastilla/médico en el azul de tu marca */}
                <Ionicons name="medical" size={24} color={BRAND_COLOR} />
            </View>
            
            <View style={styles.infoContainer}>
                <Text style={styles.medName}>{item.name}</Text>
                <Text style={styles.medDetail}>
                    {item.principio_activo || 'Sin especificar'} - {item.concentracion || ''}
                </Text>
                <Text style={styles.categoryTag}>PRODUCTO REGISTRADO</Text>
            </View>

            <TouchableOpacity 
                style={styles.infoIcon}
                onPress={() => Alert.alert("Detalles", `${item.name}\n${item.principio_activo}`)}
            >
                <Ionicons name="information-circle" size={30} color={BRAND_COLOR} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            {/* Encabezado Azul */}
            <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
                <Ionicons name="chevron-back" size={28} color="white" />
                <Text style={styles.headerTitle}>Catálogo de Medicamentos</Text>
                <TouchableOpacity onPress={fetchMedicines}>
                    <Ionicons name="refresh" size={24} color="white" />
                </TouchableOpacity>
            </View>
            
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={BRAND_COLOR} />
                    <Text style={{marginTop: 10, color: BRAND_COLOR}}>Sincronizando catálogo...</Text>
                </View>
            ) : (
                <FlatList
                    data={medicines}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No hay medicamentos para mostrar.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F5F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    // paddingTop se calcula en linea: la cabecera absorbe el inset superior.
    header: { 
        backgroundColor: BRAND_COLOR, 
        paddingBottom: 14, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20 
    },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    listContainer: { padding: 15 },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 15, 
        padding: 15, 
        marginBottom: 12, 
        flexDirection: 'row', 
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    iconContainer: { 
        backgroundColor: '#E8F0F8', 
        padding: 12, 
        borderRadius: 12, 
        marginRight: 15 
    },
    infoContainer: { flex: 1 },
    medName: { fontSize: 16, fontWeight: 'bold', color: '#333', textTransform: 'uppercase' },
    medDetail: { fontSize: 14, color: '#777', marginTop: 2 },
    categoryTag: { fontSize: 11, color: BRAND_COLOR, fontWeight: 'bold', marginTop: 5 },
    infoIcon: { marginLeft: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default AdminMedicines;