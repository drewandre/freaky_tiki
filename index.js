import "react-native-gesture-handler";
import { registerRootComponent } from "expo";

import App from "./src/App";
import { PersistGate } from "redux-persist/integration/react";
import persistStore from "redux-persist/es/persistStore";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import persistReducer from "redux-persist/es/persistReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import settings from "./src/features/settings/redux/settingsReducer";
import DeviceInfo from "react-native-device-info";
import { Provider } from "react-redux";

const rootReducer = combineReducers({
  settings,
});

const persistConfig = {
  key: "root",
  version: DeviceInfo.getVersion().toString(),
  storage: AsyncStorage,
  debug: __DEV__,
};

const middleware = [thunk];

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, applyMiddleware(...middleware));

const persistor = persistStore(store);
persistor.purge();

function FreakyTiki() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
}
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(FreakyTiki);
