import { TouchableOpacity, StyleSheet, Text, ScrollView, View } from 'react-native'
import { Button } from '@rneui/themed';
import { Session } from '@supabase/supabase-js'
import { MMKV, useMMKV} from 'react-native-mmkv'
import { supabase } from '../../lib/supabase'
import React from 'react'

const Settings = () => {
  return (
    <View>
      <Button title="Sign Out" color={'rgb(245, 148, 92)'} titleStyle={{color: 'black'}} onPress={() => supabase.auth.signOut()} />
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  button: {
    width: '47%', // about 2 per row with spacing
    height: '47%',
    aspectRatio: 1, // 👈 keeps it square
    backgroundColor: 'rgb(245, 148, 92)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
})