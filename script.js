document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const cityInput = document.getElementById('city-input');

    loadHistory();

    searchButton.addEventListener('click', () => {
        const cityName = cityInput.value.trim();
        if (cityName) {
            fetchWeatherData(cityName);
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

function fetchWeatherData(cityName) {
    const apiKey = '35d84be1378a9aefb8228a70d9bee481';
    fetchCurrentWeather(cityName, apiKey);
    fetchForecastWeather(cityName, apiKey);
    saveToHistory(cityName);
}

function fetchCurrentWeather(cityName, apiKey) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => displayCurrentWeather(data))
        .catch(error => {
            console.error('Error fetching current weather:', error);
            alert('Failed to fetch current weather data.');
        });
}

function displayCurrentWeather(data) {
    if (data.cod !== 200) {
        alert('Failed to fetch current weather data: ' + data.message);
        return;
    }

    const currentWeatherDiv = document.getElementById('current-weather');
    const date = new Date().toLocaleDateString('en-US');
    currentWeatherDiv.innerHTML = `
        <h2>${data.name} (${date})</h2>
        <div class="weather-condition">
            <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
            <p>Temperature: ${data.main.temp.toFixed(1)}°F</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind Speed: ${data.wind.speed.toFixed(1)} mph</p>
        </div>
    `;
}

function fetchForecastWeather(cityName, apiKey) {
    const forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=imperial`;

    fetch(forecastWeatherUrl)
        .then(response => response.json())
        .then(data => displayForecastWeather(data))
        .catch(error => {
            console.error('Error fetching forecast:', error);
            alert('Failed to fetch forecast data.');
        });
}

function displayForecastWeather(data) {
    if (data.cod !== "200") {
        alert('Failed to fetch forecast data: ' + data.message);
        return;
    }

    const forecastWeatherDiv = document.getElementById('forecast-weather');
    forecastWeatherDiv.innerHTML = '<h2>5-Day Forecast:</h2><div class="forecast-cards"></div>';
    const forecastCardsDiv = forecastWeatherDiv.querySelector('.forecast-cards');

    const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.includes('12:00:00'));

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt_txt).toLocaleDateString('en-US');
        forecastCardsDiv.innerHTML += `
            <div class="forecast-card">
                <h3>${date}</h3>
                <img src="https://openweathermap.org/img/w/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                <p>Temp: ${forecast.main.temp.toFixed(1)}°F</p>
                <p>Wind: ${forecast.wind.speed.toFixed(1)} mph</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
            </div>
        `;
    });
}

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
        searchHistoryDiv.appendChild(button);
    });
}

window.onload = () => {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    if (history.length > 0) {
        fetchWeatherData(history[0]);
    }
};
