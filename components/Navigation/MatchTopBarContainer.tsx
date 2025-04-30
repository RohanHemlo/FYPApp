import React, { useRef, useEffect } from 'react'
import { View, Text, Pressable, Animated, Dimensions, StyleSheet } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs'
import { useMMKV } from 'react-native-mmkv'
import { supabase } from '../../lib/supabase'

// SCREENS

import MatchScreen from '../screens/Matchmaking/MatchScreen'
import CreateMatch from '../screens/Matchmaking/CreateMatch'
import MatchMakeCooldown from '../screens/Matchmaking/MatchMakeCooldown'

// ANIMATED TAB BAR

import AnimatedTabBar from '../CustomProps/AnimatedTabBar'

// export default function MatchTopBarContainer() {
//   const Tab = createMaterialTopTabNavigator()

//   return (
//     <Tab.Navigator
//       initialRouteName={'Find Match'}
//       screenOptions={{
//         tabBarLabelStyle: { fontWeight: 'bold' },
//         tabBarActiveTintColor: '#f5945c',  
//         tabBarInactiveTintColor: 'grey',  
//         tabBarIndicatorStyle: { backgroundColor: '#f5945c' }, 
//       }}
//     >
//       <Tab.Screen name={'Find Match'} component={MatchScreen} />
//       <Tab.Screen name={'Create a Match'} component={CreateMatch} />
//     </Tab.Navigator>
//   )
// }

// CODE BELOW HERE IS TO MAKE THE WHOLE BUTTON COLOUR INSTEAD OF JUST THE INDICATOR 

const Tab = createMaterialTopTabNavigator()

export default function MatchTopBarContainer() {

  const storage = useMMKV()
  let json_string: string = storage.getString('session')!
  const session = JSON.parse(json_string)
  const user_id = session?.user?.identities?.[0]?.id

  async function getCanMakeMatch() {
    let { data, error, status } = await supabase.from("Profiles").select("CanMakeMatch").eq('id', user_id)

    if (data) {
      storage.set('canMakeMatch', data[0].CanMakeMatch)
    }
  }

  getCanMakeMatch()
  return (
    <Tab.Navigator initialRouteName={"Find Match"} tabBar={(props) => <AnimatedTabBar {...props} />}>
      <Tab.Screen name="Find Match" component={MatchScreen} />
      {storage.getBoolean('canMakeMatch') ? (
        <Tab.Screen name="Create a Match" component={CreateMatch} />
      ) : (
        <Tab.Screen name="No Match Make" component={MatchMakeCooldown} />
      )
      }

    </Tab.Navigator>
  )
}