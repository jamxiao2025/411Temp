import React from 'react'

const AUTH_URL = process.env.REACT_APP_SPOTIFY_AUTH_URL;

export default function Login() {
  return (
        <a className='btn btn-success btn-lg' href={AUTH_URL} >Login With Spotify</a>
  )
}
