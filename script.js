const API_KEY = "a2b51079fbb99087af7f391cd490c469";

// Tema
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Aplicar tema guardado
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme + '-mode';
    
    // Cargar historial
    showHistory();
    
    // Obtener clima por ubicación si el usuario lo permite
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                    const response = await fetch(url);
                    const data = await response.json();
                    displayWeather(data);
                    await displayForecast(data.name);
                } catch (err) {
                    console.warn("No se pudo obtener ubicación:", err);
                }
            },
            () => console.log("Geolocalización denegada")
        );
    }
});

async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Por favor, ingresa una ciudad.");
        return;
    }
    await fetchWeather(city);
}

async function quickSearch(city) {
    document.getElementById("cityInput").value = city;
    await fetchWeather(city);
}

async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Ciudad no encontrada`);
        const data = await response.json();
        displayWeather(data);
        await displayForecast(city);
        saveSearch(city);
    } catch (error) {
        document.getElementById("result").innerHTML = `<p class="error">❌ ${error.message}. Verifica el nombre de la ciudad.</p>`;
        document.getElementById("forecast").innerHTML = '';
    }
}

function displayWeather(data) {
    const { main, weather, name, sys } = data;
    const temp = main.temp;
    const humidity = main.humidity;
    const description = weather[0].description;
    const iconCode = weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const advice = getAdvice(temp, description);

    document.getElementById("result").innerHTML = `
        <div class="weather-header">
            <img src="${iconUrl}" alt="Clima" class="weather-icon">
            <h2>📍 ${name}, ${sys.country}</h2>
        </div>
        <div class="weather-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
            </svg>
            Temperatura: <strong>${temp.toFixed(1)}°C</strong>
        </div>
        <div class="weather-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
            </svg>
            Humedad: <strong>${humidity}%</strong>
        </div>
        <div class="weather-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Clima: <strong>${description}</strong>
        </div>
        <p style="margin-top: 15px; font-style: italic;">💡 Consejo: ${advice}</p>
    `;
}

function getAdvice(temp, description) {
    if (temp > 30) return "🔥 ¡Hace mucho calor! Lleva agua y usa protector solar.";
    if (temp < 10) return "❄️ Frío intenso. Ponte abrigo y guantes.";
    if (description.includes("rain") || description.includes("storm")) return "🌧️ Lluvia prevista. No olvides tu paraguas.";
    if (description.includes("cloud")) return "☁️ Nublado, pero sin lluvia. Ideal para salir.";
    if (description.includes("clear")) return "☀️ Cielo despejado. ¡Perfecto para disfrutar al aire libre!";
    return "🌤️ Clima agradable. ¡Disfruta el día!";
}

async function displayForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const daily = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

        let cards = daily.map(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('es', { weekday: 'short' });
            const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
            return `
                <div class="forecast-card">
                    <div>${dayName}</div>
                    <img src="${icon}" alt="clima" style="width:40px;height:40px;">
                    <div>${day.main.temp.toFixed(0)}°C</div>
                </div>
            `;
        }).join('');

        document.getElementById("forecast").innerHTML = `
            <div class="forecast-title">📅 Pronóstico (5 días)</div>
            <div class="forecast-cards">${cards}</div>
        `;
    } catch (err) {
        document.getElementById("forecast").innerHTML = '';
    }
}

// Historial
function saveSearch(city) {
    let searches = JSON.parse(localStorage.getItem('searches')) || [];
    if (!searches.includes(city)) {
        searches = [city, ...searches.slice(0, 4)]; // Máximo 5
        localStorage.setItem('searches', JSON.stringify(searches));
        showHistory();
    }
}

function showHistory() {
    const history = JSON.parse(localStorage.getItem('searches')) || [];
    if (history.length === 0) {
        document.getElementById("history").innerHTML = '';
        return;
    }

    const historyList = history.map(c => `<li>${c}</li>`).join('');
    document.getElementById("history").innerHTML = `
        <div class="history-title">
            <span>🔍 Historial reciente</span>
            <button class="clear-btn" onclick="clearHistory()">Limpiar</button>
        </div>
        <ul>${historyList}</ul>
    `;
}

function clearHistory() {
    localStorage.removeItem('searches');
    showHistory();
}