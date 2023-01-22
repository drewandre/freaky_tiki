import 'react-native-gesture-handler'

import React from 'react'
import { Alert, View } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { registerRootComponent } from 'expo'
import * as SplashScreen from 'expo-splash-screen'
import ErrorBoundary from 'react-native-error-boundary'
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler'
import RNRestart from 'react-native-restart'
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

const CustomFallback = (
  {
    /* error, resetError */
  }
) => {
  const errorStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#121212',
  }
  return <View style={errorStyles} />
}

const errorHandler = (error, isFatal) => {
  if (isFatal) {
    SplashScreen.hideAsync().catch(console.warn)
    Alert.alert(
      'Something went wrong',
      `Please take a screenshot of this error message and text it to Drew @ 978-495-2066. ${
        __DEV__ ? error.message : ''
      }`,
      [
        {
          text: 'Ok',
          onPress: () => {
            RNRestart.Restart()
          },
        },
      ],
      { cancelable: __DEV__ }
    )
    // BugsnagManager.notify(error, {
    //   context: `Fatal exception ${error.message}`,
    //   unhandled: true,
    // })
  } else {
    console.log(error)
  }
}

setJSExceptionHandler(errorHandler)

setNativeExceptionHandler((errorString) => {
  console.warn(errorString)
  // BugsnagManager.notify(new Error(errorString), {
  //   context: 'Native exception handler',
  //   unhandled: true,
  // })
})

function FrikiTiki() {
  return (
    <ErrorBoundary onError={errorHandler} FallbackComponent={CustomFallback}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  )
}
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(FrikiTiki)
