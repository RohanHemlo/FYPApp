import React, { useRef, useEffect, lazy } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

// SCREENS

import UpComingMatch from '../screens/Calendar/UpComingMatch'
import History from '../screens/Calendar/History'

// ANIMATED TAB BAR

import AnimatedTabBar from '../CustomProps/AnimatedTabBar'

const Tab = createMaterialTopTabNavigator()

export default function CalendarTopBarContainer() {

    return (
        <Tab.Navigator initialRouteName={"Upcoming Match"} tabBar={(props) => <AnimatedTabBar {...props} />}>
            <Tab.Screen name="Upcoming Match" component={UpComingMatch} />
            <Tab.Screen name="History" component={History} />
        </Tab.Navigator>
    )
}