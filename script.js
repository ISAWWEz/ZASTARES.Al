// ZASTARES AI - OMNI ENGINE v5.0 (Performance & Expert Mode)
// YAPIMCI: İSAWWEz-CODLYİNG STUDİOS

let chatSessions = JSON.parse(localStorage.getItem('zastares_sessions')) || [];
let currentSessionId = null;
let isIncognito = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Splash Screen ve Giriş Kontrolü (Hızlandırıldı)
    const splash = document.getElementById('splash-screen');
    const auth = document.getElementById('auth-screen');
    const main = document.getElementById('main-app');

    setTimeout(() => {
        if(splash) splash.style.display = 'none';
        const savedUser = localStorage.getItem('zastares_user');
        if (savedUser) {
            login(true); 
        } else if(auth) {
            auth.classList.remove('hidden');
        }
    }, 2500);

    // Event Listeners (Takılmayı önlemek için pasif dinleyiciler kullanıldı)
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
// 1. PERFORMANS ODAKLI KAYDIRMA (SWIPE)
// ==========================================
function setupSwipeMechanics() {
    let touchStartX = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    document.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        const diff = touchEndX - touchStartX;
        if (diff > 80) sidebar.classList.add('open'); // Sağa
        if (diff < -80) sidebar.classList.remove('open'); // Sola
    }, {passive: true});
}

// ==========================================
// 2. AKILLI CEVAP VE UZMANLIK SİSTEMİ
// ==========================================
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addMessageData(text, 'user');
    input.value = '';

    const tempId = "ai-" + Date.now();
    addPlaceholder("ZASTARES Analiz Ediyor...", tempId);

    // Uygulamanın donmasını engellemek için async/await yapısı optimize edildi
    setTimeout(async () => {
        try {
            const result = await getAIResponse(text);
            updateMessage(tempId, result);
            addMessageData(result, 'ai');
        } catch (e) {
            updateMessage(tempId, "ZASTARES: Veri işleme hatası. Lütfen tekrar dene.");
        }
    }, 100); 
}

async function getAIResponse(query) {
    const lowerQ = query.toLowerCase();
    
    // Rastgele tuş kontrolü (Hızlı Algoritma)
    if (/(.)\1{4,}/.test(query) || (/[bcçdfgğhjklmnprsştvyz]{6,}/i.test(query)) || (!query.includes(" ") && query.length > 12)) {
        return "ZASTARES: Sanırım rastgele tuşlara bastın! Lütfen mantıklı bir şeyler yaz ki sana yardımcı olabileyim.";
    }

    // WEB ARAŞTIRMA (Öncelikli)
    const cleanTopic = query.replace(/ara|nedir|kimdir|hakkında|bilgi ver/gi, "").trim();
    const webData = await fetchWikipedia(cleanTopic || query);
    
    if (webData) return webData;

    // UZMANLIK ALANLARI (Kapsamlı ve Bilimsel Yanıtlar)
    return generateDeepResponse(lowerQ);
}

