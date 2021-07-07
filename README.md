# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

#### `npm install` - Install dependencies

#### `npm start` - Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

#### `npm test` - Run Jest tests WIP

#### `npm run build` - Build project: minifier, packaging, etc

## About the project:
```
Its basically a search API for https://news.ycombinator.com/ but using the third-party API service Algolia.com.
https://hn.algolia.com/api/v1/search?query={searchTerm}
```
## Demo:
https://react-minisearch.netlify.app/

## Features:
```
It sorts (also with reverse sort) results by:
-Comments
-Points
-Titles
-Author.

-It saves up to 5 search terms.
-It extends more results by clicking the 'More' button.
-Has React performance enhancements.
-Can dismiss a story/post
-Count total comments for each displayed 20 results. They accumulate as we click 'More' to expand.
```

## Dependencies:
```
Uses:
-Axios 
-Lodash
-React with Hooks: useState, useEffect, useRef, useReducer, useCallback, useMemo.   
```
