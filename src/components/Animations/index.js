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
import { setParamValue } from '../../features/settings/redux/settingsActions'
import Cue from '../Cue'
import Slider from '../Slider'

const isTablet = DeviceInfo.isTablet()

const ViewWrapper = isTablet ? View : SafeAreaView

const DEFAULT_HIT_SLOP = {
  top: 15,
  bottom: 15,
  left: 5,
  right: 5,
}

function Animations({ cues, currentAnimation, setParamValue }) {
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
    console.log('skip to start')
  }
  function skipToEnd() {
    console.log('skip to end')
  }
  function play() {
    console.log('play')
  }
  function onParamSliderChange(e, address, oscAddress) {
    OSCManager.sendMessage(oscAddress, [e])
  }
  function onParamSliderChangeFinish(e, address /* oscAddress */) {
    setParamValue(address, e)
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
          <Text style={styles.sectionHeader}>Animations</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity hitSlop={DEFAULT_HIT_SLOP} onPress={skipToStart}>
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
        </View>
        <FlatList
          numColumns={isTablet ? 4 : 2}
          data={cues}
          keyExtractor={animationKeyExtractor}
          renderItem={renderAnimation}
          scrollIndicatorInsets={{
            bottom: currentAnimation?.PARAMS?.length ? 160 : 0,
          }}
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
          contentContainerStyle={styles.contentContainerStyle}
        />
        {currentAnimation?.PARAMS?.length ? (
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
}

function mapStateToProps({ settings: { port, currentAnimation, cues } }) {
  return {
    cues,
    port,
    currentAnimation,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Animations)
