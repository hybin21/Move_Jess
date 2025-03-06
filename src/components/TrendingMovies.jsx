import React from "react";
import {useNavigate} from 'react-router-dom';
import {useRaf} from "react-use";

const TrendingMovies = ({ trendingMovies }) => {
    const navigate = useNavigate();

    return (
        trendingMovies.length > 0 && (
            <section className="trending">
                <h2>Trending Movies</h2>
                <ul>
                    {trendingMovies.map((movie, index) => (
                        <li
                            key={movie.$id}
                        className = "cursor-pointer"
                        onClick = {() => navigate(`/movie/${movie.movie_id}`)}>
                            <p>{index + 1}</p>
                            <img src={movie.poster_url} alt={movie.title} />
                        </li>
                    ))}
                </ul>
            </section>
        )
    );
};

export default TrendingMovies;
