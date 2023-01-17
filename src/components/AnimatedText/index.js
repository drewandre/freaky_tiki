import React from 'react'
import { StyleSheet, TextInput } from 'react-native'

import Animated, { useAnimatedProps } from 'react-native-reanimated'

Animated.addWhitelistedNativeProps({ text: true })

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

function AnimatedText(props) {
  const { style, text, ...rest } = props
  const animatedProps = useAnimatedProps(() => {
    return {
      text: text.value,
    }
  })
  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value={text.value}
      style={[styles.baseStyle, style || undefined]}
      {...rest}
      {...{ animatedProps }}
    />
  )
}

const styles = StyleSheet.create({
  baseStyle: {
    color: 'black',
  },
})

export default AnimatedText
