import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useMMKV } from 'react-native-mmkv'
import { supabase } from '../../lib/supabase'
import { useIsFocused } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { checkMaps } from '../CustomProps/checkMaps'
import Modal from 'react-native-modal'

import { Button } from '@rneui/themed'
import { Picker } from '@react-native-picker/picker'

// TODO: PUSH USERS VOTE TO SERVER AND MAKE IT SO THAT AFTER THEY HAVE VOTED, THEIR OWN STATS GO UP AS WELL (DEPENDING ON THE POSITION THEY HAVE PLAYED)
// VOTES WILL ONLY SHOW FOR GAMES THAT HAVE BEEN PASSED AND THE USER HASN'T VOTED FOR YET
// CHANGE THE VOTE TO TRUE AFTER AND TO WHICH PLAYER HE VOTED FOR
// DO A SCHEDULING JOB 

export default function Vote() {
  const [matchesPlayed, setMatchesPlayed] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [groupedPositions, setGroupedPositions] = useState<any>()
  const [showModal, setShowModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const positions = ['GK', 'DEF', 'MID', 'ATK']
  const grouped: { [key: string]: string[] } = {}

  const storage = useMMKV()
  const isFocused = useIsFocused()

  useEffect(() => {
    getPlayerSessions()
    if (isFocused) {


    }
  }, [isFocused])

  const p_user_id = storage.getString('user_id')

  async function getPlayerSessions() {
    let { data, error } = await supabase.rpc('get_unvoted_finished_sessions_for_user', { p_user_id })

    if (!error && data) {

      setMatchesPlayed(data)
    }

  }

  async function getPlayerPositions() {
    let { data, error } = await supabase.rpc('get_players_for_session', { p_session_id: selectedMatch.SessionID })

    if (!error && data) {

      setPlayers(data)

      setSelectedUserId(data[0].UserID)

      positions.forEach(pos => {
        grouped[pos] = data
          .filter((p: { PositionChosen: string }) => p.PositionChosen === pos)
          .map((p: { FirstName: any; SecondName: any }) => `${p.FirstName} ${p.SecondName}`);
      });

      setGroupedPositions(grouped)
  
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

  function DisplayVotes({ match, onPress }: { match: any, onPress: (match: any) => void }) {
    const date = new Date(match.MatchTime)
    const level = getLevel(match.Level)


    return (
      <View style={styles.whole_view}>
        <View style={styles.view_date}>
          <Text style={styles.text}>{date.toDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <Pressable onPress={() => checkMaps(match.Address)}>
          <Text style={{ textDecorationLine: 'underline' }}>{match.Address}</Text>
        </Pressable>
        <Text>Level: {level}</Text>

        <Button title={"Vote"}
          color={'rgb(245, 148, 92)'}
          titleStyle={{ color: 'black' }}
          onPress={() => onPress(match)}
        />
      </View>
    )

  }

  function openModal(match: any) {
    setSelectedMatch(match)
    setShowModal(true)
  }


  function mapSelectedPositions() {

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

  return (
    <View>
      <SafeAreaView>
        <FlatList
          data={matchesPlayed}
          renderItem={({ item }) => (
            <DisplayVotes match={item} onPress={openModal} />
          )}
        />

        <Modal
          isVisible={showModal}
          onBackdropPress={() => setShowModal(false)}
          style={styles.modal}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          onModalWillShow={() => getPlayerPositions()}
        // onModalWillHide={() => onRefresh()}
        >
          <View style={styles.modalContent}>
            {selectedMatch && (
              <>
                <Text style={styles.modalHeaderText}>Match Info</Text>
                <Text style={styles.modalText}>Date: {new Date(selectedMatch.MatchTime).toDateString()} {new Date(selectedMatch.MatchTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Pressable onPress={() => checkMaps(selectedMatch.Address)}>
                  <Text style={[styles.modalText, { textDecorationLine: 'underline' }]}>Location: {selectedMatch.Address}</Text>
                </Pressable>
                <Text style={styles.modalText}>Level: {getLevel(selectedMatch.Level)} </Text>
                <Text style={[styles.modalText, { marginTop: 10 }]}>Positions:</Text>
                {mapSelectedPositions()}
              </>
            )}
            <Picker
              selectedValue={selectedUserId}
              onValueChange={value => setSelectedUserId(value)}
            >
              {players.map(player => (
                <Picker.Item
                  key={player.UserID}
                  label={`${player.FirstName} ${player.SecondName} - ${player.PositionChosen}`}
                  // label={player.FirstName}
                  value={player.UserID}
                />
              ))}
            </Picker>
            <Button
              title="Vote"
              color={'rgb(245, 148, 92)'}
              titleStyle={{ color: 'black' }}
              onPress={() => {
                if (selectedMatch) {
                  console.log('AFTER BUTTON CLICk: ', selectedUserId)
                  // alertMessageBeforeLeave()
                }
              }
              }
            />
          </View>
        </Modal>
      </SafeAreaView>
    </View>
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
    height: '70%',
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