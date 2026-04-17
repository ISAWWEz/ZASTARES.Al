#include <iostream>
#include <string>
#include <vector>
#include <curl/curl.h> // İnternet istekleri için
#include "httplib.h"    // Web sunucusu için
#include "nlohmann/json.hpp" // JSON işleme için (nlohmann/json kütüphanesi)

using namespace std;
using json = nlohmann::json;

// Curl'den gelen veriyi string'e yazmak için yardımcı fonksiyon
size_t WriteCallback(void* contents, size_t size, size_t nmemb, string* s) {
    size_t newLength = size * nmemb;
    try {
        s->append((char*)contents, newLength);
    } catch(bad_alloc& e) {
        return 0;
    }
    return newLength;
}

// Web'de araştırma yapan fonksiyon (API tabanlı)
string webSearch(string query) {
    CURL* curl;
    CURLcode res;
    string readBuffer;

    curl = curl_easy_init();
    if(curl) {
        // ÖRNEK: Google Custom Search veya Serper API kullanılabilir
        // Aşağıdaki URL bir temsilidir, kendi API key'ini eklemelisin
        string apiKey = "YOUR_API_KEY"; 
        string url = "https://google.com/search?q=" + query; // Basit örnek

        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
        
        // SSL sertifikası kontrolü (Mobil tarafta bazen sorun çıkarabilir, gerekirse kapatılabilir)
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);

        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);

        if(res == CURLE_OK) {
            return "Araştırma Tamamlandı: " + readBuffer.substr(0, 500) + "..."; // İlk 500 karakter
        }
    }
    return "Hata: İnternet bağlantısı kurulamadı.";
}

// ZASTARES AI Karar Mekanizması
string zastaresEngine(string userQuery) {
    cout << "Analiz ediliyor: " << userQuery << endl;
    
    // Eğer kullanıcı 'nedir', 'araştır' veya 'kimdir' gibi şeyler sorarsa internete git
    if (userQuery.find("ara") != string::npos || userQuery.find("nedir") != string::npos) {
        return webSearch(userQuery);
    }
    
    return "ZASTARES AI: Bu konuda yerel bilgiye sahibim, internete gerek yok.";
}

int main() {
    httplib::Server svr;

    svr.Post("/api/chat", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        string response = zastaresEngine(req.body);
        res.set_content(response, "text/plain; charset=utf-8");
    });

    cout << "ZASTARES AI + WEB SEARCH Aktif (Port: 8080)" << endl;
    cout << "Yapımcı: İSAWWEz-CODLYİNG STUDİOS" << endl;
    svr.listen("0.0.0.0", 8080);

    return 0;
}

