module.exports = function (api) {
  api.cache(true)

  const presets = ['module:metro-react-native-babel-preset']
  const plugins = [
    [
      'module-resolver',
      {
        extensions: ['.js', '.json', '.ts', '.tsx'],
        root: ['./src/'],
      },
    ],
  ]

  plugins.push('react-native-reanimated/plugin') // must be last

  return {
    presets,
    plugins,
  }
}
