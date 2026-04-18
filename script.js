// ZASTARES AI - OMNI ENGINE v4.5 (Lag-Free & Optimized)
// YAPIMCI: İSAWWEz-CODLYİNG STUDİOS

let chatSessions = JSON.parse(localStorage.getItem('zastares_sessions')) || [];
let currentSessionId = null;
let isIncognito = false;

// Performans için DOM elementlerini bir kez önbelleğe alalım
const ui = {
    messages: null,
    input: null,
    sidebar: null,
    historyList: null
};

document.addEventListener('DOMContentLoaded', () => {
    // Elementleri tanımla
    ui.messages = document.getElementById('messages');
    ui.input = document.getElementById('chat-input');
    ui.sidebar = document.getElementById('sidebar');
    ui.historyList = document.getElementById('history-list');

    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.style.display = 'none';
        
        const savedUser = localStorage.getItem('zastares_user');
        if (savedUser) {
            login(true); 
        } else {
            document.getElementById('auth-screen').classList.remove('hidden');
        }
    }, 2500); // 3 saniyeden 2.5'e çekildi, daha seri açılış

    document.getElementById('login-btn').addEventListener('click', () => login(false));
    document.getElementById('reg-btn').addEventListener('click', register);
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    
    ui.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    renderSidebar();
    setupSwipeMechanics();
});

// ==========================================
// 1. SWIPE (KAYDIRMA) OPTİMİZASYONU
// ==========================================
function setupSwipeMechanics() {
    let touchStartX = 0;
    document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive: true});
    document.addEventListener('touchend', e => {
        let touchEndX = e.changedTouches[0].screenX;
        let diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 80) { // Hassasiyet artırıldı
            if (diff > 0) ui.sidebar.classList.add('open');
            else ui.sidebar.classList.remove('open');
        }
    }, {passive: true});
}

// ==========================================
// 2. ZEKA VE ARAŞTIRMA MANTIĞI (GELİŞTİRİLMİŞ)
// ==========================================
async function sendMessage() {
    const text = ui.input.value.trim();
    if (!text) return;

    addMessageData(text, 'user');
    ui.input.value = '';

    const tempId = "ai-" + Date.now();
    addPlaceholder("ZASTARES Analiz Ediyor...", tempId);

    // Ana işlem dizisini (Main Thread) rahatlatmak için setTimeout kullanalım
    setTimeout(async () => {
        try {
            let result = await getAIResponse(text);
            updateMessage(tempId, result);
            addMessageData(result, 'ai');
        } catch (e) {
            updateMessage(tempId, "ZASTARES: Bağlantı stabil değil, tekrar deneyebilir misin?");
        }
    }, 100);
}

async function getAIResponse(query) {
    if (isGibberish(query)) return "ZASTARES: Sanırım rastgele tuşlara bastın! Lütfen mantıklı bir şeyler yaz.";

    const lowerQ = query.toLowerCase();
    const cleanTopic = query.replace(/ara|nedir|kimdir|bilgi ver|hakkında/gi, "").trim() || query;
    
    // Wikipedia sorgusu (Hızlandırılmış)
    let webResult = await fetchWikipedia(cleanTopic);
    if (webResult) return webResult;

    // Uzmanlık Alanları (Donma yapmaması için optimize Switch-Case yapısı)
    return generateExpertResponse(lowerQ);
}

