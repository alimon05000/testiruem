const tg = window.Telegram.WebApp;
tg.expand();
// Устанавливаем цвет хедера под наш темный фон, а не стандартный
tg.setHeaderColor('#0a0e1a'); 
tg.setBackgroundColor('#0a0e1a');

// --- MOCK DATA (Те же данные, новый вид) ---
const MOCK_USER_DATA = {
    tg_id: tg.initDataUnsafe?.user?.id || 123456,
    first_name: tg.initDataUnsafe?.user?.first_name || "Алекс",
    last_name: tg.initDataUnsafe?.user?.last_name || "",
    username: tg.initDataUnsafe?.user?.username || "alex_cinema",
    // Используем заглушку, если нет реального фото
    photo_url: tg.initDataUnsafe?.user?.photo_url || "https://i.pravatar.cc/150?img=68",

    season_points: 145,
    league_id: 2, // Критик
    stats: { invites: 12, premium_bought: 2 },
    rank: 42,
    points_to_next_rank: 12,
    bot_username: "kinoitochca_bot" 
};

// Добавил CSS классы рамок в конфиг лиг
const LEAGUES = [
    { id: 0, name: "Зритель", threshold: 0, icon: "👀", next_threshold: 10, frame: null },
    { id: 1, name: "Киноман", threshold: 10, icon: "🎬", next_threshold: 25, frame: "frame-silver" },
    { id: 2, name: "Критик", threshold: 25, icon: "✍️", next_threshold: 50, frame: "frame-gold" },
    { id: 3, name: "Продюсер", threshold: 50, icon: "💰", next_threshold: 90, frame: "frame-gold" },
    { id: 4, name: "Режиссёр", threshold: 90, icon: "🎥", next_threshold: 150, frame: "frame-gold" },
    { id: 5, name: "Легенда", threshold: 150, icon: "👑", next_threshold: null, frame: "frame-gold" }
];

const MOCK_LEADERBOARD = [
    { rank: 1, name: "KinoKing", points: 320, league: "Легенда", avatar: "https://i.pravatar.cc/50?img=11" },
    { rank: 2, name: "Eva Green", points: 295, league: "Легенда", avatar: "https://i.pravatar.cc/50?img=5" },
    { rank: 3, name: "Producer Max", points: 250, league: "Режиссёр", avatar: "https://i.pravatar.cc/50?img=3" },
    { rank: 41, name: "Сэм", points: 157, league: "Легенда", avatar: "https://i.pravatar.cc/50?img=8" },
    { rank: 43, name: "Анна", points: 140, league: "Киноман", avatar: "https://i.pravatar.cc/50?img=9" }
];

// --- ФУНКЦИИ ---
function initApp() {
    populateUserData();
    setupNavigation();
    loadLeaderboard();
    setupReferralCopy();
    // Небольшая анимация появления при старте
    document.querySelector('.app-container').style.opacity = 1;
}

