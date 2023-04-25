import './App.css';
import Login from'./pages/login'
import Dashboard from './pages/dashboard'
import Register from './pages/register'
import SpotifyLogin from './pages/spotifyLogin'
import {BrowserRouter as Router,Routes,Route,Link} from "react-router-dom";

const code = new URLSearchParams(window.location.search).get('code');

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element = {<Login />} />
        <Route path="/register" element = {<Register />} />
        <Route path="/dashboard" element = {code ? <Dashboard code={code} /> : <SpotifyLogin />} />

      </Routes>
    </Router>
  );
}

export default App;
