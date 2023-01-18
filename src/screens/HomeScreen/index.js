import React from 'react'
import { View, StyleSheet } from 'react-native'

import * as ScreenOrientation from 'expo-screen-orientation'
import { StatusBar } from 'expo-status-bar'
import { connect } from 'react-redux'

import Animations from '../../components/Animations'
import Palettes from '../../components/Palettes'

const SHOW_PALETTES = false

function HomeScreen({}) {
  const [orientation, setOrientation] = React.useState(0)
  const isLandscape = [1, 2].includes(orientation)
  React.useEffect(() => {
    ScreenOrientation.unlockAsync()
      .then(() => {
        ScreenOrientation.getOrientationAsync()
          .then((result) => {
            // console.log('initial orientation', result)
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
    console.log('orientation', orientationInfo.orientation)
    setOrientation(orientationInfo.orientation)
  }
  if (!orientation) {
    return null
  }
  return (
    <View
      style={{
        ...styles.container,
        flexDirection: isLandscape ? 'column' : 'row',
      }}
    >
      <StatusBar style="light" />
      <Animations />
      {SHOW_PALETTES ? <Palettes /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#000',
  },
})

const mapDispatchToProps = {}

function mapStateToProps({}) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)
