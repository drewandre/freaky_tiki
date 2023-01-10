import React from "react";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ColorPaletteScreen from "./screens/ColorPaletteScreen";
import {
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  View,
  PlatformColor,
} from "react-native";
import OSCManager from "./features/OSC/OSCManager";
import { connect } from "react-redux";
import { setData } from "./features/settings/redux/settingsOperations";

const RootStack = createStackNavigator();

function App({ port, address, setData, loading, error }) {
  React.useEffect(() => {
    OSCManager.setClient(port, address);
    setData();
  }, [port, address, setData]);
  return (
    <NavigationContainer theme={DarkTheme}>
      <RootStack.Navigator
        screenOptions={{
          cardStyle: {
            backgroundColor: "#000",
          },
        }}
      >
        <RootStack.Group>
          <RootStack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              headerTitle: "Freaky Tiki",
              headerRight: () => {
                return (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 15,
                      }}
                    >
                      <View
                        style={{
                          marginRight: 7,
                          width: 10,
                          height: 10,
                          borderRadius: 100,
                          backgroundColor: loading
                            ? "orange"
                            : error
                            ? "red"
                            : "green",
                        }}
                      />
                      <Text style={{ color: "#fff" }}>
                        {loading
                          ? "Refreshing..."
                          : error
                          ? "Disconnected"
                          : "Connected"}
                      </Text>
                    </View>
                    {loading ? (
                      <ActivityIndicator
                        style={{ width: 30, marginRight: 15 }}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={setData}
                        style={{
                          marginRight: 15,
                        }}
                      >
                        <Image
                          source={require("./assets/refresh.png")}
                          style={{ width: 30, height: 30 }}
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("SettingsScreen");
                      }}
                      style={{
                        marginRight: 15,
                      }}
                    >
                      <Image
                        source={require("./assets/gear.png")}
                        style={{ width: 30, height: 30 }}
                      />
                    </TouchableOpacity>
                  </View>
                );
              },
            })}
          />
        </RootStack.Group>
        <RootStack.Group screenOptions={{ presentation: "modal" }}>
          <RootStack.Screen
            name="SettingsScreen"
            component={SettingsScreen}
            options={({ navigation }) => ({
              headerLeft: () => {
                return (
                  <TouchableOpacity onPress={navigation.goBack}>
                    <Image
                      source={require("./assets/down_arrow.png")}
                      style={{
                        width: 30,
                        height: 30,
                        marginLeft: 15,
                        tintColor: PlatformColor("systemBlueColor"),
                      }}
                    />
                  </TouchableOpacity>
                );
              },
              headerBackTitleVisible: false,
              headerTitle: "Settings",
            })}
          />
          <RootStack.Screen
            name="ColorPaletteScreen"
            component={ColorPaletteScreen}
            options={({ navigation, route }) => ({
              headerLeft: () => {
                return (
                  <TouchableOpacity onPress={navigation.goBack}>
                    <Image
                      source={require("./assets/down_arrow.png")}
                      style={{
                        width: 30,
                        height: 30,
                        marginLeft: 15,
                        tintColor: PlatformColor("systemBlueColor"),
                      }}
                    />
                  </TouchableOpacity>
                );
              },
              headerBackTitleVisible: false,
              headerTitle: route?.params?.palette
                ? "Edit Color Palette"
                : "Create Color Palette",
            })}
          />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const mapDispatchToProps = {
  setData,
};

function mapStateToProps({ settings }) {
  return {
    error: settings?.error,
    loading: settings?.loading,
    port: settings?.port,
    address: settings?.address,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
