import { TouchableOpacity, StyleSheet, Text, ScrollView, View } from 'react-native'
import { Button } from '@rneui/themed';
import { Session } from '@supabase/supabase-js'
import { MMKV, useMMKV } from 'react-native-mmkv'
import { supabase } from '../../lib/supabase'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from "@react-navigation/native";
import React from 'react'


export default function SettingsMain() {

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={[styles.verticallySpaced, styles.mt20]}>
      <Button title="Edit Account" color={'rgb(245, 148, 92)'} titleStyle={{ color: 'black' }} 
      containerStyle={{
        marginVertical: 10,
      }}
      onPress={() => navigation.navigate("Edit Profile")} />

      <Button title="Sign Out" color={'rgb(245, 148, 92)'} titleStyle={{ color: 'black' }} 
      containerStyle={{
        marginVertical: 10,
      }}
      onPress={() => supabase.auth.signOut()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})