import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import supabase from "../lib/supabase/init";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { logoutUser } from "../lib/supabase/auth/logout";

interface LeaveRequest {
  id: number;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

interface Attendance {
  id: number;
  user_id: string;
  date: string;
}

type AdminDashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AdminDashboard"
>;

const AdminDashboard: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [userNames, setUserNames] = useState<{ [userId: string]: string }>({});
  const [activeView, setActiveView] = useState<"attendance" | "leave_requests">(
    "attendance"
  ); // Untuk memilih tampilan data
  const navigation = useNavigation<AdminDashboardNavigationProp>();

  const fetchUserNames = async (requests: { user_id: string }[]) => {
    const userIds = requests.map((request) => request.user_id);
    const uniqueUserIds = [...new Set(userIds)];
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .in("id", uniqueUserIds);
      if (error) throw error;

      const names: { [userId: string]: string } = {};
      data?.forEach((user) => {
        names[user.id] = user.name || "Unknown User";
      });

      setUserNames((prev) => ({ ...prev, ...names }));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal memuat data pengguna");
    }
  };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("leave_requests").select("*");
      if (error) throw error;
      setLeaveRequests(data || []);
      fetchUserNames(data || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal memuat data permintaan cuti");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("id, user_id, date")
        .eq("date", today);
      if (error) throw error;

      setTodayAttendance(data || []);
      fetchUserNames(data || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal memuat data kehadiran hari ini");
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    // Menambahkan tombol Logout di header
    navigation.setOptions({
      title: "AdminDashboard", // Judul Header
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
          <Text style={styles.headerButtonText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation])

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      navigation.replace("Login");
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const renderAttendance = ({ item }: { item: Attendance }) => (
    <Text style={styles.itemText}>
      User: {userNames[item.user_id] || "Unknown User"} - Tanggal: {item.date}
    </Text>
  );

  const renderLeaveRequest = ({ item }: { item: LeaveRequest }) => (
    <View style={styles.card}>
      <Text style={styles.title}>User: {userNames[item.user_id] || "Unknown"}</Text>
      <Text>Start Date: {item.start_date}</Text>
      <Text>End Date: {item.end_date}</Text>
      <Text>Reason: {item.reason}</Text>
      <Text>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Admin Dashboard</Text>
      </View>

      {/* Tombol untuk memilih tampilan */}
      <View style={styles.buttonContainer}>
        <Button
          title="Lihat Absensi Hari Ini"
          onPress={() => {
            setActiveView("attendance");
            fetchTodayAttendance();
          }}
          color={activeView === "attendance" ? "blue" : "gray"}
        />
        <Button
          title="Lihat Leave Requests"
          onPress={() => {
            setActiveView("leave_requests");
            fetchLeaveRequests();
          }}
          color={activeView === "leave_requests" ? "blue" : "gray"}
        />
      </View>

      {/* Menampilkan data berdasarkan tombol */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : activeView === "attendance" ? (
        <FlatList
          data={todayAttendance}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAttendance}
          ListEmptyComponent={<Text>Tidak ada absensi hari ini</Text>}
        />
      ) : (
        <FlatList
          data={leaveRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLeaveRequest}
          ListEmptyComponent={<Text>Tidak ada leave requests</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 8,
  },
  headerButton: {
    marginRight: 10,
    backgroundColor: "red",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  headerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AdminDashboard;
