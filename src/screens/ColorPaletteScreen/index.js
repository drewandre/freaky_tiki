import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  Button,
  Image,
  TouchableOpacity,
} from 'react-native'

import * as Haptics from 'expo-haptics'
import DeviceInfo from 'react-native-device-info'
import { TapGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import uuid from 'react-native-uuid'
import { connect } from 'react-redux'

import { adjustColor } from '../../features/settings/helpers/adjustColor'
import {
  editColorPalette,
  addColorPalette,
} from '../../features/settings/redux/settingsActions'
import ColorPicker from '../../vendor/ColorPicker'

const isTablet = DeviceInfo.isTablet()
const ViewWrapper = isTablet ? View : SafeAreaView

function hex2Rgb(hex) {
  'worklet'
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

const palettes = [
  {
    hex: '#000000',
    alpha: 1,
  },
  {
    hex: '#ffffff',
    alpha: 1,
  },
  {
    hex: '#ff0000',
    alpha: 1,
  },
  {
    hex: '#ffa500',
    alpha: 1,
  },
  {
    hex: '#ffff00',
    alpha: 1,
  },
  {
    hex: '#008000',
    alpha: 1,
  },
  {
    hex: '#0000ff',
    alpha: 1,
  },
  {
    hex: '#4b0082',
    alpha: 1,
  },
  {
    hex: '#ee82ee',
    alpha: 1,
  },
]

function ColorPaletteScreen({
  navigation,
  route,
  editColorPalette,
  addColorPalette,
  medias = {},
  currentPalette,
}) {
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => {
    return updateState({})
  }, [])

  const pickerRef = React.useRef(null)
  const [frontColorSelectedState, setFrontColorSelectedState] =
    React.useState(true)
  const frontColorSelected = useSharedValue(1)
  const frontColor = useSharedValue(currentPalette?.front?.hex || '#503482')
  const backColor = useSharedValue(currentPalette?.back?.hex || '#FB9702')
  const frontColorAlpha = useSharedValue(currentPalette?.front?.alpha || 1)
  const backColorAlpha = useSharedValue(currentPalette?.back?.alpha || 1)

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            title={route?.palette ? 'Save' : 'Add'}
            onPress={handleSave}
            style={styles.button}
          />
        )
      },
    })
  }, [handleSave, navigation, route?.palette])

  const handleSave = React.useCallback(() => {
    if (route?.palette) {
      editColorPalette({
        id: route.palette.id,
        front: {
          hex: frontColor.value,
          alpha: frontColorAlpha.value,
        },
        back: {
          hex: backColor.value,
          alpha: backColorAlpha.value,
        },
      })
    } else {
      const id = uuid.v4()
      console.log('Creating color palette', id)
      addColorPalette({
        id,
        front: {
          hex: frontColor.value,
          alpha: frontColorAlpha.value,
        },
        back: {
          hex: backColor.value,
          alpha: backColorAlpha.value,
        },
      })
    }
    navigation.goBack()
  }, [
    addColorPalette,
    backColor.value,
    backColorAlpha.value,
    editColorPalette,
    frontColor.value,
    frontColorAlpha.value,
    navigation,
    route.palette,
  ])

  function setPickerRef(ref) {
    pickerRef.current = ref
  }

  function handleFrontColorPress() {
    frontColorSelected.value = 1
    setFrontColorSelectedState(true)
  }

  function handleBackColorPress() {
    frontColorSelected.value = 0
    setFrontColorSelectedState(false)
  }

  function onFrontColorChange(hex) {
    frontColor.value = hex
    for (var media in medias) {
      if (medias[media]?.CONTENTS) {
        const { r, g, b } = hex2Rgb(frontColor.value)
        adjustColor(medias, 'Front_Color', media, {
          r,
          g,
          b,
          a: frontColorAlpha.value,
        })
      } else {
        console.log(`${media} media did not have any CONTENTS`)
      }
    }
  }

  function onBackColorChange(hex) {
    backColor.value = hex
    for (var media in medias) {
      if (medias[media]?.CONTENTS) {
        const { r, g, b } = hex2Rgb(backColor.value)
        adjustColor(medias, 'Back_Color', media, {
          r,
          g,
          b,
          a: backColorAlpha.value,
        })
      } else {
        console.log(`${media} media did not have any CONTENTS`)
      }
    }
  }

  function onInteractionStart() {
    Haptics.selectionAsync()
  }

  const animatedFrontColorStyles = useAnimatedStyle(() => {
    return {
      flex: 1,
      overflow: 'hidden',
      zIndex: frontColorSelected.value ? 5 : 0,
      transform: [{ scale: withSpring(frontColorSelected.value ? 1.2 : 1) }],
      borderRadius: 15,
    }
  })

  const animatedBackColorStyles = useAnimatedStyle(() => {
    return {
      flex: 1,
      overflow: 'hidden',
      zIndex: frontColorSelected.value ? 0 : 5,
      transform: [{ scale: withSpring(frontColorSelected.value ? 1 : 1.2) }],
      borderRadius: 15,
    }
  })

  const animatedBackBackgroundStyles = useAnimatedStyle(() => {
    const rgb = hex2Rgb(backColor.value)
    return {
      flex: 1,
      backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},${backColorAlpha.value})`,
    }
  })

  const animatedFrontBackgroundStyles = useAnimatedStyle(() => {
    const rgb = hex2Rgb(frontColor.value)
    return {
      flex: 1,
      backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},${frontColorAlpha.value})`,
    }
  })

  function onFrontColorAlphaChange(a) {
    frontColorAlpha.value = a
    for (var media in medias) {
      if (medias[media]?.CONTENTS) {
        const { r, g, b } = hex2Rgb(frontColor.value)
        adjustColor(medias, 'Front_Color', media, { r, g, b, a })
      } else {
        console.log(`${media} media did not have any CONTENTS`)
      }
    }
  }

  function onBackColorAlphaChange(a) {
    backColorAlpha.value = a
    for (var media in medias) {
      if (medias[media]?.CONTENTS) {
        const { r, g, b } = hex2Rgb(backColor.value)
        adjustColor(medias, 'Back_Color', media, { r, g, b, a })
      } else {
        console.log(`${media} media did not have any CONTENTS`)
      }
    }
  }

  function onSwatchPress(palette) {
    if (frontColorSelectedState) {
      frontColor.value = palette.hex
      frontColorAlpha.value = palette.alpha
    } else {
      backColor.value = palette.hex
      backColorAlpha.value = palette.alpha
    }
    forceUpdate()
    forceUpdate()
  }

  return (
    <ViewWrapper style={styles.wrapper}>
      <View style={styles.innerContainer}>
        <View style={styles.buttonContainer}>
          <TapGestureHandler onActivated={handleFrontColorPress}>
            <Animated.View style={animatedFrontColorStyles}>
              <Image
                source={require('../../assets/alpha.jpg')}
                style={styles.alphaBackground}
              />
              <Animated.View style={animatedFrontBackgroundStyles} />
              <Text
                style={{
                  position: 'absolute',
                  fontWeight: 'bold',
                  bottom: 8,
                  left: 10,
                  overflow: 'visible',
                  textShadowRadius: 1,
                  textShadowColor: '#fff',
                  fontSize: 20,
                  color: '#000',
                }}
              >
                Front Color
              </Text>
            </Animated.View>
          </TapGestureHandler>
          <TapGestureHandler onActivated={handleBackColorPress}>
            <Animated.View style={animatedBackColorStyles}>
              <Image
                source={require('../../assets/alpha.jpg')}
                style={styles.alphaBackground}
              />
              <Animated.View style={animatedBackBackgroundStyles} />
              <Text
                style={{
                  position: 'absolute',
                  fontWeight: 'bold',
                  bottom: 8,
                  right: 10,
                  overflow: 'visible',
                  textShadowRadius: 1,
                  textShadowColor: '#fff',
                  fontSize: 20,
                  color: '#000',
                }}
              >
                Rear Color
              </Text>
            </Animated.View>
          </TapGestureHandler>
        </View>
        <View style={styles.colorPickerContainer}>
          <ColorPicker
            ref={setPickerRef}
            color={frontColorSelectedState ? frontColor.value : backColor.value}
            alpha={
              frontColorSelectedState
                ? frontColorAlpha.value
                : backColorAlpha.value
            }
            onColorChange={
              frontColorSelectedState ? onFrontColorChange : onBackColorChange
            }
            onAlphaChange={
              frontColorSelectedState
                ? onFrontColorAlphaChange
                : onBackColorAlphaChange
            }
            onInteractionStart={onInteractionStart}
            onColorChangeComplete={onInteractionStart}
            thumbSize={40}
            shadeWheelThumb={false}
            sliderSize={30}
            row={false}
            swatches={false}
          />
          <View style={styles.swatchesContainer}>
            {palettes.map((palette, index) => {
              return (
                <TouchableOpacity
                  key={`palette_${palette.hex}_${index}`}
                  onPress={() => {
                    onSwatchPress(palette)
                  }}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: palette.hex,
                      opacity: palette.alpha,
                      borderWidth: palette.hex === '#000000' ? 2 : 0,
                      borderColor: '#fff',
                    },
                  ]}
                />
              )
            })}
          </View>
        </View>
      </View>
    </ViewWrapper>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 8,
    margin: isTablet ? 30 : 15,
    marginBottom: isTablet ? 15 : 35,
    paddingHorizontal: 15,
    backgroundColor: '#121212',
    justifyContent: 'space-around',
  },
  innerContainer: {
    width: '100%',
    height: isTablet ? '75%' : '100%',
  },
  swatchesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 15,
  },
  swatch: {
    aspectRatio: 1,
    flex: 1,
    marginHorizontal: 5,
    height: 40,
    borderRadius: 100,
  },
  alphaBackground: {
    resizeMode: 'cover',
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  colorPickerContainer: {
    alignSelf: 'center',
    width: isTablet ? '50%' : '100%',
    flex: 1,
  },
  buttonContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    height: 80,
    width: isTablet ? '50%' : '80%',
  },
  button: {
    backgroundColor: '#fff',
    width: '100%',
    height: 100,
    alignSelf: 'flex-end',
  },
})

function mapStateToProps({ settings: { currentPalette, medias = {} } }) {
  return {
    medias,
    currentPalette,
  }
}

const mapDispatchToProps = {
  addColorPalette,
  editColorPalette,
}

export default connect(mapStateToProps, mapDispatchToProps)(ColorPaletteScreen)
