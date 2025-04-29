import { RefreshControl, ScrollView, View, Text, StyleSheet, FlatList, Linking, Platform, Pressable } from 'react-native'
import React from 'react'
import { supabase } from '../../../lib/supabase'
import { useMMKV } from 'react-native-mmkv'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useIsFocused } from '@react-navigation/native'
import Modal from 'react-native-modal'
import { Button, Input } from '@rneui/themed'
import { Picker } from '@react-native-picker/picker'

// TODO: PLAYERS CAN ONLY CHOOSE FROM AVAILABLE ROLES 
// TODO: WHEN A PLAYER JOINED ALREADY, MAKE IT SO THAT THEY CAN'T PRESS THE JOIN BUTTON
// TODO: FIX THE TIME (TRY SHOW IT TO DEVICE TIME)
// TODO: IMPLEMENT WITH RPC INSTEAD (SORT BY DATE CLOSEST OR AMOUNT OF PLAYERS NEEDED)

export default function MatchScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState<any>([]);
  const storage = useMMKV()

  const isFocused = useIsFocused()

  useEffect(() => {
    getUpcomingMatches()
    if (isFocused) {
      onRefresh()
    }
  }, [isFocused])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getUpcomingMatches()
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  let json_string: string = storage.getString('session')!
  const session = JSON.parse(json_string)
  const user_id = session?.user?.identities?.[0]?.id

  async function getUpcomingMatches() {
    let { data, error } = await supabase.from('Session').select().eq('UpComing', 'true')
    // console.log(data?.length)
    if (error) {
      // console.log(error)
    } else {
      // console.log(data)
      setMatches(data)
    }
  }

  function checkMaps(address: any) {
    const scheme = Platform.select({
      ios: `maps://?q=${address}`,
      android: `geo:0,0?q=${address}`,
    })

    if (scheme) {
      Linking.openURL(scheme)
    }
  }

  async function updateSession(session_id:number, current_count:number) {
    const {data, error} = await supabase.from('Session')
    .update({ PlayerCount: current_count + 1})
    .eq('SessionID', session_id)
    .select()

    console.log("Updated Session: ")
    console.log(data, error)
  }

  async function insertPlayerSession(position:string, session_id:number, current_count:number) {

    const {data, error} = await supabase.from('PlayerSession')
    .upsert({ UserID: user_id, SessionID: session_id, PositionChosen: position, Voted: false})
    .select()

    console.log("Insert Into Player Session: ")
    console.log(data, error)

    updateSession(session_id, current_count)
    
  }

  function DisplayMatches({ match }: { match: any }) {
    const [showModal, setShowModal] = useState<boolean>(false)
    const [positionChosen, setPositionChosen] = useState<string>("GK")

    const toggleModal = () => {
      setShowModal(!showModal)
    }

    const date: Date = new Date(match.MatchTime)
    var gender
    var info
    if (!match.Information) {
      info = "No additional info!"
    }
    else {
      info = match.Information
    }

    // console.log(match.Address)
    if (match.Gender === "Male") {
      gender = "Men's Only"
    }
    else if (match.Gender === "Female") {
      gender = "Women's Only"
    }

    return (
      <View style={styles.whole_view}>
        <View style={styles.view_date}>
          <Text style={styles.text}>{date.toString().substring(0, 21) + " " + date.toString().substring(25, 28)}</Text>
        </View>
        <View>
          <Text>{gender}</Text>
        </View>
        <View>
          <Text>Player Count: {match.PlayerCount + "/" + match.TotalPlayers * 2}</Text>
        </View>
        <View>
          <Pressable onPress={() => checkMaps(match.Address)}>
            <Text style={{ textDecorationLine: 'underline' }}>{match.Address}</Text>
          </Pressable>
        </View>
        <View>
          <Text>{info}</Text>
        </View>


        < View >
          <Button title="Join!" color={'rgb(245, 148, 92)'} titleStyle={{ color: 'black' }} onPress={toggleModal} />

          <Modal
            isVisible={showModal}
            onBackdropPress={toggleModal}
            style={styles.modal}
            animationIn="slideInUp"
            animationOut="slideOutDown"
          >
            <View style={styles.modalContent}>
              {/* <Text style={styles.modalText}>I am the modal content! {match.SessionID}</Text> */}
              <Text style={styles.modalText}>Pick your position!</Text>
              <Picker prompt="Which position do you want to play?" selectedValue={positionChosen} onValueChange={itemValue => setPositionChosen(itemValue)}>
                <Picker.Item label="Goalkeeper" value={"GK"} />
                <Picker.Item label="Defender" value={"DEF"} />
                <Picker.Item label="Midfielder" value={"MID"} />
                <Picker.Item label="Attacker" value={"ATK"} />
              </Picker>

              <Button title="Join Match!" color={'rgb(245, 148, 92)'} titleStyle={{ color: 'black' }} onPress={() => [toggleModal(), insertPlayerSession(positionChosen, match.SessionID, match.PlayerCount)]} />
            </View>
          </Modal>

        </View >

      </View>

    )
  }

  return (
    <SafeAreaView>
      <View>
        <FlatList
          data={matches}
          renderItem={({ item }) =>
            <>
              <DisplayMatches match={item}></DisplayMatches>
            </>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  whole_view: {
    padding: '2%',
    margin: '2%',
  },
  view_date: {
    backgroundColor: 'rgb(246, 177, 138)',
    padding: '2%',
  },
  text: {
    fontSize: 18,
  },
  modal: {
    justifyContent: 'flex-end', // Align to bottom
    margin: 0,                  // Remove default margin
  },
  modalContent: {
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
})
