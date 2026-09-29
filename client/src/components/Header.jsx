import { useState } from "react";

const Header = () => {
  const [search, setSearch] = useState("");

  const searchMovie = (e) => {
    e.preventDefault();

    console.log(search);

    setSearch("");
  };

  return (
    <>
      {/* <header>
        <nav>
          <a href="/">Home</a> | <a href="/mylist">My List</a> |{" "}
          <a href="/login">Login</a>
        </nav>
        <form onSubmit={searchMovie}>
          <label>
            <input
              type="text"
              class="border-1 border-solid rounded-sm border-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button>Search</button>
        </form>
      </header> */}

      <div className="max-lg:collapse bg-base-200 lg:mb-18 shadow-sm w-full rounded-md">
        <input id="navbar-1-toggle" className="peer hidden" type="checkbox" />
        <label
          htmlFor="navbar-1-toggle"
          className="fixed inset-0 hidden max-lg:peer-checked:block"
        ></label>

        <div className="collapse-title navbar">
          <div className="navbar-start">
            <label
              htmlFor="navbar-1-toggle"
              className="btn btn-ghost lg:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <a href="/" className=" text-xl font-bold">
              Two Seats
            </a>
          </div>

          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              <li>
                <a href="/" className="text-xl">
                  Feed
                </a>
              </li>
              <li>
                <a href="/saved" className="text-xl">
                  Saved
                </a>
              </li>
              <li>
                <a href="/friends" className="text-xl">
                  Friends
                </a>
              </li>
            </ul>
          </div>

          <div className="navbar-end">
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered w-64 lg:w-auto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn" onClick={searchMovie}>
            Search
          </button>
        </div>

        <div className="collapse-content lg:hidden z-1">
          <ul className="menu">
            <li>
              <a href="/" className="text-xl">
                Home
              </a>
            </li>
            <li>
              <a href="/mylist" className="text-xl">
                My Movies
              </a>
            </li>
            <li>
              <a href="/login" className="text-xl">
                Login
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Header;
