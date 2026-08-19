const API_KEY = "dd9c37b1da1cc3d1981235e7db930ef1";
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';

const searchInput = document.getElementById("searchInput");
const weatherInfo = document.getElementById("weatherInfo");
const searchBtn = document.getElementById("searchBtn");
const historyList = document.getElementById("historyList");
const suggestionsList = document.getElementById("suggestions");

let searchHistory = JSON.parse(localStorage.getItem("climaHistory")) || [];
let suggestionsTimeout;

const weatherIcons = {
    'Clear': 'fas fa-sun',
    'Clouds': 'fas fa-cloud',
    'Rain': 'fas fa-cloud-rain',
    'Drizzle': 'fas fa-cloud-rain',
    'Thunderstorm': 'fas fa-bolt',
    'Snow': 'fas fa-snowflake',
    'Mist': 'fas fa-smog',
    'Smoke': 'fas fa-smog',
    'Haze': 'fas fa-smog',
    'Dust': 'fas fa-wind',
    'Fog': 'fas fa-smog',
    'Sand': 'fas fa-wind',
    'Ash': 'fas fa-smog',
    'Squall': 'fas fa-wind',
    'Tornado': 'fas fa-tornado'
};

searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeather(city);
        suggestionsList.classList.remove("active");
    }
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) {
            getWeather(city);
            suggestionsList.classList.remove("active");
        }
    }
});

searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(suggestionsTimeout);
    
    if (query.length < 2) {
        suggestionsList.classList.remove("active");
        return;
    }
    
    suggestionsTimeout = setTimeout(() => {
        getSuggestions(query);
    }, 300);
});

async function getSuggestions(query) {
    try {
        const response = await fetch(
            `${GEO_API_URL}?q=${query}&limit=5&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            suggestionsList.classList.remove("active");
            return;
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            suggestionsList.classList.remove("active");
            return;
        }
        
        displaySuggestions(data);
        
    } catch (error) {
        console.error("Error al obtener sugerencias:", error);
        suggestionsList.classList.remove("active");
    }
}

function displaySuggestions(cities) {
    suggestionsList.innerHTML = "";
    
    cities.forEach(city => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${city.name}, ${city.country}`;
        
        div.addEventListener("click", () => {
            searchInput.value = city.name;
            suggestionsList.classList.remove("active");
            getWeather(city.name);
        });
        
        suggestionsList.appendChild(div);
    });
    
    suggestionsList.classList.add("active");
}

document.addEventListener("click", (e) => {
    if (e.target !== searchInput) {
        suggestionsList.classList.remove("active");
    }
});

async function getWeather(city) {
    weatherInfo.innerHTML = '<p class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando...</p>';
    
    try {
        const response = await fetch(
            `${API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=es`
        );

        if (!response.ok) {
            throw new Error("Ciudad no encontrada");
        }

        const data = await response.json();
        displayWeather(data);
        addToHistory(data.name);
        searchInput.value = "";

    } catch (error) {
        weatherInfo.innerHTML = `
            <div class="error active">
                <i class="fas fa-exclamation-circle"></i> ${error.message}
            </div>
        `;
    }
}

function displayWeather(data) {
    const { name, sys, main, weather, wind } = data;
    
    const iconClass = weatherIcons[weather[0].main] || 'fas fa-cloud';
    
    weatherInfo.innerHTML = `
        <div class="weather-info active">
            <div class="city-name">${name}, ${sys.country}</div>
            <div class="weather-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="temperature">${Math.round(main.temp)}°C</div>
            <div class="description">${weather[0].description}</div>
            
            <div class="details">
                <div class="detail-item">
                    <strong><i class="fas fa-thermometer-half"></i> Sensación térmica:</strong>
                    ${Math.round(main.feels_like)}°C
                </div>
                <div class="detail-item">
                    <strong><i class="fas fa-droplet"></i> Humedad:</strong>
                    ${main.humidity}%
                </div>
                <div class="detail-item">
                    <strong><i class="fas fa-gauge"></i> Presión:</strong>
                    ${main.pressure} hPa
                </div>
                <div class="detail-item">
                    <strong><i class="fas fa-wind"></i> Viento:</strong>
                    ${Math.round(wind.speed * 3.6)} km/h
                </div>
            </div>
        </div>
    `;
}

function addToHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.unshift(city);
        if (searchHistory.length > 5) {
            searchHistory.pop();
        }
        localStorage.setItem("climaHistory", JSON.stringify(searchHistory));
    }
    displayHistory();
}

function displayHistory() {
    historyList.innerHTML = "";
    
    if (searchHistory.length === 0) {
        historyList.innerHTML = '<p style="color: #999; font-size: 14px;">No hay búsquedas recientes</p>';
        return;
    }
    
    searchHistory.forEach(city => {
        const btn = document.createElement("button");
        btn.className = "history-btn";
        btn.innerHTML = `<i class="fas fa-history"></i> ${city}`;
        btn.addEventListener("click", () => {
            searchInput.value = city;
            getWeather(city);
        });
        historyList.appendChild(btn);
    });
}

displayHistory();