var webpack = require('webpack');
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  //mode: 'development',
  entry: {
    vendor: './src/index.js',
    //vendorfr: './src/index_french.js',
  },
  output: {
    filename: '[name].min.js',
      path: path.resolve(__dirname, 'dependencies'),
  },
  externals: {
    // If k8-bootstrap is require()'d or import()'d in any code, skip it.
    // Instead this CSS will have to be included on the HTML page via a
    // traditional <link/> tag in the <head/>.
    // This is to get around the Brightspace WYSIWYG "noscript" problem.
    'k8-bootstrap-css': {
      commonjs: 'k8-bootstrap-css'
    }
  },
  resolve: {
    extensions: ['.js'],
    alias: {
        // Resolve aliases required by ReactDOM when referencing 'react'
        "react": path.resolve(__dirname, 'node_modules/@tvontario/react/react.production.min'),
        "ReactDOM": path.resolve(__dirname, 'node_modules/@tvontario/react/react-dom.production.min'),
        "react-dom": "ReactDOM",
        "material-ui": path.resolve(__dirname, 'node_modules/@tvontario/material-ui/material-ui.production.min'),
        "iframe-resizer": path.resolve(__dirname, 'node_modules/@tvontario/iframe-resizer/iframeResizer.contentWindow.min'),
    }
  },
  plugins: [
    // ProvidePlugin() is added to resolve React and ReactDom referenced by widget codebase;
    // Aliases to React and ReactDOM (see resolve block above)
    new webpack.ProvidePlugin({
      'React': 'react',
      'ReactDOM': 'ReactDOM',
      'MaterialUI': 'material-ui',
      'iFrameResizer': 'iframe-resizer'
    }),
    // We are skipping k8-bootstrap in the build above (externals), so we need
    // to copy it to the dependencies folder in order to reference it in
    // html pages that need it.
    new CopyPlugin([
      {
        from: path.resolve(__dirname, 'node_modules/k8-bootstrap-css/scss/tvo_k8.css'),
        to: path.resolve(__dirname, 'dependencies')
      }
    ])
  ],
  module: {
    rules: [{
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: '../dependencies/fonts/'
          }
        }],
      },
      {
        test: /\.(svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: (url, resourcePath, context) => {

              // Any images in node_modules/@tvontario/ will be copied/referenced as dependencies/{projectname}/img/
              if (/node_modules\/@tvontario/.test(resourcePath)) {
                var p = String(resourcePath.split('/node_modules/@tvontario/')[1])
                var slash = p.indexOf('/');
                var projectDir = p.substr(0, slash);

                return `../dependencies/${projectDir}/img/${url}`;

              // Any images NOT in node_modules/@tvontario/ will be copied/referenced as assets/icons/
              } else {

                return `../assets/icons/${url}`;
              }
            }

          }
        }],
      },
    ],
  },
};
