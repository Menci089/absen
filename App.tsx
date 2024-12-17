// App.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/loginScreen";
import RegisterScreen from "./src/screens/registerScreen";
import AdminDashboard from "./src/screens/adminDashboard";
import EmployeeDashboard from "./src/screens/employeeDashboard";
import AbsenceScreen from "./src/screens/ui/absenceScreen";
import { UserProvider } from "./src/lib/supabase/context/userContext";
import LeaveRequest from "./src/screens/ui/leaveReqScreen";
import Laporan from "./src/screens/reportScreens";
import DetailLaporan from "./src/screens/ui/detailReport";
import TambahLaporan from "./src/screens/ui/addReport";

export type RootStackParamList = {
  Login: undefined;
  AdminDashboard: undefined;
  karyawanDashboard: undefined;
  Registrasi: undefined;
  Absensi:undefined
  IjinCuti:undefined
  Laporan:undefined
};

const Stack = createStackNavigator();

const App = () => {
  return (
   <UserProvider>
     <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen  name="Login"  options={{headerShown:false}} component={LoginScreen} />
        <Stack.Screen name="Registrasi" options={{headerShown:false}} component={RegisterScreen} />
        <Stack.Screen name="AdminDashboard" options={{ headerLeft: () => null }} component={AdminDashboard} />
        <Stack.Screen
          name="karyawanDashboard"
          options={{ headerLeft: () => null }}
          component={EmployeeDashboard}
        />
        <Stack.Screen name="Absensi" component={AbsenceScreen}/>
        <Stack.Screen name="IjinCuti" component={LeaveRequest}/>
        <Stack.Screen name="Laporan" component={Laporan}/>
        <Stack.Screen name="DetailLaporan" component={DetailLaporan}/>
        <Stack.Screen name="TambahLaporan" component={TambahLaporan}/>
      </Stack.Navigator>
    </NavigationContainer>
   </UserProvider>
  );
};

export default App;
