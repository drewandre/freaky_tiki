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
} from 'react-native'

import DeviceInfo from 'react-native-device-info'
import { connect } from 'react-redux'

import Slider from '../../components/Slider'
import OSCManager from '../../features/OSC/OSCManager'
import {
  changePort,
  changeAddress,
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
  audioInputLevel,
  changePort,
  changeAddress,
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
    OSCManager.sendMessage(address, [e])
  }

  function renderSliders() {
    return (
      <>
        {masterLevel ? (
          <Slider {...masterLevel} onSliderChange={onSliderChange} />
        ) : null}
        {audioInputLevel ? (
          <Slider {...audioInputLevel} onSliderChange={onSliderChange} />
        ) : null}
      </>
    )
  }

  return (
    <View style={styles.viewWrapper}>
      <ScollViewWrapper style={styles.scrollView}>
        <View style={styles.slidersWrapper}>{renderSliders()}</View>
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
    flex: 1,
    maxWidth: 500,
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
})

function mapStateToProps({ settings }) {
  return {
    port: settings?.port,
    masterLevel: settings?.masterLevel,
    audioInputLevel: settings?.audioInputLevel,
    address: settings?.address,
  }
}

const mapDispatchToProps = {
  changePort,
  changeAddress,
  setData,
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen)
