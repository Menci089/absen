// src/components/LogoutButton.js

import React from 'react';
import { View, Button } from 'react-native';
import { logoutUser } from '../lib/supabase/auth/logout';

const LogoutButton = ({ navigation }: any) => {
  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      navigation.replace('Login');
    }
  };

  return (
    <View>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default LogoutButton;
