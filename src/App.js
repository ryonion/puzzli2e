import logo from './logo.svg';
import './App.css';
import firebaseConfig from "./firebase";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import { useEffect } from 'react';

function App() {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  
  useEffect(() => {
    // set(ref(db, 'users/' + 3), {
    //   username: "ryan",
    //   email: "ryan@email.com",
    // });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
