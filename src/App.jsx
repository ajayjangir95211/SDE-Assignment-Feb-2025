import { useEffect, useState } from "react";
import "./App.css";

const logRegex =
  /^(\S+) \S+ \S+ \[(.*?)\] "(.*?)" (\d+) (\d+) "(.*?)" "(.*?)"$/;

const months = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    function getWhereIsWishi() {
      fetch(`https://api.wishlink.dev/whereiswishi?`)
        .then((res) => console.log(res))
        .catch((err) => {
          console.error(err);
        });
    }

    getWhereIsWishi();

    const fetchData = async () => {
      try {
        const response = await fetch("/log.txt");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text();
        console.log(text);
        const data = text
          .split("\n")
          .slice(0, 1)
          .forEach((e) => {
            const match = e.match(logRegex);

            const date = match[2].split(":")[0];
            console.log(
              `${date.split("/")[2]}-${months[date.split("/")[1]]}-${
                date.split("/")[0]
                // }T${match[2].split(":")[1]}:${match[2].split(":")[2]}:${
                // match[2].split(":")[3]
              }`
            );
          });
      } catch (error) {
        console.error(error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    // fetchData();
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return <p>Success!</p>;
}

export default App;
