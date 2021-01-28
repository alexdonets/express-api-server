const generateRandId = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)

const getValueFromListById = (list, id) => list.filter(item => item.id === id)[0]

module.exports = {
  generateRandId,
  getValueFromListById
}