function populateUserData() {
    const user = MOCK_USER_DATA;
    const currentLeague = LEAGUES.find(l => l.id === user.league_id);
    const nextLeague = LEAGUES.find(l => l.id === user.league_id + 1);
    const fullName = `${user.first_name} ${user.last_name}`.trim();

    // Header & Profile Names
    document.getElementById('header-username').textContent = fullName;
    document.getElementById('profile-fullname').textContent = fullName;
    document.getElementById('profile-username').textContent = user.username ? `@${user.username}` : "";

    // Avatars
    const avatarEls = [document.getElementById('header-avatar'), document.getElementById('profile-avatar')];
    avatarEls.forEach(el => el.src = user.photo_url);

    // Main Dashboard Info
    document.getElementById('current-league-icon').textContent = currentLeague.icon;
    document.getElementById('current-league-name').textContent = currentLeague.name;
    document.getElementById('current-points').textContent = user.season_points;

    // Progress Bar
    if (nextLeague) {
        const pointsNeeded = nextLeague.threshold - user.season_points;
        document.getElementById('next-league-target').textContent = `Цель: ${nextLeague.name} (еще ${pointsNeeded})`;
        
        const leagueRange = nextLeague.threshold - currentLeague.threshold;
        const userProgressInOutRange = user.season_points - currentLeague.threshold;
        const progressPercent = (userProgressInOutRange / leagueRange) * 100;
        document.getElementById('main-progress-fill').style.width = `${Math.max(8, progressPercent)}%`;
    } else {
        document.getElementById('next-league-target').textContent = "Абсолютный чемпион!";
        document.getElementById('main-progress-fill').style.width = '100%';
    }

    // Profile Frame & Badge
    const frameContainer = document.getElementById('profile-frame-container');
    // Сбрасываем старые рамки
    frameContainer.classList.remove('frame-silver', 'frame-gold');
    if (currentLeague.frame) {
        frameContainer.classList.add(currentLeague.frame);
    }
    document.getElementById('profile-league-badge').textContent = `${currentLeague.icon} ${currentLeague.name}`;

    // Stats
    document.getElementById('stat-points').textContent = user.season_points;
    document.getElementById('stat-invites').textContent = user.stats.invites;
    document.getElementById('stat-premium').textContent = user.stats.premium_bought;

    // Ref Link
    const refLink = `https://t.me/${user.bot_username}?start=ref_${user.tg_id}`;
    document.getElementById('ref-link-input').value = refLink;

    // Leaderboard Info
    document.getElementById('my-rank').textContent = user.rank;
    document.getElementById('points-gap').textContent = `${user.points_to_next_rank} б.`;
}

function setupNavigation() {
    // Используем делегирование или прямой выбор по классу nav-link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Если клик по центральной кнопке, она может вести себя иначе, но пока так же
            const targetId = link.getAttribute('data-target');
            if(targetId) {
                 e.preventDefault();
                 openTab(targetId);
            }
        });
    });
}

window.openTab = function(tabId) {
    // Скрываем вкладки с анимацией
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active', 'fade-in');
    });
    // Деактивируем ссылки
    document.querySelectorAll('.nav-link').forEach(nav => {
        nav.classList.remove('active');
    });

    // Показываем новую
    const targetTab = document.getElementById(tabId);
    targetTab.classList.add('active');
    // Небольшой хак, чтобы перезапустить анимацию fade-in
    setTimeout(() => targetTab.classList.add('fade-in'), 10);

    // Активируем ссылку в меню
    const activeNavLink = document.querySelector(`.nav-link[data-target="${tabId}"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }
    
    tg.HapticFeedback.impactOccurred('light');
};

function loadLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = ''; 
    let combinedList = [...MOCK_LEADERBOARD];

    combinedList.forEach(user => {
        let rankDisplay = `#${user.rank}`;
        let rankClass = '';
        if (user.rank === 1) { rankDisplay = '🥇'; rankClass = 'top-1'; }
        else if (user.rank === 2) rankDisplay = '🥈';
        else if (user.rank === 3) rankDisplay = '🥉';
        
        const itemHtml = `
            <div class="leaderboard-item">
                <div class="lb-rank ${rankClass}">${rankDisplay}</div>
                <img src="${user.avatar}" alt="${user.name}" class="avatar-small lb-avatar">
                <div class="lb-info">
                    <div class="lb-name">${user.name}</div>
                    <div class="lb-league">${user.league}</div>
                </div>
                <div class="lb-points">${user.points}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    });
}

function setupReferralCopy() {
    const copyBtn = document.getElementById('copy-ref-btn');
    const linkInput = document.getElementById('ref-link-input');

    copyBtn.addEventListener('click', () => {
        linkInput.select();
        linkInput.setSelectionRange(0, 99999); // Для мобилок

        try {
            // Пробуем современный API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                 navigator.clipboard.writeText(linkInput.value).then(onCopySuccess);
            } else {
                // Старый метод
                document.execCommand('copy');
                onCopySuccess();
            }
        } catch (err) {
            tg.showPopup({ title: 'Ошибка', message: 'Не удалось скопировать вручную.' });
        }
    });
}

function onCopySuccess() {
    tg.showPopup({ title: 'Готово!', message: 'Ссылка скопирована.' });
    tg.HapticFeedback.notificationOccurred('success');
}

tg.ready();
// Запускаем инициализацию
initApp();
