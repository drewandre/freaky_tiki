import { LayoutAnimation } from 'react-native'

import OSCManager from '../../OSC/OSCManager'
import { setDataBegin, setDataSuccess, setDataError } from './settingsActions'

export const setData = () => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      LayoutAnimation.configureNext({
        duration: 500,
        delete: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.opacity,
          springDamping: 0.7,
        },
        update: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.scaleXY,
          springDamping: 0.7,
        },
      })
      dispatch(setDataBegin())
      setTimeout(() => {
        OSCManager.pollCurrentState()
          .then((response) => {
            LayoutAnimation.configureNext({
              duration: 500,
              delete: {
                type: LayoutAnimation.Types.spring,
                property: LayoutAnimation.Properties.opacity,
                springDamping: 0.7,
              },
              update: {
                type: LayoutAnimation.Types.spring,
                property: LayoutAnimation.Properties.scaleXY,
                springDamping: 0.7,
              },
            })
            dispatch(setDataSuccess(response))
            resolve(response)
          })
          .catch((error) => {
            console.warn(error)
            LayoutAnimation.configureNext({
              duration: 500,
              delete: {
                type: LayoutAnimation.Types.spring,
                property: LayoutAnimation.Properties.opacity,
                springDamping: 0.7,
              },
              update: {
                type: LayoutAnimation.Types.spring,
                property: LayoutAnimation.Properties.scaleXY,
                springDamping: 0.7,
              },
            })
            dispatch(setDataError(error?.message))
            reject()
          })
      }, 500)
    })
  }
}
