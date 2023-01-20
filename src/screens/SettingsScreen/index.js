import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  PlatformColor,
  ActivityIndicator,
} from 'react-native'

import DeviceInfo from 'react-native-device-info'
import { connect } from 'react-redux'

import Slider from '../../components/Slider'
import OSCManager from '../../features/OSC/OSCManager'
import {
  changePort,
  changeAddress,
  setAudioInputLevel,
} from '../../features/settings/redux/settingsActions'
import { setData } from '../../features/settings/redux/settingsOperations'

const isTablet = DeviceInfo.isTablet()
const ScollViewWrapper = isTablet ? View : ScrollView

function SettingsScreen({
  navigation,
  port,
  setData,
  address,
  masterLevel,
  loading,
  error,
  audioInputLevel,
  changePort,
  changeAddress,
  setAudioInputLevel,
}) {
  const localAddressRef = React.useRef(address)
  const localPortRef = React.useRef(port)

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={handleSave}>
            <Text
              style={{
                marginRight: 15,
                color: PlatformColor('systemBlueColor'),
                fontSize: 18,
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        )
      },
    })
  }, [navigation, handleSave])

  const handleSave = React.useCallback(() => {
    changePort(localPortRef.current)
    changeAddress(localAddressRef.current)
    OSCManager.setClient(localPortRef.current, localAddressRef.current)
    setData().catch(console.warn)
    navigation.goBack()
  }, [changeAddress, setData, changePort, navigation])

  function onChangePortText(value) {
    localPortRef.current = value
  }

  function onChangeAddressText(value) {
    localAddressRef.current = value
  }

  function onSliderChange(e, address) {
    Keyboard.dismiss()
    OSCManager.sendMessage(`${address}_OSC`, [e])
  }

  function renderSliders() {
    return (
      <>
        {masterLevel === undefined ? null : (
          <Slider {...masterLevel} onSliderChange={onSliderChange} />
        )}
      </>
    )
  }

  function handleAudioSensitivityChange(val) {
    setAudioInputLevel(val)
  }

  return (
    <View style={styles.viewWrapper}>
      <ScollViewWrapper style={styles.scrollView}>
        <View style={{ flex: 1 }}>
          {!loading && !error ? (
            <View style={styles.slidersWrapper}>{renderSliders()}</View>
          ) : null}
          <TouchableOpacity
            onPress={setData}
            disabled={loading}
            style={{
              maxWidth: isTablet ? 300 : undefined,
              opacity: loading ? 0.5 : 1,
              marginBottom: 15,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              height: 50,
              backgroundColor: '#fff',
            }}
          >
            {loading ? (
              <ActivityIndicator style={{ width: 30, marginRight: 15 }} />
            ) : (
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                Refresh Data
              </Text>
            )}
          </TouchableOpacity>
          {isTablet || loading || error ? null : (
            <View>
              <Text
                style={{
                  marginVertical: 15,
                  marginBottom: 0,
                  ...styles.sectionHeader,
                }}
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
          )}
        </View>
        <View style={styles.textInputsContainer}>
          <Text style={styles.warningLabel}>
            These settings should not need to be changed
          </Text>
          <View style={styles.textInputContainer}>
            <Text style={styles.label}>IP Address</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="10.0.208.87"
              returnKeyType="done"
              defaultValue={address}
              onSubmitEditing={Keyboard.dismiss}
              onChangeText={onChangeAddressText}
              style={styles.textInput}
            />
          </View>
          <View style={styles.textInputContainer}>
            <Text style={styles.label}>Port</Text>
            <TextInput
              returnKeyType="done"
              placeholder="8010"
              defaultValue={port}
              editable={false}
              onSubmitEditing={Keyboard.dismiss}
              onChangeText={onChangePortText}
              style={[styles.textInput, styles.disabledTextInput]}
            />
          </View>
        </View>
      </ScollViewWrapper>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flexDirection: isTablet ? 'row' : 'column',
    padding: 15,
    margin: 15,
    marginBottom: isTablet ? 0 : 35,
    borderRadius: 8,
    backgroundColor: '#121212',
  },
  viewWrapper: {
    flex: 1,
  },
  slidersWrapper: {
    maxWidth: isTablet ? 300 : undefined,
    marginBottom: 15,
  },
  warningLabel: {
    color: '#ff6700',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 15,
  },
  label: {
    color: '#fff',
    fontSize: 16,
  },
  textInput: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 5,
    alignSelf: 'center',
    borderRadius: 5,
    backgroundColor: '#181818',
    color: '#fff',
    width: '100%',
    fontSize: 16,
  },
  disabledTextInput: {
    opacity: 0.3,
  },
  textInputContainer: {
    marginBottom: 15,
  },
  textInputsContainer: {
    flex: isTablet ? undefined : 1,
    marginLeft: isTablet ? 15 : undefined,
    alignSelf: isTablet ? 'flex-start' : undefined,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 0,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff6700',
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
  sectionHeader: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  audioButtons: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    width: '100%',
    paddingVertical: 20,
  },
  audioButton: {
    marginRight: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    // paddingHorizontal: 40,
    paddingVertical: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  audioButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

function mapStateToProps({ settings }) {
  return {
    port: settings?.port,
    error: settings?.error,
    loading: settings?.loading,
    masterLevel: settings?.masterLevel,
    audioInputLevel: settings?.audioInputLevel,
    address: settings?.address,
  }
}

const mapDispatchToProps = {
  changePort,
  changeAddress,
  setData,
  setAudioInputLevel,
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen)
