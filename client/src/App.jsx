import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";

function App() {
  // const [movies, setMovies] = useState([]);
  // useEffect(() => {
  //   const fetchMovies = async () => {
  //     const discoverUrl = "https://api.themoviedb.org/3/discover/movie";
  //     const config = {
  //       method: "GET",
  //       headers: {
  //         accept: "application/json",
  //         Authorization:
  //           "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkODVmYzNmODY2ZTVmYzc3YmUyZjM4NGEwMjhiMTZkMyIsIm5iZiI6MTcyMTIyNjc5OC45MDEsInN1YiI6IjY2OTdkNjJlZjA3NWRiNGMxZjg4NzM4ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.HsxKA_M8uk8GDmX0_z7Pj751J2EWbHqGQ4ShB0cpQHM",
  //       },
  //     };
  //     const response = await axios.get(discoverUrl, config);
  //     setMovies(response.data.results);
  //   };
  //   fetchMovies();
  // }, []);

  return (
    <>
      <div className="bg-[#222329]">
        <Header />
        <main >
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
