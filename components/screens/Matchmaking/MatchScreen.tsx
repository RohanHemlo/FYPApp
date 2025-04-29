import { RefreshControl, ScrollView, View, Text, StyleSheet, FlatList, Linking, Platform, Pressable } from 'react-native'
import React from 'react'
import { supabase } from '../../../lib/supabase'
import { useMMKV } from 'react-native-mmkv'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useIsFocused } from '@react-navigation/native'
import { Button } from '@rneui/themed'

// MAKE THE DATE A BUTTON SO THAT HWEN PRESSED YOU CAN CHOOSE TO JOIN THE MATCH 
// TODO: IMPLEMENT WITH RPC INSTEAD (SORT BY DATE CLOSEST OR AMOUNT OF PLAYERS NEEDED)

export default function MatchScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState<any>([]);
  const storage = useMMKV()

  const isFocused = useIsFocused()
  console.log(isFocused)

  useEffect(() => {
    getUpcomingMatches()
    if(isFocused) {
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

  function DisplayMatches({ match }: { match: any }) {
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
            <Text>{match.Address}</Text>
          </Pressable>
        </View>
        <View>
          <Text>{info}</Text>
        </View>
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
  }
})
