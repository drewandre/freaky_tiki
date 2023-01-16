import { produce } from 'immer'

import {
  CHANGE_PORT,
  CHANGE_ADDRESS,
  SET_DATA_BEGIN,
  SET_DATA_SUCCESS,
  SET_DATA_ERROR,
  SET_CURRENT_ANIMATION,
  SET_PARAM_VALUE,
  ADD_COLOR_PALETTE,
  EDIT_COLOR_PALETTE,
  SET_CURRENT_PALETTE,
} from './settingsTypes'

const INITIAL_STATE = {
  port: '8010',
  address: '10.0.208.87',
  loading: false,
  error: null,
  cues: [],
  palettes: [],
  audioInputLevel: null,
  masterLevel: null,
  currentPalette: null,
  currentAnimation: null,
}

export { INITIAL_STATE }
export default produce((draft, action) => {
  switch (action.type) {
    case CHANGE_PORT:
      draft.port = action.payload
      return draft
    case CHANGE_ADDRESS:
      draft.address = action.payload
      return draft
    case SET_CURRENT_PALETTE:
      draft.currentPalette = action.payload
      return draft
    case ADD_COLOR_PALETTE:
      draft.palettes.push(action.payload)
      return draft
    case EDIT_COLOR_PALETTE:
      const paletteIndex = draft.palettes.find((palette) => {
        return palette.id === action.payload.id
      })
      if (paletteIndex === -1) {
        console.warn('Could not find palette to edit')
      } else {
        draft.palettes[paletteIndex] = action.payload
      }
      return draft
    case SET_DATA_BEGIN:
      draft.loading = true
      draft.error = null
      // draft.cues = [];
      // draft.audioInputLevel = null;
      // draft.masterLevel = null;
      return draft
    case SET_DATA_SUCCESS:
      draft.cues = action.payload.cues
      draft.medias = action.payload.medias
      draft.audioInputLevel = action.payload.audio_input_level
      draft.masterLevel = action.payload.master_level
      draft.loading = false
      return draft
    case SET_DATA_ERROR:
      draft.data = INITIAL_STATE.data
      draft.loading = false
      draft.error = action.payload
      return draft
    case SET_CURRENT_ANIMATION:
      draft.currentAnimation = action.payload
      return draft
    case SET_PARAM_VALUE:
      const param = draft.currentAnimation.PARAMS.find((param) => {
        return param.FULL_PATH === action.payload.address
      })
      if (param) {
        param.VALUE = [action.payload.value]
        const cueIndex = draft.cues.findIndex((param) => {
          return param.FULL_PATH === draft.currentAnimation.FULL_PATH
        })
        if (cueIndex !== -1) {
          draft.cues[cueIndex] = draft.currentAnimation
        } else {
          console.warn('Could not find cueIndex in draft.cues')
        }
      } else {
        console.warn('No cue found for param', action.payload)
      }
      return draft
    default:
      return draft
  }
}, INITIAL_STATE)
