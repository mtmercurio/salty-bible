import React, {useEffect, useState} from 'react';
import {getUsers, User} from '../data/users';
import {
    IonButton,
  IonContent,
  IonList,
  IonPage,
} from '@ionic/react';
import UserListItem from "../components/UserListItem";

const Login: React.FC = () => {

  const [users, setUsers] = useState<User[]>([]);
  const [authUrl, setAuthUrl] = useState("");

  useEffect(() => {
    fetch('https://salty.yas.family/api/google/redirect').then(response => response.json())
    .then(data => {
        setAuthUrl(data.redirectUrl);
    })


  }, []);

  const getHeaders = () => {
    let headers;
    if (localStorage.getItem('salty_token')) {
      headers = new Headers({
        'Authorization': 'Bearer ' + localStorage.getItem('salty_token')
      })
    }
    return headers;
  }

  const testClick = () => {
    fetch('https://salty.yas.family/api/authcheck', { 
    method: 'get', 
    headers: getHeaders()
}).then((response) => response.json()).then(d=>console.log(d))
  }

  const logoutClick = () => {
      fetch('https://salty.yas.family/api/logout', {
        method: 'post', 
        headers: getHeaders()
    }).then((response) => response.json()).then(d=>console.log(d))
  }

  return (
    <IonPage id="login-page">
      <IonContent fullscreen>
        <IonButton href={authUrl}>Login</IonButton>
        <IonButton onClick={testClick}>Test Auth</IonButton>
        <IonButton onClick={logoutClick}>Logout</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;
