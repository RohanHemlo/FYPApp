import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { MMKV, useMMKV } from 'react-native-mmkv'
import Auth from './components/Auth'
import Account from './components/Accounts'
import { View, ActivityIndicator } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main from './components/Main'
import Profile from './components/screens/Profile'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import TabContainer from './components/Navigation/TabContainer'

export const storage = new MMKV()

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  const Stack = createNativeStackNavigator(); 
  storage.set('user.name', 'Marc')


  // TODO: CHECK HOW TO USE ASYNC STORAGE AND GET THE TAB BAR DONE

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      storage.set('session', JSON.stringify(session))
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      storage.set('session', JSON.stringify(session))
    })

    // if (session != null) {
    //   storage.set('session', JSON.stringify(session))
    // }

  }, [])

  // }

  // const renderInitialScreen = () => {
  //   checkName()
  //   if (!session || !session.user) {
  //     return <Stack.Screen name="Auth" component={Auth} />;
  //   }

  //   if (!hasFirstName) {
  //     return (
  //       <>
  //       {/* <Stack.Screen name="Account">
  //         {(props) => <Account {...props} session={session} />}
  //       </Stack.Screen> */}
  //       <Stack.Screen name="Profile" component={Profile} />
  //       </>
  //     );
  //   }

  //   return (
  //     <>

  //     </>

  //     // <Stack.Screen name="Account">
  //     //     {(props) => <Account {...props} session={session} />}
  //     //   </Stack.Screen>
  //   );
  // }

  return (
    <NavigationContainer>
      {/* <Stack.Navigator screenOptions={{ headerShown: true }}> */}
      {/* {renderInitialScreen()} */}
      {/* <Stack.Screen name="Account">
              {(props) => <Account {...props} session={session} />}
            </Stack.Screen> */}
      {session && session.user ? (
        <TabContainer/>
      ) : (
        // <>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </Stack.Navigator>
      )
      }
      {/* </Stack.Navigator> */}
    </NavigationContainer >
  )
}

// <View>

{/* {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />} */ }
{/* <Main></Main> */ }
{/* </View> */ }