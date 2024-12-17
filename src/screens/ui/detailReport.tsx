// pages/DetailLaporan.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import supabase from "../../lib/supabase/init";

const DetailLaporan: React.FC<{ route: any }> = ({ route }) => {
  const { laporanId } = route.params;
  const [laporanDetail, setLaporanDetail] = useState<any>(null);

  useEffect(() => {
    // Fetch detail laporan berdasarkan laporanId
    const fetchDetailLaporan = async () => {
      try {
        const { data, error } = await supabase
          .from("laporan")
          .select("*")
          .eq("id", laporanId)
          .single(); // Mengambil data berdasarkan id

        if (error) {
          console.error("Error fetching laporan detail:", error.message);
        } else {
          setLaporanDetail(data);
        }
      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
      }
    };

    fetchDetailLaporan();
  }, [laporanId]);

  if (!laporanDetail) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{laporanDetail.judul}</Text>
        <Text style={styles.info}>Deskripsi: {laporanDetail.deskripsi}</Text>
        <Text style={styles.info}>Tanggal: {laporanDetail.tanggal}</Text>
        <Text style={styles.info}>Status: {laporanDetail.status}</Text>
        <Text style={styles.info}>Dibuat pada: {laporanDetail.created_at}</Text>
        <Text style={styles.info}>Terakhir diperbarui: {laporanDetail.updated_at}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
});

export default DetailLaporan;
