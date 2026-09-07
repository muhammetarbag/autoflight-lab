# AEE 303 Autoflight Lab

- Uygulama bu klasörde bağımsızdır. Üst `Okul` klasöründeki diğer ders projelerine dokunma.
- React / TypeScript / Vite; Türkçe açıklamalar, İngilizce aviation identifiers.
- Tek deterministik model: `src/sim/engine.ts`. Görsellerde veya göstergelerde bağımsız/rastgele uçuş değeri üretme.
- Eğitim sınırını koru: `Simplified educational model — not aircraft-specific.` Üreticiye özgü prosedür veya sertifikasyon iddiası ekleme.
- Arıza, ilgili sinyal / actuator davranışını ve monitor durumunu birlikte değiştirmeli. Active/armed ve AP/FD ayrımını koru.
- Doğrulama: `npm test`, `npm run build`; çalışan sunucuda `npm run test:e2e`. Python/Playwright kurulumu README'de.
- Browser test kanıtları `artifacts/` altında; `.venv/`, `dist/`, `node_modules/` ve kimlik bilgileri versiyon kontrolüne eklenmez.
- Sınav cevapları yalnız localStorage'da tutulur; okunurken doğrulanır. Öğrenci bilgisi / backend / analytics yoktur.
