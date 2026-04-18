// ZASTARES AI - ULTIMATE ENGINE (Persist & Sessions)
// YAPIMCI: İSAWWEz-CODLYİNG STUDİOS

let chatSessions = JSON.parse(localStorage.getItem('zastares_sessions')) || [];
let currentSessionId = null;
let isIncognito = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Açılış Ekranı ve Otomatik Giriş Kontrolü
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        const savedUser = localStorage.getItem('zastares_user');
        
        if (savedUser) {
            // Eğer daha önce giriş yapılmışsa direkt ana uygulamayı aç
            login(true); 
        } else {
            document.getElementById('auth-screen').classList.remove('hidden');
        }
    }, 3000);

    // Buton Dinleyicileri
    document.getElementById('login-btn').addEventListener('click', () => login(false));
    document.getElementById('reg-btn').addEventListener('click', register);
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    
    loadSessionsFromStorage(); // Kayıtlı sohbetleri sidebar'a yükle
});

// 2. Giriş & Kayıt (Oturum Koruma Eklenmiş)
function login(isAuto = false) {
    if (!isAuto) {
        const user = document.getElementById('l-user').value;
        if (!user) { alert("Kullanıcı adı giriniz!"); return; }
        localStorage.setItem('zastares_user', user); // Kullanıcıyı kaydet
    }
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    // Giriş yapınca yeni bir boş sohbet başlat (veya son sohbeti yükle)
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
        localStorage.setItem('zastares_creds', JSON.stringify({user, pass}));
        alert("Kayıt başarılı! Şimdi giriş yapın.");
        toggleAuth();
    }
}

function toggleAuth() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

// 3. Sohbet Oturum Yönetimi (Sessions)
function createNewChat() {
    currentSessionId = Date.now();
    const newSession = {
        id: currentSessionId,
        title: "Yeni Sohbet " + new Date().toLocaleTimeString(),
        messages: []
    };
    chatSessions.unshift(newSession);
    saveToStorage();
    renderSidebar();
    clearChatScreen();
}

function loadSession(id) {
    currentSessionId = id;
    clearChatScreen();
    const session = chatSessions.find(s => s.id === id);
    if (session) {
        session.messages.forEach(m => displayMessage(m.text, m.sender));
    }
}

// 4. Geliştirilmiş Web Arama & Mesajlaşma
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addMessageData(text, 'user');
    input.value = '';

    const tempId = "ai-" + Date.now();
    addPlaceholder("ZASTARES araştırıyor...", tempId);

    try {
        let result = "";
        const lowerText = text.toLowerCase();

        // Web Arama Tetikleyicisi (Geliştirilmiş Mantık)
        if (lowerText.includes("ara") || lowerText.includes("nedir") || lowerText.includes("kim") || lowerText.includes("search")) {
            result = await webSearchAPI(text);
        } else {
            result = "Anladım. Detaylı web araştırması için sorunuzun yanına 'ara' ekleyebilirsiniz.";
        }

        updateMessage(tempId, result);
        addMessageData(result, 'ai');
    } catch (e) {
        updateMessage(tempId, "Bağlantı hatası oluştu.");
    }
}

async function webSearchAPI(query) {
    const cleanTopic = query.toLowerCase()
        .replace(/ara|nedir|kimdir|search|nedir/g, "").trim();

    // DuckDuckGo + Wikipedia Fallback
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanTopic)}&format=json&no_html=1`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        // Eğer DuckDuckGo ana özet vermezse, ilgili konulardan bir özet oluştur
        if (data.AbstractText) {
            return `🌐 **Bilgi:** ${data.AbstractText}`;
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            return `🔍 **Sonuç:** ${data.RelatedTopics[0].Text}`;
        } else {
            return `ZASTARES: '${cleanTopic}' hakkında genel bir araştırma yaptım ama spesifik bir özet bulamadım. Aramayı biraz daha genişletebilirsiniz.`;
        }
    } catch (err) {
        return "Arama servisi şu an meşgul.";
    }
}

// 5. Yardımcı Fonksiyonlar (Arayüzü Günceller)
function addMessageData(text, sender) {
    if (!isIncognito) {
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (session) {
            session.messages.push({text, sender});
            if (session.messages.length === 1) session.title = text.substring(0, 20);
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
    div.innerHTML = text.replace(/\n/g, "<br>");
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
    list.innerHTML = `<div class="sidebar-item" onclick="createNewChat()" style="color:#00ffcc; border:1px dashed #00ffcc; text-align:center; margin-bottom:10px;">+ Yeni Sohbet</div>`;
    chatSessions.forEach(s => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.innerText = s.title || "Adsız Sohbet";
        item.onclick = () => loadSession(s.id);
        list.appendChild(item);
    });
}

function loadSessionsFromStorage() {
    renderSidebar();
}

// Sidebar ve Ayarlar (Global Fonksiyonlar)
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('open');
window.toggleSettings = () => {
    const s = document.getElementById('settings-menu');
    s.style.display = s.style.display === 'block' ? 'none' : 'block';
};
window.clearHistory = () => {
    localStorage.removeItem('zastares_sessions');
    chatSessions = [];
    renderSidebar();
    clearChatScreen();
    alert("Tüm geçmiş silindi.");
};
window.toggleIncognito = () => {
    isIncognito = !isIncognito;
    const header = document.getElementById('header-title');
    header.innerText = isIncognito ? "🕵️ GİZLİ SOHBET" : "ZASTARES AI";
    header.style.color = isIncognito ? "#ff4d4d" : "#00ffcc";
    if(isIncognito) alert("Gizli modda konuşmalar kaydedilmez.");
    toggleSidebar();
};
window.copyHistory = () => {
    const session = chatSessions.find(s => s.id === currentSessionId);
    if(session) {
        const text = session.messages.map(m => `${m.sender}: ${m.text}`).join("\n");
        navigator.clipboard.writeText(text);
        alert("Sohbet kopyalandı!");
    }
};
        
