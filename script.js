const API_KEY = "a2b51079fbb99087af7f391cd490c469"; // 👈 CAMBIA ESTO POR TU CLAVE REAL (solo para pruebas)

async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Por favor, ingresa una ciudad.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        const temp = data.main.temp;
        const humidity = data.main.humidity;
        const description = data.weather[0].description;

        document.getElementById("result").innerHTML = `
            <h2>📍 ${data.name}, ${data.sys.country}</h2>
            <p>🌡️ Temperatura: ${temp}°C</p>
            <p>💧 Humedad: ${humidity}%</p>
            <p>☁️ Clima: ${description}</p>
        `;
    } catch (error) {
        document.getElementById("result").innerHTML = `
            <p style="color: red;">❌ Error: ${error.message}</p>
            <p>Verifica que la ciudad exista o que tu API Key sea correcta.</p>
        `;
    }
}