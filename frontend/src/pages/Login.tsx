import React, { useEffect, useState } from "react";
import { getUsers, User } from "../data/users";
import { IonButton, IonContent, IonList, IonPage } from "@ionic/react";
import UserListItem from "../components/UserListItem";
import { Reading } from "../data/reading";
import ReadingItem from "../components/Reading";

const Login: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [authUrl, setAuthUrl] = useState("");

  const [userContent, setUserContent] = useState("");
  const [userPlanContent, setUserPlanContent] = useState("");
  const [userPlanStatus, setUserPlanStatus] = useState("");
  const [todaysReading, setTodaysReading] = useState<Reading[]>([]);

  useEffect(() => {
    fetch(process.env.REACT_APP_SERVICE_BASE_URL + "/google/redirect")
      .then((response) => response.json())
      .then((data) => {
        setAuthUrl(data.redirectUrl);
      });
  }, []);

  const getHeaders = () => {
    let headers;
    if (localStorage.getItem("salty_token")) {
      headers = new Headers({
        Authorization: "Bearer " + localStorage.getItem("salty_token"),
      });
    }
    return headers;
  };

  const testClick = () => {
    fetch(process.env.REACT_APP_SERVICE_BASE_URL + "/authcheck", {
      method: "get",
      headers: getHeaders(),
    })
      .then((response) => response.json())
      .then((d) => console.log(d));
  };

  const logoutClick = () => {
    fetch(process.env.REACT_APP_SERVICE_BASE_URL + "/logout", {
      method: "post",
      headers: getHeaders(),
    })
      .then((response) => response.json())
      .then((d) => console.log(d));
  };

  const getUserClick = () => {
    fetch(process.env.REACT_APP_SERVICE_BASE_URL + "/user", {
      method: "get",
      headers: getHeaders(),
    })
      .then((response) => response.json())
      .then((d) => setUserContent(JSON.stringify(d, null, 2)));
  };

  const getUserPlanClick = () => {
    fetch(process.env.REACT_APP_SERVICE_BASE_URL + "/user/plan", {
      method: "get",
      headers: getHeaders(),
    })
      .then((response) => response.json())
      .then((d) => setUserPlanContent(JSON.stringify(d, null, 2)));
  };

  const assignUserTestPlan = () => {
    fetch(process.env.REACT_APP_SERVICE_BASE_URL + "/user/plan/assign", {
      method: "get",
      headers: getHeaders(),
    })
      .then((response) => response.json())
      .then((d) => console.log(d));
  };

  const getUserPlanStatus = () => {
    fetch(process.env.REACT_APP_SERVICE_BASE_URL + "/user/plan/status", {
      method: "get",
      headers: getHeaders(),
    })
      .then((response) => response.json())
      .then((d) => setUserPlanStatus(JSON.stringify(d, null, 2)));
  };

  const getTodaysReading = () => {
    fetch(process.env.REACT_APP_SERVICE_BASE_URL + "/user/plan/today", {
      method: "get",
      headers: getHeaders(),
    })
      .then((response) => response.json())
      .then((d) => {
        // Filter null- reading labels that are all complete (reading plan done), will be null
        // If all readings are complete, this will return nothing
        d.filter((n: any) => n).map(
          (readingJson: {
            id: any;
            date: string | number | Date;
            verses: any;
            label: any;
            complete: any;
            reading_plan_id: any;
            reading_day_index: any;
          }) => {
            const reading = {
              id: readingJson.id,
              date: new Date(readingJson.date),
              verses: readingJson.verses,
              label: readingJson.label,
              complete: readingJson.complete,
              readingPlanId: readingJson.reading_plan_id,
              readingDayIndex: readingJson.reading_day_index,
            } as Reading;
            setTodaysReading((todaysReading) => [...todaysReading, reading]);
          }
        );
      });
  };

  return (
    <IonPage id="login-page">
      <IonContent fullscreen>
        <IonButton href={authUrl}>Login</IonButton>
        <IonButton onClick={testClick}>Test Auth</IonButton>
        <IonButton onClick={logoutClick}>Logout</IonButton>

        <div>
          <IonButton onClick={getUserClick}>Get User</IonButton>
          <code>
            <pre>{userContent}</pre>
          </code>
        </div>

        <div>
          <IonButton onClick={getUserPlanClick}>Get User's Plan</IonButton>
          <IonButton onClick={assignUserTestPlan}>
            Assign Default Plan
          </IonButton>
          <IonButton onClick={getUserPlanStatus}>Plan Status</IonButton>
          <code>
            <pre>{userPlanStatus}</pre>
          </code>
          <code>
            <pre>{userPlanContent}</pre>
          </code>
        </div>

        <div>
          <IonButton onClick={getTodaysReading}>Get Today's Reading</IonButton>
          {todaysReading.map((r) => (
            <ReadingItem key={r.id} reading={r} />
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
