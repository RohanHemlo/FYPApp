import { RefreshControl, ScrollView, View, Text, StyleSheet, FlatList, Linking, Platform, Pressable } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useMMKV } from 'react-native-mmkv'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useIsFocused } from '@react-navigation/native'
import Modal from 'react-native-modal'
import { Button } from '@rneui/themed'
import { Picker } from '@react-native-picker/picker'

export default function MatchScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [positionChosen, setPositionChosen] = useState<string>('GK')
  const [availablePositions, setAvailablePositions] = useState<string[]>([])

  // TODO: PLAYERS CAN ONLY CHOOSE FROM AVAILABLE ROLES 
  // TODO: WHEN A PLAYER JOINED ALREADY, MAKE IT SO THAT THEY CAN'T PRESS THE JOIN BUTTON
  // TODO: FIX THE TIME (TRY SHOW IT TO DEVICE TIME)
  // TODO: IMPLEMENT WITH RPC INSTEAD (SORT BY DATE CLOSEST OR AMOUNT OF PLAYERS NEEDED)

  const storage = useMMKV()
  const isFocused = useIsFocused()

  let json_string: string = storage.getString('session')!
  const session = JSON.parse(json_string)
  const user_id = session?.user?.identities?.[0]?.id

  useEffect(() => {
    getUpcomingMatches()
    if (isFocused) {
      onRefresh()
    }
  }, [isFocused])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    getUpcomingMatches()
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }, [])

  async function getUpcomingMatches() {
    let { data, error } = await supabase.from('Session').select().eq('UpComing', 'true')
    if (!error && data) {
      setMatches(data)
    }
  }

  function checkMaps(address: string) {
    const scheme = Platform.select({
      ios: `maps://?q=${address}`,
      android: `geo:0,0?q=${address}`,
    })
    if (scheme) Linking.openURL(scheme)
  }

  function removeFromArray(array: string[], item: string) {
    const index = array.indexOf(item)
    if (index !== -1) array.splice(index, 1)
  }

  async function getAvailablePositions(session_id: number, totalPlayers: number) {
    const { data } = await supabase.rpc('get_position_chosen_by_session', { session_id })

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

  async function insertPlayerSession(position: string, session_id: number, current_count: number) {
    // Example logic
    // await supabase.from('PlayerSession').upsert({ UserID: user_id, SessionID: session_id, PositionChosen: position })
    // await updateSession(session_id, current_count)
    console.log('Insert', { position, session_id, current_count })
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

  function DisplayMatches({ match, onJoinPress }: { match: any, onJoinPress: (match: any) => void }) {
    const date = new Date(match.MatchTime)
    const gender = match.Gender === "Male" ? "Men's Only" : "Women's Only"
    const info = match.Information || "No additional info!"

    return (
      <View style={styles.whole_view}>
        <View style={styles.view_date}>
          <Text style={styles.text}>{date.toDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <Text>{gender}</Text>
        <Text>Player Count: {match.PlayerCount + "/" + match.TotalPlayers * 2}</Text>
        <Pressable onPress={() => checkMaps(match.Address)}>
          <Text style={{ textDecorationLine: 'underline' }}>{match.Address}</Text>
        </Pressable>
        <Text>{info}</Text>

        <Button title="Join!" color={'rgb(245, 148, 92)'} titleStyle={{ color: 'black' }} onPress={() => onJoinPress(match)} />
      </View>
    )
  }

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
          <Text style={styles.modalText}>Pick your position!</Text>
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
            }}
          />
        </View>
      </Modal>
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
    fontSize: 16,
    marginBottom: 20,
  },
})
