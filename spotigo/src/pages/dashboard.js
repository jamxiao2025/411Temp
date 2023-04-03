import { Link,Heading, Text, Container, Box, Flex, VStack, FormLabel, FormControl, Input, FormErrorMessage, Button, Checkbox} from '@chakra-ui/react'
import React from 'react'
import {Formik, Field} from "formik"
import {auth} from '../firebase'
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState } from "react";


function Dashboard(){
    const [name, setName] = useState("")
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
  return (
    <h1>Hi {name}</h1>
  )
}

export default Dashboard