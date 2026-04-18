// ZASTARES AI - OMNI ENGINE v4.0 (Global Expert)
// YAPIMCI: İSAWWEz-CODLYİNG STUDİOS

// ... (Önceki giriş ve swipe kodları aynı kalıyor, sadece cevaplama mantığını güçlendiriyoruz) ...

async function getAIResponse(query) {
    if (isGibberish(query)) {
        return "ZASTARES: Sanırım rastgele tuşlara bastın! Lütfen mantıklı bir şeyler yaz.";
    }

    const lowerQ = query.toLowerCase();
    
    // 1. WEB ARAŞTIRMASI (Wikipedia üzerinden derin bilgi çekme)
    const cleanTopic = query.replace(/ara|nedir|kimdir|hakkında|bilgi ver/gi, "").trim() || query;
    let webResult = await fetchWikipedia(cleanTopic);
    
    if (webResult) {
        return webResult;
    } 

    // 2. WEB'DE BULUNAMAZSA: UZMANLIK ALANLARINA GÖRE CEVAP ÜRETİMİ
    return generateExpertResponse(lowerQ);
}

function generateExpertResponse(q) {
    // Futbol ve Spor
    if (q.includes("futbol") || q.includes("basketbol") || q.includes("gol") || q.includes("maç")) {
        return "ZASTARES Spor Analizi: Futbol sadece bir oyun değil, bir strateji savaşıdır. Takımların form durumu, oyuncu istatistikleri ve taktiksel dizilişler sonucu belirler. Hangi futbolcu veya takım hakkında detaylı analiz istersin?";
    }
    
    // Biyoloji, Kimya, Fizik
    if (q.includes("hücre") || q.includes("atom") || q.includes("kuantum") || q.includes("dna") || q.includes("element")) {
        return "ZASTARES Bilim Laboratuvarı: Evrenin temel taşlarını inceliyoruz. Madde ve enerji arasındaki dengeyi, moleküler bağları veya yaşamın biyolojik kodlarını (DNA) analiz etmek benim uzmanlık alanım. Deneyin hangi aşamasındayız?";
    }

    // Üstün Matematik
    if (q.includes("matematik") || q.includes("integral") || q.includes("türev") || q.includes("denklem")) {
        return "ZASTARES Matematik Motoru: Karmaşık sayı setleri, matrisler ve sonsuz seriler... Evrenin dili matematiktir. Çözmemi istediğin o zor denklemi bana yaz, senin için basite indirgeyeyim.";
    }

    // Dünya Tarihi ve Savaşlar
    if (q.includes("tarih") || q.includes("savaş") || q.includes("imparator") || q.includes("devrim")) {
        return "ZASTARES Arşivi: Roma'nın çöküşünden Dünya Savaşlarına kadar her şey hafızamda. Stratejiler, antlaşmalar ve tarihin akışını değiştiren liderler... Hangi döneme yolculuk yapıyoruz?";
    }

    // Diyetisyen ve Sağlık
    if (q.includes("diyet") || q.includes("kalori") || q.includes("beslenme") || q.includes("protein")) {
        return "ZASTARES Diyetisyen: Sağlıklı yaşam için makro besin dengesi (Karbonhidrat, Protein, Yağ) çok önemlidir. Vücut tipine ve hedefine göre sana özel bir beslenme haritası çıkarabilirim. Bugün ne yedin?";
    }

    // Dünya Edebiyatı ve Dil
    if (q.includes("kitap") || q.includes("yazar") || q.includes("şiir") || q.includes("dil") || q.includes("edebiyat")) {
        return "ZASTARES Kütüphanesi: Dostoyevski'den Shakespeare'e, semantiğin derinliklerinden gramer yapılarına kadar buradayım. Kelimelerin gücüyle bir şaheser yaratmaya ne dersin?";
    }

    // Büyük Ölçülü Yazı (Makale Yazma Yeteneği)
    if (q.includes("yaz") || q.includes("makale") || q.includes("uzun") || q.includes("metin")) {
        return "ZASTARES Yazarlık Modu: Senin için sayfalarca süren, profesyonel ve etkileyici bir metin kaleme alabilirim. Konuyu belirle, giriş-gelişme-sonuç örgüsünü ben kurayım.";
    }

    // Genel Cevap (Hala bir şey uydurması gerekiyorsa)
    return `ZASTARES: Bu konu hakkında derin bir analiz yapıyorum. Görünüşe göre "${q}" meselesi, çok yönlü bir yaklaşımla ele alınmalı. Bilgi tabanımı bu yönde genişletiyorum, sormaya devam et!`;
}

// ... (fetchWikipedia ve diğer fonksiyonlar aynı kalıyor) ...
