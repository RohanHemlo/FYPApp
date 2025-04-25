import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { StyleSheet, ScrollView, View, Switch, Alert } from 'react-native'
import { Button, Input, Text } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Picker } from '@react-native-picker/picker'
import { useMMKV } from 'react-native-mmkv'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import DatePicker from 'react-native-date-picker'
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler'

// TODO: ADD ADDRESS TO THE INFORMATION ADDED, TRY FIND A MODULE FOR IT
// TODO: REDO THE TRIGGER AND FUNCTIONS IN SQL TO MAKE SURE THAT IF IT'S BEEN LESS THAN 24 HOURS UPCOMING GETS SET TO FALSE
// TODO: MAKE SURE THE DATE IS MORE THAN 24 HOURS THAN NOW TO ADD IT TO THE DATABASE
// TODO: CHANGE THE DATABASE SO THAT USERS CAN ONLY MAKE ONE MATCH PER WEEK
// TODO: BETTER STYLING FOR EVERYTHING IN THIS PAGE

export default function CreateMatch() {
    const [loading, setLoading] = useState(false)
    const [TotalPlayers, setTotalPlayers] = useState<number>(5)
    const [Gender, setGender] = useState<string>("Male")
    const [info, setInfo] = useState<string>()

    // THIS IS FOR DATES
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)

    const storage = useMMKV()

    const navigation = useNavigation<NativeStackNavigationProp<any>>()

    let json_string: string = storage.getString('session')!
    const session = JSON.parse(json_string)
    const user_id = session?.user?.identities?.[0]?.id

    async function insertNewMatch() {
        console.log(TotalPlayers, date, Gender, info)

        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const inserts = {
                TotalPlayers: TotalPlayers,
                Gender: Gender,
                PlayerCount: 0,
                UpComing: true,
                MatchTime: (date.toISOString()).toLocaleString(),
                Information: info,
                Address: 'nothing',
            }
            console.log(inserts)

            let { data, error } = await supabase.from('Session').upsert(inserts).select()

            console.log("data: ", data)

            if (error) {
                console.log("error: ", error)
                throw error
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
              }
        } finally {
            setLoading(false)
        }
    }


    return (
        <GestureHandlerRootView>
            <ScrollView style={styles.container}>
                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Button
                        title="Choose Date and Time"
                        color={'rgb(245, 148, 92)'}
                        titleStyle={{ color: 'black' }}
                        onPress={() => setOpen(true)}
                        disabled={loading} />
                    <DatePicker
                        modal
                        open={open}
                        date={date}
                        minuteInterval={15}
                        onConfirm={(date) => {
                            setOpen(false)
                            setDate(date)
                        }}
                        onCancel={() => {
                            setOpen(false)
                        }}
                    />
                    <Text style={[styles.verticallySpaced, styles.mt20]}>{date.toLocaleString()}</Text>
                </View>
                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Text>Team Size</Text>
                    <Picker prompt="What team size?" selectedValue={TotalPlayers} onValueChange={itemValue => setTotalPlayers(itemValue)}>
                        <Picker.Item label="5 a-side" value={5} />
                        <Picker.Item label="7 a-side" value={7} />
                    </Picker>
                </View>
                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Text>Mens' or Womens'?</Text>
                    <Picker prompt="Mens' or Womens'?" selectedValue={Gender} onValueChange={itemValue => setGender(itemValue)}>
                        <Picker.Item label="Mens" value="Male" />
                        <Picker.Item label="Womens" value="Female" />
                    </Picker>
                </View>
                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <SafeAreaProvider>
                        <SafeAreaView>
                            <TextInput
                                editable
                                multiline
                                numberOfLines={4}
                                maxLength={40}
                                placeholder="Write any aditional information here! For example, what type of boots to bring, any costs"
                                onChangeText={text => setInfo(text)}
                                value={info}
                                style={styles.textInput}
                            />
                        </SafeAreaView>
                    </SafeAreaProvider>
                </View>


                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Button
                        title={'Create Match'}
                        color={'rgb(245, 148, 92)'} titleStyle={{ color: 'black' }}
                        onPress={() => { insertNewMatch(), navigation.navigate("Find Match") }}
                        disabled={loading}
                    />
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        // marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
    textInput: {
        padding: 10,
    },
});