import React from 'react'
import { View, StyleSheet, Image } from 'react-native'

import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { TapGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { connect } from 'react-redux'

import { adjustColor } from '../../features/settings/helpers/adjustColor'
import { setCurrentPalette } from '../../features/settings/redux/settingsActions'

function hex2Rgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function Palette({ medias = {}, setCurrentPalette, currentPalette, data }) {
  function handlePress() {
    setCurrentPalette(data)
    for (var media in medias) {
      if (medias[media]?.CONTENTS) {
        const backRgb = hex2Rgb(data.back.hex)
        const frontRgb = hex2Rgb(data.front.hex)
        adjustColor(medias, 'Back_Color', media, {
          ...backRgb,
          a: data.back.alpha,
        })
        adjustColor(medias, 'Front_Color', media, {
          ...frontRgb,
          a: data.front.alpha,
        })
      } else {
        console.log(`${media} media did not have any CONTENTS`)
      }
    }
  }

  const frontColor = React.useMemo(() => {
    if (data?.id) {
      const { r, g, b } = hex2Rgb(data?.front?.hex)
      return `rgba(${r}, ${g}, ${b}, ${data.front.alpha})`
    }
  }, [data?.front?.alpha, data?.front?.hex, data?.id])

  const backColor = React.useMemo(() => {
    if (data?.id) {
      const { r, g, b } = hex2Rgb(data?.back?.hex)
      return `rgba(${r}, ${g}, ${b}, ${data.front.alpha})`
    }
  }, [data?.back?.hex, data?.front?.alpha, data?.id])

  const isSelected = useSharedValue(currentPalette?.id === data?.id)
  const scale = useSharedValue(1)
  const prevScale = useSharedValue(1)
  const cueTimingProgress = useSharedValue(0)

  React.useEffect(() => {
    if (currentPalette?.id === data?.id) {
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
      cueTimingProgress.value = 0
      scale.value = withTiming(1)
    }
  }, [cueTimingProgress, currentPalette, data, isSelected, scale])

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
      zIndex: 9,
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
      right: 5,
      zIndex: 7,
      overflow: 'hidden',
      borderRadius: 4,
      width: `${cueTimingProgress.value}%`,
      backgroundColor: 'rgba(255,255,255,0.5)',
    }
  })
  return (
    <TapGestureHandler
      enabled={!!data?.id}
      onBegan={onTapBegin}
      onActivated={onTapActive}
      onFailed={onTapFailed}
      onCancelled={onTapCancelled}
    >
      <Animated.View style={animatedStyles}>
        {data?.id ? (
          <Image
            source={require('../../assets/alpha.jpg')}
            style={styles.imageBackground}
          />
        ) : (
          <View style={styles.imageBackground} />
        )}
        <LinearGradient
          colors={[frontColor, backColor]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <Animated.View style={animatedCueTimingStyles} />
        {data?.id ? <Animated.View style={animatedBottomBorderStyles} /> : null}
      </Animated.View>
    </TapGestureHandler>
  )
}

const styles = StyleSheet.create({
  imageBackground: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#242424',
    borderRadius: 4,
    resizeMode: 'cover',
    zIndex: 3,
  },
  gradient: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    zIndex: 5,
    overflow: 'hidden',
    borderRadius: 4,
  },
})

const mapDispatchToProps = {
  setCurrentPalette,
}

function mapStateToProps({ settings: { medias = {}, currentPalette } }) {
  return {
    currentPalette,
    medias,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Palette)
