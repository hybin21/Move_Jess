import React, { useState, useEffect } from "react";
import YouTube from "react-youtube";
import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieTrailer = ({ movieId }) => {
    const [videoId, setVideoId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchTrailer = async () => {
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
                );

                console.log("TMDb API Response:", response.data);

                if (response.data.results.length > 0) {
                    const firstVideo = response.data.results[0]; // Get the first available video
                    console.log("Selected video:", firstVideo);
                    setVideoId(firstVideo.key);
                } else {
                    setErrorMessage("Trailer not found.");
                }
            } catch (error) {
                console.error("Error fetching trailer:", error);
                setErrorMessage("Error fetching trailer. Please try again.");
            }
        };

        fetchTrailer();
    }, [movieId]);

    return (
        <div className="mt-6">
            <p className="pb-4"><strong>Relevant Video: </strong></p>
            {videoId ? (
                <YouTube
                    videoId={videoId}
                    className="w-full"
                    opts={{
                        width: "100%",
                        height: "290", // Adjust height as needed
                        playerVars: {
                            autoplay: 0, // Set to 1 if you want autoplay
                            controls: 1, // Show controls
                        },
                    }}
                />
            ) : (
                <p className="text-gray-400">{errorMessage || "Loading trailer..."}</p>
            )}
        </div>
    );
};

export default MovieTrailer;