import utf8 from 'utf8'
import R from 'ramda'
import request from 'browser-request'

export const dateToString = (date) => {
  const oneMillenium = 31556952000000
  const oneCentury = 3155695200000
  const oneDecade = 315569520000
  const oneYear = 31556952000
  const oneMonth = 2592000000
  const oneWeek = 604800000
  const oneDay = 86400000
  const oneHour = 3600000
  const oneMinute = 60000
  const oneSecond = 1000
  let difference = date - Date.now()
  if (difference > 0) {
    if (difference >= oneMillenium) {
      const num = parseInt(difference / oneMillenium)
      const time = (num === 1 ? 'millennium' : 'millennia')
      return ('ends in ' + num + ' ' + time)
    }
    if (difference >= oneCentury) {
      const num = parseInt(difference / oneCentury)
      const time = (num === 1 ? 'century' : 'centuries')
      return ('ends in ' + num + ' ' + time)
    }
    if (difference >= oneDecade) {
      const num = parseInt(difference / oneDecade)
      const time = (num === 1 ? 'decade' : 'decades')
      return ('ends in ' + num + ' ' + time)
    }
    if (difference >= oneYear) {
      const num = parseInt(difference / oneYear)
      const time = (num === 1 ? 'year' : 'years')
      return ('ends in ' + num + ' ' + time)
    }
    if (difference >= oneMonth) {
      const num = parseInt(difference / oneMonth)
      const time = (num === 1 ? 'month' : 'months')
      return ('ends in ' + num + ' ' + time)
    }
    if (difference >= oneWeek) {
      const num = parseInt(difference / oneWeek)
      const time = (num === 1 ? 'week' : 'weeks')
      return ('ends in ' + num + ' ' + time)
    }
    if (difference >= oneDay) {
      const num = parseInt(difference / oneDay)
      const time = (num === 1 ? 'day' : 'days')
      return ('ends in ' + num + ' ' + time)
    }
    if (difference >= oneHour) {
      const num = parseInt(difference / oneHour)
      const time = (num === 1 ? 'hour' : 'hours')
      return ('ends in ' + num + ' ' + time)
    }
    if (difference >= oneMinute) {
      const num = parseInt(difference / oneMinute)
      const time = (num === 1 ? 'minute' : 'minutes')
      return ('ends in ' + num + ' ' + time)
    }
    if (difference >= oneSecond) {
      const num = parseInt(difference / oneSecond)
      const time = (num === 1 ? 'second' : 'seconds')
      return ('ends in ' + num + ' ' + time)
    }
  } else if (difference < 0) {
    difference = difference * -1

    if (difference >= oneMillenium) {
      const num = parseInt(difference / oneMillenium)
      const time = (num === 1 ? 'millennium' : 'millennia')
      return (num + ' ' + time + ' ago')
    }
    if (difference >= oneCentury) {
      const num = parseInt(difference / oneCentury)
      const time = (num === 1 ? 'century' : 'centuries')
      return (num + ' ' + time + ' ago')
    }
    if (difference >= oneDecade) {
      const num = parseInt(difference / oneDecade)
      const time = (num === 1 ? 'decade' : 'decades')
      return (num + ' ' + time + ' ago')
    }
    if (difference >= oneYear) {
      const num = parseInt(difference / oneYear)
      const time = (num === 1 ? 'year' : 'years')
      return (num + ' ' + time + ' ago')
    }
    if (difference >= oneMonth) {
      const num = parseInt(difference / oneMonth)
      const time = (num === 1 ? 'month' : 'months')
      return (num + ' ' + time + ' ago')
    }
    if (difference >= oneWeek) {
      const num = parseInt(difference / oneWeek)
      const time = (num === 1 ? 'week' : 'weeks')
      return (num + ' ' + time + ' ago')
    }
    if (difference >= oneDay) {
      const num = parseInt(difference / oneDay)
      const time = (num === 1 ? 'day' : 'days')
      return (num + ' ' + time + ' ago')
    }
    if (difference >= oneHour) {
      const num = parseInt(difference / oneHour)
      const time = (num === 1 ? 'hour' : 'hours')
      return (num + ' ' + time + ' ago')
    }
    if (difference >= oneMinute) {
      const num = parseInt(difference / oneMinute)
      const time = (num === 1 ? 'minute' : 'minutes')
      return (num + ' ' + time + ' ago')
    }
    if (difference >= oneSecond) {
      const num = parseInt(difference / oneSecond)
      const time = (num === 1 ? 'second' : 'seconds')
      return (num + ' ' + time + ' ago')
    }
  } else {
    return 'now'
  }
}

export const toUTF8 = (hex) => {
  // Find termination
  let str = ''
  let i = 0
  const l = hex.length
  if (hex.substring(0, 2) === '0x') {
    i = 2
  }
  for (; i < l; i += 2) {
    var code = parseInt(hex.substr(i, 2), 16)
    if (code === 0) { break }
    str += String.fromCharCode(code)
  }

  return utf8.decode(str)
}

export const getPrices = (callback) => {
  request(
    'https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=100',
    function (error, response, body) {
      if (error) {
        callback(null)
      }
      try {
        const data = JSON.parse(body)
        callback(R.pick(['symbol', 'price_usd'], data))
      } catch (e) {
        callback(null)
      }
    }
  )
}
