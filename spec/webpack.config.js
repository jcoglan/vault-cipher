var path = require('path');

module.exports = {
  entry:    path.join(__dirname, 'main'),
  devtool:  'sourcemap',

  output: {
    path:     __dirname,
    filename: 'browser_bundle.js'
  },

  module: {
    noParse: /jstest/
  }
};
