// ZASTARES AI - OMNI ENGINE v3.0 (Swipe & No Limits)
// YAPIMCI: İSAWWEz-CODLYİNG STUDİOS

let chatSessions = JSON.parse(localStorage.getItem('zastares_sessions')) || [];
let currentSessionId = null;
let isIncognito = false;

document.addEventListener('DOMContentLoaded', () => {
    // Açılış Ekranı ve Otomatik Giriş
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
    
    // Klavyeden "Enter" ile Gönderme
    document.getElementById('chat-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    loadSessionsFromStorage();
    setupSwipeMechanics(); // Kaydırma (Swipe) özelliğini başlat
});

// ==========================================
// 1. DOKUNMATİK KAYDIRMA (SWIPE) MEKANİĞİ
// ==========================================
function setupSwipeMechanics() {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        // Sağa Kaydırma (Açılış) - 70px barajı
        if (touchEndX - touchStartX > 70) {
            sidebar.classList.add('open');
        }
        // Sola Kaydırma (Kapanış) - 70px barajı
        if (touchStartX - touchEndX > 70) {
            sidebar.classList.remove('open');
        }
    }
}

// ==========================================
// 2. HESAP VE GİRİŞ MEKANİĞİ
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
// 3. SOHBET GEÇMİŞİ VE OTURUMLAR
// ==========================================
function createNewChat() {
    currentSessionId = Date.now();
    const newSession = { id: currentSessionId, title: "Yeni Sohbet", messages: [] };
    chatSessions.unshift(newSession);
    saveToStorage();
    renderSidebar();
    clearChatScreen();
    displayMessage("Sistem hazır. Sorularını bekliyorum!", "ai");
}

function loadSession(id) {
    currentSessionId = id;
    clearChatScreen();
    const session = chatSessions.find(s => s.id === id);
    if (session) session.messages.forEach(m => displayMessage(m.text, m.sender));
}

// ==========================================
// 4. ZASTARES BEYNİ (SANSÜRSÜZ CEVAPLAMA)
// ==========================================
// Rastgele harfleri algılama algoritması
function isGibberish(text) {
    // 1. Aynı harften peş peşe 4 tane varsa (aaaa)
    if (/(.)\1{3,}/.test(text)) return true;
    // 2. Ardışık 5 sessiz harf varsa (qwrtyp)
    if (/[bcçdfgğhjklmnprsştvyz]{5,}/i.test(text)) return true;
    // 3. "Rejeieisuei" tarzı anlamsız uzunluklar (Boşluksuz ve 10 harften uzunsa mantıksız kabul edelim)
    if (!text.includes(" ") && text.length > 10) return true;
    return false;
}

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
        updateMessage(tempId, "ZASTARES: Ufak bir sistem hatası. Lütfen tekrar sor.");
    }
}

async function getAIResponse(query) {
    // 1. Önce kullanıcının rastgele tuşlara basıp basmadığını kontrol et
    if (isGibberish(query)) {
        return "ZASTARES: Sanırım rastgele tuşlara bastın! Lütfen mantıklı bir şeyler yaz.";
    }

    // 2. Her ihtimale karşı "ara" vs. gibi komut kelimelerini ayıkla ve direkt Wikipediada dene
    const cleanTopic = query.replace(/ara|nedir|kimdir|hakkında/gi, "").trim() || query;
    let webResult = await fetchWikipedia(cleanTopic);
    
    // 3. Eğer Wiki'de varsa gerçek bilgi ver, yoksa KENDİ UYDURSUN!
    if (webResult) {
        return webResult;
    } else {
        return generateCreativeResponse(query);
    }
}

// Gerçek Web Araması (Sadece varsa döner, yoksa null döner)
async function fetchWikipedia(topic) {
    const url = `https://tr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&origin=*&titles=${encodeURIComponent(topic)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId !== "-1" && pages[pageId].extract) {
            let info = pages[pageId].extract;
            if (info.length > 500) info = info.substring(0, 500) + "... [Devamı Web'de]";
            return `🌐 **ZASTARES:**\n${info}`;
        }
        return null; // Eğer bulamazsa "null" döner ve uydurma fonksiyonuna geçer
    } catch (err) {
        return null;
    }
}

// Bulamadığı Zamanlarda ZASTARES'in Uydurma / Mantıklı Gözüken Cevapları
function generateCreativeResponse(userText) {
    const responses = [
        `Analizlerime göre "${userText}" konusu oldukça karmaşık ama bir o kadar da geleceği olan bir kavram. Bence bu işin arkasında çok sağlam bir kod mantığı yatıyor.`,
        `Sistemsel olarak bunu tam olarak doğrulayamasam da, "${userText}" meselesinin senin algoritmik düşünce yapınla uyuştuğunu görüyorum. Kesinlikle doğru yoldasın!`,
        `İlginç bir yaklaşım! İnternetteki standart veriler bunu açıklamaya yetmez ama ZASTARES mantığına göre "${userText}" kesinlikle mümkün ve mantıklı.`,
        `Bu anlattığın şeyin arkasında yatan asıl sır bence senin yaratıcılığında gizli. "${userText}" şimdilik kayıtlarıma bir 'Yenilik' olarak geçti!`,
        `Açıkçası "${userText}" konusuyla ilgili sistemlerimde net bir tanım yok, ama ZASTARES yapay zekası olarak bunu harika bir fikir olarak onaylıyorum.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// ==========================================
// 5. ARAYÜZ VE EKRAN YÖNETİMİ
// ==========================================
function addMessageData(text, sender) {
    if (!isIncognito) {
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (session) {
            session.messages.push({text, sender});
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
// 6. AYARLAR VE GLOBAL FONKSİYONLAR
// ==========================================
window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('open');
};
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

