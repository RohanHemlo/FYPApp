import React, { useRef, useEffect } from 'react'
import { View, Text, Pressable, Animated, Dimensions, StyleSheet } from 'react-native'
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs'

const { width } = Dimensions.get('window')

export default function AnimatedTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  const translateX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: (width / state.routes.length) * state.index,
      useNativeDriver: true,
    }).start()
  }, [state.index])

  return (
    <View style={{ position: 'relative' }}>
      {/* Animated background for the active tab */}
      <Animated.View
        style={{
          position: 'absolute',
          height: '100%',
          width: width / state.routes.length,
          backgroundColor: '#f5945c',
          transform: [{ translateX }],
          borderRadius: 5,
        }}
      />

      {/* Tab Buttons */}
      <View style={{ flexDirection: 'row' }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label = options.title ?? route.name
          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor: isFocused ? 'transparent' : 'white', // Background for inactive tab
                // zIndex: 1, // Make sure this is above the animated tab
              }}
            >
              <Text
                style={{
                  color: isFocused ? 'black' : 'gray', // Text color
                  fontWeight: 'bold',
                }}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