async function fetchWikipedia(topic) {
    const url = `https://tr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&origin=*&titles=${encodeURIComponent(topic)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId !== "-1" && pages[pageId].extract) {
            let info = pages[pageId].extract;
            return `🌐 **ZASTARES Bilgi Merkezi:**\n\n${info.substring(0, 700)}...`;
        }
        return null;
    } catch (err) { return null; }
}

function generateExpertResponse(q) {
    // Kategori tabanlı hızlı eşleşme
    const maps = [
        { keys: ["futbol", "maç", "gol", "spor"], msg: "ZASTARES Spor: Futbol ve spor dünyasındaki stratejileri analiz ediyorum. Hangi takım veya oyuncu üzerine yoğunlaşalım?" },
        { keys: ["hücre", "dna", "atom", "fizik", "kimya", "biyoloji"], msg: "ZASTARES Bilim: Moleküler düzeyde veya kuantum evreninde bir araştırma mı yapıyoruz? Formülleri hazırladım." },
        { keys: ["tarih", "savaş", "imparator", "devlet"], msg: "ZASTARES Arşiv: Dünya tarihindeki savaşlar ve siyasi devrimler kayıtlarımda mevcut. Hangi dönemi merak ediyorsun?" },
        { keys: ["diyet", "kalori", "besin", "sağlık"], msg: "ZASTARES Sağlık: Diyetisyen modum aktif. Kalori takibi ve makro besin dengesi hakkında sana rehberlik edebilirim." },
        { keys: ["yaz", "makale", "metin", "uzun"], msg: "ZASTARES Yazar: Senin için profesyonel ve derinlikli bir makale kaleme alabilirim. Konuyu belirtmen yeterli." }
    ];

    for (let map of maps) {
        if (map.keys.some(k => q.includes(k))) return map.msg;
    }

    return "ZASTARES: Bu konu hakkında derinlemesine bir mantık yürütüyorum. Bence bu durum oldukça yenilikçi bir yaklaşıma sahip!";
}

// ==========================================
// 3. EKRAN VE PERFORMANS YÖNETİMİ
// ==========================================
function addMessageData(text, sender) {
    if (!isIncognito) {
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (session) {
            session.messages.push({text, sender});
            if (session.messages.length <= 2 && sender === 'user') {
                session.title = text.substring(0, 15) + "...";
                saveToStorage();
                renderSidebar();
            } else {
                saveToStorage();
            }
        }
    }
    displayMessage(text, sender);
}

function displayMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `msg ${sender}-msg`;
    div.innerHTML = text.replace(/\n/g, "<br>");
    ui.messages.appendChild(div);
    ui.messages.scrollTo({ top: ui.messages.scrollHeight, behavior: 'smooth' });
}

function addPlaceholder(text, id) {
    const div = document.createElement('div');
    div.className = `msg ai-msg`;
    div.innerText = text;
    div.id = id;
    ui.messages.appendChild(div);
    ui.messages.scrollTop = ui.messages.scrollHeight;
}

function updateMessage(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.style.opacity = '0';
        setTimeout(() => {
            el.innerHTML = text.replace(/\n/g, "<br>");
            el.style.opacity = '1';
            ui.messages.scrollTop = ui.messages.scrollHeight;
        }, 50);
    }
}

function renderSidebar() {
    if (!ui.historyList) return;
    ui.historyList.innerHTML = `<div class="sidebar-item" onclick="createNewChat()" style="color:#00ffcc; border:1px dashed #00ffcc; text-align:center;">+ YENİ SOHBET</div>`;
    
    // Performans için DocumentFragment kullanalım (Ekranda takılmayı önler)
    const fragment = document.createDocumentFragment();
    chatSessions.forEach(s => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.innerText = s.title || "Sohbet";
        item.onclick = () => { loadSession(s.id); ui.sidebar.classList.remove('open'); };
        fragment.appendChild(item);
    });
    ui.historyList.appendChild(fragment);
}

function createNewChat() {
    currentSessionId = Date.now();
    chatSessions.unshift({ id: currentSessionId, title: "Yeni Sohbet", messages: [] });
    saveToStorage();
    renderSidebar();
    ui.messages.innerHTML = '';
    displayMessage("ZASTARES AI Uzman Modu Hazır.", "ai");
}

function loadSession(id) {
    currentSessionId = id;
    ui.messages.innerHTML = '';
    const session = chatSessions.find(s => s.id === id);
    if (session) session.messages.forEach(m => displayMessage(m.text, m.sender));
}

function saveToStorage() {
    localStorage.setItem('zastares_sessions', JSON.stringify(chatSessions));
}

// Global Fonksiyonlar
window.login = login;
window.register = register;
window.toggleSidebar = () => ui.sidebar.classList.toggle('open');
window.clearHistory = () => { if(confirm("Tüm veriler silinecek?")) { localStorage.clear(); location.reload(); }};
window.toggleIncognito = () => {
    isIncognito = !isIncognito;
    document.getElementById('header-title').innerText = isIncognito ? "🕵️ GİZLİ SOHBET" : "ZASTARES AI";
    document.getElementById('header-title').style.color = isIncognito ? "#ff4d4d" : "#00ffcc";
    ui.sidebar.classList.remove('open');
};

function isGibberish(t) { return (/(.)\1{4,}/.test(t)) || (/[bcçdfgğhjklmnprsştvyz]{6,}/i.test(t)) || (!t.includes(" ") && t.length > 15); }
function login(isAuto) {
    if (!isAuto) {
        const u = document.getElementById('l-user').value;
        if (!u) return;
        localStorage.setItem('zastares_user', u);
    }
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    if (chatSessions.length === 0) createNewChat(); else loadSession(chatSessions[0].id);
                   }
            
