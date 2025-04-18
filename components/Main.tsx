import { TouchableOpacity, StyleSheet, ScrollView, View, Switch, Alert, Dimensions } from 'react-native'
import { Text } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'

const { width } = Dimensions.get('window')

export default function Main() {

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button}>
              <Text>Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text>Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text>Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text>Test</Text>
            </TouchableOpacity>
        </View>
    )

}

console.log(width)

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  button: {
    width: '47%', // about 2 per row with spacing
    height: '47%',
    aspectRatio: 1, // 👈 keeps it square
    backgroundColor: 'rgb(66, 133, 244)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  //   width: width * 0.45,
  //   height: width * 0.45,
  //   margin: width * 0.05,
  //   backgroundColor: 'rgb(66, 135, 245)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   borderRadius: 8, // optional: makes corners rounded
  // },
})