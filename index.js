const Reader = require('./lib/Reader')

;(async () => {
  try {
    console.time('Total')
    const reader = new Reader('./10m.txt.bz2')

    console.time('MAX')
    const maxNumber = await reader.getMax()
    console.log(maxNumber)
    console.timeEnd('MAX')

    console.time('MIN')
    const minNumber = await reader.getMin()
    console.log(minNumber)
    console.timeEnd('MIN')

    console.time('AVG')
    const avg = await reader.getAvg()
    console.log(avg)
    console.timeEnd('AVG')

    console.time('MEDIAN')
    const median = await reader.getMedian()
    console.log(median)
    console.timeEnd('MEDIAN')

    console.time('INCREASING_SEQUENCE')
    const getIncreasingSequence = await reader.getIncreasingSequence()
    console.log(...getIncreasingSequence)
    console.timeEnd('INCREASING_SEQUENCE')

    console.time('DECREASING_SEQUENCE')
    const getDecreasingSequence = await reader.getDecreasingSequence()
    console.log(...getDecreasingSequence)
    console.timeEnd('DECREASING_SEQUENCE')

    console.timeEnd('Total')
  } catch (error) {
    console.log(error.message)
  }
})()
