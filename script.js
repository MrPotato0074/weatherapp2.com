const cityNameOutput = document.getElementById("city-name-output");
const temperatureOutput = document.getElementById("temperature-output");
const descriptionOutput = document.getElementById("description-output");
const logoOutput = document.getElementById("logo");
const weatherBtn = document.getElementById("weather-btn");
const weatherInput = document.getElementById("weather-input");
const errorOutput = document.getElementById("error");
console.log(`hello`);

const favoritesDropdown = document.getElementById("favorites-dropdown");
const favoriteBtn = document.getElementById("favorite-btn");
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

const updateFavoritesDropdown = () => {
    favoritesDropdown.innerHTML = '<option value="" disabled selected>Select a favorite city</option>';
    favorites.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        favoritesDropdown.appendChild(option);
    });
};

const updateFavoriteButton = () =>{
    if(favorites.includes(weatherInput.value)){
        favoriteBtn.classList.add("active");
    } else{
        favoriteBtn.classList.remove("active");
    }
}

const getWeather = () => {
    const apiKey = '75c995f5d7a351cb8a000e1547d5c2e5';
    const inputCity = weatherInput.value.toLowerCase();
    const currentWeather = `https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&appid=${apiKey}`;
    const forecast = `https://api.openweathermap.org/data/2.5/forecast?q=${inputCity}&appid=${apiKey}`;
    
    fetch(currentWeather)
    .then(response => {
        if (!response.ok) {
            
            if (response.status === 404) {
                throw new Error(`City not found. Please enter a valid city name.`);
            }else if (response.status === 500) {
                throw new Error('Server error!');
              } else {
                throw new Error(`No response from server!`);
            }
        }
        document.getElementById("weather-output").style.display = "none";
        document.getElementById("loading").style.display = "flex";
        return response.json();
    })
    .then(data => {
        const cityName = data.name;
        const temperature = Math.round(data.main.temp - 273.15);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl =  `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        cityNameOutput.innerHTML = cityName;
        temperatureOutput.innerHTML = `${temperature}°C`;
        descriptionOutput.innerHTML = description;
        logoOutput.src = iconUrl;
        

        return fetch(forecast);
    })
    .then(response => response.json())
    .then(forecastData => {
        const forecastContainer = document.getElementById("forecast-days");
        forecastContainer.innerHTML = "";
        const dailyForecasts = forecastData.list.filter(item => {
            return item.dt_txt.includes("12:00:00");
        }).slice(0, 3);
        
        dailyForecasts.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString("EN-UK", { weekday: "short" });
            const temp = Math.round(day.main.temp - 273.15);
            const iconCode = day.weather[0].icon;
            
            const dayElement = document.createElement("div");
            dayElement.className = "forecast-day";
            dayElement.innerHTML = `
                <div>${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${day.weather[0].description}">
                <div>${temp}°C</div>
                <div>${day.weather[0].description}</div>
            `;
            errorOutput.style.display = "none";
            forecastContainer.appendChild(dayElement);
        document.getElementById("loading").style.display = "none";
        document.getElementById("forecast-container").style.display = "block";
        changeCss();
        });
    })
    .catch(error => {
        document.getElementById("weather-output").style.display = "none";
        console.error('Error fetching data:', error.message);
        errorOutput.innerHTML = error.message;
        errorOutput.style.display = "block";
    });
};

const changeCss = () => {
    // favoritesDropdown.classList.add("show-favorites");
    document.getElementById("weather-output").style.display = "flex";
    
};

weatherBtn.addEventListener("click", () => {
    errorOutput.innerHTML = '';
    getWeather();
});

weatherInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        errorOutput.innerHTML = '';
        getWeather();
    }
});

favoriteBtn.addEventListener("click", () => {
    const inputCity = weatherInput.value.trim();
    if(!inputCity){
        return;
    }

    if(favorites.includes(inputCity)){
        favorites = favorites.filter(c => c !== inputCity);
        favoriteBtn.classList.remove("active");
    } else{
        favorites.push(inputCity);
        favoriteBtn.classList.add("active");
    }
    favorites.sort((a, b) => a.localeCompare(b));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesDropdown();
});

weatherInput.addEventListener('input', updateFavoriteButton);

favoritesDropdown.addEventListener("change", (elem) => {
    if (elem.target.value) {
        weatherInput.value = elem.target.value;
        if(favorites.includes(elem.target.value)){
            favoriteBtn.classList.add("active");
        } else{
            favoriteBtn.classList.remove("active");
        }
        getWeather();
    }
});

updateFavoritesDropdown();
updateFavoriteButton();
