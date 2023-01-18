import OSCManager from '../../OSC/OSCManager'

export function adjustColor(
  medias,
  type,
  immediate = true,
  name,
  { r, g, b, a }
) {
  console.log(type, r, g, b, a)
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
      // console.log({
      //   alpha: immediate ? alphaAddress : `${alphaAddress}_OSC`,
      //   red: immediate ? alphaAddress : `${redAddress}_OSC`,
      //   green: immediate ? alphaAddress : `${greenAddress}_OSC`,
      //   blue: immediate ? alphaAddress : `${blueAddress}_OSC`,
      // })
      OSCManager.sendMessage(immediate ? alphaAddress : `${alphaAddress}_OSC`, [
        a,
      ])
      OSCManager.sendMessage(immediate ? redAddress : `${redAddress}_OSC`, [r])
      OSCManager.sendMessage(immediate ? greenAddress : `${greenAddress}_OSC`, [
        g,
      ])
      OSCManager.sendMessage(immediate ? blueAddress : `${blueAddress}_OSC`, [
        b,
      ])
    } else {
      console.log(`${name} media did not support editing ${type}`)
    }
  } else {
    console.log(`${name} media did not exist`)
  }
}
