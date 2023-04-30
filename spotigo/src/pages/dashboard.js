import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {GoogleMap, useLoadScript, Marker} from '@react-google-maps/api';
import axios from 'axios';
import {Button} from '@chakra-ui/react';
import useAuth from './useAuth';
import DisplayTrack from './displayTrack';
import Select from 'react-select';


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
  const [selectedGenres, setSelectedGenres] = useState(['acoustic']);
  const [email, setEmail] = useState("");
  const [plength, setPlength] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
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
        const email = user.email;
        setName(uid);
        setEmail(email);
        // ...
      } else {
        // User is signed out
        // ...
      }
    });
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    axios.get('http://localhost:8080/spotifyCalls/available-genre-seeds', { 'headers': { 'token': accessToken } } )
      .then(res => {
        const data = res.data;
        const genreSeeds = data.body.genres;
        setgenreOptions(genreSeeds.map(genre => ({label: [genre], value: [genre]})));
      })
      .catch(err => {
        console.log('Something went wrong!', err);
      });
    
  }, [accessToken]);

  function findSongs(querySize) {
    if (!durationTime) {
      window.alert("Please Enter a Route!");
      return
    }

    if (selectedGenres.length === 0) {
      window.alert("Please Select a Genre!");
      return;
    }
    
    axios.get(`http://localhost:8080/spotifyCalls/getrecommendations`, { headers: { 'token': accessToken, 'querysize': querySize, 'selectedGenres': selectedGenres } })
    .then(res => {
      const data = res.data.body.tracks;
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
      setPlength(pLength);
    })
    .catch(err => console.log("Something went wrong!", err));
  }

  function handleGenreSelect(e) {
    setSelectedGenres(e.map(genre => genre.value[0]));
  }

  function convertMS(ms) {
    let d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    h += d * 24;

    return  (h ? h + 'h ' : '') +  (h ? m + 'm ' : '') +  (m ? s + 's' : 's')
}

  return (
    <div className='appContainer'>
      <h1>Hi {email}</h1>
      <div className='formContainer'>
        <form onSubmit={handleSubmit}>
          <label>
            Departure:
            <input type="text" value={departure} onChange={(e) => setDeparture(e.target.value)} className="input"/>
          </label>
          <label>
            Arrival:
            <input type="text" value={arrival} onChange={(e) => setArrival(e.target.value)} className="input"/>
          </label>
          <button type="submit">Submit</button>
        </form>
        <h1>Distance:{distance}</h1>
        <h1>Duration:{duration}</h1>
        <div className='genreContainer'>
          <Select
            placeholder="Select Genres"
            isMulti
            name="genres"
            options={genreOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={e => handleGenreSelect(e)}
            />
        </div>
      </div>
      <Button onClick={() => findSongs(20)} colorScheme="green" size="md">Find Songs</Button>
      {tracks.length > 0 && <div style={{overflowy: 'auto'}} className="songs">
          <div className='trackInfo'>
            <div className='numSongs'>Number of songs: {tracks.length}</div>
            <div className='plength'>Playlist Length: {convertMS(plength)}</div>
          </div>
            {tracks.map(track => (
                <DisplayTrack track={track} key={track.uri}/>
            ))}
      </div>}
    </div>
  );
}

export default Dashboard;
