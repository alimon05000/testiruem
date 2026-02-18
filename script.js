// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Расширяем на весь экран и красим хедер
tg.expand();
tg.setHeaderColor('secondary_bg_color'); // Или 'bg_color'

// --- MOCK DATA (ЗАГЛУШКИ ДАННЫХ) ---
// В будущем эти данные будут приходить с твоего сервера Python
const MOCK_USER_DATA = {
    // Данные, которые мы возьмем из TG initData (если они есть)
    tg_id: tg.initDataUnsafe?.user?.id || 123456,
    first_name: tg.initDataUnsafe?.user?.first_name || "Киноман",
    last_name: tg.initDataUnsafe?.user?.last_name || "",
    username: tg.initDataUnsafe?.user?.username || "kinoman_user",
    photo_url: tg.initDataUnsafe?.user?.photo_url || "https://via.placeholder.com/100",

    // Игровые данные (будут в базе)
    season_points: 145,
    league_id: 2, // 0: Зритель, 1: Киноман, 2: Критик и т.д.
    stats: {
        invites: 12,
        premium_bought: 2
    },
    rank: 42, // Позиция в рейтинге
    points_to_next_rank: 12, // Сколько баллов до челика сверху
    
    // ТВОЙ ЮЗЕРНЕЙМ БОТА (ЗАМЕНИ!)
    bot_username: "kinoitochca_bot" 
};

const LEAGUES = [
    { id: 0, name: "Зритель", threshold: 0, icon: "👀", next_threshold: 10 },
    { id: 1, name: "Киноман", threshold: 10, icon: "🎬", next_threshold: 25, frame: "frame-silver" },
    { id: 2, name: "Критик", threshold: 25, icon: "✍️", next_threshold: 50, frame: "frame-gold" },
    { id: 3, name: "Продюсер", threshold: 50, icon: "💰", next_threshold: 90, frame: "frame-gold" },
    { id: 4, name: "Режиссёр", threshold: 90, icon: "🎥", next_threshold: 150, frame: "frame-gold" },
    { id: 5, name: "Легенда", threshold: 150, icon: "👑", next_threshold: null, frame: "frame-gold" }
];

const MOCK_LEADERBOARD = [
    { rank: 1, name: "Alex Stark", points: 320, league: "Легенда", avatar: "https://i.pravatar.cc/50?img=1" },
    { rank: 2, name: "Мария Кино", points: 295, league: "Легенда", avatar: "https://i.pravatar.cc/50?img=5" },
    { rank: 3, name: "CinemaGeek", points: 250, league: "Режиссёр", avatar: "https://i.pravatar.cc/50?img=3" },
    // ... добавь еще для теста ...
    { rank: 41, name: "Тот парень сверху", points: 157, league: "Легенда", avatar: "https://i.pravatar.cc/50?img=8" },
    // Текущий юзер будет вставлен между ними
    { rank: 43, name: "Догоняющий", points: 140, league: "Киноман", avatar: "https://i.pravatar.cc/50?img=9" }
];


// --- ФУНКЦИИ ---

// 1. Инициализация приложения
function initApp() {
    // Проверяем, запущено ли в Телеграм
    if (!tg.initDataUnsafe?.user) {
        // console.warn("Not launched in Telegram. Using mock data completely.");
        // В реале тут можно показать заглушку "Откройте в Telegram"
    }

    populateUserData();
    setupNavigation();
    loadLeaderboard();
    setupReferralCopy();
}

