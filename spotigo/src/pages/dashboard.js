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
  const [durationTime, setDurationTime] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [genreOptions, setgenreOptions] = useState();
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`http://localhost:8080/api/distance?departure=${departure}&arrival=${arrival}`);
      setDistance(response.data.rows[0].elements[0].distance.text);
      setDuration(response.data.rows[0].elements[0].duration.text);
      setDurationTime(response.data.rows[0].elements[0].duration.value * 1000);
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

  function findSongs(querySize) {
    console.log(selectedGenres);
    if (!durationTime) {
      window.alert("Please Enter a Route!");
      return
    }

    if (selectedGenres.length === 0) {
      window.alert("Please Select a Genre!");
      return;
    }

    spotifyApi.getRecommendations({
      limit: querySize,
      // min_energy: 0.4,
      seed_genres: selectedGenres,
      // min_popularity: 10
    })
    .then(res => {
      const data = res.body.tracks;
      let playlist = [];
      let pLength = 0;
      
      for (const track of data) {
        playlist.push(track);
        pLength += track.duration_ms;

        if (pLength > durationTime) break;
      }

      console.log(pLength, durationTime);

      (pLength < durationTime) && (querySize < 100) && (playlist.length === querySize) ? 
      findSongs(querySize + 20) :
      setTracks(
        playlist.map(track => {
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

  function handleGenreSelect(e) {
    setSelectedGenres(e.map(genre => genre.value[0]));
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
      <h1>Genre</h1>
      <Select
        isMulti
        name="genres"
        options={genreOptions}
        className="basic-multi-select"
        classNamePrefix="select"
        onChange={e => handleGenreSelect(e)}
      />
      <button onClick={() => findSongs(20)}>Find Songs</button>
      <div style={{overflowy: 'auto'}}>
            {tracks.map(track => (
                <DisplayTrack track={track} key={track.uri}/>
            ))}
      </div>
    </div>
  );
}

export default Dashboard;
