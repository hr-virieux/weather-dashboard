document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const cityInput = document.getElementById('city-input');

    loadHistory();

    searchButton.addEventListener('click', () => {
        const cityName = cityInput.value.trim();
        if (cityName) {
            fetchWeatherData(cityName);
            cityInput.value = '';
        } else {
            alert('Please enter a city name.');
        }
    });

    document.getElementById('search-history').addEventListener('click', (event) => {
        if (event.target && event.target.nodeName === 'BUTTON') {
            fetchWeatherData(event.target.textContent);
        }
    });
});

//weather data
function fetchWeatherData(cityName) {
    const apiKey = '35d84be1378a9aefb8228a70d9bee481';
    fetchCurrentWeather(cityName, apiKey);
    fetchForecastWeather(cityName, apiKey);
    saveToHistory(cityName);
}

//display current weather
function fetchCurrentWeather(cityName, apiKey) {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => displayCurrentWeather(data))
        .catch(error => {
            console.error('Error fetching current weather:', error);
        });
}

function displayCurrentWeather(data) {
    if (data.cod !== 200) {
        console.error('Failed to fetch current weather data:', data.message);
        return;
    }

    const currentWeatherDiv = document.getElementById('current-weather');
    const date = formatDate(new Date(data.dt * 1000));
    currentWeatherDiv.innerHTML = `
        <h2>${data.name} (${date})</h2>
        <div class="weather-condition">
            <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
            <p>Temperature: ${data.main.temp.toFixed(1)}°C</p> <!-- Celsius display -->
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind: ${(data.wind.speed * 3.6).toFixed(1)} km/h</p>
        </div>
    `;
}

//format date to day/month/year
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

//display forecast weather
function fetchForecastWeather(cityName, apiKey) {
    const forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    fetch(forecastWeatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            displayForecastWeather(data);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
        });
}

function displayForecastWeather(data) {
    if (data.cod !== "200") {
        console.error('Failed to fetch forecast data:', data.message);
        return;
    }

    const forecastWeatherDiv = document.getElementById('forecast-weather');
    forecastWeatherDiv.innerHTML = '<h2>5-Day Forecast:</h2><div class="forecast-cards"></div>';
    const forecastCardsDiv = forecastWeatherDiv.querySelector('.forecast-cards');

    data.list.filter((forecast, index) => index % 8 === 0).forEach(forecast => {
        const date = formatDate(new Date(forecast.dt_txt));
        forecastCardsDiv.innerHTML += `
            <div class="forecast-card">
                <h3>${date}</h3>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                <p>Temp: ${forecast.main.temp.toFixed(1)}°C</p> <!-- Temperature in Celsius -->
                <p>Wind: ${(forecast.wind.speed * 3.6).toFixed(1)} km/h</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
            </div>
        `;
    });
}

//local storage
function saveToHistory(cityName) {
    let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    if (!history.includes(cityName)) {
        history.unshift(cityName);
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
        updateHistoryList(history);
    }
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    updateHistoryList(history);
    }
    
    function updateHistoryList(history) {
    const searchHistoryDiv = document.getElementById('search-history');
    searchHistoryDiv.innerHTML = '';
    history.forEach(cityName => {
    const button = document.createElement('button');
    button.textContent = cityName;
    button.className = 'history-btn';
    button.addEventListener('click', () => fetchWeatherData(cityName));
    searchHistoryDiv.appendChild(button);
    });
}

window.onload = () => {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    if (history.length > 0) {
        fetchWeatherData(history[0]);
    }
};
