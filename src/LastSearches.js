export const LastSearches = ({ lastSearches, onLastSearch }) => {
    return (
        <>
            {lastSearches.map((searchTerm, index) => {
                return (
                    <button
                        key={searchTerm + index}
                        type="button"
                        onClick={() => onLastSearch(searchTerm)}
                    >
                        {searchTerm}
                    </button>
                )
            })}

        </>
    )
}