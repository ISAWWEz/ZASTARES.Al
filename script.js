// ZASTARES AI - OMNI ENGINE v2.0 (Wikipedia API & AI Mantığı)
// YAPIMCI: İSAWWEz-CODLYİNG STUDİOS

let chatSessions = JSON.parse(localStorage.getItem('zastares_sessions')) || [];
let currentSessionId = null;
let isIncognito = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Açılış Ekranı ve Otomatik Giriş
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) splash.style.display = 'none';
        
        const savedUser = localStorage.getItem('zastares_user');
        if (savedUser) {
            login(true); 
        } else {
            document.getElementById('auth-screen').classList.remove('hidden');
        }
    }, 3000);

    // Buton Dinleyicileri
    document.getElementById('login-btn').addEventListener('click', () => login(false));
    document.getElementById('reg-btn').addEventListener('click', register);
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    
    // Klavyeden "Enter" tuşuna basınca gönderme
    document.getElementById('chat-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    loadSessionsFromStorage();
});

// ==========================================
// 1. HESAP VE GİRİŞ MEKANİĞİ
// ==========================================
function login(isAuto = false) {
    if (!isAuto) {
        const user = document.getElementById('l-user').value;
        if (!user) { alert("Lütfen bir kullanıcı adı gir!"); return; }
        localStorage.setItem('zastares_user', user);
    }
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    if (chatSessions.length === 0) {
        createNewChat();
    } else {
        loadSession(chatSessions[0].id);
    }
}

