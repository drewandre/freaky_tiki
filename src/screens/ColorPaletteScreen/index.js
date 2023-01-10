import React from "react";
import { View, TouchableOpacity, StyleSheet, Button } from "react-native";
import { connect } from "react-redux";
import ColorPicker from "react-native-wheel-color-picker";

function ColorPaletteScreen({ navigation, route }) {
  const pickerRef = React.useRef(null);
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            title={route?.palette ? "Save" : "Add"}
            onPress={handleSave}
            style={styles.button}
          />
        );
      },
    });
  }, [navigation]);

  function handleSave() {
    navigation.goBack();
  }

  function setPickerRef(ref) {
    pickerRef.current = ref;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.frontColor} />
        <TouchableOpacity style={styles.backColor} />
      </View>
      <ColorPicker
        ref={setPickerRef}
        // color={this.state.currentColor}
        // onColorChange={this.onColorChange}
        // onColorChangeComplete={this.onColorChangeComplete}
        thumbSize={40}
        sliderSize={30}
        row={false}
        swatches={false}
        // swatchesLast={this.state.swatchesLast}
        // swatches={this.state.swatchesEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 8,
    margin: 15,
    padding: 15,
    backgroundColor: "#121212",
  },
  frontColor: {
    flex: 1,
    backgroundColor: "red",
    height: 80,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
  },
  backColor: {
    flex: 1,
    backgroundColor: "red",
    height: 80,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  buttonContainer: {
    alignSelf: "center",
    flexDirection: "row",
    width: "75%",
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
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#000",
    justifyContent: "space-between",
    alignItems: "center",
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
  return {};
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ColorPaletteScreen);
