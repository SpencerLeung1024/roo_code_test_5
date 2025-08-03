# Monopoly Game Setup Guide

## Quick Start

1. **Initialize the project:**
   ```bash
   cd kimi
   npm init -y
   ```

2. **Install dependencies:**
   ```bash
   npm install react react-dom
   npm install --save-dev @babel/core @babel/preset-env @babel/preset-react webpack webpack-cli webpack-dev-server babel-loader css-loader style-loader html-webpack-plugin
   ```

3. **Create directory structure:**
   ```bash
   mkdir -p src/components/board src/components/cards src/components/ui src/components/modals
   mkdir -p src/models src/data src/styles src/utils
   mkdir -p public
   ```

4. **Create initial files:**
   - webpack.config.js
   - .babelrc
   - public/index.html
   - src/App.jsx
   - src/index.js

## Development Workflow

1. **Start development server:**
   ```bash
   npm start
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

## File Templates

### webpack.config.js
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
  },
};
```

### .babelrc
```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

### package.json scripts
```json
{
  "scripts": {
    "start": "webpack serve --mode development",
    "build": "webpack --mode production"
  }
}