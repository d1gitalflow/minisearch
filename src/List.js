import { useState } from 'react';
import {SORTS} from './App';

export const List = ({ list, onRemoveItem }) => {

    const [sort, setSort] = useState({sortKey:'NONE',isReverse:false});

    const handleSort = (sortKey) => {
                            //none          title        true
        const isReverse = sort.sortKey === sortKey && !sort.isReverse
        setSort({sortKey:sortKey,isReverse:isReverse});
    }

    const sortFunction = SORTS[sort.sortKey];
    const sortedList = sort.isReverse ? sortFunction(list).reverse() : sortFunction(list)

    return (
        <ul>
            <li style={{ display: 'flex' }}>
                <span>
                    <button type="button" onClick={() => handleSort('TITLE')}>
                        Title
                    </button>
                </span>
                <span>
                    <button type="button" onClick={() => handleSort('AUTHOR')}>
                        Author
                    </button>
                </span>
                <span>
                    <button type="button" onClick={() => handleSort('COMMENT')}>
                        Comments
                    </button>
                </span>
                <span>
                    <button type="button" onClick={() => handleSort('POINT')}>
                        Points
                    </button>
                </span>
                <span style={{ width: '10%' }}>Actions</span>
            </li>
            {sortedList.map((item) => (
                <Item
                    key={item.objectID}
                    item={item}
                    onRemoveItem={onRemoveItem}
                />
            ))}
        </ul>
    );
}


export const Item = ({ item, onRemoveItem }) => {

    return (<li style={{ display: 'flex' }}>
        <span style={{ width: '40%' }}><a href={item.url}>{item.title}</a></span>
        <span style={{ width: '30%' }}>{item.author}</span>
        <span style={{ width: '10%' }}>{item.num_comments}</span>
        <span style={{ width: '10%' }}>{item.points}</span>
        <span style={{ width: '10%' }}>
            <button type="button" onClick={() => onRemoveItem(item)}

            >
                Submit
            </button>
        </span>
    </li>)
}