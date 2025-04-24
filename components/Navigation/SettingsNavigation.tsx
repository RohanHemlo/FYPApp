import { TouchableOpacity, StyleSheet, Text, ScrollView, View } from 'react-native'
import { Button } from '@rneui/themed';
import { Session } from '@supabase/supabase-js'
import { MMKV, useMMKV} from 'react-native-mmkv'
import { supabase } from '../../lib/supabase'
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SettingsMain from '../screens/SettingsMain';
import EditProfile from '../screens/EditProfile';

const Stack = createNativeStackNavigator();

export default function SettingsNavigation() {

  const storage = useMMKV()

  let session_string:string = storage.getString('session')!
  const session = JSON.parse(session_string)

  return (
      <Stack.Navigator>
        <Stack.Screen name="Main Settings" component={SettingsMain} options={{ headerShown: false}}/>
        <Stack.Screen name="Edit Profile">
           {(props) => <EditProfile {...props} session={session} />}
         </Stack.Screen>
      </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '47%', // about 2 per row with spacing
    height: '47%',
    aspectRatio: 1, // <- keeps it square
    backgroundColor: 'rgb(245, 148, 92)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
})