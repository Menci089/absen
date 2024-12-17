import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { decode } from 'base64-arraybuffer';
import supabase from '../../lib/supabase/init';

const AbsenceScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<any>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error) {
        setAttendance(null);
      } else {
        setAttendance(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInWithSelfie = async () => {
    try {
      setLoading(true);

      // 1. Minta izin lokasi
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to check-in.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 2. Izin kamera
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take a selfie.');
        return;
      }

      // 3. Ambil selfie
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) return;

      const { base64 } = result.assets[0];
      const fileName = `selfie-${Date.now()}.jpg`;
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('You must be logged in.');

      // 4. Upload selfie ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('selfie-bucket')
        .upload(fileName, decode(base64), { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // 5. Dapatkan public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('selfie-bucket')
        .getPublicUrl(fileName);

      // 6. Insert data attendance
      const { data: attendanceData, error: insertError } = await supabase
        .from('attendance')
        .insert([{ user_id: user.id, date: today, check_in: currentTime, selfie_url: publicUrl }])
        .select('id')
        .single();

      if (insertError) throw insertError;

      // 7. Insert lokasi ke tabel attendance_location
      const { error: locationError } = await supabase
        .from('attendance_location')
        .insert([{ attendance_id: attendanceData.id, latitude, longitude }]);

      if (locationError) throw locationError;

      setSelfieUri(publicUrl);
      Alert.alert('Success', 'Check-in successful with selfie and location!');
      fetchAttendance();
    } catch (error: any) {
      console.error('Error during check-in:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('You must be logged in.');

      // Update the attendance record with the checkout time
      const { data: updatedAttendance, error: updateError } = await supabase
        .from('attendance')
        .update({ check_out: currentTime })
        .eq('user_id', user.id)
        .eq('date', today)
        .select('check_out')
        .single();

      if (updateError) throw updateError;

      Alert.alert('Success', 'Check-out successful!');
      fetchAttendance();
    } catch (error: any) {
      console.error('Error during check-out:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Absensi</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : attendance ? (
        <>
          <Text style={styles.text}>Check-in: {attendance.check_in || '-'}</Text>
          <Text style={styles.text}>Check-out: {attendance.check_out || '-'}</Text>
          <Image source={{ uri: selfieUri || attendance.selfie_url }} style={styles.selfie} />
          <Button title="Check-out" onPress={handleCheckOut} color="#e74c3c" />
        </>
      ) : (
        <Button title="Check-in dengan Selfie & Lokasi" onPress={handleCheckInWithSelfie} color="#27ae60" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  selfie: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 20,
  },
});

export default AbsenceScreen;
