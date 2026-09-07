# AEE 303 — Automatic Flight Systems Virtual Lab

ATA 22 konularını kontrol çevrimleri, hareketli uçak/gösterge görünümleri, arıza enjeksiyonu ve teşhis deneyleriyle öğreten Türkçe web uygulaması. Avionics terimleri İngilizce korunur.

**Simplified educational model — not aircraft-specific.**

[Laboratuvarı aç](https://muhammetarbag.github.io/autoflight-lab/) · [Tüm laboratuvarlar](https://muhammetarbag.github.io/)

## Yayınlama

GitHub Actions, `main` güncellemelerinde kilitli bağımlılıkları kurar; 48 model/içerik testini, üretim bağımlılığı denetimini, TypeScript/üretim derlemesini ve 28 tarayıcı kontrol grubunu çalıştırır. Kontroller başarılı olduktan sonra `dist/` çıktısı GitHub Pages'e yayımlanır. Pull request'lerde aynı kontroller çalışır; yayın yapılmaz.

## Çalıştırma

Node.js 22.18+ gerekir. Sunucu yalnızca yerel loopback adresinde dinler.

```sh
npm ci
npm run dev
```

Adres: http://127.0.0.1:3022/

```sh
npm test
npm run build
npm run preview
```

`preview`, dev sunucusu kapalıyken aynı portta üretim çıktısını sunar. `dist/` tamamen statiktir; backend, hesap, API anahtarı veya uzak font servisi gerektirmez. Vite `base: './'` sayesinde bir alt klasörden de sunulabilir. Hash URL'leri (`#autoland`, `#yaw`, `#quiz`) ilgili laboratuvarı açar.

## İçerik

| Laboratuvar | İşlev |
|---|---|
| Autoflight Fundamentals | 9 aşamalı komut/feedback çevrimi; düğüm inceleme ve adım modu |
| Roll / Pitch / Yaw | Kanal anahtarları, yüzeyler, hata ve rate göstergeleri, üç eksenli bozucular |
| Yaw Damper | ON/OFF, damping ve sensitivity; yaw-rate ve rudder grafikleri |
| Automatic Trim | Elevator/trim aktarımı, pitch tepkisi, normalize servo load ve trim failure |
| Autopilot Modes | MCP, PFD, active/armed FMA, HDG/NAV/ALT/VS/APP/GA |
| Navigation Interface | VOR, LOC, G/S, heading, air data, attitude, RA sinyal kesme |
| Autothrottle | Throttle lever ve engine lag; speed/drag/wind/mass deneyleri, dört arıza |
| Autoland | Sapma yakalama, approach, flare, land, touchdown, go-around; altı kritik arıza |
| Helicopter SAS | Üç eksen stabilizasyonu, ON/OFF, sensör/güç arızaları |
| Architecture | 9 temsilî fiziksel konum ve bileşen ilişkileri |
| FCC Interfaces | 12 tıklanabilir bağlantı, altitude signal trace |
| Components | Aranabilir ve filtrelenebilir 19 bileşen kartı |
| Troubleshooting | Kanıt toplayarak çözülen 7 vaka; yanlış/doğru açıklaması |
| Free Experiment | AP, YD, A/T, trim, ortam, modlar, sensör/servo arızaları ve canlı telemetri |
| Quiz / Challenges | 7 soru türünde 28 soru; puan, tamamlanma ve yerel kayıt |

Her bölüm Learn → Experiment → Observe → Why akışını izler. İlgili bölümlerde Failure Injection bulunur. RESET LAB simülasyonu, grafik geçmişini ve o bölümün inceleme adımlarını başlangıca getirir. Sınavın ayrı **Sınavı sıfırla** düğmesi vardır.

## Örnek deneyler

1. **Heading:** `Autopilot Modes` → selected heading 150° → HDG. Bank artışını, heading değişimini ve hedefte bank'ın azalmasını izle.
2. **Altitude:** selected altitude 5000 ft → ALT ACQ. Capture sonrasında ALT HOLD aktif olur. ALT HOLD mevcut/tutulan irtifayı korur; yalnız hedef seçmek tırmanış başlatmaz.
3. **Yaw damping:** Yaw Damper → OFF → darbe. Reset sonrası aynı başlangıçta ON yanıtını karşılaştır.
4. **Trim:** Automatic Trim → pitch 8°; elevator azalırken trim artar. Trim arızasını ekle, hedefi yeniden değiştir ve sürekli yükü gör.
5. **Autoland:** offset ve crosswind seç → APP ARM → 12×. LOC/G/S yakalamasını ve düşük irtifa geçişlerini izle. RA arızası autoland'i keser; GO-AROUND genel bir tırmanış komutu üretir.
6. **Teşhis:** bir vakada dört kontrol noktasını incele, sonra arızayı seç. Çözüm, gönderimden önce gösterilmez.

## Model ve sınırlamalar

Tek fizik durumu `src/sim/engine.ts` içindedir. UI, yüzeyler, göstergeler ve grafikler aynı durumdan türetilir. `Math.random()` ile uçuş değeri veya animasyon üretilmez.

| İlişki | Bu modeldeki yaklaşım |
|---|---|
| Heading → bank | En kısa heading hatası × 0.65; ±25° bank komut limiti |
| Bank → heading | `g · tan(bank) / speed` ile koordineli dönüş; yaw sapmasının heading katkısı ayrıca eklenir |
| Altitude → pitch | Altitude error → sınırlı VS → `asin(VS / speed)` pitch referansı |
| Pitch → altitude | `speed · sin(pitch)` vertical speed; ft/min → ft/s entegrasyonu |
| Yaw damper | Hafif sönümlü yaw salınıcısı; yaw rate'e ters rudder feedback |
| Yaw channel | Üç eksen deneyinde hedef yaw sapması, rate damping ve denge feedforward'u |
| Trim | Sustained elevator talebini yavaşça trim'e aktarır; konum ve hız sınırları vardır |
| Speed → thrust | PI kontrol, throttle servo gecikmesi ve birinci dereceden engine lag |
| Thrust → speed | Normalize thrust − quadratic drag; kütleye bağlı ivme |
| Wind | Sabit headwind ground speed'i azaltır; değişen wind kısa IAS geçişi oluşturur |
| LOC | Lateral offset ve crosswind crab düzeltmesi → heading/bank command |
| G/S | 3° referans yoluna düşey hata → VS/pitch command |
| SAS | Üç basit tutum salınıcısına ek rate damping |

- Normal adım **0.025 s**; motor tek çağrıda en çok **0.05 s** kabul eder. Arka plandaki sekmede fizik durur; geri dönüşte kayıp süre birden uygulanmaz. 1×/4×/12×, aynı adımları daha hızlı yürütür.
- Katsayılar, kazançlar, drag, kütle aralıkları, limitler ve capture eşikleri **eğitim için seçilmiştir**; kalibre edilmiş uçak verisi değildir. Thrust limiti nedeniyle her hız hedefi her drag koşulunda erişilebilir değildir; monitor bunu bildirir.
- Gerçek Dutch roll, aerodinamik roll-yaw bağlaşımı ve rotor aerodinamiği çözülmez. Yaw/sideslip değeri basitleştirilmiş bir sapma temsilidir. Uçak resmi tutumun geometrik izdüşümüdür; 3D airframe veya CFD modeli değildir.
- NAV INT ve G/S INT, bu laboratuvarın yakalamayı görünür kılan genel intercept yardımcılarıdır; üretici FMA mod adı olarak yorumlanmamalıdır.
- Autoland düz arazi, sıfır pist kotu ve 3° yaklaşma yolu kullanır. Dolayısıyla sağlam RA ile altitude aynı sayıya karşılık gelir. LOC/G/S sapmaları metre/feet cinsindendir; ILS dot ölçeği değildir.
- Eğitim capture eşikleri: LOC <90 m; sonra G/S <65 ft; yaklaşma kararlılığı <45 m / <35 ft; FLARE ≤50 ft; LAND ≤12 ft. Fazlar fiziksel duruma göre ilerler. Dokunma sonrası yavaşlama sabit ve normalize edilmiştir.
- Her kritik yaklaşma arızasında autoland kesilir. Aircraft-specific redundancy, fail-passive/fail-operational, CAT II/III yetkilendirmesi, alert height veya published missed-approach route modellenmez.
- Arızalı sensörün fiziksel değeri eğitim için görünür kalabilir; validity uyarısı buna eşlik eder. Arıza giderilmesi ayrılmış AP/YD/A/T'yi kendiliğinden yeniden bağlamaz. AP arızası varken GA, FD talebidir ve otomatik kumanda sağlamaz.
- Gerçek uçak bileşen konumları, bus mimarisi ve güç yedekliliği değişebilir. Harita bakım yerleşim dokümanı değildir.

## Tarayıcı doğrulaması

Python 3.10+ ve Playwright:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r tests/requirements.txt
.venv/bin/python -m playwright install chromium
npm run dev
# Ayrı terminal:
npm run test:e2e
```

Varsayılan adres `http://127.0.0.1:3022`. Farklı sunucu için `LAB_URL`, farklı Chromium binary için `CHROME_PATH` kullanılabilir. Testler gerçek UI üzerinden çalışır; yalnızca test için açılan simülasyon API'si yoktur. Sanal tarayıcı saati aynı `requestAnimationFrame` döngüsünü hızlandırır. Kanıtlar `artifacts/browser-report.json`, ekran görüntüleri ve test çıktılarıdır; `artifacts/` Git dışında tutulur.

## Kaynaklar

- [FAA Advanced Avionics Handbook — Automated Flight Control](https://www.faasafety.gov/files/events/EA/EA03/2019/EA0392003/aah_ch04.pdf): active/armed, capture ve automation farkındalığı.
- [FAA AIM — Air Navigation](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap1_section_1.html): LOC/G/S guidance ve ILS sinyal işlevleri.
- [FAA AIM — Helicopter Operations](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap10_section_1.html): SAS, AP ve FD işlev ayrımı.
- [Garmin — Autopilot, Yaw Damper and Automatic Trim](https://www8.garmin.com/manuals/webhelp/GUID-1FA95EDE-BA0A-4000-B109-7E73945389F7/EN-US/GUID-85E10FEF-706A-40C3-BC32-FA1E6E4348B5.html): işlevlerin üretici örneği; model bu sistemin kopyası değildir.

Kaynaklar kavramlara dayanak sağlar. Yazılımdaki sayısal kazançlar, motor denklemleri ve autoland davranışı bu belgelerin kalibre edilmiş uygulaması değildir.

Kalıcı ders notu için önerilen Obsidian başlığı: `[[AEE 303 - Automatic Flight Systems]]`; ilişkiler: `[[ATA 22]]`, `[[Autopilot]]`, `[[Yaw Damper]]`, `[[Autoland]]`. Bu görev vault'a not yazmaz.
