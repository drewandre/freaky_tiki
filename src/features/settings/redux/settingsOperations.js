import { Alert, LayoutAnimation } from "react-native";
import OSCManager from "../../OSC/OSCManager";
import { setDataBegin, setDataSuccess, setDataError } from "./settingsActions";

export const setData = () => (dispatch, getState) => {
  const {
    settings: { address, port },
  } = getState();
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
  });
  dispatch(setDataBegin());
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
        });
        dispatch(setDataSuccess(response));
      })
      .catch((error) => {
        console.warn(error);
        Alert.alert(`Unable to connect to ${address}:${port}`);
        dispatch(setDataError(error?.message));
      });
  }, 500);
};
