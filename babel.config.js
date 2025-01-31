module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // Existing line
    ['@babel/plugin-transform-private-methods', { loose: true }], // Add this line with loose mode
    ['@babel/plugin-transform-class-properties', { loose: true }], // Add this line with loose mode
    ['@babel/plugin-transform-private-property-in-object', { loose: true }], // Add this line with loose mode
  ],
};