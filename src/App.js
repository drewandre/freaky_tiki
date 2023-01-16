import React from 'react'
import {
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  View,
  PlatformColor,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  DarkTheme,
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { BlurView } from 'expo-blur'
import * as SplashScreen from 'expo-splash-screen'
import DeviceInfo from 'react-native-device-info'
import RNRestart from 'react-native-restart'
import { connect } from 'react-redux'

import Animations from './components/Animations'
import Palettes from './components/Palettes'
import OSCManager from './features/OSC/OSCManager'
import { setData } from './features/settings/redux/settingsOperations'
import ColorPaletteScreen from './screens/ColorPaletteScreen'
import HomeScreen from './screens/HomeScreen'
import SettingsScreen from './screens/SettingsScreen'

const navigationRef = createNavigationContainerRef()

const RootStack = createNativeStackNavigator()
const Footer = createBottomTabNavigator()

const isTablet = DeviceInfo.isTablet()

const reasons = [
  'Make sure this iPad is connected to the normal WiFi network (should be called Tiki_guest). If the WiFi network has recently changed, see step 4.',
  'Make sure the Mac Mini (located in the rack unit) is turned on. There should be a glowing white light on the front of the unit. If not, the black-colored power button is located on the front left of the unit.',
  'If the Mac Mini is turned on, try power cycling entire system using the large on/off switch located on the bottom right of the rack unit. Wait 10 seconds before turning the system back on, after which you should hear the startup chime.',
  "If you believe it's possible the WiFi network has recently changed, you will need to update this on the Mac Mini. To do so, you need to plug a monitor into the computer's HDMI port, and the keyboard/mouse (located in the rack unit). Correct the WiFi setting, then take note of the new IP address which can be found by holding the window key (or option on a mac keyboard) and clicking the WiFi sybol in the mac menu bar. Within that dropdown you will see IP Address. You should then click 'Settings' below, and make sure the IP Address matches.",
  'If all else fails, call Drew André using the cell number above.',
]

function App({
  port,
  address,
  setData,
  loading,
  error,
  currentAnimation,
  currentPalette,
}) {
  React.useEffect(() => {
    OSCManager.setClient(port, address)
    setData().then(() => {
      if (currentAnimation) {
        console.log('Setting current animation!')
        OSCManager.sendMessage(currentAnimation.FULL_PATH, [])
      }
      if (currentPalette) {
        console.log('Setting current palette!')
        OSCManager.sendMessage(currentPalette.FULL_PATH, [])
      }
    })
    // Hides native splash screen after 500ms
    const timeout = setTimeout(async () => {
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Unable to hide splash screen', error)
      })
    }, 500)
    return function cleanup() {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const navigateToSettings = React.useCallback(() => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Settings')
    }
  }, [])
  const connectionText = React.useMemo(() => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 15,
        }}
      >
        <View
          style={{
            marginRight: 7,
            width: 10,
            height: 10,
            borderRadius: 100,
            backgroundColor: loading ? 'orange' : error ? 'red' : 'green',
          }}
        />
        <Text style={{ color: '#fff' }}>
          {loading ? 'Refreshing...' : error ? 'Disconnected' : 'Connected'}
        </Text>
      </View>
    )
  }, [loading, error])
  function defaultHomeScreenOptions(navigation) {
    return {
      tabBarLabelStyle: {
        color: '#fff',
      },
      headerTitle: () => {
        return (
          <Image
            source={require('./assets/logo_horizontal.png')}
            style={{
              width: 115,
              height: 50,
              resizeMode: 'contain',
              tintColor: '#fff',
            }}
          />
        )
      },
      headerLeft: () => {
        if (isTablet) {
          return null
        } else {
          return <View style={{ marginLeft: 15 }}>{connectionText}</View>
        }
      },
      headerRight: () => {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isTablet ? connectionText : null}
            {loading ? (
              <ActivityIndicator style={{ width: 30, marginRight: 15 }} />
            ) : (
              <TouchableOpacity
                onPress={setData}
                style={{
                  marginRight: 15,
                }}
              >
                <Image
                  source={require('./assets/refresh.png')}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Settings')
              }}
              style={{
                marginRight: 15,
              }}
            >
              <Image
                source={require('./assets/gear.png')}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          </View>
        )
      },
    }
  }

  const handleRestart = React.useCallback(() => {
    try {
      RNRestart.Restart()
    } catch (e) {
      console.warn('Could not start', e)
    }
  }, [])

  const errorOverlay = React.useMemo(() => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <BlurView intensity={100} tint="dark" style={styles.blurContainer} />
          <View style={styles.innerErrorContainer}>
            <Text style={styles.errorHeader}>Unable to connect</Text>
            <Text style={styles.errorText}>
              There are a few reasons why this could happen. Try the following
              steps to re-connect. If nothing works, you can text Drew André at
              <Text
                style={{
                  color: PlatformColor('systemBlue'),
                }}
                onPress={() => {
                  Linking.openURL('sms:978-495-2066')
                }}
              >
                {' '}
                978-495-2066
              </Text>
              .
            </Text>
            <ScrollView contentContainerStyle={styles.contentContainerStyle}>
              {reasons.map((reason, index) => {
                return (
                  <View
                    key={`reason_${index}`}
                    style={styles.errorMessageContainer}
                  >
                    <View style={styles.errorNumberContainer}>
                      <Text style={styles.errorNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                )
              })}
            </ScrollView>
            <TouchableOpacity onPress={navigateToSettings}>
              <Text
                style={{
                  alignSelf: 'center',
                  marginTop: 15,
                  fontSize: 20,
                  color: PlatformColor('systemBlue'),
                  fontWeight: 'bold',
                }}
              >
                Settings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRestart}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Retry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }, [error, loading, handleRestart, navigateToSettings])
  return (
    <View style={styles.container}>
      <NavigationContainer theme={DarkTheme} ref={navigationRef}>
        <RootStack.Navigator
          screenOptions={{
            cardStyle: {
              backgroundColor: '#000',
            },
          }}
        >
          {isTablet ? (
            <RootStack.Screen
              name="Home"
              options={({ navigation }) => {
                return {
                  ...defaultHomeScreenOptions(navigation),
                }
              }}
              component={HomeScreen}
            />
          ) : (
            <RootStack.Screen
              name="Footer"
              options={{
                headerShown: false,
              }}
            >
              {() => {
                return (
                  <Footer.Navigator>
                    <Footer.Screen
                      name="Animations"
                      component={Animations}
                      options={({ navigation }) => {
                        return {
                          ...defaultHomeScreenOptions(navigation),
                          tabBarIcon: ({ focused }) => {
                            return (
                              <Image
                                source={require('./assets/movie.png')}
                                style={{
                                  opacity: focused ? 1 : 0.4,
                                  width: 26,
                                  height: 26,
                                }}
                              />
                            )
                          },
                        }
                      }}
                    />
                    <Footer.Screen
                      name="Color Palettes"
                      component={Palettes}
                      options={({ navigation }) => {
                        return {
                          ...defaultHomeScreenOptions(navigation),
                          tabBarIcon: ({ focused }) => {
                            return (
                              <Image
                                source={require('./assets/palette.png')}
                                style={{
                                  opacity: focused ? 1 : 0.4,
                                  width: 26,
                                  height: 26,
                                }}
                              />
                            )
                          },
                        }
                      }}
                    />
                  </Footer.Navigator>
                )
              }}
            </RootStack.Screen>
          )}
          <RootStack.Group screenOptions={{ presentation: 'modal' }}>
            <RootStack.Screen
              name="Settings"
              component={SettingsScreen}
              options={({ navigation }) => {
                return {
                  headerLeft: () => {
                    return (
                      <TouchableOpacity onPress={navigation.goBack}>
                        <Image
                          source={require('./assets/down_arrow.png')}
                          style={{
                            width: 30,
                            height: 30,
                            marginLeft: 15,
                            tintColor: PlatformColor('systemBlueColor'),
                          }}
                        />
                      </TouchableOpacity>
                    )
                  },
                  headerBackTitleVisible: false,
                  headerTitle: 'Settings',
                }
              }}
            />
            <RootStack.Screen
              name="ColorPaletteScreen"
              component={ColorPaletteScreen}
              options={({ navigation, route }) => {
                return {
                  headerLeft: () => {
                    return (
                      <TouchableOpacity onPress={navigation.goBack}>
                        <Image
                          source={require('./assets/down_arrow.png')}
                          style={{
                            width: 30,
                            height: 30,
                            marginLeft: 15,
                            tintColor: PlatformColor('systemBlueColor'),
                          }}
                        />
                      </TouchableOpacity>
                    )
                  },
                  headerBackTitleVisible: false,
                  headerTitle: route?.params?.palette
                    ? 'Edit Color Palette'
                    : 'Create Color Palette',
                }
              }}
            />
          </RootStack.Group>
        </RootStack.Navigator>
      </NavigationContainer>
      {errorOverlay}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    ...StyleSheet.absoluteFill,
  },
  retryButton: {
    margin: 15,
    marginBottom: 0,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#fff',
  },
  errorMessageContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  errorNumberContainer: {
    backgroundColor: '#fff',
    width: 30,
    height: 30,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  errorNumber: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  reasonText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerErrorContainer: {
    overflow: 'hidden',
    maxHeight: isTablet ? '60%' : '80%',
    maxWidth: isTablet ? '50%' : undefined,
    backgroundColor: '#121212',
    borderRadius: 8,
    paddingVertical: 15,
  },
  errorHeader: {
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 24,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  contentContainerStyle: {
    padding: 15,
  },
  errorText: {
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
})

const mapDispatchToProps = {
  setData,
}

function mapStateToProps({ settings }) {
  return {
    error: settings?.error,
    loading: settings?.loading,
    port: settings?.port,
    address: settings?.address,
    currentAnimation: settings?.currentAnimation,
    currentPalette: settings?.currentPalette,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
