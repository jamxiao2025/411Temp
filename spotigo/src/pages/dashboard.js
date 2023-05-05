import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {GoogleMap, useLoadScript, Marker} from '@react-google-maps/api'
import axios from 'axios'
import dist from '@chakra-ui/icon';
function Dashboard() {
  const [name, setName] = useState("")
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [distance, setDistance] = useState("")
  const [duration, setDuration] = useState("")
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`http://localhost:8080/api/distance?departure=${departure}&arrival=${arrival}`);
      console.log(response)
      setDistance(response.data.rows[0].elements[0].distance.text)
      setDuration(response.data.rows[0].elements[0].duration.text)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        setName(uid)
        // ...
      } else {
        // User is signed out
        // ...
      }
    });
  }, []);

  return (
    <div className="container">
      <h1 className="title">Welcome to Music Go!</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Departure:
          <input type="text" value={departure} onChange={(e) => setDeparture(e.target.value)} />
        </label>
        <label>
          Arrival:
          <input type="text" value={arrival} onChange={(e) => setArrival(e.target.value)} />
        </label>
        <button type="submit">Submit</button>
      </form>
      {distance && duration && (
        <>
          <h2 className="subtitle">Results:</h2>
          <p>Distance: {distance}</p>
          <p>Duration: {duration}</p>
        </>
      )}
    </div>
  );
}

export default Dashboard;