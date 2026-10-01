import axios from "axios";
import Movie from "../components/Movie";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const baseUrl = "http://localhost:3001/api/movies";
  const tmdbUrl = "https://api.themoviedb.org/3/discover/movie";

  useEffect(() => {
    const fetchLatestMovies = async () => {
      const config = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkODVmYzNmODY2ZTVmYzc3YmUyZjM4NGEwMjhiMTZkMyIsIm5iZiI6MTcyMTIyNjc5OC45MDEsInN1YiI6IjY2OTdkNjJlZjA3NWRiNGMxZjg4NzM4ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.HsxKA_M8uk8GDmX0_z7Pj751J2EWbHqGQ4ShB0cpQHM",
        },
      };

      const responseTMDB = await axios.get(tmdbUrl, config);
      const responseDB = await axios.get(baseUrl);
      // console.log(responseTMDB.data.results);
      // const obj1 = [
      //   { id: 1, name: "Alice", role: "Engineer" },
      //   { id: 2, name: "Bob", role: "Designer" },
      //   { id: 3, name: "Jack", role: "Carpenter" },
      // ];

      // const obj2 = [
      //   { id: 1, name: "Alice", role: "Engineer" },
      //   { id: 2, name: "Maria", role: "Designer" },
      //   { id: 3, name: "Robert", role: "Carpenter" },
      // ];

      // obj1.forEach((item, i) => {
      //   if (item.name === obj2[i].name) {
      //     newArr.push({ name: item.name, button: true });
      //   } else {
      //     newArr.push({ name: item.name, button: false });
      //   }
      // });
      // console.log(responseDB.data);
      // console.log(responseDB.data[0].title);

      let newArr = [];

      console.log(responseTMDB)
      console.log(responseDB)
      /* Improve this, transform to setMap maybe */
      responseTMDB.data.results.map((movieTMDB) => {
        const checkMovie = responseDB.data.some(
          (movie) => movie.title === movieTMDB.title,
        );

        const movieObj = {
          title: movieTMDB.title,
          thumbnail: movieTMDB.poster_path,
          overview: movieTMDB.overview,
          id: movieTMDB.id,
          genreId: movieTMDB.genre_ids,
        };

        if (checkMovie) {
          movieObj.button = true;
          newArr.push(movieObj);
        } else {
          movieObj.button = false;
          newArr.push(movieObj);
        }
      });

      setMovies(newArr);
    };
    fetchLatestMovies();
  }, []); //FIXME - I had a dependency 'movies' here, 
  // the useEffect fetches movies and updates 'movies' variable, 
  // that causes an infinite loop.

  const saveToDB = async (movieParam) => {
    const { title, thumbnail, genreId, overview } = movieParam;

    const newMovie = {
      title,
      thumbnail,
      genreId,
      date: "",
      place: "",
      comment: "",
      overview,
    };

    const response = await axios.post(
      "http://localhost:3001/api/movies",
      newMovie,
    );

    /* Improve this, extract this functionality, maybe? 
    it's being used twice almost the same func up above */
    let newArr = [];

    movies.map((item) => {
      if (response.data.title === item.title) {
        item.button = true;
        newArr.push(item);
      } else {
        newArr.push(item);
      }
    });

    setMovies(newArr);
  };

  return (
    <>
      <div className="main_movies_container ">
        {movies.map((item) => (
          <div
            // key={item.id}// CONTINUE is it supposed to have an ID key here?
            className="card shadow-lg border-1 rounded-sm border-black "
          >
            <Movie
              key={item.id.toString()}
              details={item}
              saveToDB={saveToDB}
              from={"home.jsx"}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
