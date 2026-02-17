/*
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="main">
      <h1>Home</h1>
      <Link to="/restaurant/dummy1" className="home-dummy-link">
        Dummy Restaurant (for testing)
      </Link>
    </div>
  );
}
*/

//
//
//
//
//
// IMPLEMENTING SEARCH FILTERING BY TEXT AND LOCATION SORTING
//
//
//
//
//

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
}

export default function Home() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchText, setSearchText] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortMode, setSortMode] = useState("none");

  /* 
  Pulling all the restaurant documents from Firebase collection. 
  This is basically the initial data load so the page has something to show. 
  Not doing anything fancy here, just looping through the snapshot and building a list.
*/
  useEffect(function () {
    async function loadRestaurants() {
      try {
        const snapshot = await getDocs(collection(db, "restaurants"));

        const list: Restaurant[] = [];
        for (let i = 0; i < snapshot.docs.length; i++) {
          const doc = snapshot.docs[i];
          const data: any = doc.data();

          const item: Restaurant = {
            id: doc.id,
            name: typeof data.name === "string" ? data.name : "",
            description: typeof data.description === "string" ? data.description : "",
            address: typeof data.address === "string" ? data.address : "",
            lat: typeof data.lat === "number" ? data.lat : Number.NaN,
            lng: typeof data.lng === "number" ? data.lng : Number.NaN
          };

          list.push(item);
        }

        setRestaurants(list);
      } catch (error) {
        console.error("Failed to load restaurants:", error);
        setRestaurants([]);
      }
    }

    loadRestaurants();
  }, []);

  /* 
  Asking the browser for the user's current location so we can calculate distances later. 
  This only runs once on page load, and it might fail if the user blocks location access. 
  I mainly use this to sort restaurants by how close they are.
*/
  useEffect(function () {
    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(coords);
      },
      function () {
        console.log("user said no to location");
      }
    );
  }, []);

  /* 
  Basic distance formula to estimate how far two coordinates are from each other. 
  Accurate enough for sorting restaurants by proximity. 
  Keeping it easy to read by hardcoding so it’s easy to debug if something is off.
*/
  function getDistance(aLat: number, aLng: number, bLat: number, bLng: number) {
    if (
      !Number.isFinite(aLat) ||
      !Number.isFinite(aLng) ||
      !Number.isFinite(bLat) ||
      !Number.isFinite(bLng)
    ) {
      return Number.POSITIVE_INFINITY;
    }

    const R = 6371;
    const dLat = (bLat - aLat) * (Math.PI / 180);
    const dLng = (bLng - aLng) * (Math.PI / 180);

    const x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(aLat * (Math.PI / 180)) *
        Math.cos(bLat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const dist = R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return dist;
  }

  
  /* 
  Filtering the restaurant list based on whatever the user types into the search bar. 
  Just checking name, description, and address fields for a match. 
  This runs on every render but the list is small enough that performance isn’t a big deal.
*/
  let filtered: Restaurant[] = [];
  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    const text = searchText.toLowerCase();

    const nameMatch = r.name.toLowerCase().includes(text);
    const descMatch = r.description.toLowerCase().includes(text);
    const addrMatch = r.address.toLowerCase().includes(text);

    if (nameMatch || descMatch || addrMatch) {
      filtered.push(r);
    }
  }

  
  /* 
  Making a separate copy of the filtered results so we don’t mutate the original one. 
  This keeps the logic cleaner and avoids weird bugs with React state. 
  It also makes the sorting step easier to push about.
*/

  let finalList: Restaurant[] = [];
  for (let i = 0; i < filtered.length; i++) {
    finalList.push(filtered[i]);
  }

  
  /* 
  Sorting the restaurants based on how far they are from the user, depending on the selected mode. 
  Using a simple nested loop here so the logic is super explicit and easy to follow. 
  This only runs when the user has location enabled and chooses a sorting option.
*/
  if (sortMode !== "none" && userLocation !== null) {
    for (let i = 0; i < finalList.length - 1; i++) {
      for (let j = i + 1; j < finalList.length; j++) {
        const a = finalList[i];
        const b = finalList[j];

        const distA = getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);

        let swap = false;

        if (sortMode === "nearest" && distA > distB) {
          swap = true;
        }

        if (sortMode === "farthest" && distA < distB) {
          swap = true;
        }

        if (swap) {
          const temp = finalList[i];
          finalList[i] = finalList[j];
          finalList[j] = temp;
        }
      }
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Restaurants</h1>

      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={function (e) {
          setSearchText(e.target.value);
        }}
        style={{ width: "100%", padding: 10, marginBottom: 12 }}
      />

      <select
        value={sortMode}
        onChange={function (e) {
          setSortMode(e.target.value);
        }}
        style={{ width: "100%", padding: 10, marginBottom: 20 }}
      >
        <option value="none">Sort by…</option>
        <option value="nearest">Nearest first</option>
        <option value="farthest">Farthest first</option>
      </select>

      {[
        { id: "dummy1", name: "Dummy Restaurant (for testing)", description: "", address: "", lat: 0, lng: 0 } as Restaurant,
        ...finalList.filter((r) => r.name && r.name.trim() !== "")
      ].map(function (r) {
        let distanceText = "";
        if (userLocation !== null) {
          const d = getDistance(userLocation.lat, userLocation.lng, r.lat, r.lng);
          distanceText = d.toFixed(2) + " km away";
        }

        return (
          <div
            key={r.id}
            onClick={function () {
              navigate("/restaurant/" + r.id);
            }}
            style={{
              padding: 15,
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 12,
              cursor: "pointer"
            }}
          >
            <h2>{r.name}</h2>
            {r.description ? <p>{r.description}</p> : null}
            {r.address ? <p style={{ fontStyle: "italic" }}>{r.address}</p> : null}
            {userLocation !== null && <p style={{ color: "#555" }}>{distanceText}</p>}
          </div>
        );
      })}
    </div>
  );
}



