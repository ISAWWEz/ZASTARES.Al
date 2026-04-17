async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text) return;

    addMessage(text, 'user');
    input.value = '';

    try {
        // C++ Sunucusuna istek gönder (Telefonunda 8080 portunda çalışmalı)
        const response = await fetch("http://localhost:8080/api/chat", {
            method: "POST",
            body: text,
            headers: { "Content-Type": "text/plain" }
        });
        
        const data = await response.text();
        addMessage(data, 'ai');
    } catch (error) {
        addMessage("Hata: C++ AI Motoruyla bağlantı kurulamadı. Lütfen sunucuyu çalıştırın.", 'ai');
    }
}

