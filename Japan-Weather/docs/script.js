const API_KEY = "2e2e13eef83f05a83c1ae98da64b4dd2";
let currentCity = localStorage.getItem("lastCity") || "Tokyo";
let currentLat = 0;
let currentLon = 0;
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Переключение темы
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.querySelector(".theme-toggle");
    const isDark = document.body.classList.contains("dark-mode");
    btn.textContent = isDark ? "☀️" : "🌙";
}

// Проверяем сохранённую тему при загрузке
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}

// Преобразование имени в японскую катакану + хирагана + подсказка
function showJapaneseName() {
    let name = document.getElementById("nameInput").value.trim();
    if (!name) name = "Гость";
    
    // Более точное преобразование русских звуков в катакану
    const katakanaMap = {
        'а':'ア','б':'ブ','в':'ヴ','г':'グ','д':'ド','е':'エ','ё':'ョ',
        'ж':'ジュ','з':'ズ','и':'イ','й':'イ','к':'ク','л':'ル','м':'ム',
        'н':'ン','о':'オ','п':'プ','р':'ル','с':'ス','т':'ト','у':'ウ',
        'ф':'フ','х':'ハ','ц':'ツ','ч':'チ','ш':'シ','щ':'シュ','ы':'ィ',
        'э':'エ','ю':'ユ','я':'ヤ',' ':' '
    };
    
    // Хирагана (мягкий вариант)
    const hiraganaMap = {
        'а':'あ','б':'ぶ','в':'ゔ','г':'ぐ','д':'ど','е':'え','ё':'ょ',
        'ж':'じゅ','з':'ず','и':'い','й':'い','к':'く','л':'る','м':'む',
        'н':'ん','о':'お','п':'ぷ','р':'る','с':'す','т':'と','у':'う',
        'ф':'ふ','х':'は','ц':'つ','ч':'ち','ш':'し','щ':'しゅ','ы':'ぃ',
        'э':'え','ю':'ゆ','я':'や',' ':' '
    };
    
    let katakana = "";
    let hiragana = "";
    
    for (let char of name.toLowerCase()) {
        katakana += katakanaMap[char] || char.toUpperCase();
        hiragana += hiraganaMap[char] || char.toUpperCase();
    }
    
    // Создаём красивый вывод с обоими вариантами
    const japaneseNameEl = document.getElementById("japaneseName");
    japaneseNameEl.innerHTML = `
        <div class="japanese-name-display">
            <div class="katakana">${katakana}</div>
            <div class="hiragana">${hiragana}</div>
            <div class="honorific">さん ようこそ！</div>
            <div class="romaji">(${transliterateToRomaji(name)})</div>
            <button class="speak-btn" onclick="speakJapaneseName('${katakana}')" title="Прослушать">🔊 Прослушать</button>
        </div>
    `;
    
    // Добавляем анимацию
    japaneseNameEl.classList.add('name-appear');
    setTimeout(() => japaneseNameEl.classList.remove('name-appear'), 600);
    
    // Воспроизводим звук приветствия
    playSound('welcome');
}

// Проговариваем имя на японском
function speakJapaneseName(japaneseName) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(japaneseName);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    } else {
        alert("Ваш браузер не поддерживает синтез речи");
    }
}

// Звуковые эффекты (нежные и приятные)
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'welcome') {
            // Мелодичный приветственный звук (три ноты)
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.3);
            
            oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime + 0.1); // D5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        } else if (type === 'success') {
            // Нежная мелодия успеха (восходящие ноты)
            gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.02, audioContext.currentTime + 0.3);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'click') {
            // Мягкий звук клика
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.frequency.value = 400;
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        }
    } catch (e) {
        console.log("Аудио контекст недоступен");
    }
}

// Преобразование в ромадзи для справки
function transliterateToRomaji(name) {
    const romajiMap = {
        'а':'a','б':'bu','в':'vu','г':'gu','д':'du','е':'e','ё':'yo',
        'ж':'ju','з':'zu','и':'i','й':'i','к':'ku','л':'ru','м':'mu',
        'н':'n','о':'o','п':'pu','р':'ru','с':'su','т':'to','у':'u',
        'ф':'fu','х':'ha','ц':'cu','ч':'chi','ш':'shi','щ':'shu','ы':'yi',
        'э':'e','ю':'yu','я':'ya',' ':' '
    };
    
    let romaji = "";
    for (let char of name.toLowerCase()) {
        romaji += romajiMap[char] || char;
    }
    return romaji.charAt(0).toUpperCase() + romaji.slice(1);
}

