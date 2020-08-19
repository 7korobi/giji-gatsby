/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

exports.onCreateWebpackConfig = ({ stage, rules, loaders, plugins, actions, getConfig }) => {
  const config = getConfig()

  // support coffeescript.
  config.resolve.extensions.push('.coffee')
  config.module.rules.push({
    test: /\.coffee?$/i,
    use: {
      loader: 'coffee-loader',
      options: {
        transpileOnly: true,
      },
    },
  })

  // support yml.
  config.module.rules.forEach((rule) => {
    const { test, use } = rule
    if (test && '.yml'.match(test)) {
      use[0].options = use[1].options = {
        merge: true,
      }
    }
  })

  console.log(stage)
  // This will completely replace the webpack config with the modified object.
  actions.replaceWebpackConfig(config)

  if (stage === 'build-html') {
    actions.setWebpackConfig({
      // Don't bundle modules that reference browser globals such as `window` and `IDBIndex` during SSR.
      // See: https://github.com/gatsbyjs/gatsby/issues/17725
      externals: config.externals.concat(function (_context, request, callback) {
        // Exclude bundling firebase* and react-firebase*
        // These are instead required at runtime.
        if (/^@?(react-)?firebase(.*)/.test(request)) {
          console.log('Excluding bundling of: ' + request)
          return callback(null, 'umd ' + request)
        }
        callback()
      }),
    })
  }
}
