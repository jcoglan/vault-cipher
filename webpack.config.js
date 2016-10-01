var path = require('path');

module.exports = {
  devtool:  'sourcemap',

  entry: {
    'compat/bundles/buffer': path.join(__dirname, 'compat', 'buffer'),
    'spec/browser_bundle':   path.join(__dirname, 'spec', 'main')
  },

  output: {
    filename: '[name].js'
  },

  module: {
    noParse: /jstest/
  }
};
