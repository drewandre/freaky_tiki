import React from "react";
import {
  ScrollView,
  View,
  Platform,
  KeyboardAvoidingView,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Keyboard,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { connect } from "react-redux";
import {
  changePort,
  changeAddress,
} from "../../features/settings/redux/settingsActions";
import OSCManager from "../../features/OSC/OSCManager";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "../HomeScreen/components/Slider";

function SettingsScreen({
  navigation,
  port,
  address,
  masterLevel,
  audioInputLevel,
  changePort,
  changeAddress,
}) {
  const [localPort, setLocalPort] = React.useState(port);
  const [localAddress, setLocalAddress] = React.useState(address);

  const portRef = React.useRef(null);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button title="Save" onPress={handleSave} style={styles.button} />
        );
      },
    });
  }, [navigation]);

  function handleSave() {
    changePort(localPort);
    changeAddress(localAddress);
    OSCManager.setClient(localPort, localAddress);
    navigation.goBack();
  }

  function onChangePortText(value) {
    setLocalPort(value);
  }

  function onChangeAddressText(value) {
    setLocalAddress(value);
  }

  function setPortRef(ref) {
    portRef.current = ref;
  }

  function focusPortRef() {
    portRef.current?.focus?.();
  }

  function onSliderChange(e, address) {
    Keyboard.dismiss();
    OSCManager.sendMessage(address, [e]);
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
        {audioInputLevel ? (
          <Slider {...audioInputLevel} onSliderChange={onSliderChange} />
        ) : null}
      </>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.slidersWrapper}>{renderSliders()}</View>
      <View style={styles.textInputsContainer}>
        <Text style={styles.warningLabel}>
          These settings do not need to be changed
        </Text>
        <View style={styles.textInputContainer}>
          <Text style={styles.label}>TouchOSC IP Address</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="192.168.100.118"
            value={localAddress}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            onChangeText={onChangeAddressText}
            style={styles.textInput}
          />
        </View>
        <View style={styles.textInputContainer}>
          <Text style={styles.label}>TouchOSC Input Port</Text>
          <TextInput
            ref={setPortRef}
            returnKeyType="done"
            value={localPort}
            placeholder="8010"
            onSubmitEditing={Keyboard.dismiss}
            onChangeText={onChangePortText}
            style={styles.textInput}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "row",
    padding: 15,
    margin: 15,
    borderRadius: 8,
    backgroundColor: "#121212",
  },
  warningLabel: {
    color: "#ff6700",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 15,
  },
  label: {
    color: "#fff",
    fontSize: 16,
  },
  slidersWrapper: {
    width: "50%",
  },
  scrollViewContainer: {
    flex: 1,
    padding: 15,
    flexDirection: "row",
    backgroundColor: "#000",
  },
  textInput: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 5,
    alignSelf: "center",
    borderRadius: 5,
    backgroundColor: "#181818",
    color: "#fff",
    width: "100%",
    fontSize: 16,
  },
  textInputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  textInputsContainer: {
    flex: 1,
    marginLeft: 15,
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 0,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ff6700",
  },
  button: {
    backgroundColor: "#fff",
    width: "100%",
    height: 100,
    alignSelf: "flex-end",
  },
});

function mapStateToProps({ settings }) {
  return {
    port: settings?.port,
    masterLevel: settings?.masterLevel,
    audioInputLevel: settings?.audioInputLevel,
    address: settings?.address,
  };
}

const mapDispatchToProps = {
  changePort,
  changeAddress,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
