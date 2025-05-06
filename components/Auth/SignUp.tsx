import { useState, useEffect } from 'react'
import { StyleSheet, ScrollView, View, Switch, Alert } from 'react-native'
import { supabase } from '../../lib/supabase'
import { Button, Input, Text } from '@rneui/themed'
import { useNavigation } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker'

export default function SignUp() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const [FirstName, setFirstName] = useState('')
    const [SecondName, setSecondName] = useState('')
    const [Gender, setGender] = useState<string>("Male")
    const [Private, setPrivate] = useState<boolean>(false)
    const [FavouritePosition, setFavouritePosition] = useState<string>("GK")
    const [FavouriteClub, setFavouriteClub] = useState('')
    const [Level, setLevel] = useState<number>(1)

    const userAgreementAlert = () => Alert.alert('Disclaimer',
        'By signing up to this, you are agreeing that any injuries or harm done to you from playing a match is not liable to the app or creator of the app.', [
            { text: 'Yes', onPress: () => [signUpWithEmail()] },
             { text: 'Cancel', }])

    async function signUpWithEmail() {
        setLoading(true)

        console.log(FirstName, "")
        if (email === "" || email === null) {
            alert("Email is Empty!!")
            setLoading(false)
        }
        else if (password === "" || password === null) {
            alert("Password is Empty!!")
            setLoading(false)
        }
        else if (FirstName === "" || FirstName === null) {
            alert("First Name is Empty!!")
            setLoading(false)
        }
        else if (SecondName === "" || SecondName === null) {
            alert("Second Name is Empty!!")
            setLoading(false)
        }
        else {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            })

            // if (error) Alert.alert(error.message)
            if (data) console.log(data)
            if (error) console.log(error)

            try {
                setLoading(true)
                if (!data?.user) throw new Error('No user on the session!')

                console.log(FirstName, "")
                if (FirstName === "" || SecondName === "" || FirstName === null || SecondName === null) {
                    alert("First Name or Second Name is Empty!!")

                }

                const updates = {
                    id: data?.user.id,
                    FirstName,
                    SecondName,
                    Gender,
                    Private,
                    FavouritePosition,
                    FavouriteClub,
                    Level,
                }

                let { error } = await supabase.from('Profiles').upsert(updates).select()

                console.log(error)

                if (error) {
                    throw error
                }

                // navigation.navigate("Profile")


            } catch (error) {
                if (error instanceof Error) {
                    Alert.alert(error.message)
                }
            } finally {
                setLoading(false)
            }

            setLoading(false)
        }
    }

    return (
        <ScrollView>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input
                    label="Email"
                    leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize={'none'}
                />
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                    label="Password"
                    leftIcon={{ type: 'font-awesome', name: 'lock' }}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize={'none'}
                />
            </View>
            <View style={styles.verticallySpaced}>
                <Input label="First Name" value={FirstName || ''} onChangeText={(text) => setFirstName(text)} />
            </View>
            <View style={styles.verticallySpaced}>
                <Input label="Second Name" value={SecondName || ''} onChangeText={(text) => setSecondName(text)} />
            </View>
            <View style={styles.verticallySpaced}>
                <Text>Gender</Text>
                <Picker prompt="Gender" selectedValue={Gender} onValueChange={itemValue => setGender(itemValue)}>
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                </Picker>
            </View>
            <View style={styles.verticallySpaced}>
                <Text>
                    {Private ? "Profile is Private" : "Profile is Public"}
                </Text>
                <Switch
                    value={Private}
                    onValueChange={setPrivate}
                    trackColor={{ false: "#ccc", true: "#007bff" }}
                    thumbColor={Private ? "#fff" : "#f4f3f4"}
                />
            </View>
            <View style={styles.verticallySpaced}>
                <Text>Favourite Position?</Text>
                <Picker prompt="Favourite Position?" selectedValue={FavouritePosition} onValueChange={itemValue => setFavouritePosition(itemValue)}>
                    <Picker.Item label="GK (Goalkeeper)" value="GK" />
                    <Picker.Item label="DEF (Defender)" value="DEF" />
                    <Picker.Item label="MID (Midfielder)" value="MID" />
                    <Picker.Item label="ATK (Attacker)" value="ATK" />
                </Picker>
            </View>
            <View style={styles.verticallySpaced}>
                <Input label="Favourite Football Club?" value={FavouriteClub || ''} onChangeText={(text) => setFavouriteClub(text)} />
            </View>
            <View style={styles.verticallySpaced}>
                <Text>Football Level?</Text>
                <Picker selectedValue={Level} onValueChange={(itemValue) => setLevel(itemValue)} >
                    <Picker.Item label="Beginner" value={1} />
                    <Picker.Item label="Casual" value={2} />
                    <Picker.Item label="Amateur" value={3} />
                    <Picker.Item label="Expert" value={4} />
                    <Picker.Item label="All-Star" value={5} />
                </Picker>
            </View>


            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                    title={loading ? 'Loading ...' : 'Sign Up!'}
                    color={'rgb(245, 148, 92)'}
                    titleStyle={{ color: 'black' }}
                    onPress={() => { userAgreementAlert() }}
                    disabled={loading}
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
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
})