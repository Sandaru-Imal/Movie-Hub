import React from 'react'

export default function Search({searchTerm, setSearchTerm}) {
  return (
    <div className='search'>
      <div>
        <img src='search.svg' alt='search' />
        <input 
            type='text'
            placeholder='Searh movies here'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  )
}
