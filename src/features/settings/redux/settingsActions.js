import OSCManager from '../../OSC/OSCManager'
import {
  CHANGE_PORT,
  CHANGE_ADDRESS,
  SET_DATA_BEGIN,
  SET_DATA_SUCCESS,
  SET_DATA_ERROR,
  SET_CURRENT_ANIMATION,
  SET_CURRENT_PALETTE,
  SET_PARAM_VALUE,
  ADD_COLOR_PALETTE,
  EDIT_COLOR_PALETTE,
  SET_ENABLED,
} from './settingsTypes'

const disallowedMedias = [
  'FaceTime_HD_Camera_(Built-in)',
  'TestCard',
  'Video-Output-1',
  'main_output',
  'next',
  'per_type_selection',
  'previous',
  'select',
  'select_by_name',
]

export function changePort(port) {
  return {
    type: CHANGE_PORT,
    payload: port,
  }
}

export function setEnabled(bool) {
  OSCManager.sendMessage('/master/master_level_OSC', [bool ? 0.5 : 0])
  return {
    type: SET_ENABLED,
    payload: bool,
  }
}

export function addColorPalette(payload) {
  return {
    type: ADD_COLOR_PALETTE,
    payload,
  }
}

export function editColorPalette(payload) {
  return {
    type: EDIT_COLOR_PALETTE,
    payload,
  }
}

export function changeAddress(address) {
  return {
    type: CHANGE_ADDRESS,
    payload: address,
  }
}

export function setDataBegin() {
  return {
    type: SET_DATA_BEGIN,
  }
}

export function setDataSuccess(data = {}) {
  const {
    CONTENTS: {
      master: {
        CONTENTS: {
          audio_input_level,
          /*
            {
              "ACCESS": 3,
              "DESCRIPTION": "Audio Input Level",
              "FULL_PATH": "/master/audio_input_level",
              "RANGE": [
                  {
                      "MAX": 4,
                      "MIN": 0
                  }
              ],
              "TYPE": "f",
              "VALUE": [
                  1
              ]
          }
          */
          master_level,
          /*
            {
              "ACCESS": 3,
              "DESCRIPTION": "Master Level",
              "FULL_PATH": "/master/master_level",
              "RANGE": [
                  {
                      "MAX": 1,
                      "MIN": 0
                  }
              ],
              "TYPE": "f",
              "VALUE": [
                  1
              ]
          }
          */
        },
      },
      cues: {
        CONTENTS: {
          main: {
            CONTENTS: {
              scenes: {
                CONTENTS: {
                  by_name: {
                    CONTENTS: cues,
                    /*
                      {
                        'Cue-1': {
                          ACCESS: 3,
                          DESCRIPTION: 'Cue-1',
                          FULL_PATH: '/cues/main/cues/by_name/Cue-1',
                          TYPE: 'N'
                        }
                        ...
                      }
                    */
                  },
                },
              },
            },
          },
        },
      },
      medias: { CONTENTS: medias },
    },
  } = data
  const newMedias = {}
  for (var media in medias) {
    if (disallowedMedias.includes(media) || media.includes('Camera')) {
      delete medias[media]
    } else {
      newMedias[media] = medias[media].CONTENTS.Public || {}
    }
  }

  const cuesArr = new Array(16).fill({})
  let index = 0
  for (var cue in cues) {
    const obj = cues[cue]
    if (newMedias[cue]) {
      obj.PARAMS = []
      for (var param in newMedias[cue].CONTENTS) {
        obj.PARAMS.push(newMedias[cue].CONTENTS[param])
      }
    } else {
      // console.log(`${cue} did not have a media`)
    }
    cuesArr[index] = obj
    index++
  }
  return {
    type: SET_DATA_SUCCESS,
    payload: {
      medias: newMedias,
      cues: cuesArr,
      audio_input_level,
      master_level: {
        ...master_level,
        DESCRIPTION: 'Brightness Level',
      },
    },
  }
}

export function setDataError(message) {
  return {
    type: SET_DATA_ERROR,
    payload: message,
  }
}

export function setCurrentAnimation(cue) {
  return {
    type: SET_CURRENT_ANIMATION,
    payload: cue,
  }
}

export function setCurrentPalette(palette) {
  return {
    type: SET_CURRENT_PALETTE,
    payload: palette,
  }
}

export function setParamValue(address, value) {
  return {
    type: SET_PARAM_VALUE,
    payload: { address, value },
  }
}
