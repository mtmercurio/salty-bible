import React, { useEffect, useState } from "react";
import { getUsers, User } from "../data/users";
import { IonButton, IonContent, IonList, IonPage } from "@ionic/react";
import { useHistory } from "react-router";

const Auth: React.FC = () => {
  const [authUrl, setAuthUrl] = useState("");
  const history = useHistory();

  useEffect(() => {
    /**
     * Construct URL for the callback route.
     */
    const url = new URL(
      process.env.REACT_APP_SERVICE_BASE_URL + "/google/callback"
    );

    /**
     * Add the query provided by google.
     */
    url.search = window.location.search;

    /**
     * Send the final request. You can use Axios if you want.
     */
    const response = fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((data) => data.json())
      .then((resp) => {
        fetch(process.env.REACT_APP_SERVICE_BASE_URL + "/authcheck", {
          method: "get",
          headers: new Headers({
            Authorization: "Bearer " + resp.token,
          }),
        })
          .then((resp) => resp.json())
          .then((data) => {
            if (data.isAuthenticated) {
              localStorage.setItem("salty_token", resp.token);
              history.push("/login");
            }
          });
      });
  }, []);

  return (
    <IonPage id="auth-page">
      <IonContent fullscreen></IonContent>
    </IonPage>
  );
};

export default Auth;
