import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {GoogleMap, useLoadScript, Marker} from '@react-google-maps/api';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';
import dist from '@chakra-ui/icon';
import useAuth from './useAuth';
import DisplayTrack from './displayTrack';
import Select from 'react-select';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID
})


function Dashboard({ code }) {
  const accessToken = useAuth(code);

  const [name, setName] = useState("");
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [tracks, setTracks] = useState([]);
  const [genreOptions, setgenreOptions] = useState();

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

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

  useEffect(() => {
    if (!accessToken) return;

    spotifyApi.getAvailableGenreSeeds()
    .then(data => {
      const genreSeeds = data.body.genres;
      setgenreOptions(genreSeeds.map(genre => ({label: [genre], value: [genre]})));
    })
    .catch(err => {
      console.log('Something went wrong!', err);
    });
  }, [accessToken]);

  function findSongs() {
    spotifyApi.getRecommendations({
      min_energy: 0.4,
      seed_artists: ['6mfK6Q2tzLMEchAr0e9Uzu', '4DYFVNKZ1uixa6SQTvzQwJ'],
      min_popularity: 50
    })
    .then(res => {
      const data = res.body;

      setTracks(
        data.tracks.map(track => {
          const smallestAlbumImage = track.album.images.reduce( (smallest, image) => {
            if (image.height < smallest.height) return image
            return smallest
          }, track.album.images[0] );

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url
          }
        })
      );
    })
    .catch(err => console.log("Something went wrong!", err));
  }

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
      <Select
        isMulti
        name="genres"
        options={genreOptions}
        className="basic-multi-select"
        classNamePrefix="select"
        onChange={e => console.log(e)}
      />
      <button onClick={findSongs}>Find Songs</button>
      <div style={{overflowy: 'auto'}}>
            {tracks.map(track => (
                <DisplayTrack track={track} key={track.uri}/>
            ))}
      </div>
    </div>
  );
}

export default Dashboard;
