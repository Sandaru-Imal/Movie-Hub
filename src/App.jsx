import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import SpinningIndicator from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_API_URL;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [decouncedSerachTerm, setDecouncedSerachTerm] = useState("");

  const [isLoadingTrendingMovies, setIsLoadingTrendingMovies] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingMoviesErrorMessage, setTrendingMoviesErrorMessage] =
    useState("");

  //debounce delays the API request by the given timeout
  useDebounce(() => setDecouncedSerachTerm(searchTerm), 500, [searchTerm]);

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

      if (data.response === "False") {
        setErrorMessage(data.Error);
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        debugger;
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.log(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      setIsLoadingTrendingMovies(true);
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
      setIsLoadingTrendingMovies(false);
    } catch (error) {
      setTrendingMoviesErrorMessage(error);
    }
  };

  useEffect(() => {
    fetchMovies(decouncedSerachTerm);
  }, [decouncedSerachTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./assets/hero-bg.png" alt="Hero Banner" />
          <h1>
            <span className="text-gradient">Movie</span> hub
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {trendingMovies && trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending movies</h2>
            {isLoadingTrendingMovies ? (
              <SpinningIndicator />
            ) : trendingMoviesErrorMessage ? (
              <p className="text-red-500">{trendingMoviesErrorMessage}</p>
            ) : (
              <ul>
                {trendingMovies &&
                  trendingMovies.map((movie, index) => (
                    <li key={movie.$id}>
                      <p>{index + 1}</p>
                      <img src={movie.poster_url} alt={movie.title} />
                    </li>
                  ))}
              </ul>
            )}
          </section>
        )}
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {isLoading ? (
            <SpinningIndicator />
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
  );
}
