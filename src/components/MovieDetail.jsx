import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
    },
};

const MovieDetails = ({ genreMap }) => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [keyWords, setKeyWords] = useState([]);
    const [movie, setMovie] = useState(location.state?.movie || null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (movie) return;
            try {
                const response = await fetch(
                    `${API_BASE_URL}/movie/${id}?append_to_response=credits,reviews`,
                    API_OPTIONS
                );
                if (!response.ok) throw new Error("Failed to fetch movie details");
                const data = await response.json();
                setMovie(data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchMovieDetails();
    }, [id]);

    useEffect(() => {
        const fetchKeyWords = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/movie/${id}/keywords`,
                    API_OPTIONS
                );
                if (!response.ok) throw new Error("Failed to fetch keywords");
                const keywordData = await response.json();
                setKeyWords(keywordData.keywords || []);
            } catch (e) {
                console.error(e);
                setKeyWords([]);
            }
        };
        fetchKeyWords();
    }, [id]);

    if (!movie) {
        return (
            <p className="text-center text-red-500">Error: No movie details available.</p>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center text-white">
            {/* Apply the same background pattern as the main page */}
            <div className="pattern absolute inset-0"></div>

            <div className="wrapper relative bg-dark-100 p-8 rounded-lg max-w-4xl shadow-lg">
                <button
                    className="absolute top-5 right-5 text-white text-lg bg-gray-800 px-3 py-1 rounded-lg hover:bg-gray-600"
                    onClick={() => navigate("/")}
                >
                    ✕
                </button>

                <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                <div className="flex items-center text-yellow-400">
                    ⭐ {movie.vote_average?.toFixed(1)} / 10
                </div>

                <div className="flex gap-6 mt-4">
                    <img
                        src={
                            movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : "/no-movie.png"
                        }
                        alt={movie.title}
                        className="w-60 rounded-lg shadow-lg"
                    />
                    <div className="w-full">
                        <img src={movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : '/no-movie.png'} alt ={movie.title}/>

                        <div className="flex gap-2 mt-2">
                            <p>
                                <strong>Genre : </strong>
                            </p>
                            {movie.genres ? (
                                movie.genres.map((genre) => (
                                    <span key={genre.id} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                                    {genre.name}
                                    </span>
                                ))
                                ) : movie.genre_ids ? (
                                    movie.genre_ids.map((g_id) => (
                                    <span key={g_id} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                                    {genreMap[g_id] || "Unknown"}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400">No genre data available</span>
                            )}
                        </div>


                        {keyWords.length > 0 ? (
                            <div className="mt-4">
                                <p className="font-semibold mb-2">Keywords:</p>
                                <div className="flex flex-wrap gap-2">
                                    {keyWords.slice(0, 8).map((keyword) => (
                                        <span
                                            key={keyword.id}
                                            className="px-3 py-1 bg-gray-700 rounded-full text-sm text-white whitespace-nowrap"
                                        >
                      {keyword.name}
                    </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 mt-4">No Keywords available</p>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <p className="text-lg">
                        <strong>Overview:</strong> {movie.overview}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <p>
                            <strong>Release Date:</strong> {movie.release_date}
                        </p>
                        <p>
                            <strong>Languages:</strong> {movie.original_language}
                        </p>
                        <p>👍 : {movie.vote_count}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
