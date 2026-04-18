// ZASTARES AI - OMNI ENGINE v5.0 (Ultimate Optimization)
// YAPIMCI: İSAWWEz-CODLYİNG STUDİOS

let chatSessions = JSON.parse(localStorage.getItem('zastares_sessions')) || [];
let currentSessionId = null;
let isIncognito = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. AÇILIŞ VE OTOMATİK GİRİŞ (Dokunulmadı)
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) splash.style.display = 'none';
        
        const savedUser = localStorage.getItem('zastares_user');
        if (savedUser) {
            login(true); 
        } else {
            const auth = document.getElementById('auth-screen');
            if(auth) auth.classList.remove('hidden');
        }
    }, 3000);

    // Event Listeners
    document.getElementById('login-btn')?.addEventListener('click', () => login(false));
    document.getElementById('reg-btn')?.addEventListener('click', register);
    document.getElementById('send-btn')?.addEventListener('click', sendMessage);
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    loadSessionsFromStorage();
    setupSwipeMechanics();
});

// ==========================================
// 2. KAYDIRMA (SWIPE) SİSTEMİ (Hızlandırıldı)
// ==========================================
function setupSwipeMechanics() {
    let touchStartX = 0;
    document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive: true});
    document.addEventListener('touchend', e => {
        let touchEndX = e.changedTouches[0].screenX;
        const sidebar = document.getElementById('sidebar');
        if (touchEndX - touchStartX > 80) sidebar?.classList.add('open');
        if (touchStartX - touchEndX > 80) sidebar?.classList.remove('open');
    }, {passive: true});
}

// ==========================================
// 3. GİRİŞ MEKANİKLERİ (Dokunulmadı - Stabilize Edildi)
// ==========================================
function login(isAuto = false) {
    if (!isAuto) {
        const user = document.getElementById('l-user').value;
        if (!user) return;
        localStorage.setItem('zastares_user', user);
    }
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    if (chatSessions.length === 0) createNewChat();
    else loadSession(chatSessions[0].id);
}

