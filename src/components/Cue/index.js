import React from 'react'
import { View, StyleSheet, Image, Text, LayoutAnimation } from 'react-native'

import * as Haptics from 'expo-haptics'
import { TapGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { connect } from 'react-redux'

import OSCManager from '../../features/OSC/OSCManager'
import { setCurrentAnimation } from '../../features/settings/redux/settingsActions'

function Cue({ setCurrentAnimation, currentAnimation, data }) {
  function handlePress() {
    OSCManager.sendMessage(data.FULL_PATH, [])
    LayoutAnimation.configureNext({
      duration: 500,
      delete: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.7,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.7,
      },
    })
    setCurrentAnimation(data)
  }
  const isSelected = useSharedValue(0)
  const scale = useSharedValue(1)
  const prevScale = useSharedValue(1)
  const cueTimingProgress = useSharedValue(0)

  React.useEffect(() => {
    if (currentAnimation && currentAnimation?.FULL_PATH === data.FULL_PATH) {
      if (!isSelected.value) {
        cueTimingProgress.value = withTiming(
          100,
          {
            duration: 2000,
            easing: Easing.linear,
          },
          () => {
            cueTimingProgress.value = withDelay(
              250,
              withTiming(0, { duration: 0 })
            )
          }
        )
      }
      isSelected.value = 1
    } else {
      isSelected.value = 0
      cancelAnimation(cueTimingProgress)
      cueTimingProgress.value = withTiming(0, { duration: 50 })
      scale.value = withTiming(1)
    }
  }, [cueTimingProgress, currentAnimation, data, isSelected, scale])

  function onTapBegin() {
    prevScale.value = scale.value
    scale.value = withTiming(scale.value - 0.02)
    Haptics.selectionAsync()
  }

  function onTapActive() {
    scale.value = withTiming(1)
    handlePress()
  }

  function onTapCancelled() {
    scale.value = withTiming(prevScale.value)
  }

  function onTapFailed() {
    scale.value = withTiming(prevScale.value)
  }

  const animatedBottomBorderStyles = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      bottom: 5,
      left: 5,
      right: 5,
      height: 5,
      opacity: isSelected.value ? 1 : 0,
      borderBottomLeftRadius: 100,
      borderBottomRightRadius: 100,
      backgroundColor: '#32FCFF',
    }
  })

  const animatedStyles = useAnimatedStyle(() => {
    return {
      flex: 1,
      height: 70,
      padding: 5,
      overflow: 'hidden',
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ scale: scale.value }],
    }
  })

  const animatedCueTimingStyles = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: 5,
      bottom: 5,
      left: 5,
      overflow: 'hidden',
      borderRadius: 4,
      // borderRadius: 8,
      width: `${cueTimingProgress.value}%`,
      backgroundColor: 'rgba(255,255,255,0.5)',
    }
  })

  const thumbnail = React.useMemo(() => {
    const id = data?.FULL_PATH?.toLowerCase?.() || ''
    if (id.includes('sparkle')) {
      return (
        <Image
          source={require('../../assets/sparkle_thumbnail.png')}
          style={styles.imageBackground}
        />
      )
    } else if (id.includes('noise')) {
      return (
        <Image
          source={require('../../assets/noise_thumbnail.png')}
          style={styles.imageBackground}
        />
      )
    } else {
      return (
        <Image
          source={require('../../assets/unknown_thumbnail.png')}
          style={styles.imageBackground}
        />
      )
    }
  }, [data?.FULL_PATH])

  return (
    <TapGestureHandler
      enabled={!!data?.FULL_PATH}
      onBegan={onTapBegin}
      onActivated={onTapActive}
      onFailed={onTapFailed}
      onCancelled={onTapCancelled}
    >
      <Animated.View style={animatedStyles}>
        {data?.FULL_PATH ? thumbnail : <View style={styles.imageBackground} />}
        <Text style={styles.text}>{data.DESCRIPTION}</Text>
        <Animated.View style={animatedCueTimingStyles} />
        {data?.FULL_PATH ? (
          <Animated.View style={animatedBottomBorderStyles} />
        ) : null}
      </Animated.View>
    </TapGestureHandler>
  )
}

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
    position: 'absolute',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#242424',
    borderRadius: 4,
    resizeMode: 'cover',
  },
})

const mapDispatchToProps = {
  setCurrentAnimation,
}

function mapStateToProps({ settings: { currentAnimation } }) {
  return {
    currentAnimation,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Cue)
