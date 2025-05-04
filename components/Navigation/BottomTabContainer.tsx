import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons';

// SCREENS

import HomeTopBarContainer from './HomeTopBarContainer';
import SettingsNavigation from './SettingsNavigation'
import MatchTopBarContainer from './MatchTopBarContainer'
import CalendarTopBarContainer from './CalendarTopBarContainer';
import Vote from '../screens/Vote';

export default function TabContainer() {
    const Tab = createBottomTabNavigator()

    return (
        <Tab.Navigator
            initialRouteName={"Home"}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'home';
                    let rn = route.name;

                    if (rn === "Home") {
                        iconName = focused ? 'home' : 'home-outline';

                    } else if (rn === "Settings") {
                        iconName = focused ? 'settings' : 'settings-outline';

                    } else if (rn === "Vote") {
                        iconName = focused ? 'checkbox' : 'checkbox-outline';

                    } else if (rn === "Play!") {
                        iconName = focused ? 'football' : 'football-outline';
                    }
                    else if (rn === "Calendar") {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#f5945c',
                tabBarInactiveTintColor: 'grey',
                labelStyle: { paddingBottom: 10, fontSize: 10 },
                style: { padding: 10, height: 70 },
                headerShown: false
            })}>

            <Tab.Screen name={"Home"} component={HomeTopBarContainer} />
            <Tab.Screen name={"Vote"} component={Vote} />
            <Tab.Screen name={"Play!"} component={MatchTopBarContainer} />
            <Tab.Screen name={"Calendar"} component={CalendarTopBarContainer} />
            <Tab.Screen name={"Settings"} component={SettingsNavigation} />

        </Tab.Navigator>
    )
}
