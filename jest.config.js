module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.js$": "babel-jest"
  },

  moduleNameMapper: {
    "^map/(.*)$": "<rootDir>/app/javascript/map/$1"
  }
};