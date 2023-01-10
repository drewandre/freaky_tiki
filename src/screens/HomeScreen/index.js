import React from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { connect } from "react-redux";
import * as ScreenOrientation from "expo-screen-orientation";
import Cue from "./components/Cue";
import { TouchableOpacity } from "react-native-gesture-handler";
import Palette from "./components/Palette";
import Slider from "./components/Slider";
import { setParamValue } from "../../features/settings/redux/settingsActions";
import OSCManager from "../../features/OSC/OSCManager";

const DEFAULT_HIT_SLOP = {
  top: 15,
  bottom: 15,
  left: 5,
  right: 5,
};

function HomeScreen({
  cues,
  palettes,
  currentAnimation,
  navigation,
  setParamValue,
}) {
  const [orientation, setOrientation] = React.useState(0);
  const isLandscape = [1, 2].includes(orientation);
  React.useEffect(() => {
    ScreenOrientation.unlockAsync()
      .then(() => {
        ScreenOrientation.getOrientationAsync()
          .then((result) => {
            console.log("initial orientation", result);
            setOrientation(result);
          })
          .catch((error) => {
            console.warn(error);
            setOrientation(1);
          });
      })
      .catch(console.warn);
    ScreenOrientation.addOrientationChangeListener(screenListener);
    return function cleanup() {
      ScreenOrientation.removeOrientationChangeListeners();
    };
  }, []);

  function screenListener({ orientationInfo }) {
    console.log("orientation", orientationInfo.orientation);
    setOrientation(orientationInfo.orientation);
  }

  function renderAnimation({ item, index }) {
    return <Cue data={item} />;
  }
  function renderPalette({ item, index }) {
    if (!isLandscape && index === 15) {
      return null;
    }
    return <Palette data={item} />;
  }
  function keyExtractor(item, index) {
    return `${item?.FULL_PATH || "empty"}_${index}`;
  }
  function skipToStart() {
    console.log("skip to start");
  }
  function skipToEnd() {
    console.log("skip to end");
  }
  function play() {
    console.log("play");
  }
  function addColorPalette() {
    navigation.navigate("ColorPaletteScreen");
  }

  function onParamSliderChange(e, address) {
    OSCManager.sendMessage(address, [e]);
  }

  function onParamSliderChangeFinish(e, address) {
    setParamValue(address, e);
  }

  if (!orientation) {
    return null;
  }
  return (
    <View
      style={{
        ...styles.container,
        flexDirection: isLandscape ? "column" : "row",
      }}
    >
      <StatusBar style="light" />
      <View style={{ ...styles.innerContainer, flex: 1.5 }}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Animations</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity hitSlop={DEFAULT_HIT_SLOP} onPress={skipToStart}>
              <Image
                source={require("../../assets/skip_to_start.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={DEFAULT_HIT_SLOP} onPress={skipToEnd}>
              <Image
                source={require("../../assets/skip_to_next.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={DEFAULT_HIT_SLOP} onPress={play}>
              <Image
                source={require("../../assets/play.png")}
                style={styles.playIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          scrollEnabled={false}
          numColumns={4}
          data={cues}
          keyExtractor={keyExtractor}
          renderItem={renderAnimation}
          contentContainerStyle={styles.contentContainerStyle}
        />
        {currentAnimation?.PARAMS ? (
          <View style={styles.animationSliderContainer}>
            {currentAnimation.PARAMS.map((param) => {
              if (["Back Color", "Front Color"].includes(param.DESCRIPTION)) {
                return null;
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
              );
            })}
          </View>
        ) : null}
      </View>
      <View style={{ flex: 0.03 }} />
      <View style={styles.innerContainer}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Color Palettes</Text>
          <TouchableOpacity
            hitSlop={DEFAULT_HIT_SLOP}
            onPress={addColorPalette}
          >
            <Image
              style={styles.icon}
              source={require("../../assets/add.png")}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          scrollEnabled={false}
          key={isLandscape ? "landscape" : "portrait"}
          numColumns={isLandscape ? 4 : 3}
          data={palettes}
          keyExtractor={keyExtractor}
          renderItem={renderPalette}
          contentContainerStyle={styles.contentContainerStyle}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  icon: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  innerContainer: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#121212",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  slidersWrapper: {
    width: "100%",
    paddingHorizontal: 15,
  },
  container: {
    flex: 1,
    padding: 15,
    flexDirection: "row",
    backgroundColor: "#000",
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playIcon: {
    marginLeft: 10,
    width: 25,
    height: 25,
  },
  iconContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  sectionHeader: {
    color: "#fff",
    fontWeight: "bold",
    paddingHorizontal: 5,
    fontSize: 20,
  },
  contentContainerStyle: {
    paddingVertical: 10,
    // paddingHorizontal: "3%",
  },
});

const mapDispatchToProps = {
  setParamValue,
};

function mapStateToProps({ settings: { currentAnimation, cues, palettes } }) {
  return {
    cues,
    currentAnimation,
    palettes,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
