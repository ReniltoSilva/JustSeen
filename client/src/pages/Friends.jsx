import { useState } from "react";
import axios from "axios";

const Friends = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginHandle = async (e) => {
    e.preventDefault();

    /* Turn this into a login/sign up component, 
dependending on where the user clicks, 
button login or sign up */ //FIXME

    console.log(name);
    console.log(username);
    console.log(password);
    // const response = await axios.get("http://localhost:3001/api/login");
    // console.log(response.data);

    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const signupHandle = async (e) => {
    e.preventDefault();

    const user = {
      name,
      username,
      password,
    };

    // const response = await axios.post("http://localhost:3001/api/users", user);
    console.log(response.status);

    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  {
    // return (
    /* <div>
        <h1>Login</h1>
        <form>
          <label>
              Name:
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

          <label>
            Username:
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label>
            Password:
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button onClick={loginHandle}>Login</button>
          <button onClick={signupHandle}>Sign up</button>
        </form>
      </div> */
  }

  return (
    <>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        {/* <legend className="fieldset-legend">Login</legend> */}

        <label className="label">Name</label>
        <input
          type="text"
          className="input"
          placeholder="Insert name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="label">Username</label>
        <input
          className="input"
          type="text"
          placeholder="Insert username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="label">Email</label>
        <input type="email" className="input" placeholder="Email" required />

        <label className="label">Password</label>
        <input
          className="input"
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-neutral mt-4" onClick={loginHandle}>
          Login
        </button>
        <button className="btn btn-neutral mt-4" onClick={signupHandle}>
          Signup
        </button>
      </fieldset>
    </>
  );
};

export default Friends;
