// Kendi API anahtarınızı buraya yapıştırın
const API_KEY = "AIzaSyB4g9EPmRPTwVbkmlxTb0Kkz..."; 
// Güncel Gemini 1.5 Flash API endpointi
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const statusDiv = document.getElementById('status');
const outputDiv = document.getElementById('output');

sendBtn.addEventListener('click', handleSearch);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });

async function handleSearch() {
    const query = userInput.value.trim();
    if (!query) {
        alert("Lütfen bir soru girin!");
        return;
    }

    sendBtn.disabled = true;
    statusDiv.style.display = "block";
    outputDiv.innerText = "Yapay zeka interneti tarıyor ve yanıtı hazırlıyor...";
    outputDiv.style.color = "#e1e1e6";

    try {
        // En güncel ve kararlı Google Arama Bağlantısı (Grounding) istek gövdesi
        const requestBody = {
            contents: [{
                parts: [{
                    text: `İnternette güncel arama yaparak bu soruyu detaylıca cevapla: ${query}`
                }]
            }],
            tools: [{
                googleSearchRetrieval: {
                    dynamicRetrievalConfig: {
                        mode: "MODE_DYNAMIC",
                        dynamicThreshold: 0.3
                    }
                }
            }]
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // Konsola gelen ham veriyi yazdırıyoruz (Hata ayıklama için F12'de görünür)
        console.log("API Yanıtı:", data);

        // API'den hata döndüyse ekrana yazdır
        if (data.error) {
            throw new Error(`${data.error.status} - ${data.error.message}`);
        }

        // Yanıtı ayıklama ve ekrana basma
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            outputDiv.innerText = data.candidates[0].content.parts[0].text;
        } else {
            outputDiv.innerText = "Yapay zeka arama yaptı ancak metin biçiminde bir cevap üretemedi. Konsolu (F12) kontrol edin.";
        }

    } catch (error) {
        console.error("Detaylı Hata:", error);
        outputDiv.innerText = `Hata Oluştu!\n\nNedeni: ${error.message}\n\nTavsiye: API anahtarınızın doğruluğunu ve internet bağlantınızı kontrol edin.`;
        outputDiv.style.color = "#fc4e4e";
    } finally {
        sendBtn.disabled = false;
        statusDiv.style.display = "none";
    }
}

