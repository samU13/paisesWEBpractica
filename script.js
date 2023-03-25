"use strict";

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");
const inputSearch = document.querySelector(".input__search");

const renderError = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
  countriesContainer.style.opacity = 1;
};

const renderCountry = function (dataC, className = "") {
  const html = `
        <article class="country ${className}">
        <img class="country__img" src="${dataC.flags.png}" />
        <div class="country__data">
          <h3 class="country__name">${dataC.name.common}</h3>
          <h4 class="country__region">${dataC.region}</h4>
          <p class="country__row"><span>👫</span>${(
            +dataC.population / 1000000
          ).toFixed(1)} M</p>
          <p class="country__row"><span>🗣️</span>${
            dataC.languages[Object.keys(dataC.languages)[0]]
          }</p>
          <p class="country__row"><span>💰</span>${
            dataC.currencies[Object.keys(dataC.currencies)[0]].name
          }</p>
          <p class="country__row"><span>🗺️</span>${dataC.area} km²</p>
          <p class="country__row"><span>🏛️</span>${dataC.capital}</p>
        </div>
        </article>
        `;

  countriesContainer.insertAdjacentHTML("beforeend", html);

  countriesContainer.style.opacity = 1;
};

const getJSON = function (url, errorMsg = "Something went wrong") {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`${errorMsg} (${response.status})`);
    }
    return response.json();
  });
};

const getCountryData = async function (country) {
  try {
    //Country 1 km²
    const data = await getJSON(
      `https://restcountries.com/v3.1/name/${country}`,
      "Country not found"
    );
    console.log(data);
    renderCountry(data[0]);
    const neighbour = data[0].borders;
    console.log(neighbour);
    if (!neighbour) throw new Error("No neighbour not found!");
    for (const neighbor of neighbour) {
      const dataN = await getJSON(
        `https://restcountries.com/v3.1/alpha/${neighbor}`,
        "Country not found"
      );
      renderCountry(dataN[0], "neighbour");
    }
  } catch (err) {
    console.log(`${err} 🔥🔥🔥🔥🔥🔥`);
    //renderError(`🧨 ${err.message}`);

    // Reject promise returned from async function
    throw err;
  }
};

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const whereAmI = async function (country) {
  try {
    //Geolocation
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;

    //Reverse geocoding
    const resGeo = await fetch(
      `https://geocode.xyz/${lat},${lng}?geoit=json&auth=109786097683711e15872383x49451`
    );
    if (!resGeo.ok) throw new Error("Problem getting location data 🗺️");
    const dataGeo = await resGeo.json();

    //Render country
    getCountryData(dataGeo.country);
    return `You are in ${dataGeo.city}, ${dataGeo.country}!`;
  } catch (err) {
    console.log(`${err} 🔥🔥🔥🔥🔥🔥`);
    renderError(`🧨 ${err.message}`);

    // Reject promise returned from async function
    throw err;
  }
};

inputSearch.addEventListener("keypress", function (e) {
  if (event.key === "Enter") {
    event.preventDefault();
    countriesContainer.innerHTML = "";
    let countryValue = inputSearch.value;
    getCountryData(countryValue);
  }
});

btn.addEventListener("click", function () {
  countriesContainer.innerHTML = "";
  whereAmI();
});
