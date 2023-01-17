import React from 'react'

import 'react-native-gesture-handler'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { registerRootComponent } from 'expo'
import * as SplashScreen from 'expo-splash-screen'
import { Provider } from 'react-redux'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { createTransform } from 'redux-persist'
import persistReducer from 'redux-persist/es/persistReducer'
import persistStore from 'redux-persist/es/persistStore'
import { PersistGate } from 'redux-persist/integration/react'
import thunk from 'redux-thunk'

import App from './src/App'
import settings from './src/features/settings/redux/settingsReducer'

SplashScreen.preventAutoHideAsync().catch(console.warn)

const rootReducer = combineReducers({
  settings,
})

const settingsDisallow = createTransform(
  (inboundState /* key */) => {
    return inboundState
  },
  (outboundState /* key */) => {
    return {
      ...outboundState,
      address: outboundState?.address,
      port: outboundState?.port,
      audioInputLevel: outboundState?.audioInputLevel,
      masterLevel: outboundState?.masterLevel,
      currentPalette: outboundState?.currentPalette,
      currentAnimation: outboundState?.currentAnimation,
      cues: [],
    }
  },
  { whitelist: ['settings'] }
)

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  transforms: [settingsDisallow],
  debug: __DEV__,
}

const middleware = [thunk]

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = createStore(persistedReducer, applyMiddleware(...middleware))

const persistor = persistStore(store)
// persistor.purge()

function FreakyTiki() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  )
}
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(FreakyTiki)
