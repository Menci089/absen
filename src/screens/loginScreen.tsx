import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import supabase from "../lib/supabase/init";
import { useUser } from "../lib/supabase/context/userContext";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setUser } = useUser();

  useEffect(() => {
    const checkLogin = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        navigation.navigate(session.session.user.role === "admin" ? "AdminDashboard" : "karyawanDashboard");
      }
    };

    checkLogin();
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan Password harus diisi.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Format email tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw new Error("Login gagal: " + loginError.message);

      if (!session?.user?.id) throw new Error("User ID tidak ditemukan setelah login.");

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("name, role")
        .eq("id", session.user.id)
        .single();

      if (userError) throw new Error("Error fetching user role: " + userError.message);

      const role = userData?.role;
      setUser({ id: session.user.id, name: userData?.name || session.user.email, role });

      Alert.alert("Login Berhasil", "Selamat datang!");
      navigation.navigate(role === "admin" ? "AdminDashboard" : "karyawanDashboard");
    } catch (error: any) {
      console.error("Login Error:", error);
      Alert.alert("Login Error", error.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      

      <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Login"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Registrasi")} style={styles.linkContainer}>
        <Text style={styles.linkText}>Belum punya akun? Daftar di sini</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#ff4500" style={styles.loader} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2c3e50", // Tema yang sama seperti halaman Absensi
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff", // Warna aksen merah terang
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 8,
    backgroundColor: "#34495e", // Warna latar belakang abu-abu tua
    color: "#ecf0f1", // Warna teks terang
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#e74c3c", // Warna tombol merah terang
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkContainer: {
    marginTop: 10,
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
});

export default LoginScreen;
