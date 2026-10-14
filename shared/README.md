# Shared code

Plain JavaScript used by both the website (`client/`) and the mobile app (`mobile/`):
dates, genres and the animal avatars. Nothing here may import React, the browser or
React Native, so it runs the same everywhere.

The website reaches these through small re-export files (for example
`client/src/genres.js`), the app through `mobile/metro.config.js`.
