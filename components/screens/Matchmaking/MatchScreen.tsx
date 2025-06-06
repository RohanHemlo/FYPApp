import { RefreshControl, ScrollView, View, Text, StyleSheet, FlatList, Pressable } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useMMKV } from 'react-native-mmkv'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import Modal from 'react-native-modal'
import { Button } from '@rneui/themed'
import { Picker } from '@react-native-picker/picker'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { checkMaps } from '../../CustomProps/checkMaps'

export default function MatchScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [joinedMatches, setJoinedMatches] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [positionChosen, setPositionChosen] = useState<string>('GK')
  const [availablePositions, setAvailablePositions] = useState<string[]>([])

  // TODO: IMPLEMENT WITH RPC INSTEAD (SORT BY DATE CLOSEST OR AMOUNT OF PLAYERS NEEDED)

  const storage = useMMKV()
  const isFocused = useIsFocused()

  const navigation = useNavigation<NativeStackNavigationProp<any>>()


  const user_id = storage.getString('user_id')
  const level = storage.getNumber('level')
  const gender = storage.getString('sex')
  // console.log(gender)

  useEffect(() => {

    if (isFocused) {
      onRefresh()
    }
  }, [isFocused])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      getUpcomingMatches()
      setRefreshing(false)
    }, 500)
  }, [])

  async function getAlreadyJoined() {
    let { data, error } = await supabase.from('PlayerSession').select("SessionID").eq('UserID', user_id)

    if (!error && data) {
      let array: number[] = []
      for (var index in data) {
        array.push(data[index].SessionID)
      }
      setJoinedMatches(array)
    }
  }

  async function getUpcomingMatches() {
    let { data, error } = await supabase.from('Session').select().eq('UpComing', 'true').eq('Gender', gender)

    getAlreadyJoined()

    if (!error && data) {
      setMatches(data)
    }
  }

  function removeFromArray(array: string[], item: string) {
    const index = array.indexOf(item)
    if (index !== -1) array.splice(index, 1)
  }

  async function getAvailablePositions(session_id: number, totalPlayers: number) {
    let { data } = await supabase.rpc('get_position_chosen_by_session', { session_id })

    let positions: string[] = []
    if (totalPlayers === 7) {
      positions = ["GK", "GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "ATK", "ATK", "ATK", "ATK"]
    } else if (totalPlayers === 5) {
      positions = ["GK", "GK", "DEF", "DEF", "MID", "MID", "MID", "MID", "ATK", "ATK"]
    }

    data?.forEach(({ position_chosen }: any) => {
      removeFromArray(positions, position_chosen)
    })

    const unique = Array.from(new Set(positions))
    setAvailablePositions(unique)
  }

  async function updateSession(session_id: number, current_count: number) {
    let { data, error } = await supabase.from('Session')
      .update({ PlayerCount: current_count + 1 })
      .eq('SessionID', session_id)
      .select()

    // console.log("Updated Session: ")
    // console.log(data, error)
  }

  async function insertPlayerSession(position: string, session_id: number, current_count: number) {

    let { data, error } = await supabase.from('PlayerSession')
      .upsert({ UserID: user_id, SessionID: session_id, PositionChosen: position, Voted: false })
      .select()

    // console.log("Insert Into Player Session: ")
    // console.log(data, error)

    updateSession(session_id, current_count)

  }

  function openModal(match: any) {
    setSelectedMatch(match)
    getAvailablePositions(match.SessionID, match.TotalPlayers).then(() => {
      setShowModal(true)
    })
  }

  const getLabel = (value: string) => {
    switch (value) {
      case 'GK': return 'Goalkeeper'
      case 'DEF': return 'Defender'
      case 'MID': return 'Midfielder'
      case 'ATK': return 'Attacker'
      default: return value
    }
  }

  const checkLevel = (match_level: number | undefined) => {
    let string = ''
    if (match_level != level) {
      string = "This is a different difficulty to your chosen difficulty!"
    }

    return (string)
  }

  const getLevel = (value: number | undefined) => {
    switch (value) {
      case 1: return "Beginner"
      case 2: return "Casual"
      case 3: return "Amateur"
      case 4: return "Expert"
      case 5: return "All-Star"
      default: return value
    }
  }

  function DisplayMatches({ match, onJoinPress }: { match: any, onJoinPress: (match: any) => void }) {
    const date = new Date(match.MatchTime)
    const gender = match.Gender === "Male" ? "Men's Only" : "Women's Only"
    const level = getLevel(match.Level)
    const info = match.Information || "No additional info!"
    var able = false

    // console.log(joinedMatches, (match.SessionID))
    if (joinedMatches.includes(match.SessionID)) {
      // console.log('ran')
      able = true
    }

    return (
      <View style={styles.wholeView}>
        <View style={styles.viewDate}>
          <Text style={styles.text}>{date.toDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <Text>{gender}</Text>
        <Text>Player Count: {match.PlayerCount + "/" + match.TotalPlayers * 2}</Text>
        <Pressable onPress={() => checkMaps(match.Address)}>
          <Text style={styles.addressText}>{match.Address}</Text>
        </Pressable>
        <Text style={styles.levelText}>Level: {level}</Text>
        <Text style={styles.infoText}>{info}</Text>

        <Button title={able ? 'Already Joined!' : "Join!"}
          color={able ? 'grey' : 'rgb(245, 148, 92)'}
          titleStyle={{ color: 'black' }}
          onPress={() => [console.log('pressed'), onJoinPress(match)]}
          disabled={able}
        />
      </View>
    )
  }

  if (matches.length === 0) {
    return (
      <View>
        <Text>There are no matches right now, make a new one or wait for someone to make it</Text>
      </View>
    )
  }
  else {
    // console.log("IN MATCH SCREEN:", matches)
    return (
      <SafeAreaView>
        <FlatList
          data={matches}
          renderItem={({ item }) => (
            <DisplayMatches match={item} onJoinPress={openModal} />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />

        <Modal
          isVisible={showModal}
          onBackdropPress={() => setShowModal(false)}
          style={styles.modal}
          animationIn="slideInUp"
          animationOut="slideOutDown"
        >
          <View style={styles.modalContent}>
            {selectedMatch && (
              <>
                <Text style={styles.modalHeaderText}>Match Info</Text>
                <Text style={styles.modalText}>Date: {new Date(selectedMatch.MatchTime).toDateString()} {new Date(selectedMatch.MatchTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.modalText}>{selectedMatch.Gender === 'Male' ? "Men's Only" : "Women's Only"}</Text>
                <Pressable onPress={() => checkMaps(selectedMatch.Address)}>
                  <Text style={styles.modalAddressText}>Location: {selectedMatch.Address}</Text>
                </Pressable>
                <Text style={styles.modalText}>Level: {getLevel(selectedMatch.Level)} <Text style={styles.modalWarning}>{checkLevel(selectedMatch.Level)}</Text></Text>
                <Text style={[styles.modalText, { marginTop: 10 }]}>Pick your position:</Text>
              </>
            )}
            <Picker
              selectedValue={positionChosen}
              onValueChange={value => setPositionChosen(value)}
            >
              {availablePositions.map(pos => (
                <Picker.Item key={pos} label={getLabel(pos)} value={pos} />
              ))}
            </Picker>
            <Button
              title="Join Match!"
              color={'rgb(245, 148, 92)'}
              titleStyle={{ color: 'black' }}
              onPress={() => {
                if (selectedMatch) {
                  insertPlayerSession(positionChosen, selectedMatch.SessionID, selectedMatch.PlayerCount)
                }
                setShowModal(false)
                onRefresh()
                navigation.navigate('Calendar')
              }}
            />
          </View>
        </Modal>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  modal: {
      justifyContent: 'flex-end',
      margin: 0,
  },
  modalContent: {
      height: '50%',
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
  },
  modalText: {
      fontSize: 18,
      // marginBottom: 20,
  },
  modalAddressText: {
      fontSize: 18,
      color: '#0066cc',
      textDecorationLine: 'underline',
      marginBottom: 6,
  },
  modalWarning: {
      fontSize: 14,
      color: 'red',
  },
  modalHeaderText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  wholeView: {
      backgroundColor: '#fff',
      padding: 16,
      marginVertical: 10,
      marginHorizontal: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2, // for Android shadow
  },
  viewDate: {
      marginBottom: 8,
  },
  text: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
  },
  addressText: {
      fontSize: 15,
      color: '#0066cc',
      textDecorationLine: 'underline',
      marginBottom: 6,
  },
  levelText: {
      fontSize: 15,
      color: '#666',
      marginBottom: 4,
  },
  infoText: {
      fontSize: 14,
      color: '#444',
      marginBottom: 12,
  },
  button: {
      backgroundColor: 'rgb(245, 148, 92)',
      paddingVertical: 10,
      borderRadius: 8,
  },
})
