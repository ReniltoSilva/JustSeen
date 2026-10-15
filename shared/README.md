# Shared code

Plain JavaScript used by both the website (`client/`) and the mobile app (`mobile/`):
dates, genres, the animal avatars, the username and password rules, movies vs TV shows
(titles.js), "people you may know" (suggestions.js) and the Year in
Film stats. Nothing here may import React, the browser or React Native, so it runs
the same everywhere.

The website reaches these through small re-export files (for example
`client/src/genres.js`), the app through `mobile/metro.config.js`.
