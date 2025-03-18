import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MovieTrailer from "./MovieTrailer.jsx";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_BEARER_TOKEN;
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
    const [providers, setProviders] = useState([])
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(""); // this will store returned value from exa.ai for movie's summarization

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
    }, [id, movie]);

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
        useEffect(() => {
            const fetchWatchProviders = async () => {
                try {
                    const response = await fetch(
                        `${API_BASE_URL}/movie/${id}/watch/providers`,
                        API_OPTIONS
                    );
                    if (!response.ok) throw new Error("Failed to fetch watch providers");
                    const data = await response.json();
                    console.log("Providers API Response:", data); // 🔍 Debugging

                    const usProviders = data.results?.US?.flatrate || data.results?.US?.buy || [];
                    setProviders(usProviders);
                } catch (e) {
                    console.error(e);
                }
            };
            fetchWatchProviders();
    }, [id]);


    // fetch movie summary from exa.ai
    const fetchMovieSummary = async () => {
        if (!movie || !movie.title) return;
        setLoading(true);
        setSummary("");

        try {
            const response = await fetch("http://3.15.226.141:5002/api/movie-summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieTitle: movie.title }),
            });

            const data = await response.json();
            console.log(data); // Debugging

            if (response.ok && data.summary) {
                setSummary(data.summary);
            } else {
                console.error("Error fetching movie summary:", data);
            }
        } catch (error) {
            console.error("Error fetching summary:", error);
        }

        setLoading(false);
    };


    if (!movie) {
        return (
            <p className="text-center text-red-500">Error: No movie details available.</p>
        );
    }
    console.log(movie)
    return (
        <div className="relative min-h-screen flex items-center justify-center text-white">
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

                <div className="flex gap-6 mt-4 items-start">
                    <img
                        src={
                            movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : "/no-movie.png"
                        }
                        alt={movie.title}
                        className="w-auto max-w-[300px] h-[250ps] object-cover "
                    />
                    <div className="w-full">
                        <MovieTrailer  movieId={movie.id}/>
                        {/*<img src={movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : '/no-movie.png'} alt ={movie.title}/>*/}

                        <div className="flex gap-2 mt-5">
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
                        {providers.length > 0 ? (
                            <div className="mt-4">
                                <p className="font-semibold mb-2">Available on:</p>
                                <div className="flex flex-wrap gap-2">
                                    {providers.map((provider) => (
                                        <a
                                            key={provider.provider_id}
                                            href={`https://www.themoviedb.org/movie/${id}/watch`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 bg-gray-700 rounded-full text-sm text-white whitespace-nowrap hover:bg-blue-500 transition"
                                        >
                                            {provider.provider_name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 mt-4">Only at Movie Theater</p>
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
                <button className = "mt-2 px-2 py-1 bg-gray-700 rounded-2xl cursor-pointer hover hover:bg-white hover:text-black"
                        onClick={fetchMovieSummary}
                        disabled={loading}>
                    {loading ? "Fetching..." : "Get Summarization from Exa.ai"}
                </button>
                {summary && (
                    <p className="mt-4 p-4 bg-gray-800 text-white rounded-lg">
                        <strong>Summary:</strong> {summary}
                    </p>
                )}

            </div>
        </div>
    );
};

export default MovieDetails;
