import { TouchableOpacity, StyleSheet, Text, ScrollView, View, FlatList, RefreshControl } from 'react-native'
import { useMMKV } from 'react-native-mmkv'
import { supabase } from '../../../lib/supabase'
import React, { useState, useEffect, useCallback } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { StarRatingDisplay } from 'react-native-star-rating-widget'
import { Button } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import Modal from 'react-native-modal'

// TODO: IMPLEMENT LEADERBOARD

const Profile = () => {
  const [refreshing, setRefreshing] = useState(false)

  const [userRatings, setUserRatings] = useState<any>()
  const [overallRating, setOverallRating] = useState<number>(0)
  const [showModal, setShowModal] = useState(false)

  const storage = useMMKV()
  const isFocused = useIsFocused()

  const p_user_id = storage.getString('user_id')

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
    var overall_rating = 0
    let { data, error } = await supabase.from('Rating').select().eq('userid', p_user_id)

    if (data) {
      // console.log(data)
      setUserRatings(data[0])

      overall_rating += data[0].DefendingRating
      overall_rating += data[0].DribblingRating
      overall_rating += data[0].PassingRating
      overall_rating += data[0].ShootingRating
      overall_rating += data[0].TeamworkRating
      setOverallRating(overall_rating / 5)

    }

  }

  return (
    <SafeAreaView>
      {/* refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}> */}
      <View style={styles.container}>
        {userRatings ? (
          <>
            <View style={styles.ratingBlock}>
              <Text style={styles.ratingLabel}>Defending Rating</Text>
              <StarRatingDisplay rating={userRatings.DefendingRating * 2} maxStars={10} color="#f6b18a" starSize={22} />
            </View>
            <View style={styles.ratingBlock}>
              <Text style={styles.ratingLabel}>Passing Rating</Text>
              <StarRatingDisplay rating={userRatings.PassingRating * 2} maxStars={10} color="#f6b18a" starSize={22} />
            </View>
            <View style={styles.ratingBlock}>
              <Text style={styles.ratingLabel}>Dribbling Rating</Text>
              <StarRatingDisplay rating={userRatings.DribblingRating * 2} maxStars={10} color="#f6b18a" starSize={22} />
            </View>
            <View style={styles.ratingBlock}>
              <Text style={styles.ratingLabel}>Shooting Rating</Text>
              <StarRatingDisplay rating={userRatings.ShootingRating * 2} maxStars={10} color="#f6b18a" starSize={22} />
            </View>
            <View style={styles.ratingBlock}>
              <Text style={styles.ratingLabel}>Teamwork Rating</Text>
              <StarRatingDisplay rating={userRatings.TeamworkRating * 2} maxStars={10} color="#f6b18a" starSize={22} />
            </View>
            <View style={styles.ratingBlock}>
              <Text style={styles.ratingLabel}>Overall Rating</Text>
              <StarRatingDisplay rating={overallRating * 2} maxStars={10} color="#f6b18a" starSize={22} />
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading ratings...</Text>
        )}
        <Button title={'How To Improve Your Ratings'}
          color={'rgb(245, 148, 92)'} titleStyle={{ color: 'black' }}
          onPress={() => setShowModal(true)}

        />
      </View>
      <Modal
        isVisible={showModal}
        style={styles.modal}
        onBackdropPress={() => setShowModal(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalHeaderText}>How To Improve Your Ratings</Text>
          <Text style={styles.modalText}>To improve your ratings, play games. You can join games in the Play! tab and create a match or join one.</Text>
          <Text style={styles.modalText}>After playing a game and voting for your favourite teammate or opponent, your stats will go up depending on the position you played!</Text>
          <Text style={styles.modalText}>Goalkeeper - Increases your Defending, Passing and Teamwork Ratings</Text>
          <Text style={styles.modalText}>Defender - Increases your Defending and Passing Ratings</Text>
          <Text style={styles.modalText}>Midfielder - Increases your Passing and Dribbling Ratings</Text>
          <Text style={styles.modalText}>Midfielder - Increases your Dribbling and Shooting Ratings</Text>
          <Text style={styles.modalText}>For every vote you get, your Teamwork ratings will increase!</Text>
          <Text style={styles.modalSmallText}>Note - You don't have to stick to a position for the entire match, make sure to let others play in different positions. The selected positions only account for which ratings increase in the app.</Text>
        </View>
      </Modal>
    </SafeAreaView>

  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // backgroundColor: '#fff',
  },
  ratingBlock: {
    marginBottom: 18,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
  modal: {
    justifyContent: 'center',
    margin: 0,
  },
  modalContent: {
    height: '73%',
    backgroundColor: 'white',
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    padding: 20,
    margin: 20,
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    // marginBottom: 20,
  },
  modalSmallText: {
    marginTop: 8,
    fontSize: 12,
    color: 'grey',
  }
});