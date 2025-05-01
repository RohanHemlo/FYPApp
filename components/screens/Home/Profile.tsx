import { TouchableOpacity, StyleSheet, Text, ScrollView, View, Button } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { MMKV, useMMKV} from 'react-native-mmkv'
import { supabase } from '../../../lib/supabase'
import React from 'react'

const Profile = () => {

  const storage = useMMKV();
  console.log("SESSION")
  console.log(storage.getString('session'))

  return (
    <ScrollView>
      <View>
        <Text>Profile</Text>
        <TouchableOpacity style={styles.button}>
          <Text>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text>Rank</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  )
}

export default Profile

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