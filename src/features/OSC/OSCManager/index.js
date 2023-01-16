import Osc from 'react-native-osc'

class OSCManager {
  constructor() {
    this.client = null
  }

  setClient(portOut, address) {
    // OSC server IP address like "192.168.1.80" or "localhost"
    Osc.createClient(address, parseInt(portOut))
    this.baseUrl = `http://${address}:${portOut}/`
  }

  sendMessage(...params) {
    Osc.sendMessage(...params)
  }

  pollCurrentState() {
    return new Promise((resolve, reject) => {
      if (this.baseUrl) {
        fetch(this.baseUrl)
          .then((response) => {
            return response.json()
          })
          .then(resolve)
          .catch(reject)
      } else {
        reject(new Error('Base url not set up yet'))
      }
    })
  }
}

export default new OSCManager()
