const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/* Metro (the app's bundler) only looks inside mobile/ by default; also let it read
/shared, the plain-JavaScript helpers the website uses too */
const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../shared")];

module.exports = config;
