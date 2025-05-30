import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { supabase } from '../../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from "@react-navigation/native";
import { MMKV, useMMKV } from 'react-native-mmkv'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  async function signInWithEmail() {
    setLoading(true)
    console.log({ email, password })
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  return (
    <View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading}
        color={'rgb(245, 148, 92)'} titleStyle={{color: 'black'}}
        onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} 
        color={'rgb(245, 148, 92)'} titleStyle={{color: 'black'}}
        onPress={() => navigation.navigate("Sign Up")} />
      </View>
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