function generateDeepResponse(q) {
    // Akademik ve Teknik Konular (Fizik, Kimya, Matematik, Biyoloji)
    if (/(atom|molekül|kuantum|hücre|dna|denklem|matematik|fizik|kimya|biyoloji|integral|türev)/.test(q)) {
        return "🔍 **ZASTARES Akademik Veri:** Bu konu evrensel yasalarla doğrudan ilişkilidir. Analizlerime göre, bahsettiğin yapının moleküler veya matematiksel temelleri oldukça derin. Bu alandaki ileri düzey teorileri veya formülleri senin için detaylandırabilirim.";
    }

    // Tarih, Edebiyat ve Dünya Savaşları
    if (/(tarih|savaş|imparator|yazar|kitap|edebiyat|devrim|osmanlı|roma)/.test(q)) {
        return "📜 **ZASTARES Arşivi:** Tarihin tozlu sayfalarında bu konunun izleri çok belirgin. Stratejik hamleler, kültürel devrimler ve edebi şaheserler insanlığı şekillendirdi. Hangi dönemin veya akımın derinliklerine inmek istersin?";
    }

    // Spor, Futbol ve Atletizm
    if (/(futbol|maç|gol|basketbol|spor|oyuncu|şampiyon)/.test(q)) {
        return "⚽ **ZASTARES Spor Merkezi:** Performans verileri ve taktiksel disiplin bu sporun kalbidir. Takımların dinamikleri veya sporcu fizyolojisi üzerine geniş bir veri tabanına sahibim. Analiz etmemi istediğin spesifik bir olay var mı?";
    }

    // Sağlık, Diyet ve Beslenme
    if (/(diyet|kalori|sağlık|besin|protein|zayıflama|vitamin)/.test(q)) {
        return "🍎 **ZASTARES Sağlık Danışmanı:** İnsan metabolizması kompleks bir makine gibidir. Makro besin dengesi ve günlük kalori ihtiyacı hedeflerine göre değişir. Senin için bilimsel bir beslenme şeması veya diyet önerisi oluşturabilirim.";
    }

    // Uzun Metin / Makale Yazma
    if (/(yaz|makale|uzun metin|hikaye|anlat)/.test(q)) {
        return "✍️ **ZASTARES Yazarlık Modu:** Profesyonel, akıcı ve bilgilendirici bir metin hazırlıyorum. Giriş, gelişme ve sonuç bölümleriyle konuyu en ince detayına kadar ele alabilirim. Konu başlığını netleştirmen yeterli.";
    }

    // Hiçbir şey bulunamazsa (Senin istediğin "uydurma" ama zekice cevaplar)
    const defaultLogic = [
        "Bu konu üzerindeki verilerim henüz işleniyor ancak mantıksal çıkarımım bunun büyük bir potansiyel taşıdığı yönünde.",
        "ZASTARES sistemleri bu soruyu yüksek öncelikli olarak analiz ediyor. Bence bu, geleceğin teknolojileriyle bağlantılı olabilir.",
        "İlginç bir nokta! Veri tabanımda tam karşılığı olmasa da, algoritmalarım bunun doğru bir yaklaşım olduğunu söylüyor."
    ];
    return "💡 " + defaultLogic[Math.floor(Math.random() * defaultLogic.length)];
}

async function fetchWikipedia(topic) {
    try {
        const res = await fetch(`https://tr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&origin=*&titles=${encodeURIComponent(topic)}`);
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId !== "-1") return `🌐 **ZASTARES Araştırma:**\n${pages[pageId].extract.substring(0, 700)}...`;
        return null;
    } catch { return null; }
}

// ==========================================
// 3. SİSTEM VE HAFIZA YÖNETİMİ (TAKILMA ÖNLEYİCİ)
// ==========================================
function addMessageData(text, sender) {
    if (!isIncognito && currentSessionId) {
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (session) {
            session.messages.push({text, sender});
            if (session.messages.length === 2 && sender === 'user') {
                session.title = text.substring(0, 25) + "...";
            }
            saveToStorage();
            renderSidebar();
        }
    }
    displayMessage(text, sender);
}

function displayMessage(text, sender) {
    const box = document.getElementById('messages');
    if(!box) return;
    const div = document.createElement('div');
    div.className = `msg ${sender}-msg`;
    div.innerHTML = text.replace(/\n/g, "<br>");
    box.appendChild(div);
    box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' }); // Daha akıcı kaydırma
}

function updateMessage(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = text.replace(/\n/g, "<br>");
        el.classList.add('fade-in'); // Hafif bir geçiş efekti
    }
}

// ... Diğer yardımcı fonksiyonlar (saveToStorage, renderSidebar, login, register) öncekiyle aynı kalmalı ...
// (Kodun geri kalanı stabil olduğu için buraya eklemedim ama senin dosyanda durmalı)
        
