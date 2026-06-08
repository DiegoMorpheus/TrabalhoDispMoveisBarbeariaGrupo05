// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Permite que o Metro resolva arquivos .wasm (necessário para expo-sqlite na web)
config.resolver.assetExts.push("wasm");

// Headers necessários para SharedArrayBuffer funcionar no navegador
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      middleware(req, res, next);
    };
  },
};

module.exports = config;
