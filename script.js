// ZASTARES AI - FIX ENGINE
// YAPIMCI: İSAWWEz-CODLYİNG STUDİOS

document.addEventListener('DOMContentLoaded', () => {
    // 1. Açılış Ekranı Fix
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const auth = document.getElementById('auth-screen');
        if (splash) splash.style.display = 'none';
        if (auth) auth.classList.remove('hidden');
    }, 3000);

    // 2. Buton Dinleyicileri (Giriş Yapma Hatasını Çözer)
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('reg-btn').addEventListener('click', register);
    document.getElementById('send-btn').addEventListener('click', sendMessage);
});

// Global Değişkenler
let chatHistory = [];
let isIncognito = false;

// 3. Mekanikler
function toggleAuth() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

function login() {
    // Giriş butonuna basıldığında ana uygulamayı açar
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
}

function register() {
    const pass = document.getElementById('r-pass').value;
    const regex = /^(?=.*[0-9])(?=.*[@#₺_]).{12,}$/;
    if (!regex.test(pass)) {
        alert("Hata: Şifre en az 12 karakter olmalı, sayı ve (@#₺_) içermelidir!");
    } else {
        alert("Kayıt Başarılı! Giriş yapabilirsiniz.");
        toggleAuth();
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    const tempId = "ai-" + Date.now();
    addPlaceholder("Düşünüyorum...", tempId);

    try {
        let result = "";
        if (text.toLowerCase().includes("ara") || text.toLowerCase().includes("nedir")) {
            result = await webSearchAPI(text);
        } else {
            result = "ZASTARES AI: Analiz edildi. Bu konuda daha fazla bilgi için '... nedir ara' şeklinde sorabilirsiniz.";
        }
        updateMessage(tempId, result);
    } catch (e) {
        updateMessage(tempId, "Hata: Web bağlantısı kurulamadı.");
    }
}

async function webSearchAPI(query) {
    const q = query.replace("ara", "").replace("nedir", "").trim();
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.AbstractText || "Üzgünüm, internet üzerinde net bir sonuç bulamadım.";
    } catch (err) {
        return "İnternet araması şu an yapılamıyor.";
    }
}

// 4. Arayüz Yönetimi
function addMessage(text, sender) {
    const msgBox = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `msg ${sender}-msg`;
    div.innerText = text;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;

    if (!isIncognito) {
        if(sender === 'user') {
            chatHistory.push("Sen: " + text);
            updateSidebar(text);
        } else {
            chatHistory.push("Zastares: " + text);
        }
    }
}

function addPlaceholder(text, id) {
    const msgBox = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `msg ai-msg`;
    div.innerText = text;
    div.id = id;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
}

function updateMessage(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

// 5. Sidebar & Ayarlar
window.toggleSidebar = function() {
    document.getElementById('sidebar').classList.toggle('open');
}

window.toggleSettings = function() {
    const s = document.getElementById('settings-menu');
    s.style.display = s.style.display === 'block' ? 'none' : 'block';
}

window.toggleIncognito = function() {
    isIncognito = !isIncognito;
    const header = document.getElementById('header-title');
    const chat = document.getElementById('chat-area');
    if (isIncognito) {
        header.innerText = "🕵️ GİZLİ SOHBET";
        header.style.color = "#ff4d4d";
        chat.classList.add('incognito-active');
        document.getElementById('messages').innerHTML = '<div class="msg ai-msg">Gizli mod aktif. Çıkışta her şey silinir.</div>';
    } else {
        header.innerText = "ZASTARES AI";
        header.style.color = "#00ffcc";
        chat.classList.remove('incognito-active');
    }
    toggleSidebar();
}

window.clearHistory = function() {
    chatHistory = [];
    document.getElementById('history-list').innerHTML = '';
    document.getElementById('messages').innerHTML = '<div class="msg ai-msg">Geçmiş temizlendi.</div>';
}

window.copyHistory = function() {
    navigator.clipboard.writeText(chatHistory.join("\n"));
    alert("Kopyalandı!");
}

function updateSidebar(text) {
    const list = document.getElementById('history-list');
    const item = document.createElement('div');
    item.className = 'sidebar-item';
    item.innerText = text.substring(0, 20) + "...";
    list.prepend(item);
}
    
