import { useState, useEffect } from 'react'
import axios from 'axios'
import YouTube from 'react-youtube'
import debounce from 'lodash.debounce'

import './App.css'
import MovieCard from './components/MovieCard'



function App() {

  const base_url = 'https://api.themoviedb.org/3'
  const imageUrl = 'https://image.tmdb.org/t/p'
  const api_key = process.env.REACT_APP_MOVIE_API_KEY

  const randomStarter = Math.round(Math.random() * 20)

  const [movies, setMovies] = useState([])
  const [query, setQuery] = useState('')
  const [selectedMovie, setSelectedMovie] = useState({})
  const [playTrailer, setPlayTrailer] = useState(false)
  const [isCursorActive, setIsCursorActive] = useState(false)
  const [initialBackdropPath, setInitialBackdropPath] = useState('')


  // Fetching a list of movies
const fetchMovies = async () => {
  const type = query ? 'search' : 'discover';
  try {
    const { data } = await axios.get(`${base_url}/${type}/movie`, {
      params: {
        api_key: api_key,
        query: query
      }
    });

    if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
      setMovies(data.results);
      await setSelectedMovie(data.results[randomStarter])
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
}


  // Fetching data for a video
  const fetchMovie = async (id) => {
    try {
    const { data } = await axios.get(`${base_url}/movie/${id}`, {
      params: {
        api_key: process.env.REACT_APP_MOVIE_API_KEY,
        append_to_response: 'videos'
      }
    })

    if(!data.videos || data.videos.results.length === 0) {
      return {...data, videos: { results: [] }}
    }
    return data

    } catch (error) {
      console.error('Error fetching movie', error)
      return null
    }
  }

  const selectMovie = async (movie) => {
    const data = await fetchMovie(movie.id)
    if(data) {
      setSelectedMovie(data)
    } else {
      console.log('Failed to fetch movie data')
    }
  }
  
  useEffect(() => {
    fetchMovies()
  }, [query])


  useEffect(() => {
    if (selectedMovie && selectedMovie.backdrop_path) {
      setInitialBackdropPath(
        `${imageUrl}/original/${selectedMovie.backdrop_path}`
      );
    }
  }, [selectedMovie])

  const renderMovies = () =>
    movies.map(movie => (
      <MovieCard
        key={movie.id}
        movie={movie}
        imageUrl={imageUrl}
        selectMovie={selectMovie}
      />
    ))
  
  const selectBackdrop = () => {
    if (!selectedMovie || !selectedMovie.backdrop_path) {

      return initialBackdropPath || `url(${imageUrl}/default_background_image.jpg)`
    }
    return `url(${imageUrl}/original/${selectedMovie.backdrop_path})`;
  }

  const renderTrailer = () => {
    if (!selectedMovie || typeof selectedMovie.videos === 'undefined' || selectedMovie.videos.results.length === 0) {
      return null
    }
    let trailer = selectedMovie.videos.results.find(video => video.name === 'Official Trailer');
  
    // If Official Trailer not found
    if (!trailer) {
      const trailerRegex = /trailer/i;
      trailer = selectedMovie.videos.results.find(video => trailerRegex.test(video.name));
    }
  
    if (trailer) {
      const key = trailer.key;
  
      return (
        <YouTube
          className='video'
          videoId={key}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 1
            }
          }}
        />
      );
    } else {
      return <p>No trailer available</p>
    }
  }
  

  const handleMouseMove = () => {
    setIsCursorActive(true)

    setTimeout(() => {
      setIsCursorActive(false)
    }, 3000)
  }

  const debouncedFetchMovies = debounce(fetchMovies, 500)

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    debouncedFetchMovies()
  }

  return (
    <div className='App'>
      <header className='header'>
        <div className='header-content'>
          <span className='header-title'>Movie Trailer App</span>
        </div>
      </header>
      <div className='hero' style={{backgroundImage: selectBackdrop()}} onMouseMove={handleMouseMove}>
        <div className='hero-container'>

          {isCursorActive && playTrailer ? (<button className='close-button' onClick={() => setPlayTrailer(false)}>Close</button>) : null}
          {selectedMovie.videos && playTrailer ? renderTrailer() : null}

          <button className='button' onClick={() => setPlayTrailer(true)}>Play Trailer</button>
          <h1 className='hero-title'>{selectedMovie.title}</h1>
          <p className='hero-overview'>{selectedMovie.overview ? selectedMovie.overview : null}</p>
        </div>
      </div>
        {movies.length === 0 ? <p className='no-movies'>No matching movies</p> :
        <div className='container'>
          {renderMovies()}
        </div>
        }
      <div className='footer'>
        <input
          className='search-bar'
          type='text'
          placeholder='Search movies...'
          onChange={handleInputChange}
          value={query}
        >
        </input>
      </div>
    </div>
  );
}

export default App;