// Получение погоды из dropdown списка
async function getWeather() {
    const city = document.getElementById("citySelect").value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ru`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.main) {
            currentCity = city;
            currentLat = data.coord.lat;
            currentLon = data.coord.lon;
            localStorage.setItem("lastCity", currentCity);
            updateWeatherUI(data);
            getForecast(data.coord.lat, data.coord.lon);
            updateTime();
        }
    } catch (error) {
        document.getElementById("desc").textContent = "Ошибка загрузки 😔";
        console.error("Ошибка:", error);
    }
}

// Поиск по названию города
function searchWeather() {
    const searchInput = document.getElementById("searchCity").value.trim();
    if (searchInput) {
        getWeatherFromInput(searchInput);
    } else {
        alert("Введи название города!");
    }
}

// Получение погоды по введённому названию
async function getWeatherFromInput(cityName) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=ru`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.main) {
            currentCity = data.name;
            currentLat = data.coord.lat;
            currentLon = data.coord.lon;
            localStorage.setItem("lastCity", currentCity);
            
            // Добавляем в историю
            addToHistory(data.name);
            
            updateWeatherUI(data);
            getForecast(data.coord.lat, data.coord.lon);
            updateTime();
            document.getElementById("searchCity").value = "";
        } else {
            alert("Город не найден! 😔");
        }
    } catch (error) {
        alert("Ошибка при поиске города!");
        console.error("Ошибка:", error);
    }
}

// Обновление UI с данными о погоде
function updateWeatherUI(data) {
    document.getElementById("city").textContent = data.name + " " + getFlagEmoji(data.sys.country);
    document.getElementById("temp").textContent = Math.round(data.main.temp) + "°C";
    document.getElementById("feelsLike").textContent = Math.round(data.main.feels_like) + "°C";
    document.getElementById("humidity").textContent = data.main.humidity + "%";
    document.getElementById("wind").textContent = data.wind.speed.toFixed(1) + " м/с";
    document.getElementById("pressure").textContent = data.main.pressure + " гПа";
    document.getElementById("clouds").textContent = data.clouds.all + "%";
    document.getElementById("visibility").textContent = (data.visibility / 1000).toFixed(1) + " км";
    document.getElementById("coords").textContent = data.coord.lat.toFixed(2) + ", " + data.coord.lon.toFixed(2);
    document.getElementById("currentCoords").textContent = data.coord.lat.toFixed(4) + ", " + data.coord.lon.toFixed(4);
    
    // Восход и закат
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById("sunrise").textContent = String(sunrise.getHours()).padStart(2, '0') + ":" + String(sunrise.getMinutes()).padStart(2, '0');
    document.getElementById("sunset").textContent = String(sunset.getHours()).padStart(2, '0') + ":" + String(sunset.getMinutes()).padStart(2, '0');
    
    // Часовой пояс
    const timezoneOffset = data.timezone / 3600;
    const tzSign = timezoneOffset >= 0 ? '+' : '';
    document.getElementById("timezone").textContent = `UTC${tzSign}${timezoneOffset}`;
    
    document.getElementById("desc").textContent = 
        getWeatherDescription(data.weather[0].main) + " " + getWeatherEmoji(data.weather[0].main);
    
    // Вероятность дождя (если есть в данных)
    const rainProb = data.rain ? Object.values(data.rain)[0] * 100 : (data.clouds.all > 70 ? "60" : "0");
    document.getElementById("rain").textContent = Math.round(rainProb) + "%";
    
    // Звук успеха
    playSound('success');
}

// Получение флага страны по коду
function getFlagEmoji(countryCode) {
    const flags = {
        'JP': '🇯🇵', 'US': '🇺🇸', 'RU': '🇷🇺', 'CN': '🇨🇳', 'KR': '🇰🇷',
        'DE': '🇩🇪', 'FR': '🇫🇷', 'GB': '🇬🇧', 'IT': '🇮🇹', 'IN': '🇮🇳',
        'AU': '🇦🇺', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷', 'ZA': '🇿🇦'
    };
    return flags[countryCode] || '🌍';
}

function getWeatherEmoji(condition) {
    const emojis = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Drizzle': '🌦️',
        'Squall': '🌪️'
    };
    return emojis[condition] || '🌤️';
}

// Описание погоды на русском с переводом на японский (с хираганой)
function getWeatherDescription(condition) {
    const descriptions = {
        'Clear': 'Ясная погода (晴れ - はれ)',
        'Clouds': 'Облачно (曇り - くもり)',
        'Rain': 'Дождь (雨 - あめ)',
        'Thunderstorm': 'Гроза (雷 - かみなり)',
        'Snow': 'Снегопад (雪 - ゆき)',
        'Mist': 'Туман (霧 - きり)',
        'Drizzle': 'Небольшой дождик (小雨 - こさめ)',
        'Squall': 'Порывистый ветер (突風 - とっぷう)'
    };
    return descriptions[condition] || 'Неизвестное состояние (不明 - ふめい)';
}

