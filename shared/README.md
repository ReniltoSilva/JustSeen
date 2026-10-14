# Shared code

Plain JavaScript used by both the website (`client/`) and the mobile app (`mobile/`):
dates, genres, the animal avatars, and the username and password rules. Nothing here may import React, the browser or
React Native, so it runs the same everywhere.

The website reaches these through small re-export files (for example
`client/src/genres.js`), the app through `mobile/metro.config.js`.
