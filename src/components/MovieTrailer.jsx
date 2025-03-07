import React, { useState, useEffect } from "react";
import YouTube from "react-youtube";
import axios from "axios";

// Load API credentials from environment variables
const BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

const MovieTrailer = ({ movieId }) => {
    const [videoId, setVideoId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchTrailer = async () => {
            if (!BEARER_TOKEN) {
                console.error("Error: Bearer token is missing.");
                setErrorMessage("Authorization error. Please check API credentials.");
                return;
            }

            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
                    {
                        headers: {
                            Authorization: `Bearer ${BEARER_TOKEN}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                console.log("TMDb API Response:", response.data);

                if (response.data.results.length > 0) {
                    const firstVideo = response.data.results[0]; // Select first available video
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
                        height: "290",
                        playerVars: {
                            autoplay: 0,
                            controls: 1,
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
