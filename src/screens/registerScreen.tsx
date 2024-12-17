  import React, { useState } from 'react';
  import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
  import { useNavigation } from '@react-navigation/native';
  import { registerUser } from '../lib/supabase/auth/register';
  import { StackNavigationProp } from '@react-navigation/stack';
  import { RootStackParamList } from '../../App';
  type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, "Registrasi">;

  const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const handleRegister = async () => {
      setLoading(true);  // Set loading saat proses registrasi
      setMessage('');  // Reset message sebelum mencoba registrasi
      try {
        const result = await registerUser(email, password, name);

        // Validasi password
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // Contoh password minimal 6 karakter dengan angka
        if (!passwordRegex.test(password)) {
          Alert.alert("Error", "Password minimal 6 karakter dan mengandung angka.");
          setLoading(false); // Set loading kembali false jika validasi gagal
          return;
        }

        if (result.success) {
          setMessage('Registrasi berhasil!');
          navigation.navigate('Login'); // Navigate to login screen after successful registration
        } else {
          setMessage(result.message || 'Terjadi kesalahan, silakan coba lagi.');
        }
      } catch (error) {
        setMessage('Terjadi kesalahan, silakan coba lagi.');
      } finally {
        setLoading(false);  // Set loading ke false setelah proses selesai
      }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Registrasi</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"  // Sesuaikan warna placeholder
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ccc"  // Sesuaikan warna placeholder
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Nama"
          placeholderTextColor="#ccc"  // Sesuaikan warna placeholder
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.button}>
          <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Daftar'}</Text>
        </TouchableOpacity>
        

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
          <Text style={styles.linkText}>Kembali ke Login</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#2c3e50',  // Warna latar belakang yang sama dengan login
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',  // Warna utama yang sama dengan login
      marginBottom: 20,
    },
    input: {
      marginBottom: 10,
      width: '100%',
      padding: 15,
      borderWidth: 1,
      borderColor: '#e74c3c',  // Warna border yang sama dengan login
      borderRadius: 8,
      backgroundColor: '#34495e',  // Warna background gelap yang sama dengan login
      color: '#ecf0f1',  // Warna teks yang sama dengan login
      fontSize: 16,
    },
    button: {
      marginTop: 20,
      backgroundColor: '#e74c3c',  // Warna tombol yang sama dengan login
      padding: 15,
      borderRadius: 8,
      width: '100%',
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    linkContainer: {
      marginTop: 10,
    },
    linkText: {
      color: '#fff',  // Warna link yang sama dengan login
      fontSize: 16,
    },
    message: {
      marginTop: 20,
      color: '#e74c3c',  // Warna pesan yang sama dengan tema utama
      fontSize: 16,
      textAlign: 'center',
    },
  });

  export default RegisterScreen;