// 2. Заполнение данных пользователя (Главная и Профиль)
function populateUserData() {
    const user = MOCK_USER_DATA;
    const currentLeague = LEAGUES.find(l => l.id === user.league_id);
    const nextLeague = LEAGUES.find(l => l.id === user.league_id + 1);
    
    const fullName = `${user.first_name} ${user.last_name}`.trim();

    // Header
    document.getElementById('header-username').textContent = fullName;
    document.getElementById('header-avatar').src = user.photo_url;

    // Main Dashboard
    document.getElementById('current-league-icon').textContent = currentLeague.icon;
    document.getElementById('current-league-name').textContent = currentLeague.name;
    document.getElementById('current-points').textContent = user.season_points;

    // Progress Bar
    if (nextLeague) {
        const pointsNeeded = nextLeague.threshold - user.season_points;
        document.getElementById('next-league-target').textContent = `до ${nextLeague.name}а: ${pointsNeeded} баллов`;
        
        // Считаем процент прогресса внутри текущей лиги
        const leagueRange = nextLeague.threshold - currentLeague.threshold;
        const userProgressInOutRange = user.season_points - currentLeague.threshold;
        const progressPercent = (userProgressInOutRange / leagueRange) * 100;
        document.getElementById('main-progress-fill').style.width = `${Math.max(5, progressPercent)}%`; // Мин 5% для красоты
    } else {
        document.getElementById('next-league-target').textContent = "Максимальный уровень!";
        document.getElementById('main-progress-fill').style.width = '100%';
    }

    // Profile Tab
    document.getElementById('profile-fullname').textContent = fullName;
    document.getElementById('profile-username').textContent = user.username ? `@${user.username}` : "";
    document.getElementById('profile-avatar').src = user.photo_url;
    document.getElementById('profile-league-badge').textContent = `${currentLeague.icon} ${currentLeague.name}`;
    
    // Установка рамки (если есть в лиге)
    const profileFrame = document.getElementById('profile-frame');
    profileFrame.className = 'profile-avatar-frame'; // Сброс
    if (currentLeague.frame) {
        profileFrame.classList.add(currentLeague.frame);
    } else {
        // Дефолтная рамка (прозрачная или цвет фона)
        profileFrame.style.background = 'transparent'; 
    }

    document.getElementById('stat-points').textContent = user.season_points;
    document.getElementById('stat-invites').textContent = user.stats.invites;
    document.getElementById('stat-premium').textContent = user.stats.premium_bought;

    // Referral Link
    // ВАЖНО: Замени MOCK_USER_DATA.bot_username на реальный юзернейм своего бота!
    const refLink = `https://t.me/${user.bot_username}?start=ref_${user.tg_id}`;
    document.getElementById('ref-link-input').value = refLink;

    // Leaderboard Tab Info
    document.getElementById('my-rank').textContent = user.rank;
    document.getElementById('points-gap').textContent = user.points_to_next_rank;
}


// 3. Навигация по вкладкам
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTabId = item.getAttribute('data-target');
            openTab(targetTabId);
        });
    });
}

// Функция открытия конкретной вкладки (экспортируем в глоб. область для кнопок)
window.openTab = function(tabId) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Деактивируем все кнопки меню
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });

    // Показываем целевую вкладку
    document.getElementById(tabId).classList.add('active');

    // Активируем кнопку меню (если это не скрытая вкладка типа "tasks")
    const activeNavItem = document.querySelector(`.nav-item[data-target="${tabId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Вибрация при переключении (приятный UX)
    tg.HapticFeedback.selectionChanged();
};


// 4. Загрузка Лидерборда (Мок)
function loadLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = ''; // Очистка

    // Объединяем моковых лидеров и текущего юзера для демо
    let combinedList = [...MOCK_LEADERBOARD];
    // В реале список будет приходить уже отсортированный с бэка

    combinedList.forEach(user => {
        const isTop3 = user.rank <= 3 ? 'top-3' : '';
        const medal = user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`;
        
        const itemHtml = `
            <div class="leaderboard-item">
                <div class="lb-rank ${isTop3}">${medal}</div>
                <img src="${user.avatar}" alt="${user.name}" class="avatar-small lb-avatar">
                <div class="lb-info">
                    <div class="lb-name">${user.name}</div>
                    <div class="lb-league">${user.league}</div>
                </div>
                <div class="lb-points">${user.points} б.</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    });
}

// 5. Копирование рефки
function setupReferralCopy() {
    const copyBtn = document.getElementById('copy-ref-btn');
    const linkInput = document.getElementById('ref-link-input');

    copyBtn.addEventListener('click', () => {
        // Используем современный Clipboard API, если доступен, иначе фоллбэк
        if (navigator.clipboard && navigator.clipboard.writeText) {
             navigator.clipboard.writeText(linkInput.value)
                .then(() => {
                     tg.showPopup({ title: 'Успешно!', message: 'Ссылка скопирована в буфер обмена.', buttons: [{type: 'ok'}] });
                     tg.HapticFeedback.notificationOccurred('success');
                })
                .catch(err => {
                     console.error('Failed to copy: ', err);
                     // Фоллбэк для старых версий вебвью
                     fallbackCopyTextToClipboard(linkInput.value);
                });
        } else {
            fallbackCopyTextToClipboard(linkInput.value);
        }
    });
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if(successful) {
             tg.showPopup({ title: 'Успешно!', message: 'Ссылка скопирована.', buttons: [{type: 'ok'}] });
             tg.HapticFeedback.notificationOccurred('success');
        } else {
             tg.showPopup({ title: 'Ошибка', message: 'Не удалось скопировать.', buttons: [{type: 'close'}] });
        }
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
}


// ЗАПУСК ПРИ ЗАГРУЗКЕ
// Ждем, пока Telegram WebApp будет готов
tg.ready();
initApp();
