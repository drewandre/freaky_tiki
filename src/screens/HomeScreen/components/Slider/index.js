import React from "react";
import { Text, View, StyleSheet } from "react-native";
import SliderComponent from "@react-native-community/slider";

function Slider({
  DESCRIPTION,
  VALUE,
  RANGE,
  FULL_PATH,
  onSliderChange,
  onSlidingComplete,
  sideLabel = false,
  /* TYPE */
}) {
  function onValueChange(e) {
    onSliderChange?.(e, FULL_PATH);
  }
  function handleOnSlidingComplete(e) {
    onSlidingComplete?.(e, FULL_PATH);
  }
  const { MAX: max, MIN: min } = RANGE?.[0] || {};
  const value = VALUE?.[0];
  return (
    <View style={[styles.container, sideLabel && styles.sideLabelContainer]}>
      <Text style={[styles.text, sideLabel && styles.sideLabel]}>
        {DESCRIPTION}
      </Text>
      <SliderComponent
        style={{ ...styles.slider, flex: sideLabel ? 1 : 0 }}
        minimumValue={min}
        maximumValue={max}
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={handleOnSlidingComplete}
        minimumTrackTintColor="#32FCFF"
        maximumTrackTintColor="#242424"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 15,
  },
  sideLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
  sideLabel: {
    width: 60,
    marginRight: 15,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

export default Slider;
