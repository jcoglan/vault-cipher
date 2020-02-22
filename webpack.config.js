var path = require('path');

module.exports = {
  devtool: 'sourcemap',

  entry: {
    'compat/bundles/buffer': path.join(__dirname, 'compat', 'vendor', 'buffer'),
    'spec/browser_bundle':   path.join(__dirname, 'spec', 'main')
  },

  output: {
    path: __dirname,
    filename: '[name].js'
  },

  module: {
    noParse: [
      /asmcrypto/,
      /jstest/,
    ]
  }
};
