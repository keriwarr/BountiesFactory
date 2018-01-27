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
  const difference = date - Date.now()
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
