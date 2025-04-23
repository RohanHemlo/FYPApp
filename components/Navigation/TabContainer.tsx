import { View, Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons';

// SCREENS

import Profile from '../screens/Profile'
import Settings from '../screens/Settings'
import GameJoin from '../screens/GameJoin'
import Leaderboard from '../screens/Leaderboard'

const Tab = createBottomTabNavigator()

export default function TabContainer() {
    return (
        <Tab.Navigator
            initialRouteName={"Profile"}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'home';
                    let rn = route.name;

                    if (rn === "Profile") {
                        iconName = focused ? 'home' : 'home-outline';

                    } else if (rn === "Settings") {
                        iconName = focused ? 'settings' : 'settings-outline';

                    } else if (rn === "Leaderboard") {
                        iconName = focused ? 'podium' : 'podium-outline';

                    } else if (rn === "Play!") {
                        iconName = focused ? 'football' : 'football-outline';
                    }

                    // You can return any component that you like here!
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#f5945c',
                tabBarInactiveTintColor: 'grey',
                labelStyle: { paddingBottom: 10, fontSize: 10 },
                style: { padding: 10, height: 70 },
                headerShown: false
            })}>

            <Tab.Screen name={"Profile"} component={Profile} />
            <Tab.Screen name={"Leaderboard"} component={Leaderboard} />
            <Tab.Screen name={"Play!"} component={GameJoin} />
            <Tab.Screen name={"Settings"} component={Settings} />
            
        </Tab.Navigator>
    )
}