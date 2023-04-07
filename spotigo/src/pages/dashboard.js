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
    <div>
      <h1>Hi {name}</h1>
      <form onSubmit={handleSubmit}>
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
      <h1>Distance:{distance}</h1>
      <h1>Duration:{duration}</h1>
    </div>
  );
}

export default Dashboard;