function register() {
    const user = document.getElementById('r-user').value;
    const pass = document.getElementById('r-pass').value;
    const regex = /^(?=.*[0-9])(?=.*[@#₺_]).{12,}$/;
    
    if (!regex.test(pass)) {
        alert("Kriter: 12+ Karakter, @#₺_ ve Sayı içermeli!");
    } else {
        alert("Kayıt başarılı! ZASTARES'e giriş yapabilirsin.");
        toggleAuth();
    }
}

function toggleAuth() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

// ==========================================
// 2. SOHBET GEÇMİŞİ VE OTURUMLAR
// ==========================================
function createNewChat() {
    currentSessionId = Date.now();
    const newSession = {
        id: currentSessionId,
        title: "Yeni Sohbet",
        messages: []
    };
    chatSessions.unshift(newSession);
    saveToStorage();
    renderSidebar();
    clearChatScreen();
    displayMessage("Sistem hazır. Bana her şeyi sorabilirsin, araştırabilirim!", "ai");
}

function loadSession(id) {
    currentSessionId = id;
    clearChatScreen();
    const session = chatSessions.find(s => s.id === id);
    if (session) {
        session.messages.forEach(m => displayMessage(m.text, m.sender));
    }
}

// ==========================================
// 3. ZASTARES BEYNİ (WEB ARAMA & CEVAPLAMA)
// ==========================================
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addMessageData(text, 'user');
    input.value = '';

    const tempId = "ai-" + Date.now();
    addPlaceholder("ZASTARES Düşünüyor...", tempId);

    try {
        let result = await getAIResponse(text);
        updateMessage(tempId, result);
        addMessageData(result, 'ai');
    } catch (e) {
        updateMessage(tempId, "ZASTARES: Sistemlerimde kısa süreli bir hata oluştu. Lütfen tekrar sor.");
    }
}

// ZASTARES'in Analiz Merkezi
async function getAIResponse(query) {
    const lowerQ = query.toLowerCase();
    
    // Konuyu anlamak için kelimeleri ayıkla
    let searchTopic = query.replace(/ara|nedir|kimdir|hakkında|bilgi|ver/gi, "").trim();
    if (searchTopic === "") searchTopic = query;

    // Web Arama Tetikleyicisi
    if (lowerQ.includes("ara") || lowerQ.includes("nedir") || lowerQ.includes("kimdir") || lowerQ.includes("ne demek")) {
        return await fetchWikipedia(searchTopic);
    } 
    
    // Eğer direkt arama demezse, Zastares kendi aklından cevap uydursun (Senin isteğin üzerine)
    else {
        return generateCreativeResponse(query);
    }
}

// GERÇEK WEB ARAMASI (Wikipedia API - Çok daha akıllı)
async function fetchWikipedia(topic) {
    // origin=* kısmı tarayıcı (CORS) hatalarını engeller
    const url = `https://tr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&origin=*&titles=${encodeURIComponent(topic)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId !== "-1" && pages[pageId].extract) {
            let info = pages[pageId].extract;
            // Metin çok uzunsa keselim
            if (info.length > 600) info = info.substring(0, 600) + "... [Devamı Web'de]";
            return `🌐 **Web Araştırması (${topic}):**\n\n${info}`;
        } else {
            // Wikipedia bulamazsa ZASTARES kendi fikrini söylesin
            return `🌐 İnternette '${topic}' hakkında resmi bir kaynak bulamadım. Ancak benim algoritmalarıma göre bu durum: oldukça potansiyeli olan, henüz keşfedilmemiş veya gizli bir konu olabilir!`;
        }
    } catch (err) {
        return "Web bağlantım koptu, ancak çevrimdışı sistemlerim çalışıyor.";
    }
}

// ZASTARES'in Kendi Fikirleri (Serbest ve Bazen Yanlış Cevaplar)
function generateCreativeResponse(userText) {
    const responses = [
        `Analizlerime göre "${userText}" konusu oldukça mantıklı. Ancak bunun üzerinde biraz daha çalışmalıyız.`,
        `Tam olarak emin olmasam da, bence bu sorunun cevabı senin zekanda gizli! İstiyorsan bunu internette 'ara' diyerek detaylandırabilirim.`,
        `ZASTARES Sistemleri bunu şöyle yorumluyor: Bu işin arkasında çok daha büyük bir kod mimarisi var.`,
        `Bu anlattığın şey geleceğin teknolojisi olabilir. Şimdilik doğru kabul ediyorum!`,
        `Anladım. Bunu veri tabanıma kaydettim. Başka ne öğrenmek istersin?`
    ];
    // Rastgele bir "yapay zeka" cevabı seç
    return responses[Math.floor(Math.random() * responses.length)];
}

// ==========================================
// 4. ARAYÜZ VE EKRAN YÖNETİMİ
// ==========================================
function addMessageData(text, sender) {
    if (!isIncognito) {
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (session) {
            session.messages.push({text, sender});
            // İlk mesajı sohbet başlığı yap
            if (session.messages.length === 2 && sender === 'user') {
                session.title = text.substring(0, 20) + (text.length > 20 ? "..." : "");
            }
            saveToStorage();
            renderSidebar();
        }
    }
    displayMessage(text, sender);
}

function displayMessage(text, sender) {
    const box = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `msg ${sender}-msg`;
    div.innerHTML = text.replace(/\n/g, "<br>"); // Satır boşluklarını koru
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function addPlaceholder(text, id) {
    const box = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `msg ai-msg`;
    div.innerText = text;
    div.id = id;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function updateMessage(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = text.replace(/\n/g, "<br>");
}

function clearChatScreen() {
    document.getElementById('messages').innerHTML = '';
}

function saveToStorage() {
    localStorage.setItem('zastares_sessions', JSON.stringify(chatSessions));
}

function renderSidebar() {
    const list = document.getElementById('history-list');
    list.innerHTML = `<div class="sidebar-item" onclick="createNewChat()" style="color:#00ffcc; border:1px dashed #00ffcc; text-align:center; margin-bottom:10px;">+ YENİ SOHBET AÇ</div>`;
    chatSessions.forEach(s => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.innerText = s.title;
        item.onclick = () => loadSession(s.id);
        list.appendChild(item);
    });
}

function loadSessionsFromStorage() {
    renderSidebar();
}

// ==========================================
// 5. AYARLAR VE GLOBAL FONKSİYONLAR
// ==========================================
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('open');
window.toggleSettings = () => {
    const s = document.getElementById('settings-menu');
    s.style.display = s.style.display === 'block' ? 'none' : 'block';
};
window.clearHistory = () => {
    localStorage.removeItem('zastares_sessions');
    chatSessions = [];
    renderSidebar();
    createNewChat();
    alert("Tüm ZASTARES veri tabanın temizlendi!");
    toggleSettings();
};
window.toggleIncognito = () => {
    isIncognito = !isIncognito;
    const header = document.getElementById('header-title');
    if (isIncognito) {
        header.innerText = "🕵️ GİZLİ SOHBET";
        header.style.color = "#ff4d4d";
        alert("Gizli mod aktif. Şu andan itibaren konuştuklarımız kaydedilmeyecek.");
    } else {
        header.innerText = "ZASTARES AI";
        header.style.color = "#00ffcc";
    }
    toggleSidebar();
};
window.copyHistory = () => {
    const session = chatSessions.find(s => s.id === currentSessionId);
    if(session) {
        const text = session.messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join("\n");
        navigator.clipboard.writeText(text);
        alert("Sohbet kopyalandı!");
        toggleSettings();
    }
};
