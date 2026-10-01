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
      <div className="max-lg:collapse bg-[#222329] lg:mb-18 border-base-content shadow-[0.3px_0.3px_0px_0px_grey] w-full ">
        <input id="navbar-1-toggle" className="peer hidden" type="checkbox" />
        <label
          htmlFor="navbar-1-toggle"
          className="fixed inset-0 hidden max-lg:peer-checked:block"
        ></label>

        <div className="collapse-title navbar ">
          <div className="navbar-start flex gap-4">
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
            <a href="/" className=" text-xl font-bold text-[#fafafa]">
              Two Seats
            </a>

            {/* Search bar */}
            <div className="navbar-center">
              <input
                type="text"
                placeholder="Search"
                className="input input-bordered w-100 "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="btn " onClick={searchMovie}>
              Search
            </button>
          </div>

          {/* menu */}
          <div className="navbar-end hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              <li>
                <a href="/" className="text-xl text-[#fafafa]">
                  Feed
                </a>
              </li>
              <li>
                <a href="/saved" className="text-xl text-[#fafafa]">
                  Saved
                </a>
              </li>
              <li>
                <a href="/friends" className="text-xl text-[#fafafa]">
                  Friends
                </a>
              </li>
            </ul>
          </div>

          <div className="avatar">
            <div className="w-10 rounded-full">
              <img alt="Tailwind-CSS-Avatar-component" src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
            </div>
          </div>
        
        </div>
      </div>
    </>
  );
};

export default Header;
