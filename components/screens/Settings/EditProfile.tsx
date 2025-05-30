import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { StyleSheet, ScrollView, View, Switch, Alert } from 'react-native'
import { Button, Input, Text } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Picker } from '@react-native-picker/picker'
import { useMMKV } from 'react-native-mmkv'

export default function EditProfile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [FirstName, setFirstName] = useState('')
  const [SecondName, setSecondName] = useState('')
  const [Gender, setGender] = useState<string>("Male")
  const [FavouritePosition, setFavouritePosition] = useState<string>("GK")
  const [FavouriteClub, setFavouriteClub] = useState('')
  const [Level, setLevel] = useState<number>(1)

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const storage = useMMKV()


  console.log(session)

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      let { data, error, status } = await supabase
        .from('Profiles')
        .select()
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) { //  
        throw error
      }

      if (data) {
        setFirstName(data.FirstName)
        setSecondName(data.SecondName)
        setGender(data.Gender)
        setFavouriteClub(data.FavouriteClub)
        setFavouritePosition(data.FavouritePosition)
        setLevel(data.Level)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    FirstName,
    SecondName,
    Gender,
    FavouritePosition,
    FavouriteClub,
    Level,
  }: {
    FirstName: string
    SecondName: string
    Gender: string
    FavouritePosition: string
    FavouriteClub: string
    Level: number
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      console.log(FirstName, "")
      if (FirstName === "" || SecondName === "" || FirstName === null || SecondName === null) {
        alert("First Name or Second Name is Empty!!")

      } else {

        const updates = {
          id: session?.user.id,
          FirstName,
          SecondName,
          // Gender,
          FavouritePosition,
          FavouriteClub,
          Level,
        }

        let { data, error } = await supabase.from('Profiles').update(updates).eq('id', session?.user.id).select()

        console.log(error)
        // storage.set('sex', Gender)
        storage.set('level', Level)

        if (error) {
          throw error
        }

        navigation.navigate("Home")

      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="First Name" value={FirstName || ''} onChangeText={(text) => setFirstName(text)} />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Second Name" value={SecondName || ''} onChangeText={(text) => setSecondName(text)} />
      </View>
      {/* <View style={styles.verticallySpaced}>
        <Text>Gender</Text>
        <Picker prompt="Gender" selectedValue={Gender} onValueChange={itemValue => setGender(itemValue)}>
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
        </Picker>
      </View> */}
      <View style={styles.verticallySpaced}>
        <Text>Favourite Position?</Text>
        <Picker prompt="Favourite Position?" selectedValue={FavouritePosition} onValueChange={itemValue => setFavouritePosition(itemValue)}>
          <Picker.Item label="GK (Goalkeeper)" value="GK" />
          <Picker.Item label="DEF (Defender)" value="DEF" />
          <Picker.Item label="MID (Midfielder)" value="MID" />
          <Picker.Item label="ATK (Attacker)" value="ATK" />
        </Picker>
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Favourite Football Club?" value={FavouriteClub || ''} onChangeText={(text) => setFavouriteClub(text)} />
      </View>
      <View style={styles.verticallySpaced}>
        <Text>Football Level?</Text>
        <Picker selectedValue={Level} onValueChange={(itemValue) => setLevel(itemValue)} >
          <Picker.Item label="Beginner" value={1} />
          <Picker.Item label="Casual" value={2} />
          <Picker.Item label="Amateur" value={3} />
          <Picker.Item label="Expert" value={4} />
          <Picker.Item label="All-Star" value={5} />
        </Picker>
      </View>


      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          color={'rgb(245, 148, 92)'} titleStyle={{ color: 'black' }}
          onPress={() => { updateProfile({ FirstName, SecondName, Gender, FavouritePosition, FavouriteClub, Level }) }}
          disabled={loading}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign Out" color={'rgb(245, 148, 92)'} titleStyle={{ color: 'black' }}
          containerStyle={{
            marginVertical: 10,
          }}
          onPress={() => supabase.auth.signOut()} />
      </View>

    </ScrollView>
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