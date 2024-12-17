import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import supabase from "../lib/supabase/init";
import { useUser } from "../lib/supabase/context/userContext";

const LaporanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useUser(); // Mengambil data pengguna dari context
  const [laporanList, setLaporanList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        if (!user) return; // Jika pengguna tidak ada, tidak fetch laporan
        
        const { data, error } = await supabase
          .from("laporan")
          .select("*")
          .eq("user_id", user.id) // Hanya fetch laporan berdasarkan ID pengguna
          .order("tanggal", { ascending: false });

        if (error) throw error;
        setLaporanList(data || []);
      } catch (error) {
        console.error("Error fetching laporan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLaporan();
  }, [user]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.judul}</Text>
      <Text style={styles.cell}>{item.deskripsi}</Text>
      <Text style={styles.cell}>{item.tanggal}</Text>
      <Text style={styles.cell}>{item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Laporan</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={laporanList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.cell}>Judul</Text>
              <Text style={styles.cell}>Deskripsi</Text>
              <Text style={styles.cell}>Tanggal</Text>
              <Text style={styles.cell}>Status</Text>
            </View>
          }
        />
      )}

      <Button
        title="Tambah Laporan"
        onPress={() => navigation.navigate("TambahLaporan")}
        color="#e74c3c"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2c3e50", padding: 20 },
  title: { fontSize: 24, color: "#fff", textAlign: "center", marginBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: "#e74c3c" },
  row: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderBottomWidth: 1, borderColor: "#e74c3c" },
  cell: { flex: 1, color: "#fff", textAlign: "center" },
});

export default LaporanScreen;
