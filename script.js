<script>
    // Tarayıcı hafızasındaki veriyi çek (Veritabanı simülasyonu)
    let db = JSON.parse(localStorage.getItem('oyuncuVeritabani')) || {};

    // KAYDOL MEKANİĞİ
    function register() {
        const nick = document.getElementById('regNick').value.trim();
        const pass = document.getElementById('regPass').value;
        
        // Şifre Kriterleri
        const hasNumber = /\d/.test(pass);
        const hasSymbol = /[@#₺_]/.test(pass);

        if (nick === "" || pass === "") {
            return alert("Boş alan bırakmayın!");
        }
        if (db[nick]) {
            return alert("Bu oyuncu zaten kayıtlı!");
        }
        if (!hasNumber || !hasSymbol || pass.length < 12) {
            return alert("Şifre kriterlere uymuyor! (12 karakter, rakam ve @#₺_)");
        }

        // Veritabanına Yazma İşlemi
        db[nick] = { 
            password: pass, 
            banBitisSuresi: 0,
            kayitTarihi: new Date().toLocaleString() // Ne zaman kaydolduğunu da tutalım
        };
        
        // Hafızayı Güncelle
        localStorage.setItem('oyuncuVeritabani', JSON.stringify(db));
        
        alert("Kayıt başarılı! Admin paneline eklendiniz.");
        
        // Eğer o sırada admin paneli açıksa listeyi anında güncelle
        if (document.getElementById('adminModal').style.display === 'flex') {
            openAdminPanel();
        }
        
        switchTab('loginSec');
    }

    // ADMİN PANELİNE YAZDIRMA MEKANİĞİ
    function openAdminPanel() {
        const listDiv = document.getElementById('adminUserList');
        listDiv.innerHTML = ""; // Önce listeyi temizle
        
        const suAn = new Date().getTime();

        // Veritabanındaki (db objesi) her ismi döngüye al ve panele yaz
        Object.keys(db).forEach(nick => {
            const userBox = document.createElement('div');
            userBox.className = 'user-item';
            
            let banDurumu = db[nick].banBitisSuresi > suAn ? "<span class='banned-text'>(BANLI)</span>" : "";

            // Admin panelindeki her satırın içeriği
            userBox.innerHTML = `
                <div>
                    <strong>${nick}</strong> ${banDurumu}<br>
                    <small style="font-size:10px; color:gray;">${db[nick].kayitTarihi || ''}</small>
                </div>
                <div class="action-btns">
                    <button class="ban-btn" onclick="banUser('${nick}')">Ban</button>
                    <button class="delete-btn" onclick="deleteUser('${nick}')">Sil</button>
                </div>
            `;
            listDiv.appendChild(userBox);
        });

        if (Object.keys(db).length === 0) {
            listDiv.innerHTML = "<p style='text-align:center;'>Henüz kimse kaydolmadı.</p>";
        }

        document.getElementById('adminModal').style.display = 'flex';
    }

    // GİRİŞ YAP MEKANİĞİ
    function login() {
        const nick = document.getElementById('loginNick').value.trim();
        const pass = document.getElementById('loginPass').value;

        if (!db[nick] || db[nick].password !== pass) {
            return alert("Nick veya şifre hatalı!");
        }

        if (db[nick].banBitisSuresi > new Date().getTime()) {
            return alert("Giriş engellendi! Hesabınız banlı.");
        }

        alert("Başarıyla giriş yapıldı!");
        closeModal('authModal');
    }

    // HESAP SİLME
    function deleteUser(nick) {
        if (confirm(nick + " kişisini silmek istediğine emin misin?")) {
            delete db[nick];
            localStorage.setItem('oyuncuVeritabani', JSON.stringify(db));
            openAdminPanel(); // Paneli hemen güncelle
        }
    }

    // DİĞER FONKSİYONLAR (Aynı kaldı)
    function openAuthModal() { document.getElementById('authModal').style.display = 'flex'; }
    function closeModal(id) { document.getElementById(id).style.display = 'none'; }
    function switchTab(tabId) {
        document.querySelectorAll('.form-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        event.target.classList.add('active');
    }
    function checkAdminPassword() {
        if (prompt("Kod:") === "☍⟁ᚦDOS✓ENT꧁") openAdminPanel();
    }
</script>