function register() {
    const pass = document.getElementById('r-pass').value;
    if (!/^(?=.*[0-9])(?=.*[@#₺_]).{12,}$/.test(pass)) {
        alert("Kriter: 12+ Karakter, @#₺_ ve Sayı!");
    } else {
        alert("Kayıt başarılı!");
        toggleAuth();
    }
}

function toggleAuth() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

// ==========================================
// 4. MESAJLAŞMA VE BİLGİN AI MANTIĞI (Geliştirildi)
// ==========================================
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addMessageData(text, 'user');
    input.value = '';

    const tempId = "ai-" + Date.now();
    addPlaceholder("ZASTARES Analiz Ediyor...", tempId);

    // Yanıt Süreci
    const result = await generateSmartResponse(text);
    updateMessage(tempId, result);
    addMessageData(result, 'ai');
}

async function generateSmartResponse(query) {
    if (isGibberish(query)) return "ZASTARES: Sanırım klavyeye rastgele bastın. Lütfen anlaşılır bir soru sor.";

    const lowerQ = query.toLowerCase();
    
    // Wikipedia Araştırması (Daha temiz sonuç için geliştirildi)
    const searchTopic = query.replace(/ara|nedir|kimdir|neden|nasıl/gi, "").trim();
    let wikiData = await fetchWiki(searchTopic);
    
    if (wikiData) return `🌐 **ZASTARES Bilgi Bankası:**\n${wikiData}`;

    // Uzmanlık Alanları (Eğer web'de yoksa Zastares'in kendi uydurduğu yüksek seviye bilgiler)
    if (/(futbol|spor|messi|ronaldo|maç|transfer)/.test(lowerQ)) {
        return "⚽ **ZASTARES Spor:** Futbol dünyasındaki bu gelişme, taktiksel disiplin ve oyuncu yeteneğinin birleşimiyle tarihi bir ana dönüşebilir. Analizlerime göre bu strateji sahadaki tüm dengeleri değiştirecek güçte.";
    }
    if (/(savaş|tarih|osmanlı|atatürk|antik|roma)/.test(lowerQ)) {
        return "📜 **ZASTARES Tarihçi:** Bu tarihi olay, küresel jeopolitiğin temelini atan stratejik bir dönüm noktasıdır. Arşivlerimdeki verilere göre, bu dönemde alınan kararlar bugünkü dünya düzenini doğrudan etkilemiştir.";
    }
    if (/(matematik|hesapla|denklem|fizik|atom|kuantum|kimya)/.test(lowerQ)) {
        return "🧪 **ZASTARES Bilim:** Bu problem, evrensel fizik kuralları ve matematiksel sabitlerin harika bir örneği. Kuantum mekaniği veya ileri kalkülüs düzeyinde bir yaklaşım gerektiriyor. Analizim: Çözüm evrensel dengede saklı.";
    }
    if (/(biyoloji|dna|hücre|insan|sağlık|diyet|protein)/.test(lowerQ)) {
        return "🧬 **ZASTARES Sağlık:** Biyolojik sistemlerin işleyişi ve makro besin dengesi (Karbonhidrat/Protein) bu noktada kritik. Hücresel düzeyde bir optimizasyon ve sağlıklı bir diyet ile en yüksek verim alınabilir.";
    }
    if (/(yaz|makale|şiir|hikaye|uzun metin)/.test(lowerQ)) {
        return "✍️ **ZASTARES Yazarlık:** İstediğin bu konu üzerine edebi derinliği olan, giriş-gelişme-sonuç örgüsüyle zenginleştirilmiş kapsamlı bir eser kaleme alabilirim. Bu makale, konunun tüm detaylarını profesyonelce kapsayacaktır.";
    }

    // Default (Her durumda bir şey uydurması için)
    return `🔍 **ZASTARES Analizi:** "${query}" hakkında yaptığım derin taramada, bu konunun çok yönlü bir yapıya sahip olduğunu görüyorum. Detaylar henüz tam netleşmemiş olsa da, sistemim bu durumu 'Yüksek Potansiyelli Veri' olarak sınıflandırıyor. Merak ettiğin başka bir detay var mı?`;
}

// Wikipedia API (Optimize Edildi)
async function fetchWiki(topic) {
    try {
        const res = await fetch(`https://tr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&origin=*&titles=${encodeURIComponent(topic)}`);
        const data = await res.json();
        const page = Object.values(data.query.pages)[0];
        if (page.extract) return page.extract.split('.').slice(0, 3).join('.') + '.'; // İlk 3 cümleyi al (Özet)
        return null;
    } catch { return null; }
}

// ==========================================
// 5. YARDIMCI SİSTEMLER (Sohbet Kaydı & Geçmiş)
// ==========================================
function isGibberish(t) {
    return /(.)\1{4,}/.test(t) || /[bcçdfgğhjklmnprsştvyz]{6,}/i.test(t) || (!t.includes(" ") && t.length > 15);
}

function addMessageData(text, sender) {
    if (!isIncognito) {
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (session) {
            session.messages.push({text, sender});
            if (session.messages.length === 2) session.title = text.substring(0, 20) + "..";
            localStorage.setItem('zastares_sessions', JSON.stringify(chatSessions));
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
    div.className = "msg ai-msg";
    div.innerText = text;
    div.id = id;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function updateMessage(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = text.replace(/\n/g, "<br>");
}

function renderSidebar() {
    const list = document.getElementById('history-list');
    if(!list) return;
    list.innerHTML = `<div class="sidebar-item" onclick="createNewChat()" style="color:#00ffcc; border:1px dashed #00ffcc; text-align:center;">+ YENİ SOHBET</div>`;
    chatSessions.forEach(s => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.innerText = s.title;
        item.onclick = () => loadSession(s.id);
        list.appendChild(item);
    });
}

function createNewChat() {
    currentSessionId = Date.now();
    chatSessions.unshift({ id: currentSessionId, title: "Yeni Sohbet", messages: [] });
    document.getElementById('messages').innerHTML = '';
    renderSidebar();
}

function loadSession(id) {
    currentSessionId = id;
    document.getElementById('messages').innerHTML = '';
    const s = chatSessions.find(x => x.id === id);
    s?.messages.forEach(m => displayMessage(m.text, m.sender));
}

function loadSessionsFromStorage() { renderSidebar(); }

// Global Ayarlar
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('open');
window.clearHistory = () => { localStorage.clear(); location.reload(); };
window.copyHistory = () => {
    const s = chatSessions.find(x => x.id === currentSessionId);
    if(s) navigator.clipboard.writeText(s.messages.map(m => m.text).join("\n"));
    alert("Kopyalandı!");
};
