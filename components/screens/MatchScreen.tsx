import { View, Text } from 'react-native'
import React from 'react'
import { useMMKV } from 'react-native-mmkv'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

export default function MatchScreen () {

  const storage = useMMKV();

  let x:string = storage.getString('session')!
  const object = JSON.parse(x)
  console.log(object)
  const id = object?.user?.identities?.[0]?.id

  return (
    <View>
      <Text>{id}</Text>
    </View>
  )
}
