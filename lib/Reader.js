const fs = require('fs')
const es = require('event-stream')
const bz2 = require('unbzip2-stream')

class Reader {
  constructor(path) {
    if (typeof path !== 'string') {
      throw new Error('Please, provide a valid file path!')
    }
    this.path = path
    this.data = null
  }

  async getMax() {
    const numbers = await this._readFile()
    const sortedNumbers = this._sort(numbers, 'desc')
    return sortedNumbers[0]
  }

  async getMin() {
    const numbers = await this._readFile()
    const sortedNumbers = this._sort(numbers, 'asc')
    return sortedNumbers[0]
  }

  async getAvg() {
    const numbers = await this._readFile()
    return numbers.reduce((number, acc) => number + acc, 0) / numbers.length
  }

  async getMedian() {
    const numbers = await this._readFile()
    const sortedNumbers = this._sort(numbers, 'asc')
    if (sortedNumbers.length % 2 === 0) {
      const middleRightIndex = sortedNumbers.length / 2
      const middleLeftIndex = middleRightIndex - 1
      return (sortedNumbers[middleRightIndex] + sortedNumbers[middleLeftIndex]) / 2
    } else {
      const middleIndex = Math.floor(sortedNumbers.length / 2)
      return sortedNumbers[middleIndex]
    }
  }

  async getIncreasingSequence() {
    return await this._getSequence((prevNumber, nextNumber) => nextNumber > prevNumber)
  }

  async getDecreasingSequence() {
    return await this._getSequence((prevNumber, nextNumber) => nextNumber < prevNumber)
  }

  async _getSequence(condition) {
    const numbers = await this._readFile()

    const sequences = []
    let sequence = []
    for (let i = 0; i < numbers.length; i++) {
      const prevNumber = numbers[i]
      const nextNumber = numbers[i + 1]
      if (!sequence.length) {
        sequence.push(prevNumber)
        continue
      }
      if (condition(prevNumber, nextNumber)) {
        sequence.push(nextNumber)
      } else {
        sequences.push(sequence)
        sequence = []
        sequence.push(nextNumber)
      }
    }

    return sequences.reduce((prev, next) => (next.length > prev.length ? next : prev))
  }

  _sort(arr, type = 'asc') {
    const copyArr = [...arr]
    switch (type) {
      case 'asc':
        return copyArr.sort((a, b) => a - b)
      case 'desc':
        return copyArr.sort((a, b) => b - a)

      default:
        return copyArr.sort((a, b) => a - b)
    }
  }

  async _readFile() {
    if (this.data) {
      console.log(`----------Read from cache----------`)
      return this.data
    }
    const isZipped = new RegExp(/.bz2$/).test(this.path)
    if (isZipped) {
      return await this._createZippedReadStream()
    }
    return await this._createReadStream()
  }

  _createZippedReadStream() {
    return new Promise((resolve, reject) => {
      const numbers = []
      let lines = 0
      const stream = fs
        .createReadStream(this.path)
        .pipe(bz2())
        .pipe(es.split())
        .pipe(
          es.mapSync(line => {
            stream.pause()
            const isNumber = new RegExp(/^-?[0-9]+$/).test(line.trim())
            if (isNumber) {
              numbers.push(Number(line))
            }
            lines += 1
            stream.resume()
          })
        )
        .on('error', error => reject(error))
        .on('end', () => {
          console.log(`----------Lines were found: ${lines}----------`)
          this.data = numbers
          resolve(numbers)
        })
    })
  }

  _createReadStream() {
    return new Promise((resolve, reject) => {
      const numbers = []
      let lines = 0
      const stream = fs
        .createReadStream(this.path)
        .pipe(es.split())
        .pipe(
          es.mapSync(line => {
            stream.pause()
            const isNumber = new RegExp(/^-?[0-9]+$/).test(line.trim())
            if (isNumber) {
              numbers.push(Number(line))
            }
            lines += 1
            stream.resume()
          })
        )
        .on('error', error => reject(error))
        .on('end', () => {
          console.log(`----------Lines were found: ${lines}----------`)
          this.data = numbers
          resolve(numbers)
        })
    })
  }
}

module.exports = Reader
