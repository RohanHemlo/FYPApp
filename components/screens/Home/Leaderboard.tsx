import { View, Text, FlatList, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useMMKV } from 'react-native-mmkv'
import { useIsFocused } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons';

//TODO: THINK ABOUT ADDING THE LITTLE (MATCH ? () : ()) SYNTAX FOR THE OTHER BITS TO SHOW IF ITS LOADING OR NOT

export default function Leaderboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [userRatings, setUserRatings] = useState<any>()
  const [overallRating, setOverallRating] = useState<number>()
  const [playerRatings, setPlayerRatings] = useState<any[]>()

  const storage = useMMKV()
  const p_user_id = storage.getString('user_id')
  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused) {
      onRefresh()
    }
  }, [isFocused])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      getPlayerRatings()
      setRefreshing(false)
    }, 500)
  }, [])

  async function getPlayerRatings() {
    let { data, error } = await supabase.from('Rating').select().eq('userid', p_user_id)

    if (data) {
      setUserRatings(data[0])

      const average =
        (data[0].DefendingRating +
          data[0].DribblingRating +
          data[0].PassingRating +
          data[0].ShootingRating +
          data[0].TeamworkRating) / 5
      setOverallRating(average)
      getLeaderboardPlayers(+average.toFixed(0))

    }
  }

  async function getLeaderboardPlayers(base_rating: number) {
    let { data, error } = await supabase.rpc('get_ratings_in_range', { base_rating })
    if (error) {
      console.log(error)
    }
    if (data) {
      console.log("in leaderboard: ", data)
      setPlayerRatings(data)
    }
  }

  function DisplayPlayers({ player }: { player: any }) {
    return (
      <View style={styles.viewPlayers}>
        <Text style={styles.nameText}>
          {player.FirstName} {player.SecondName}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>Overall {player.average_rating.toFixed(2)}</Text>
          <Ionicons name="star" style={styles.icon} />
        </View>
      </View>
    );
  }

  return (
    <View>
      <SafeAreaView>
        {playerRatings  ? (
          <>
            <View style={[styles.viewTitle, styles.ratingContainer]}>
              <Text style={styles.ratingTextTitle}>{overallRating?.toFixed(0)}</Text>
              <Ionicons name="star" style={styles.iconTitle} />
              <Text style={styles.ratingTextTitle}> Leaderboard</Text>
            </View>
            <FlatList
              data={playerRatings}
              renderItem={({ item }) => (
                <DisplayPlayers player={item} />
              )}
            />
          </>
        ) : (
          console.log("in if statement: ", playerRatings, overallRating), 
          <Text>Loading...</Text>
        )}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  viewPlayers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#f6b18a',
    fontWeight: '600',
    marginRight: 4,
  },
  icon: {
    color: '#f6b18a',
    fontSize: 18,
  },
  iconTitle: {
    color: 'black',
    fontSize: 18,
  },
  viewTitle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6b18a',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  ratingTextTitle: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
    marginRight: 4,
  },
})
