import React from 'react';
import {Button} from '@chakra-ui/react';

const AUTH_URL = process.env.REACT_APP_SPOTIFY_AUTH_URL;

export default function Login() {
  return (
        <Button onClick={() => window.location.href = (AUTH_URL)} colorScheme="green" size="md" >Login With Spotify</Button>
  )
}
