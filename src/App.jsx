import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import MovieDetails from './components/MovieDetail.jsx';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
};

const App = () => {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trendingMovies, setTrendingMovies] = useState([]); // Keep trending movies
    const [genreMap, setGenreMap] = useState({});

    const fetchGenres = async () => {
        try{
            const response = await fetch(`${API_BASE_URL}/genre/movie/list?language=en`, API_OPTIONS);
            const data = await response.json();

            const genres = data.genres.reduce((acc, genre) =>{
                acc[genre.id] = genre.name;
                return acc
            },{});
            setGenreMap(genres);
        }catch(e){
            console.error(e);
        }
    };
    useEffect(() => {fetchGenres();}, []);

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();

            if (data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies); // Keep trending movies stored
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
    };

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <Router>
            <Routes>
                {/* Home Page */}
                <Route
                    path="/"
                    element={
                        <main>
                            <div className="pattern"/>
                            <div className="wrapper">
                                <header>
                                    <img src="movies.png" alt="film image" />
                                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
                                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                                </header>

                                {/* Trending Movies Section */}
                                {trendingMovies.length > 0 && (
                                    <section className="trending">
                                        <h2>Trending Movies</h2>
                                        <ul>
                                            {trendingMovies.map((movie, index
                                            ) => (
                                                <li key={movie.$id}>
                                                    <p>{index + 1}</p>
                                                    <img src={movie.poster_url} alt={movie.title} />
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {/* All Movies Section */}
                                <section className="all-movies">
                                    <h2>All Movies</h2>
                                    {isLoading ? (
                                        <Spinner />
                                    ) : errorMessage ? (
                                        <p className="text-red-500">{errorMessage}</p>
                                    ) : (
                                        <ul>
                                            {movieList.map((movie) => (
                                                <MovieCard key={movie.id} movie={movie} />
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            </div>
                        </main>
                    }
                />

                {/* Movie Details Page */}
                <Route path="/movie/:id" element={<MovieDetails trendingMovies={trendingMovies} genreMap ={genreMap} />} />
            </Routes>
        </Router>
    );
};

export default App;
