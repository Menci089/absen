import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { useUser } from "../lib/supabase/context/userContext";
import supabase from "../lib/supabase/init";
import { logoutUser } from "../lib/supabase/auth/logout";

type EmployeeDashboardNavigationProp = StackNavigationProp<RootStackParamList, "karyawanDashboard">;

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
}

const EmployeeDashboard: React.FC = () => {
  const navigation = useNavigation<EmployeeDashboardNavigationProp>();
  const { user } = useUser();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user?.id) {
      fetchLeaveRequests();
    }
  }, [user?.id]);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      navigation.replace("Login"); // Redirect user to login page after logout
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leave_requests")
        .select("id, start_date, end_date, reason, status")
        .eq("user_id", user?.id);
      if (!error) {
        setLeaveRequests(data || []);
      } else {
        Alert.alert("Error", error.message);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Gagal memuat data permintaan cuti.");
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Halo Karyawan:)",
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
          <Text style={styles.headerButtonText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const renderLeaveRequestItem = ({ item }: { item: LeaveRequest }) => (
    <View style={styles.leaveRequestItem}>
      <Text style={styles.leaveRequestText}>
        <Text style={styles.bold}>Start:</Text> {item.start_date}
      </Text>
      <Text style={styles.leaveRequestText}>
        <Text style={styles.bold}>End:</Text> {item.end_date}
      </Text>
      <Text style={styles.leaveRequestText}>
        <Text style={styles.bold}>Reason:</Text> {item.reason}
      </Text>
      <Text style={[styles.leaveRequestText, { color: item.status === "approved" ? "green" : "red" }]}>
        <Text style={styles.bold}>Status:</Text> {item.status}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Nama Karyawan */}
      <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>

      {/* Menu Navigasi */}
      <View style={styles.menuContainer}>
        <Button title="Ijin Cuti" onPress={() => navigation.navigate("IjinCuti")} color="#e74c3c" />
        <Button title="Absensi" onPress={() => navigation.navigate("Absensi")} color="#e74c3c" />
        <Button title="Laporan" onPress={() => navigation.navigate("Laporan")} color="#e74c3c" />
      </View>

      {/* Leave Request Section */}
      <Text style={styles.sectionTitle}>Leave Request Status</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : leaveRequests.length === 0 ? (
        <Text style={styles.noLeaveRequestText}>No leave requests found.</Text>
      ) : (
        <FlatList
          data={leaveRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLeaveRequestItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c3e50", // Warna background gelap yang sangar
    padding: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ecf0f1", // Warna teks terang
    textAlign: "center",
    marginVertical: 10,
  },
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff", // Warna aksen oranye terang
    marginBottom: 10,
    textAlign: "center",
  },
  leaveRequestItem: {
    backgroundColor: "#34495e", // Warna latar belakang item
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  leaveRequestText: {
    fontSize: 14,
    color: "#ecf0f1", // Warna teks terang
  },
  bold: {
    fontWeight: "bold",
  },
  noLeaveRequestText: {
    fontSize: 16,
    color: "#7f8c8d", // Warna teks abu-abu untuk status kosong
    textAlign: "center",
  },
  headerButton: {
    marginRight: 10,
    backgroundColor: "#c0392b", // Warna merah untuk tombol logout
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  headerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default EmployeeDashboard;
