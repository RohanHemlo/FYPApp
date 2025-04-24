import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { MMKV, useMMKV } from 'react-native-mmkv'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack";

////// npx expo run:android TO BUILD AND RUN APP ///////

//ALL NORMAL SCREENS
import TabContainer from './components/Navigation/BottomTabContainer'

//AUTH SCREENS
import SignIn from './components/Auth/SignIn'
import SignUp from './components/Auth/SignUp'

export const storage = new MMKV()

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      storage.set('session', JSON.stringify(session))
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      storage.set('session', JSON.stringify(session))
    })

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

      {session && session.user ? (
        <TabContainer />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: true }}>
          <Stack.Screen name="Sign In" component={SignIn} />
          <Stack.Screen name="Sign Up" component={SignUp} />
        </Stack.Navigator>
      )
      }

    </NavigationContainer >
  )
}

// <View>

{/* </Stack.Navigator> */ }

{/* {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />} */ }
{/* <Main></Main> */ }
{/* </View> */ }