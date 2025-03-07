import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Search from "./components/Search.jsx";
import TrendingMovies from "./components/TrendingMovies.jsx";
import ViewAllMovies from "./components/ViewAllMovies.jsx";
import MovieDetails from "./components/MovieDetail.jsx";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";
import MovieTrailer from "./components/MovieTrailer.jsx";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_BEARER_TOKEN;
const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`
    }
};

const App = () => {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [genreMap, setGenreMap] = useState({});

    // Fetch movie genres
    const fetchGenres = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/genre/movie/list?language=en`,
                API_OPTIONS
            );
            const data = await response.json();
            const genres = data.genres.reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
            }, {});
            setGenreMap(genres);
        } catch (e) {
            console.error(e);
        }
    };
    useEffect(() => {
        fetchGenres();
    }, []);

    // Debounce search term to prevent too many API calls
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    // Fetch movies based on search or popularity
    const fetchMovies = async (query = "") => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);
            if (!response.ok) {
                throw new Error("Failed to fetch movies");
            }
            const data = await response.json();
            if (data.Response === "False") {
                setErrorMessage(data.Error || "Failed to fetch movies");
                setMovieList([]);
                return;
            }
            setMovieList(data.results || []);
            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage("Error fetching movies. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch trending movies
    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
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
                            <div className="pattern" />
                            <div className="wrapper">
                                <header>
                                    <img src="movies.png" alt="film image" />
                                    <h1>
                                        Search Every <span className="text-gradient">Movie</span>, I will have <span className="text-gradient">everything</span>
                                    </h1>
                                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                                </header>

                                {/* Use Components Instead of Inline Code */}
                                <TrendingMovies trendingMovies={trendingMovies} />
                                <ViewAllMovies
                                    isLoading={isLoading}
                                    errorMessage={errorMessage}
                                    movieList={movieList}
                                />
                            </div>
                        </main>
                    }
                />

                {/* Movie Details Page */}
                <Route path="/movie/:id" element={<MovieDetails trendingMovies={trendingMovies} genreMap={genreMap} />} />
            </Routes>
        </Router>
    );
};

export default App;
