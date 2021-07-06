import { useState, useEffect, useRef, useReducer, useCallback, useMemo } from "react";
import axios from 'axios/index.js';
import { SearchForm } from "./SearchForm";
import { InputWithLabel } from "./InputWithLabel";
import { List, Item } from "./List";
import { LastSearches } from "./LastSearches";

//utilities such as sorting arrays
import { sortBy } from 'lodash';


//custom hook (we merge the two react core hooks useState and useEffect)
const useSemiPersistentState = (key, initialState) => {

  const isMounted = useRef(false); //current property initialized with 'false'

  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;  //isMounted.current if set to true, it survives full page re-render and if
      // exists it will set newItem the next updates avoiding the first re-render
    } else {
      localStorage.setItem(key, value);
    }

  }, [value, key]);

  return [value, setValue];
};

//action parameter =>{type:'type',payload:value}
//state parameter: init from useReducer(), updated from useReducer()
const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload.list,
        page: action.payload.page,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

export const SORTS = {
  NONE: (list) => list,
  TITLE: (list) => sortBy(list, 'title'),
  AUTHOR: (list) => sortBy(list, 'author'),
  COMMENT: (list) => sortBy(list, 'num_comments').reverse(),
  POINT: (list) => sortBy(list, 'points').reverse(),
};

//utilities:
const getSumComments = (stories) => {
  return stories.data.reduce(
    (result, value) => result + value.num_comments,
    0
  );
};

const getLastSearches = (urls) => urls.reduce((result, url, index) => {
  //for each element get the query line extracted
  const searchTerm = extractSearchTerm(url);
  if (index === 0) {//the first element of the array is the first to get concatenated into the accumulator
    return result.concat(searchTerm);
  }
  const previousSearchTerm = result[result.length - 1]; //access last result of the accumulator
  if (searchTerm === previousSearchTerm) { //if its the same return the same result to the accumulator
    return result;
  } else { //different add searchTerm
    return result.concat(searchTerm);
  }
  //accumulator initial valor is []
}, []).slice(-6)
  .slice(0, -1)
  .map((url) => extractSearchTerm(url)); //-5 is the last five

/*  
X
https://hn.algolia.com/api/v1/search?query=react
Y
https://hn.algolia.com/api/v1/search? query=react &page=0 */

//extract searchTerm between & and ?                                                             //delete 'query='
const extractSearchTerm = (url) => url.substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&')).replace(PARAM_SEARCH, '')

const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const getUrl = (searchTerm,page) => `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

const App = () => {


  //const [searchTerm, setSearchTerm] = useState(localStorage.getItem('search') || 'React');
  //custom hook
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const [urls, setUrls] = useState([getUrl(searchTerm,0)]);

  const handleSearch = (searchTerm,page) => {
    const url = getUrl(searchTerm,page);
    setUrls(urls.concat(url));
  };

  //update the setUrl
  const handleLastSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm,0);
  }

  //runs when clicked
  const handleMore = ()=>{
    const lastUrl = urls[urls.length-1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm,stories.page+1);
  }

  const lastSearches = getLastSearches(urls);

  //useReducer hook, we pass the reducer function + and the initial state
  //in useReducer we call the state updater function 'dispatcherBlaBla'
  const [stories, dispatchStories] = useReducer(storiesReducer, { data: [],page:0, isLoading: false, isError: false });


  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value)
  }

  //submit the searchTerm state
  const handleSearchSubmit = (event) => {
    handleSearch(searchTerm,0);

    //<button type="submit"> to prevent from reloading the page
    //"prevent default behavior"
    event.preventDefault();
  }

  const runComputation = useMemo(() => getSumComments(stories), [stories])


  const handleFetchStories = useCallback(async () => {
    if (!searchTerm) return;
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      //resolves in the latest url
      const lastUrl = urls[urls.length - 1];
      //fetches last url from urls present state
      const result = await axios.get(lastUrl);
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page
        }
      });
    }
    catch {
      dispatchStories({
        type: 'STORIES_FETCH_FAILURE'
      })
    }

    //eslint-disable-next-line
  }, [urls])

  useEffect(() => {
    handleFetchStories()
  }, [handleFetchStories]);



  //set if passed story doesn't equal story.objectID
  //call happens on Item component function
  const handleRemoveStory = useCallback((item) => {

    //we pass the item as a payload
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item
    })

  }, [])




  return (
    <div >
      <h1>My bleeing edge react testing ground with {runComputation} comments!</h1>

      <SearchForm
        onSearchSubmit={handleSearchSubmit}
        onSearchInput={handleSearchInput}
        searchTerm={searchTerm}

      />

      <LastSearches
        lastSearches={lastSearches}
        onLastSearch={handleLastSearch}
      />

      {stories.isError && <p>Oops something went wrong...</p>}
      {stories.isLoading ? (<p>Loading...</p>) : (
        <List
          list={stories.data}
          onRemoveItem={handleRemoveStory}
        />
      )}

      <button
      type="button"
      onClick={()=>handleMore()}
      >More</button>



    </div>

  )
}













export default App;

export { storiesReducer, SearchForm, InputWithLabel, List, Item };