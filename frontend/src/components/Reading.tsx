import { IonButton, IonItem, IonLabel, IonNote } from "@ionic/react";
import { Reading } from "../data/reading";
import React, { useEffect, useState } from "react";

interface ReadingProps {
  reading: Reading;
}

const getHeaders = () => {
  let headers;
  if (localStorage.getItem("salty_token")) {
    headers = new Headers({
      Authorization: "Bearer " + localStorage.getItem("salty_token"),
    });
  }
  return headers;
};

const ReadingItem: React.FC<ReadingProps> = ({ reading }) => {
  const [todaysReading, setTodaysReading] = useState(reading);
  useEffect(() => {}, [todaysReading]);
  const toggleComplete = () => {
    fetch(
      process.env.REACT_APP_SERVICE_BASE_URL +
        "/readings/" +
        reading.id +
        "/toggle-complete",
      {
        method: "post",
        headers: getHeaders(),
      }
    )
      .then((response) => response.json())
      .then(
        (readingJson: {
          id: any;
          date: string | number | Date;
          verses: any;
          label: any;
          complete: any;
          reading_plan_id: any;
          reading_day_index: any;
        }) => {
          const updatedReading = {
            id: readingJson.id,
            date: new Date(readingJson.date),
            verses: readingJson.verses,
            label: readingJson.label,
            complete: readingJson.complete,
            readingPlanId: readingJson.reading_plan_id,
            readingDayIndex: readingJson.reading_day_index,
          } as Reading;
          setTodaysReading(updatedReading);
        }
      );
  };

  return (
    <div>
      <code>
        <pre>{JSON.stringify(todaysReading, null, 2)}</pre>
      </code>
      <IonButton onClick={toggleComplete}>Toggle Complete</IonButton>
    </div>
  );
};

export default ReadingItem;
