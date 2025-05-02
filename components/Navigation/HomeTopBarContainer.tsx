import React, { useRef, useEffect, lazy } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

// SCREENS

import Profile from '../screens/Home/Profile'
import Leaderboard from '../screens/Home/Leaderboard'

// ANIMATED TAB BAR

import AnimatedTabBar from '../CustomProps/AnimatedTabBar'

const Tab = createMaterialTopTabNavigator()

export default function HomeTopBarContainer() {

    return (
        <Tab.Navigator initialRouteName={"Stats"} tabBar={(props) => <AnimatedTabBar {...props} />}>
            <Tab.Screen name="Stats" component={Profile} />
            <Tab.Screen name="Leaderboard" component={Leaderboard} />
        </Tab.Navigator>
    )
}