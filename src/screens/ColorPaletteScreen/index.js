import React from "react";
import { View, StyleSheet, Button, Image } from "react-native";
import { connect } from "react-redux";
import ColorPicker from "../../vendor/ColorPicker";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { TapGestureHandler } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

const hex2Rgb = (hex) => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

function ColorPaletteScreen({ navigation, route }) {
  const pickerRef = React.useRef(null);
  const [frontColorSelectedState, setFrontColorSelectedState] =
    React.useState(true);
  const frontColorSelected = useSharedValue(1);
  const frontColor = useSharedValue("#fff");
  const backColor = useSharedValue("#f00");

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

  function handleFrontColorPress() {
    frontColorSelected.value = 1;
    setFrontColorSelectedState(true);
  }

  function handleBackColorPress() {
    frontColorSelected.value = 0;
    setFrontColorSelectedState(false);
  }

  function onFrontColorChange(hex, a) {
    const { r, g, b } = hex2Rgb(hex);
    frontColor.value = `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function onBackColorChange(hex, a) {
    const { r, g, b } = hex2Rgb(hex);
    backColor.value = `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function onInteractionStart() {
    Haptics.selectionAsync();
  }

  const animatedFrontColorStyles = useAnimatedStyle(() => {
    return {
      flex: 1,
      overflow: "hidden",
      zIndex: frontColorSelected.value ? 5 : 0,
      transform: [{ scale: withSpring(frontColorSelected.value ? 1.2 : 1) }],
      borderRadius: 15,
    };
  });

  const animatedBackColorStyles = useAnimatedStyle(() => {
    return {
      flex: 1,
      overflow: "hidden",
      zIndex: frontColorSelected.value ? 0 : 5,
      transform: [{ scale: withSpring(frontColorSelected.value ? 1 : 1.2) }],
      borderRadius: 15,
    };
  });

  const animatedBackBackgroundStyles = useAnimatedStyle(() => {
    return {
      flex: 1,
      backgroundColor: backColor.value,
    };
  });

  const animatedFrontBackgroundStyles = useAnimatedStyle(() => {
    return {
      flex: 1,
      backgroundColor: frontColor.value,
    };
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.buttonContainer}>
        <TapGestureHandler onActivated={handleFrontColorPress}>
          <Animated.View style={animatedFrontColorStyles}>
            <Image
              source={require("../../assets/alpha.jpg")}
              style={styles.alphaBackground}
            />
            <Animated.View style={animatedFrontBackgroundStyles} />
          </Animated.View>
        </TapGestureHandler>
        <TapGestureHandler onActivated={handleBackColorPress}>
          <Animated.View style={animatedBackColorStyles}>
            <Image
              source={require("../../assets/alpha.jpg")}
              style={styles.alphaBackground}
            />
            <Animated.View style={animatedBackBackgroundStyles} />
          </Animated.View>
        </TapGestureHandler>
      </View>
      <View style={styles.colorPickerContainer}>
        <ColorPicker
          ref={setPickerRef}
          color={frontColorSelectedState ? frontColor.value : backColor.value}
          onColorChange={
            frontColorSelectedState ? onFrontColorChange : onBackColorChange
          }
          onInteractionStart={onInteractionStart}
          // onColorChangeComplete={this.onColorChangeComplete}
          thumbSize={40}
          sliderSize={30}
          row={false}
          shadeSliderThumb
          palette={[
            "#ffffff",
            "#FFF6ED",
            "#ff0000",
            "#ffa500",
            "#ffff00",
            "#008000",
            "#0000ff",
            "#4b0082",
            "#ee82ee",
          ]}
        />
      </View>
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
    justifyContent: "space-around",
  },
  alphaBackground: {
    resizeMode: "cover",
    ...StyleSheet.absoluteFill,
  },
  colorPickerContainer: {
    alignSelf: "center",
    width: "50%",
    height: "70%",
  },
  buttonContainer: {
    alignSelf: "center",
    flexDirection: "row",
    height: 80,
    width: "80%",
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
