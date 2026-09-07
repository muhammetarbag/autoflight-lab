# Doğrulama — AEE 303 Autoflight Lab

Son canlı kontrol: **2026-09-07T07:53:09+03:00**.

## Sonuç

- `npm test`: **48/48** model ve içerik testi geçti.
- `npm run build`: TypeScript strict kontrolü ve Vite üretim derlemesi geçti.
- `npm run test:e2e`: **28/28** tarayıcı kontrol grubu, **135** etkileşim grubu geçti.
- JavaScript / console / asset hatası: **0**.
- Son tarayıcı raporu, son üretim derlemesinden sonra üretildi.
- Sunulan HTML, JavaScript, CSS ve favicon diskteki `dist/` çıktısıyla byte-byte eşleşti; HTTP 200 doğrulandı.

## Çalışan önizleme

Adres: [http://127.0.0.1:3022/](http://127.0.0.1:3022/).

Geçici kullanıcı servisi: `autoflight-lab-preview.service`. Servis yalnız `127.0.0.1` üzerinde dinler; sohbet sürecinden bağımsız çalışır. Kalıcı boot/login autostart kurulmadı. Yeniden başlatmadan sonra README'deki `npm run preview` komutuyla tekrar açılabilir.

Servisi durdurma: `systemctl --user stop autoflight-lab-preview.service`.

## Test kapsamı

- 15 laboratuvarın navigasyonu, slider min/max değerleri, ON/OFF anahtarları, arıza düğmeleri ve resetleri.
- Heading / bank, altitude / VS, speed / thrust neden-sonuç ilişkileri; NAV capture ve active/armed geçişleri.
- Yaw-rate damping, yaw sapmasının heading katkısı, elevator yükünün trim'e aktarılması, SAS karşılaştırması.
- Autoland'de 27 lateral / vertical offset / crosswind kombinasyonu; altı kritik arızada kesilme ve yanlış TOUCHDOWN oluşmaması; sağlıklı ve AP arızalı go-around.
- 12 FCC bağlantısının port düğmesiyle ve **gerçek fare koordinatlarıyla çizgi üzerinden** seçilmesi. Üst katmanın çizgilere tıklamayı engelleyen davranışı düzeltildi ve regresyon testi eklendi.
- 19 bileşen kartı, aile filtreleri, arama ve boş sonuç; 9 temsilî fiziksel konum.
- 7 teşhis vakasının toplam 28 kanıt kontrolü, yanlış/doğru/retry akışı.
- 28 sınav yanıtı, doğru/yanlış skoru, tamamlanma, sayfa yenileme, sıfırlama ve bozuk localStorage girdileri.
- Tüm bölümlerde 320, 390 ve 768 px genişlikler; yatay taşma bulunmadı. Masaüstü ekranları 1512 px genişlikte kontrol edildi.
- Modal focus, Escape/close, mobil menü, duraklat/sürdür, 1×/4×/12× hız ve grafik geçmişi.

## Çalışma ortamı ve sınırlar

Gözlenen ortam: Node.js **v26.8.1**, Python **3.14.7**, Chromium **151.0.7922.34**, Playwright Python **1.62.0**. Tek ajanla uygulama ve doğrulama yapıldı.

Mobil kontroller Chromium viewport emülasyonudur; fiziksel telefon, Safari ve Firefox testi yapılmadı. Gerçek uçak prosedürü, üretici performansı veya sertifikasyon doğrulaması değildir. Model varsayımları README'de ve uygulamadaki Model & kaynaklar penceresindedir.

## Kanıt dosyaları

- [Model test çıktısı](artifacts/model-tests.log)
- [Üretim derleme çıktısı](artifacts/build.log)
- [Tarayıcı raporu](artifacts/browser-report.json)
- [Tarayıcı test çıktısı](artifacts/browser-production.log)
- [Ek gerçek fare / geometrik izdüşüm kontrolü](artifacts/final-smoke.json)
- [Uçak tutum izdüşümü](artifacts/axes-projected.png)
- [Masaüstü önizleme](artifacts/final-desktop.png)

`artifacts/` geçici kanıt klasörüdür ve `.gitignore` kapsamındadır. Uygulama kaynakları, README ve testler `autoflight-lab/` altında bağımsız tutulur.

## Sunulan dosya bütünlüğü

| Dosya | HTTP | SHA-256 |
|---|---|---|
| `./favicon.svg` | 200 | `b4546eec573cb54acc2265ceb484133e531b6b3d40cc6ca199614f7317eb744f` |
| `./assets/index-b9GEnnU-.js` | 200 | `9da578baae468c93ba61d96dff637b1c56e3b1e2b0589bdf140af51bc6cd4ee4` |
| `./assets/index-D8FLk0ZK.css` | 200 | `d383691feee3ef66b5b48df31d531f182174e94c34481d374a74e2dd7528cf97` |
