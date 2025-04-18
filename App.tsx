import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Account from './components/Accounts'
import { View, ActivityIndicator  } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main  from './components/Main'
import Profile from './components/screens/Profile'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [hasFirstName, setHasFirstName] = useState<boolean>(false)


  const Stack = createNativeStackNavigator();

  // TODO: CHECK IF THE SOLUTION GIVEN WORKS FOR THE LOGIN 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })


  }, [])

  async function checkName() {
    let { data, error, status } = await supabase
        .from('Profiles')
        .select()
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) { //  
        throw error
      }
    
    if (data.FirstName) {
      console.log("SHould be name")
      console.log(data.FirstName)
      setHasFirstName(true)
    }

  }

  const renderInitialScreen = () => {
    checkName()
    if (!session || !session.user) {
      return <Stack.Screen name="Auth" component={Auth} />;
    }

    if (!hasFirstName) {
      return (
        <>
        <Stack.Screen name="Account">
          {(props) => <Account {...props} session={session} />}
        </Stack.Screen>
        <Stack.Screen name="Profile" component={Profile} />
        </>
      );
    }

    return (
      <Stack.Screen name="Profile" component={Profile} />
      // <Stack.Screen name="Account">
      //     {(props) => <Account {...props} session={session} />}
      //   </Stack.Screen>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {renderInitialScreen()}
        {/* {session && session.user ? (
          <>
            <Stack.Screen name="Account">
              {(props) => <Account {...props} session={session} />}
            </Stack.Screen>
            <Stack.Screen name="Profile" component={Profile} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={Auth} />
        )} */}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

// <View>
    
    {/* {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />} */}
    {/* <Main></Main> */}
    {/* </View> */}