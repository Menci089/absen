import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import supabase from "../../lib/supabase/init";
import { useUser } from "../../lib/supabase/context/userContext";


const TambahLaporanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [status, setStatus] = useState("");
  const { user } = useUser();

  const handleSubmit = async () => {
    if (!judul || !deskripsi || !status) {
      Alert.alert("Error", "Semua field harus diisi!");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User belum login.");
      return;
    }

    try {
      const { error } = await supabase.from("laporan").insert([
        { judul, deskripsi, status, tanggal: new Date(), user_id: user.id },
      ]);

      if (error) throw error;

      Alert.alert("Sukses", "Laporan berhasil ditambahkan!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Gagal menyimpan laporan.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tambah Laporan</Text>
      <TextInput style={styles.input} placeholder="Judul" value={judul} onChangeText={setJudul} />
      <TextInput style={styles.input} placeholder="Deskripsi" value={deskripsi} onChangeText={setDeskripsi} multiline />
      <TextInput style={styles.input} placeholder="Status" value={status} onChangeText={setStatus} />
      <Button title="Simpan" onPress={handleSubmit} color="#e74c3c" />
      <Button title="Batal" onPress={() => navigation.goBack()} color="#e74c3c" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2c3e50", padding: 20 },
  title: { fontSize: 24, color: "#fff", textAlign: "center", marginBottom: 20 },
  input: { borderColor: "#e74c3c", borderWidth: 1, marginBottom: 15, padding: 10, color: "#fff" },
});

export default TambahLaporanScreen;
