import OSCManager from '../../OSC/OSCManager'

export function adjustColor(medias, type, name, { r, g, b, a }) {
  if (medias[name]) {
    const media = medias[name]
    if (media.CONTENTS[type]) {
      const {
        CONTENTS: {
          alpha: { FULL_PATH: alphaAddress },
          red: { FULL_PATH: redAddress },
          green: { FULL_PATH: greenAddress },
          blue: { FULL_PATH: blueAddress },
        },
      } = media.CONTENTS[type]
      OSCManager.sendMessage(alphaAddress, [a])
      OSCManager.sendMessage(redAddress, [r])
      OSCManager.sendMessage(greenAddress, [g])
      OSCManager.sendMessage(blueAddress, [b])
    } else {
      console.log(`${name} media did not support editing ${type}`)
    }
  } else {
    console.log(`${name} media did not exist`)
  }
}
