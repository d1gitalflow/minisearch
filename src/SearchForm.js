import {InputWithLabel} from './InputWithLabel.js';
export const SearchForm = ({ onSearchSubmit, onSearchInput, searchTerm }) => {
    return (
      <form onSubmit={onSearchSubmit}>
        <InputWithLabel
          id={'search'}
          label={'Search'}
          value={searchTerm}
          onInputChange={onSearchInput}
          isFocus={true}
        >
          <strong>Search:</strong>
        </InputWithLabel>
        <button
          
          type="submit"
          disabled={!searchTerm}
        >SubmitYo
        </button>
      </form>
    )
  }