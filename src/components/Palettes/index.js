import React from 'react'
import { View, Text, StyleSheet, FlatList, Image } from 'react-native'

import { useNavigation } from '@react-navigation/native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { StatusBar } from 'expo-status-bar'
import DeviceInfo from 'react-native-device-info'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { connect } from 'react-redux'

import Palette from '../Palette'

const isTablet = DeviceInfo.isTablet()

const ViewWrapper = isTablet ? View : SafeAreaView

const DEFAULT_HIT_SLOP = {
  top: 15,
  bottom: 15,
  left: 5,
  right: 5,
}

function Palettes({ palettes }) {
  const navigation = useNavigation()
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
  function renderPalette({ item, index }) {
    if (!isLandscape && index === palettes.length - 1) {
      return null
    }
    return <Palette data={item} />
  }
  function paletteKeyExtractor(item, index) {
    return `palette_${item?.id || 'empty'}_${index}`
  }
  function addColorPalette() {
    navigation.navigate('ColorPaletteScreen')
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
      <View style={styles.innerContainer}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Color Palettes</Text>
          <TouchableOpacity
            hitSlop={DEFAULT_HIT_SLOP}
            onPress={addColorPalette}
          >
            <Image
              style={styles.icon}
              source={require('../../assets/add.png')}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          key={isLandscape ? 'landscape' : 'portrait'}
          numColumns={isTablet ? (isLandscape ? 4 : 3) : 2}
          data={palettes}
          keyExtractor={paletteKeyExtractor}
          renderItem={renderPalette}
          contentContainerStyle={styles.contentContainerStyle}
        />
      </View>
    </ViewWrapper>
  )
}

const styles = StyleSheet.create({
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

const mapDispatchToProps = {}

function mapStateToProps({ settings: { palettes } }) {
  const filledPalettes = new Array(16).fill({})
  palettes.forEach((palette, index) => {
    filledPalettes[index] = palette
  })
  return {
    palettes: filledPalettes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Palettes)
