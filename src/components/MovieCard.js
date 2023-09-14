import React from 'react'
import noImage from './no-image2.png'

export default function MovieCard({ movie, imageUrl, selectMovie }) {

  return (
    <div className='card'>
        <div className='image-container' onClick={() => selectMovie(movie)}>
          {movie.poster_path ?
          <img className='image' src={`${imageUrl}/w500${movie.poster_path}`} alt='Movie image'/>
          : 
          <img className='image' src={noImage} alt='No image available'/>
          }
        </div>
        <h5 className='movie-title'>{movie.title}</h5>
        
    </div>
  )
}
