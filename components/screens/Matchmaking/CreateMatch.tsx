import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { RefreshControl, StyleSheet, ScrollView, View, Switch, Alert, Linking, Platform } from 'react-native'
import { Button, Input, Text } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Picker } from '@react-native-picker/picker'
import { useMMKV } from 'react-native-mmkv'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import DatePicker from 'react-native-date-picker'
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { useIsFocused } from '@react-navigation/native'

// TODO: TRY FIX IT WHERE WHEN YOU CREATE A MATCH AND IT'S SHOWN ON MATCH SCREEN, IT SHOWS 0/10 PEOPLE ENTERED

export default function CreateMatch() {
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [canCreateMatch, setCanCreateMatch] = useState<boolean>()
    const [TotalPlayers, setTotalPlayers] = useState<number>(5)
    // const [Gender, setGender] = useState<string>("Male")
    const [info, setInfo] = useState<string>()
    const [positionChosen, setPositionChosen] = useState<string>('GK')


    // THIS IS FOR DATES
    var min_day = new Date()
    min_day.setDate(min_day.getDate() + 3)

    const isFocused = useIsFocused()

    useEffect(() => {
        // getUpcomingMatches()
        if (isFocused) {
            onRefresh()
        }
    }, [isFocused])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        setTimeout(() => {
            setRefreshing(false)
        }, 500)
    }, [])

    const [date, setMatchDate] = useState(min_day)
    const [open, setOpen] = useState(false)

    // THIS IS FOR ADDRESS
    const [address, setAddress] = useState<any | null>(null)

    const storage = useMMKV()

    const navigation = useNavigation<NativeStackNavigationProp<any>>()

    // let json_string: string = storage.getString('session')!
    // const canCreateMatch = storage.getBoolean('canMakeMatch')
    // const session = JSON.parse(json_string)
    const user_id = storage.getString('user_id')
    const Gender = storage.getString('sex')
    const Level = storage.getNumber('level')
    // console.log(storage.get())
    console.log("in crease match:", storage.getString('sex'))
    console.log('in create match: ', storage.getNumber('level'))

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

    const getSex = (value: string | undefined) => {
        switch (value) {
            case 'Male' : return 'Men'
            case 'Female' : return 'Women'
            default: return value
        }
    }

    async function getCanMakeMatch() {
        let { data, error, status } = await supabase.from("Profiles").select("CanMakeMatch").eq('id', user_id)

        if (data) {
            setCanCreateMatch(data[0].CanMakeMatch)
            // console.log(storage.getBoolean('canMakeMatch'))
        }
    }

    async function setCreateMatchFalse() {
        let { data, error } = await supabase.from('Profiles')
            .update({ CanMakeMatch: false })
            .eq('id', user_id)
            .select()

        setCanCreateMatch(false)

        console.log('SET CREATE MATCH: ', data)
    }

    async function updateSession(session_id: number, current_count: number) {
        const { data, error } = await supabase.from('Session')
            .update({ PlayerCount: current_count + 1 })
            .eq('SessionID', session_id)
            .select()

        // console.log("Updated Session: ")
        // console.log(data, error)
    }

    async function insertPlayerSession(position: string, session_id: number, current_count: number) {

        const { data, error } = await supabase.from('PlayerSession')
            .upsert({ UserID: user_id, SessionID: session_id, PositionChosen: position, Voted: false })
            .select()

        // console.log("Insert Into Player Session: ")
        // console.log(data, error)

        updateSession(session_id, current_count)

    }

    async function insertNewMatch() {
        console.log(TotalPlayers, date, Gender, info, '\naddress:\n', address)

        try {
            setLoading(true)
            // if (!session?.user) throw new Error('No user on the session!')

            if (address === null || address === "") {
                alert("Address is empty, make sure you select the address after typing it")
            } else {

                const inserts = {
                    TotalPlayers: TotalPlayers,
                    Gender: Gender,
                    PlayerCount: 0,
                    UpComing: true,
                    MatchTime: (date.toISOString()).toLocaleString(),
                    Information: info,
                    Address: address?.description,
                    Level: Level,
                }
                console.log(inserts)

                let { data, error } = await supabase.from('Session').upsert(inserts).select()

                if (data) {
                    console.log("data: ", data[0].SessionID)
                    setCreateMatchFalse()
                    insertPlayerSession(positionChosen, data[0].SessionID, 0)

                    navigation.navigate("Find Match")
                }

                if (error) {
                    console.log("error: ", error)
                    throw error
                }


            }

        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)

        }
    }

    function checkMaps() {
        var address_name = address?.description

        if (address_name) {
            const scheme = Platform.select({
                ios: `maps://?q=${address_name}`,
                android: `geo:0,0?q=${address_name}`,
            })

            if (scheme) {
                Linking.openURL(scheme)
            }
        }
        else {
            alert("Address is empty, there is nothing to check.")
        }
    }

    getCanMakeMatch()

    console.log(canCreateMatch)
    if (canCreateMatch) {

        var max_day = new Date()
        max_day.setDate(max_day.getDate() + 33)

        return (
            // <SafeAreaView>
                <GestureHandlerRootView>
                    <ScrollView keyboardShouldPersistTaps={'handled'} style={styles.container}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            <Button
                                title="Choose Date and Time"
                                color={'rgb(245, 148, 92)'}
                                titleStyle={{ color: 'black' }}
                                onPress={() => setOpen(true)}
                                disabled={loading} />
                            <DatePicker
                                modal
                                minimumDate={min_day}
                                maximumDate={max_day}
                                open={open}
                                date={date}
                                minuteInterval={15}
                                onConfirm={(date) => {
                                    setOpen(false)
                                    setMatchDate(date)
                                }}
                                onCancel={() => {
                                    setOpen(false)
                                }}
                            />
                            <Text style={[styles.verticallySpaced, styles.mt20]}>Date Chosen {date.toString().substring(0, 15)} </Text>
                            <Text style={[styles.verticallySpaced, styles.mt20]}>Time Chosen {date.toLocaleTimeString().substring(0, 5) + " " + date.toLocaleTimeString().substring(8)}</Text>
                        </View>
                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            <Text>Team Size</Text>
                            <Picker prompt="What team size?" selectedValue={TotalPlayers} onValueChange={itemValue => setTotalPlayers(itemValue)}>
                                <Picker.Item label="5 a-side" value={5} />
                                <Picker.Item label="7 a-side" value={7} />
                            </Picker>
                        </View>
                        {/* <View style={[styles.verticallySpaced, styles.mt20]}>
                        <Text>Mens' or Womens'?</Text>
                        <Picker prompt="Mens' or Womens'?" selectedValue={Gender} onValueChange={itemValue => setGender(itemValue)}>
                            <Picker.Item label="Mens" value="Male" />
                            <Picker.Item label="Womens" value="Female" />
                        </Picker>
                    </View> */}
                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            <Text>Address</Text>
                            <GooglePlacesAutocomplete
                                query={{
                                    key: 'AIzaSyBcDag6e2TMRmh8Wc0vktBW7ZvH4NC-zMg',
                                    language: 'en',
                                    components: 'country:uk'
                                }}
                                onPress={(data, details) => { setAddress(data) }}
                                textInputProps={{
                                    InputComp: Input,
                                    // leftIcon: { type: 'font-awesome', name: 'chevron-left' },
                                    errorStyle: { color: 'red' },

                                }}
                                styles={styles.textInput}
                                placeholder={'Type The Address here and then select one.'} />
                        </View>
                        <View>
                            <Button title='Check on Maps'
                                color={'rgb(245, 148, 92)'} titleStyle={{ color: 'black' }}
                                onPress={() => checkMaps()} />
                        </View>
                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            <Text>Choose your position</Text>
                            <Picker
                                selectedValue={positionChosen}
                                onValueChange={value => setPositionChosen(value)}
                            >
                                <Picker.Item label={"Goalkeeper"} value={"GK"} />
                                <Picker.Item label={"Defender"} value={"DEF"} />
                                <Picker.Item label={"Midfielder"} value={"MID"} />
                                <Picker.Item label={"Attacker"} value={"ATK"} />

                            </Picker>
                        </View>
                        <View>
                            <Text>Selected Level: {getLevel(Level)}</Text>
                        </View>
                        <View>
                            <Text>{getSex(Gender)}'s Only</Text>
                        </View>
                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            <Text>Additional Information</Text>
                            <SafeAreaProvider>
                                <SafeAreaView>
                                    <TextInput
                                        editable
                                        multiline
                                        numberOfLines={4}
                                        maxLength={40}
                                        selectionColor={'grey'}
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
                                onPress={() => { insertNewMatch() }}
                                disabled={loading}
                            />
                        </View>
                    </ScrollView>
                </GestureHandlerRootView>
        )
    }
    else {
        return (
            <View>
                <Text>You have to wait a week from when you made your last match to create a new one.</Text>
            </View>
        )
    }
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
        borderColor: 'gray',
        borderWidth: 1,
    },
});