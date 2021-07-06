import * as React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react';
import App, { storiesReducer } from './App';
import { InputWithLabel } from './InputWithLabel';
import { List, Item } from './List';
import { SearchForm } from './SearchForm';
import axios from 'axios';
jest.mock('axios');







describe('something truthy and falsy', () => {
  test('true to be true', () => {
    expect(true).toBe(true);
  })
  test('false to be false', () => {
    expect(false).toBe(false);
  })

})


const storyOne = {
  title: 'React',
  url: 'https://reactjs.org/',
  author: 'Jordan Walke',
  num_comments: 3,
  points: 4,
  objectID: 0,
}

const storyTwo = {
  title: 'Redux',
  url: 'https://redux.js.org/',
  author: 'Dan Abramov, Andrew Clark',
  num_comments: 2,
  points: 5,
  objectID: 1,
};

const stories = [storyOne, storyTwo];

describe('App', () => {
  test('succeeds fetching data', async () => {
    //to be resolved promise
    const promise = Promise.resolve({
      data: {
        hits: stories
      }
    })
    axios.get.mockImplementationOnce(() => promise);

    render(<App />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();

    //promise resolves inside act
    await act(() => promise);
    expect(screen.queryByText(/Loading/)).toBeNull();

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Redux')).toBeInTheDocument();
    expect(screen.getAllByText('Submit').length).toBe(2);

  })

  test('fails fetching data', async () => {
    const promise = Promise.reject();
    axios.get.mockImplementationOnce(() => promise);

    render(<App />);

    expect(screen.getByText(/Loading/)).toBeInTheDocument();

    try {
      await act(() => promise);
    } catch {
      expect(screen.queryByText(/Loading/)).toBeNull();
      expect(screen.queryByText(/went wrong/)).toBeInTheDocument();
    }
  })

  test('removes a story', async () => {
    const reactPromise = Promise.resolve({
      data: {
        hits: stories,
      },
    });
    const anotherStory = {
      title: 'JavaScript',
      url: 'https://en.wikipedia.org/wiki/JavaScript',
      author: 'Brendan Eich',
      num_comments: 15,
      points: 10,
      objectID: 3,
    };
    const javascriptPromise = Promise.resolve({
      data: {
        hits: [anotherStory],
      },
    });
    axios.get.mockImplementation((url) => {
      if (url.includes('React')) {
        return reactPromise;
      }
      if (url.includes('JavaScript')) {
        return javascriptPromise;
      }
      throw Error();
    });

    //first render
    render(<App />);
    //first data fetch
    await act(() => reactPromise)

    expect(screen.queryByDisplayValue('React')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('JavaScript')).toBeNull();
    expect(screen.queryByText('Jordan Walke')).toBeInTheDocument();
    expect(screen.queryByText('Brendan Eich')).toBeNull();

    fireEvent.change(screen.queryByDisplayValue('React'), { target: { value: 'JavaScript' } })
    expect(
      screen.queryByDisplayValue('JavaScript')
    ).toBeInTheDocument();

    fireEvent.submit(screen.getByRole('button', { name: 'SubmitYo' }));
    await act(() => javascriptPromise);

    expect(screen.queryByText('Jordan Walke')).toBeNull();
    expect(
      screen.queryByText('Dan Abramov, Andrew Clark')
    ).toBeNull();
    expect(screen.queryByText('Brendan Eich')).toBeInTheDocument();
  });

})



describe('storiesReducer()', () => {
  //extrapolate/extend the test cases to one per action from storiesReducer
  test('REMOVE_STORY', () => {
    const action = { type: 'REMOVE_STORY', payload: storyOne };
    const state = { data: stories, isLoading: false, isError: false }
    const newState = storiesReducer(state, action);
    const expectedState = { data: [storyTwo], isLoading: false, isError: false }
    expect(newState).toStrictEqual(expectedState)
  })

  test('STORIES_FETCH_INIT', () => {
    const action = { type: 'STORIES_FETCH_INIT' };
    const state = { data: [], isLoading: false, isError: false }
    const newState = storiesReducer(state, action);
    const expectedState = { data: [], isLoading: true, isError: false };
    expect(newState).toStrictEqual(expectedState);
  })

  test('STORIES_FETCH_SUCCESS', () => {
    const action = { type: 'STORIES_FETCH_SUCCESS', payload: stories };
    const state = { data: stories, isLoading: false, isError: false }
    const newState = storiesReducer(state, action);
    const expectedState = { data: [storyOne, storyTwo], isLoading: false, isError: false }
    expect(newState).toStrictEqual(expectedState);
  })

  test('STORIES_FETCH_FAILURE', () => {
    const action = { type: 'STORIES_FETCH_FAILURE' };
    const state = { data: stories, isLoading: false, isError: false }
    const newState = storiesReducer(state, action);
    const expectedState = { data: stories, isLoading: false, isError: true }
    expect(newState).toStrictEqual(expectedState);
  })
})


describe('Item', () => {
  test('renders all properties', () => {
    render(<Item item={storyOne} />);

    expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
    expect(screen.getByText('React')).toHaveAttribute('href', 'https://reactjs.org/');

  })

  test('renders a clickable dissmiss button', () => {
    render(<Item item={storyOne} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  })

  test('clicking the dismiss button calls the callback handler', () => {
    const handleRemoveItem = jest.fn().mockImplementationOnce((item) => item);
    render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleRemoveItem.mock.results[0].value).toStrictEqual({
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0
    });
  })

  test('renders snapshot',()=>{
    const handleRemoveItem = jest.fn();
    const {container} = render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />)
    expect(container.firstChild).toMatchSnapshot();
  })
})

describe('SearchForm', () => {
  const searchFormProps = {
    searchTerm: 'React',
    onSearchSubmit: jest.fn(),
    onSearchInput: jest.fn(),
  }

  test('renders the input field with its value', () => {
    render(<SearchForm {...searchFormProps} />)
    expect(screen.getByDisplayValue('React')).toBeInTheDocument();
  })

  test('renders the correct label', () => {
    render(<SearchForm {...searchFormProps} />);
    expect(screen.getByLabelText('Search:')).toBeInTheDocument();
  });

  test('calls onSearchInput on input field change', () => {
    render(<SearchForm {...searchFormProps} />);
    fireEvent.change(screen.getByDisplayValue('React'), { target: { value: 'Redux' } })
    expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1)

  })

  test('calls onSearchSubmit on button submit click', () => {
    render(<SearchForm {...searchFormProps} />);
    fireEvent.submit(screen.getByRole('button'), { name: 'SubmitYo' });
    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
  })

  test('renders snapshot',()=>{
    const {container} = render(<SearchForm {...searchFormProps}/>);
    expect(container.firstChild).toMatchSnapshot();
  })
})






