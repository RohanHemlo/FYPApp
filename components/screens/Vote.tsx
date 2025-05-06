import { RefreshControl, View, Text, FlatList, StyleSheet, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useMMKV } from 'react-native-mmkv'
import { supabase } from '../../lib/supabase'
import { useIsFocused } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { checkMaps } from '../CustomProps/checkMaps'
import Modal from 'react-native-modal'
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Button } from '@rneui/themed'
import { Picker } from '@react-native-picker/picker'

// TODO: CRON FUNCTION THAT CHECKS IF THE MATCH HAS ENOUGH PLAYERS TO BE PLAYED 24 HOURS BEFORE THE GAME, AND IF NOT IT CANCELS (SEE HOW YOU CAN SEND A NOTIFICATION TOO)

export default function Vote() {
  const [refreshing, setRefreshing] = useState(false)

  const [matchesPlayed, setMatchesPlayed] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<any>(null)

  const [votePlayers, setVotePlayers] = useState<any[]>([])
  const [groupedPositions, setGroupedPositions] = useState<any>()
  const [showModal, setShowModal] = useState(false)
  const [userPlayer, setUserPlayer] = useState<any>()
  const [userRatings, setUserRatings] = useState<any>()
  const [selectedPlayerSessionId, setSelectedPlayerSessionID] = useState<number>()

  const positions = ['GK', 'DEF', 'MID', 'ATK']
  const grouped: { [key: string]: string[] } = {}

  const storage = useMMKV()
  const isFocused = useIsFocused()
  const navigation = useNavigation<NativeStackNavigationProp<any>>()


  useEffect(() => {

    if (isFocused) {
      onRefresh()
    }
  }, [isFocused])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      getPlayerSessions()
      getPlayerRatings()
      setRefreshing(false)
    }, 500)
  }, [])

  const p_user_id = storage.getString('user_id')

  function removeFromArray(array: any[], item: any) {
    const index = array.indexOf(item)
    if (index !== -1) array.splice(index, 1)
  }

  async function getPlayerSessions() {
    let { data, error } = await supabase.rpc('get_unvoted_finished_sessions_for_user', { p_user_id })

    if (!error && data) {

      setMatchesPlayed(data)
    }

  }

  async function getPlayerPositions() {
    let { data, error } = await supabase.rpc('get_players_for_session', { p_session_id: selectedMatch.SessionID })

    if (!error && data) {
      // console.log(data)
      // setPlayers(data)

      positions.forEach(pos => {
        grouped[pos] = data
          .filter((p: { PositionChosen: string }) => p.PositionChosen === pos)
          .map((p: { FirstName: any; SecondName: any }) => `${p.FirstName} ${p.SecondName}`);
      })

      data.forEach((item: any) => {
        if (item.UserID === p_user_id) {
          setUserPlayer(item)
          removeFromArray(data, item)
        }
      })

      setVotePlayers(data)

      setSelectedPlayerSessionID(data[0].PlayerSessionID)

      setGroupedPositions(grouped)

      // console.log(userPlayer)

    }
  }

  async function getPlayerRatings() {
    let { data, error } = await supabase.from('Rating').select().eq('userid', p_user_id)

    if (data) {
      setUserRatings(data[0])
    }

    // console.log("User ratings dribbling: ", userRatings)
  }

  async function increaseUserStats() {
    const ratingUpdates = {
      'ATK': {
        ShootingRating: userRatings.ShootingRating + 0.25,
        DribblingRating: userRatings.DribblingRating + 0.25,
      },
      'MID': {
        PassingRating: userRatings.PassingRating + 0.25,
        DribblingRating: userRatings.DribblingRating + 0.25,
      },
      'DEF': {
        PassingRating: userRatings.PassingRating + 0.25,
        DefendingRating: userRatings.DefendingRating + 0.25,
      },
      'GK': {
        PassingRating: userRatings.PassingRating + 0.25,
        DefendingRating: userRatings.DefendingRating + 0.25,
        TeamworkRating: userRatings.TeamworkRating + 0.1,
      },
    };

    const updates = ratingUpdates[userPlayer.PositionChosen as 'ATK' | 'MID' | 'DEF' | 'GK']

    if (!updates) {
      console.warn('Unknown position:', userPlayer.PositionChosen);
      return;
    }

    const { data, error } = await supabase
      .from('Rating')
      .update(updates)
      .eq('RatingsID', userRatings.RatingsID)
      .select()

    if (error) {
      console.error('Error updating ratings:', error);
    } else {
      navigation.navigate('Home', {screen: "Stats"})
    }
  }

  async function setVoted() {
    let { data, error, status } = await supabase.from('PlayerSession').update({ Voted: true }).eq('PlayerSessionID', userPlayer.PlayerSessionID).select()

    // console.log("SetVoted :", error)
    if (data) {
      console.log("Set voted ", data)
    }
  }


  async function insertVote() {
    let { data, error } = await supabase.from('Vote').insert({ PlayerSessionID: selectedPlayerSessionId, VoterUserID: p_user_id }).select()

    setVoted()


    if (data) {
      console.log("Insert vote: ", data)
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

    //TODO: get rid of private

    return (
      <View style={styles.wholeView}>
        <View style={styles.viewDate}>
          <Text style={styles.text}>{date.toDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <Pressable onPress={() => checkMaps(match.Address)}>
          <Text style={styles.addressText}>{match.Address}</Text>
        </Pressable>
        <Text style={styles.levelText}>Level: {level}</Text>

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

  if (matchesPlayed.length === 0) {
    return (
      <View>
        <Text>You can only vote for games you have played in and have finished.</Text>
        <Text>Note: it can take up to an hour after your game finished for the voting options to come up.</Text>
      </View>
    )
  }

  return (
    <View>
      <SafeAreaView>
        <FlatList
          data={matchesPlayed}
          renderItem={({ item }) => (
            <DisplayVotes match={item} onPress={openModal} />
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
        // onModalWillHide={() => onRefresh()}
        >
          <View style={styles.modalContent}>
            {selectedMatch && (
              <>
                <Text style={styles.modalHeaderText}>Match Info - Vote for the Best Player!</Text>
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
              selectedValue={selectedPlayerSessionId}
              onValueChange={value => setSelectedPlayerSessionID(value)}
            >
              {votePlayers.map(player => (
                <Picker.Item
                  key={player.UserID}
                  label={`${player.FirstName} ${player.SecondName} - ${player.PositionChosen}`}
                  value={player.PlayerSessionID}
                />
              ))}
            </Picker>
            <Button
              title="Vote"
              color={'rgb(245, 148, 92)'}
              titleStyle={{ color: 'black' }}
              onPress={() => {
                if (selectedMatch) {
                  insertVote()
                  increaseUserStats()
                  setShowModal(false)
                  onRefresh()
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