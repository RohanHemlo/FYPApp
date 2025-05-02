import { Linking, Platform } from 'react-native'

export function checkMaps(address: string) {
        const scheme = Platform.select({
            ios: `maps://?q=${address}`,
            android: `geo:0,0?q=${address}`,
        })
        if (scheme) Linking.openURL(scheme)
    }