import React from 'react'
import { View, Text, StyleSheet, FlatList, Image } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'
import * as ScreenOrientation from 'expo-screen-orientation'
import { StatusBar } from 'expo-status-bar'
import DeviceInfo from 'react-native-device-info'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { connect } from 'react-redux'

import OSCManager from '../../features/OSC/OSCManager'
import {
  setCurrentAnimation,
  setParamValue,
  setAudioInputLevel,
} from '../../features/settings/redux/settingsActions'
import Cue from '../Cue'
import Slider from '../Slider'

const SHOW_PLAY_OPTIONS = false
const SHOW_PARAMS = false

const isTablet = DeviceInfo.isTablet()

const ViewWrapper = isTablet ? View : SafeAreaView

const DEFAULT_HIT_SLOP = {
  top: 15,
  bottom: 15,
  left: 5,
  right: 5,
}

function Animations({
  cues,
  currentAnimation,
  setParamValue,
  setCurrentAnimation,
  setAudioInputLevel,
  audioInputLevel,
  loading,
  error,
}) {
  const [orientation, setOrientation] = React.useState(0)
  const isLandscape = [1, 2].includes(orientation)
  React.useEffect(() => {
    ScreenOrientation.unlockAsync()
      .then(() => {
        ScreenOrientation.getOrientationAsync()
          .then((result) => {
            // console.log("initial orientation", result);
            setOrientation(result)
          })
          .catch((error) => {
            console.warn(error)
            setOrientation(1)
          })
      })
      .catch(console.warn)
    ScreenOrientation.addOrientationChangeListener(screenListener)
    return function cleanup() {
      ScreenOrientation.removeOrientationChangeListeners()
    }
  }, [])

  function screenListener({ orientationInfo }) {
    // console.log("orientation", orientationInfo.orientation);
    setOrientation(orientationInfo.orientation)
  }

  function renderAnimation({ item }) {
    return <Cue data={item} />
  }
  function animationKeyExtractor(item, index) {
    return `animation_${item?.id || 'empty'}_${index}`
  }
  function skipToStart() {
    console.log('Skipping to start')
    OSCManager.sendMessage('/cues/main/cues/start_previous', [])
    if (cues?.[0]) {
      setCurrentAnimation(cues[0])
    }
  }
  function skipToEnd() {
    const indexToSkipTo = cues?.findIndex?.((cue) => {
      return cue?.FULL_PATH === currentAnimation?.FULL_PATH
    })
    console.log(
      'Skipping to end',
      indexToSkipTo + 1,
      !!cues?.[indexToSkipTo + 1]?.FULL_PATH
    )
    if (indexToSkipTo !== -1 && cues?.[indexToSkipTo + 1]?.FULL_PATH) {
      OSCManager.sendMessage('/cues/main/cues/start_next', [])
      setCurrentAnimation(cues[indexToSkipTo + 1])
    }
  }
  function play() {
    console.log('Auto play initiated')
    OSCManager.sendMessage('/cues/selected/auto_play', [])
    if (cues?.[0]) {
      setCurrentAnimation(cues[0])
    }
  }
  function onParamSliderChange(e, address, oscAddress) {
    OSCManager.sendMessage(oscAddress, [e])
  }
  function onParamSliderChangeFinish(e, address /* oscAddress */) {
    setParamValue(address, e)
  }
  function handleAudioSensitivityChange(val) {
    setAudioInputLevel(val)
  }
  if (!orientation) {
    return null
  }
  return (
    <ViewWrapper
      edges={isTablet ? undefined : ['left', 'right']}
      style={{
        ...styles.container,
        flexDirection: isLandscape ? 'column' : 'row',
      }}
    >
      <StatusBar style="light" />
      <View style={{ ...styles.innerContainer, flex: 1.5 }}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Presets</Text>
          {SHOW_PLAY_OPTIONS ? (
            <View style={styles.iconContainer}>
              <TouchableOpacity
                hitSlop={DEFAULT_HIT_SLOP}
                onPress={skipToStart}
              >
                <Image
                  source={require('../../assets/skip_to_start.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={DEFAULT_HIT_SLOP} onPress={skipToEnd}>
                <Image
                  source={require('../../assets/skip_to_next.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={DEFAULT_HIT_SLOP} onPress={play}>
                <Image
                  source={require('../../assets/play.png')}
                  style={styles.playIcon}
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
        <FlatList
          numColumns={isTablet ? 4 : 2}
          data={cues}
          keyExtractor={animationKeyExtractor}
          renderItem={renderAnimation}
          scrollIndicatorInsets={{
            bottom: SHOW_PARAMS && currentAnimation?.PARAMS?.length ? 160 : 0,
          }}
          style={
            SHOW_PARAMS
              ? {
                  position: 'absolute',
                  top: 60,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }
              : undefined
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            SHOW_PARAMS ? <View style={{ height: 100 }} /> : undefined
          }
          contentContainerStyle={styles.contentContainerStyle}
        />
        {isTablet && !loading && !error ? (
          <View>
            <Text
              style={{ margin: 15, marginBottom: 0, ...styles.sectionHeader }}
            >
              Audio Sensitivty
            </Text>
            <View style={styles.audioButtons}>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={() => {
                  handleAudioSensitivityChange(0)
                }}
              >
                <Text style={styles.audioButtonText}>Off</Text>
                {audioInputLevel?.VALUE?.[0] === 0 ? (
                  <View style={styles.bottomBorder} />
                ) : null}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={() => {
                  handleAudioSensitivityChange(1)
                }}
              >
                <Text style={styles.audioButtonText}>Low</Text>
                {audioInputLevel?.VALUE?.[0] === 1 ? (
                  <View style={styles.bottomBorder} />
                ) : null}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={() => {
                  handleAudioSensitivityChange(4)
                }}
              >
                <Text style={styles.audioButtonText}>Normal</Text>
                {audioInputLevel?.VALUE?.[0] === 4 ? (
                  <View style={styles.bottomBorder} />
                ) : null}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {SHOW_PARAMS && currentAnimation?.PARAMS?.length ? (
          <View style={styles.animationSliderContainer}>
            <LinearGradient
              colors={['rgba(18,18,18,0)', '#121212']}
              style={styles.linearGradient}
            />
            <View style={styles.sliderContainer}>
              {currentAnimation.PARAMS.map((param) => {
                if (['Back Color', 'Front Color'].includes(param.DESCRIPTION)) {
                  return null
                }
                return (
                  <Slider
                    key={param.DESCRIPTION}
                    sideLabel
                    DESCRIPTION={param?.DESCRIPTION}
                    VALUE={param?.VALUE}
                    RANGE={param?.RANGE}
                    FULL_PATH={param?.FULL_PATH}
                    onSliderChange={onParamSliderChange}
                    onSlidingComplete={onParamSliderChangeFinish}
                  />
                )
              })}
            </View>
          </View>
        ) : null}
      </View>
    </ViewWrapper>
  )
}

const styles = StyleSheet.create({
  animationSliderContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBorder: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 5,
    borderBottomLeftRadius: 500,
    borderBottomRightRadius: 500,
    backgroundColor: '#32FCFF',
  },
  audioButtons: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    width: '100%',
    padding: 20,
  },
  audioButton: {
    marginRight: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sliderContainer: {
    backgroundColor: '#121212',
    paddingHorizontal: 15,
  },
  icon: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  innerContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#121212',
    borderRadius: 8,
  },
  linearGradient: {
    width: '100%',
    height: 60,
  },
  container: {
    flex: 1,
    padding: 15,
    flexDirection: 'row',
    backgroundColor: '#000',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    width: '100%',
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playIcon: {
    marginLeft: 10,
    width: 25,
    height: 25,
  },
  iconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sectionHeader: {
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 5,
    fontSize: 20,
  },
  contentContainerStyle: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
})

const mapDispatchToProps = {
  setParamValue,
  setCurrentAnimation,
  setAudioInputLevel,
}

function mapStateToProps({
  settings: { port, error, loading, audioInputLevel, currentAnimation, cues },
}) {
  return {
    cues,
    port,
    error,
    loading,
    currentAnimation,
    audioInputLevel,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Animations)
