import { RefreshControl, ScrollView, View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native'
import { supabase } from '../../../lib/supabase'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Session } from '@supabase/supabase-js'
import React, { useCallback, useEffect, useState } from 'react'
import { useMMKV } from 'react-native-mmkv'
import { Button } from '@rneui/themed'
import { useIsFocused } from '@react-navigation/native'
import Modal from 'react-native-modal'
import { checkMaps } from '../../CustomProps/checkMaps'

export default function UpComingMatch() {
  const [playedMatches, setPlayedMatches] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [groupedPositions, setGroupedPositions] = useState<any>()
  const [showModal, setShowModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const positions = ['GK', 'DEF', 'MID', 'ATK']
  const grouped: { [key: string]: string[] } = {}

  const storage = useMMKV()
  const isFocused = useIsFocused()

  const p_user_id = storage.getString('user_id')
  const level = storage.getNumber('level')

  useEffect(() => {
    if (isFocused) {
      onRefresh()

    }
  }, [isFocused])

  const onRefresh = useCallback(() => {
    setRefreshing(true)

    setTimeout(() => {
      getPlayedMatches()
      setRefreshing(false)
    }, 500)
  }, [])

  async function getPlayedMatches() {
    let { data, error } = await supabase.rpc('get_played_matches', { p_user_id })
    console.log("in history: ", data, error)
    if (!error && data) {
      console.log("in history: ", data)
      setPlayedMatches(data)
    }
  }

  async function getPlayerPositions() {
    let { data, error } = await supabase.rpc('get_players_for_session', { p_session_id: selectedMatch.SessionID })

    if (!error && data) {
      // console.log('DATA: ', data)

      // console.log(selectedPositions)
      positions.forEach(pos => {
        grouped[pos] = data
          .filter((p: { PositionChosen: string }) => p.PositionChosen === pos)
          .map((p: { FirstName: any; SecondName: any }) => `${p.FirstName} ${p.SecondName}`);
      });

      setGroupedPositions(grouped)

      // console.log(grouped, positions)
    }


  }

  function mapSelectedPositions() {
    // console.log(positions, groupedPositions)

    if (groupedPositions) {
      return (

        <View>
          {positions.map(pos => (

            <Text style={styles.modalText} key={pos}>
              {pos} - {groupedPositions[pos].join(', ')}
            </Text>
          ))}
        </View>
      )
    }
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

  const checkLevel = (match_level: number | undefined) => {
    let string = ''
    if (match_level != level) {
      string = "This is a different difficulty to your chosen difficulty!"
    }

    return (string)
  }

  const alertMessageBeforeLeave = () => Alert.alert('Leaving', 'Are you sure you want to leave?', [
    {
      text: 'Yes',
      onPress: () => [leaveSession(selectedMatch.SessionID, selectedMatch.PlayerCount), setShowModal(false), onRefresh()]
    },
    {
      text: 'Cancel',
      // onPress: () 
    }
  ]);

  async function updateSession(session_id: number, current_count: number) {
    let { data, error } = await supabase.from('Session').update({ PlayerCount: current_count - 1 }).eq('SessionID', session_id).select()

    // console.log('UpdateSession in UpComingMatch: ', data)
  }

  async function leaveSession(session_id: number, player_count: number) {
    let { data, error } = await supabase.from('PlayerSession').delete().eq('SessionID', session_id).eq('UserID', p_user_id)
    // console.log("leaveSession in UpComingMatch:", data)

    updateSession(session_id, player_count)


  }

  function DisplayMatches({ match, onJoinPress }: { match: any, onJoinPress: (match: any) => void }) {
    const date = new Date(match.MatchTime)
    const gender = match.Gender === "Male" ? "Men's Only" : "Women's Only"
    const level = getLevel(match.Level)
    const info = match.Information || "No additional info!"
    var able = false

    return (
      <View style={styles.whole_view}>
        <View style={styles.view_date}>
          <Text style={styles.text}>{date.toDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <Pressable onPress={() => checkMaps(match.Address)}>
          <Text style={{ textDecorationLine: 'underline' }}>{match.Address}</Text>
        </Pressable>
        <Text>Level: {level}</Text>
        <Text>{info}</Text>

        <Button title={"Info"}
          color={'rgb(245, 148, 92)'}
          titleStyle={{ color: 'black' }}
          onPress={() => onJoinPress(match)}
          disabled={able}
        />
      </View>
    )
  }

  // console.log("IN UPCOMING", joinedMatches)

  function openModal(match: any) {
    setSelectedMatch(match)
    setShowModal(true)
  }

  if (playedMatches.length != 0) {

    return (
      <View>
        <SafeAreaView>
          <FlatList
            data={playedMatches}
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
            onModalWillShow={() => getPlayerPositions()}
            onModalWillHide={() => onRefresh()}
          >
            <View style={styles.modalContent}>
              {selectedMatch && (
                <>
                  <Text style={styles.modalHeaderText}>Match Info</Text>
                  <Text style={styles.modalText}>Date: {new Date(selectedMatch.MatchTime).toDateString()} {new Date(selectedMatch.MatchTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  <Text style={styles.modalText}>{selectedMatch.Gender === 'Male' ? "Men's Only" : "Women's Only"}</Text>
                  <Pressable onPress={() => checkMaps(selectedMatch.Address)}>
                    <Text style={[styles.modalText, { textDecorationLine: 'underline' }]}>Location: {selectedMatch.Address}</Text>
                  </Pressable>
                  <Text style={styles.modalText}>Level: {getLevel(selectedMatch.Level)} <Text style={styles.modalWarning}>{checkLevel(selectedMatch.Level)}</Text></Text>
                  <Text style={[styles.modalText, { marginTop: 10 }]}>Positions:</Text>
                  {mapSelectedPositions()}
                </>
              )}
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    )
  }
  else {
    return (
      <View>
        <Text>
          You haven't played a game yet. Any played matches will be shown here.
        </Text>
      </View>
    )
  }
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
    fontSize: 18,
    // marginBottom: 20,
  },
  modalWarning: {
    fontSize: 14,
    color: 'red',
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  }
})