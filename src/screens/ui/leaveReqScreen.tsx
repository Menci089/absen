import React, { useState } from "react";
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "../../lib/supabase/context/userContext";
import supabase from "../../lib/supabase/init";

const LeaveRequest: React.FC = () => {
  const { user } = useUser();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSubmitLeaveRequest = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User data is missing or not logged in.");
      return;
    }

    try {
      const { error } = await supabase.from("leave_requests").insert([
        {
          user_id: user.id, // menggunakan user.id yang sudah ada
          start_date: startDate?.toISOString().split("T")[0],
          end_date: endDate?.toISOString().split("T")[0],
          reason,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      Alert.alert("Sukses", "Permintaan cuti berhasil diajukan");
    } catch (error: any) {
      console.error("Error:", error);
      Alert.alert("Error", error.message || "Gagal mengajukan permintaan cuti");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permintaan Cuti</Text>

      <View style={styles.buttonGroup}>
        <Button
          title={`Dari Tanggal: ${startDate ? startDate.toISOString().split("T")[0] : ""}`}
          onPress={() => setShowStartPicker(true)}
          color="#e74c3c" // Warna merah yang lebih lembut untuk tombol
        />
        <Button
          title={`Hingga Tanggal: ${endDate ? endDate.toISOString().split("T")[0] : ""}`}
          onPress={() => setShowEndPicker(true)}
          color="#e74c3c" // Warna merah yang lebih lembut untuk tombol
        />
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      <Text style={styles.label}>Alasan</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Alasan untuk cuti"
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={4}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#e57373" />
      ) : (
        <Button title="Ajukan Permintaan Cuti" onPress={handleSubmitLeaveRequest} color="#e74c3c" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50', // Background gelap yang lebih dalam untuk tema "sangar"
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff", // Warna merah yang mencolok untuk teks judul
    marginBottom: 30,
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff", // Warna teks abu-abu untuk label
  },
  textArea: {
    width: "100%",
    borderColor: "#444", // Warna border lebih gelap untuk kontras
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 12,
    textAlignVertical: "top",
    backgroundColor: "#34495e", // Background area input dengan warna gelap
    color: "#fff", // Warna teks putih
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
});

export default LeaveRequest;