// Получение прогноза на 5 дней
async function getForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // 5-дневный прогноз (берем каждые 24 часа)
        const forecasts = [8, 16, 24, 32, 40];
        const forecastHTML = forecasts.map(idx => {
            if (idx >= data.list.length) return '';
            
            const forecast = data.list[idx];
            const date = new Date(forecast.dt * 1000);
            const day = date.toLocaleDateString('ru-RU', { weekday: 'short', month: 'short', day: 'numeric' });
            const tempMin = Math.round(forecast.main.temp_min);
            const tempMax = Math.round(forecast.main.temp_max);
            const icon = getWeatherEmoji(forecast.weather[0].main);
            
            return `
                <div class="forecast-card">
                    <p class="forecast-day">${day}</p>
                    <p class="forecast-icon">${icon}</p>
                    <p class="forecast-temp">${tempMin}°C — ${tempMax}°C</p>
                    <p class="forecast-desc">${forecast.weather[0].main}</p>
                </div>
            `;
        }).join('');
        
        document.getElementById("forecastGrid").innerHTML = forecastHTML;
        
        // Почасовой прогноз на ближайшие 24 часа
        const hourlyHTML = data.list.slice(0, 8).map(forecast => {
            const date = new Date(forecast.dt * 1000);
            const hour = String(date.getHours()).padStart(2, '0') + ":00";
            const temp = Math.round(forecast.main.temp);
            const icon = getWeatherEmoji(forecast.weather[0].main);
            
            return `
                <div class="hourly-card">
                    <p class="hourly-time">${hour}</p>
                    <p class="hourly-icon">${icon}</p>
                    <p class="hourly-temp">${temp}°C</p>
                    <p class="hourly-humid">💧 ${forecast.main.humidity}%</p>
                </div>
            `;
        }).join('');
        
        document.getElementById("hourlyGrid").innerHTML = hourlyHTML;
    } catch (error) {
        console.error("Ошибка при получении прогноза:", error);
    }
}

// Геолокация - определяет город по текущему местоположению
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            error => {
                alert("Не удалось определить твоё местоположение. Проверь разрешения браузера!");
                console.error("Ошибка геолокации:", error);
            }
        );
    } else {
        alert("Твой браузер не поддерживает геолокацию!");
    }
}

// Получение погоды по координатам
async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.main) {
            currentCity = data.name;
            currentLat = lat;
            currentLon = lon;
            localStorage.setItem("lastCity", currentCity);
            updateWeatherUI(data);
            getForecast(lat, lon);
            updateTime();
        }
    } catch (error) {
        alert("Ошибка при загрузке погоды!");
        console.error("Ошибка:", error);
    }
}

// Обновление времени последнего обновления
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById("updateTime").textContent = `${hours}:${minutes}`;
}

// Ручное обновление
function manualUpdate() {
    if (currentLat && currentLon) {
        getWeatherByCoords(currentLat, currentLon);
    } else {
        getWeather();
    }
}

// История поиска
function addToHistory(cityName) {
    if (!searchHistory.includes(cityName)) {
        searchHistory.unshift(cityName);
        if (searchHistory.length > 10) searchHistory.pop();
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }
    displayHistory();
}

function displayHistory() {
    const historyList = document.getElementById("historyList");
    if (searchHistory.length === 0) {
        historyList.innerHTML = "<p style='color: #999; font-size: 12px;'>История пуста</p>";
        return;
    }
    
    historyList.innerHTML = searchHistory.map(city => 
        `<button class="history-btn" onclick="getWeatherFromInput('${city}')">${city}</button>`
    ).join('');
}

// Избранные города
function addToFavorites() {
    if (!currentCity) {
        alert("Сначала выберите город!");
        return;
    }
    
    if (!favorites.includes(currentCity)) {
        favorites.push(currentCity);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        displayFavorites();
        alert(`${currentCity} добавлен в избранное! ⭐`);
    } else {
        alert("Этот город уже в избранном!");
    }
}

function displayFavorites() {
    const favsList = document.getElementById("favoritesList");
    if (favorites.length === 0) {
        favsList.innerHTML = "<p style='color: #999; font-size: 12px;'>Пусто</p>";
        return;
    }
    
    favsList.innerHTML = favorites.map(city => 
        `<button class="favorite-btn" onclick="getWeatherFromInput('${city}')" title="Удалить" ondblclick="removeFavorite('${city}'); event.stopPropagation();">⭐ ${city}</button>`
    ).join('');
}

function removeFavorite(cityName) {
    favorites = favorites.filter(city => city !== cityName);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
    alert(`${cityName} удалён из избранного!`);
}

// Загружаем погоду при открытии страницы
window.addEventListener('load', () => {
    // Восстанавливаем последний город из localStorage
    const lastCity = localStorage.getItem("lastCity") || "Tokyo";
    document.getElementById("citySelect").value = lastCity;
    
    // Загружаем историю и избранное
    displayHistory();
    displayFavorites();
    
    // Загружаем погоду
    getWeather();
    
    // Обновляем тему
    updateThemeButton();
});