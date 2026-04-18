// ZASTARES AI - WEB SEARCH ENGINE v1.1
// YAPIMCI: İSAWWEz-CODLYİNG STUDİOS

document.addEventListener('DOMContentLoaded', () => {
    // 3 saniye sonra açılış ekranını kapat ve giriş ekranını göster
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const auth = document.getElementById('auth-screen');
        if (splash) splash.style.display = 'none';
        if (auth) auth.classList.remove('hidden');
    }, 3000);

    // Buton Dinleyicileri
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('reg-btn').addEventListener('click', register);
    document.getElementById('send-btn').addEventListener('click', sendMessage);
});

// Global Değişkenler
let chatHistory = [];
let isIncognito = false;

// 1. Giriş ve Kayıt Mekaniği
function toggleAuth() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

function login() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
}

function register() {
    const pass = document.getElementById('r-pass').value;
    const regex = /^(?=.*[0-9])(?=.*[@#₺_]).{12,}$/;
    if (!regex.test(pass)) {
        alert("Hata: Şifre en az 12 karakter olmalı, sayı ve (@#₺_) sembolü içermelidir!");
    } else {
        alert("Kayıt Başarılı! Şimdi giriş yapabilirsin.");
        toggleAuth();
    }
}

// 2. Mesajlaşma ve WEB ARAŞTIRMA MANTIĞI
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user'); // Kullanıcı mesajını ekrana bas
    input.value = '';

    // AI Düşünüyor... efekti
    const tempId = "ai-" + Date.now();
    addPlaceholder("İnternet kaynakları taranıyor...", tempId);

    try {
        let result = "";
        const lowerText = text.toLowerCase();

        // Web Arama Tetikleyicisi
        if (lowerText.includes("ara") || lowerText.includes("nedir") || lowerText.includes("kimdir")) {
            result = await webSearchAPI(text);
        } else {
            // Standart AI Cevabı (İnternete gerek olmayan durumlar)
            result = "Anladım. Eğer bu konuda internette bir araştırma yapmamı istersen cümlene '... nedir ara' diye ekleyebilirsin.";
        }

        updateMessage(tempId, result); // Placeholder'ı gerçek cevapla değiştir
    } catch (e) {
        updateMessage(tempId, "Hata: Web servislerine şu an ulaşılamıyor.");
    }
}

// Gerçek Web Arama Fonksiyonu (DuckDuckGo API)
async function webSearchAPI(query) {
    // Sorgudaki tetikleyici kelimeleri temizleyelim
    const cleanTopic = query.toLowerCase()
        .replace("ara", "")
        .replace("nedir", "")
        .replace("kimdir", "")
        .trim();

    // DuckDuckGo API kullanımı (Ücretsiz ve anahtar gerektirmez)
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanTopic)}&format=json&no_html=1&skip_disambig=1`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.AbstractText) {
            return `🌐 **ZASTARES Buldu:** ${data.AbstractText}\n\n*Kaynak: Web Kayıtları*`;
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            return `🔍 **Bilgi:** ${data.RelatedTopics[0].Text}`;
        } else {
            return "🔍 Üzgünüm, bu spesifik konu hakkında internette net bir özet bulamadım. Aramayı biraz daha basitleştirmeyi deneyebilirsin.";
        }
    } catch (err) {
        return "❌ İnternet bağlantısı hatası: Web verileri çekilemedi.";
    }
}

// 3. Arayüz Yönetim Fonksiyonları
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
    if (el) el.innerHTML = text.replace(/\n/g, "<br>"); // Satır başlarını destekle
}

// 4. Sidebar ve Ayar Mekanikleri (Bozulmadı)
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
        alert("Gizli mod aktif! Bu oturumdaki hiçbir konuşma kaydedilmeyecek.");
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
    alert("Geçmiş panoya kopyalandı!");
}

function updateSidebar(text) {
    const list = document.getElementById('history-list');
    const item = document.createElement('div');
    item.className = 'sidebar-item';
    item.innerText = text.substring(0, 20) + "...";
    list.prepend(item);
}
