export interface Question {
  type: string;
  topic: string;
  text: string;
  options: string[];
  answer: number;
  why: string;
}
export const questions: Question[] = [
  {
    type: "Signal flow",
    topic: "Temeller",
    text: "Kapalı çevrimde ölçülen uçak tepkisi nereye döner?",
    options: [
      "Yalnızca throttle lever’a",
      "FCC karşılaştırma / feedback girişine",
      "Sadece pist vericisine",
      "MCP düğmesini mekanik olarak çevirir",
    ],
    answer: 1,
    why: "Sensör feedback’i FCC’ye dönerek gerçek durum ile referansın yeniden karşılaştırılmasını sağlar.",
  },
  {
    type: "Bileşeni tanı",
    topic: "MCP",
    text: "Pilotun selected heading ve mod seçimini FCC’ye hangi bileşen iletir?",
    options: [
      "Radio altimeter",
      "Aileron servo",
      "Mode Control Panel",
      "Rudder actuator",
    ],
    answer: 2,
    why: "MCP pilotun referans ve mod seçim arayüzüdür; fiziksel kumanda yüzeyini doğrudan sürmez.",
  },
  {
    type: "Yanıtı öngör",
    topic: "Roll",
    text: "Heading 090°, selected heading 150°. HDG active ve AP bağlı. İlk beklenen yanıt?",
    options: [
      "Sağa bank ve heading artışı",
      "Sadece elevator hareketi",
      "Hemen 150° heading",
      "Rudder’ın sabit tam sapması",
    ],
    answer: 0,
    why: "Pozitif en kısa heading hatası sağ bank talebi üretir. Bank açısı yön değişimini zaman içinde oluşturur.",
  },
  {
    type: "Göstergeyi yorumla",
    topic: "FMA",
    text: "LOC armed fakat HDG active ise mevcut lateral guidance hangisidir?",
    options: ["LOC", "G/S", "Hiçbiri", "HDG"],
    answer: 3,
    why: "Armed bir sonraki olası yakalamayı bekler. Uçağı o anda active mod yönetir.",
  },
  {
    type: "Çoktan seçmeli",
    topic: "Yaw damper",
    text: "Yaw damper temel olarak hangi değişime karşı koyar?",
    options: [
      "Kabin sıcaklığına",
      "İstenmeyen yaw oscillation / yaw rate’e",
      "Selected altitude’a",
      "Sabit headwind değerine",
    ],
    answer: 1,
    why: "Yaw-rate feedback, ters işaretli rudder düzeltmesi üreterek salınımı sönümler.",
  },
  {
    type: "Yanıtı öngör",
    topic: "Yaw damper",
    text: "Aynı darbe ve uçak parametrelerinde YD ON neyi değiştirmelidir?",
    options: [
      "Salınım anında sıfır olur",
      "Heading anında 000° olur",
      "Salınım zarfı daha hızlı küçülür",
      "Hız mutlaka iki katına çıkar",
    ],
    answer: 2,
    why: "Sönümleme kademelidir. Atalet ve actuator yanıtı nedeniyle fiziksel durum aniden sıfırlanmaz.",
  },
  {
    type: "Çoktan seçmeli",
    topic: "Trim",
    text: "Automatic trim neden elevator üzerindeki sürekli talebi azaltır?",
    options: [
      "Denge momentini trim/stabilizer üzerine aktarır",
      "Feedback sensörünü kapatır",
      "Her durumda pitch’i sıfıra getirir",
      "A/T’yi devreden çıkarır",
    ],
    answer: 0,
    why: "Trim, gerekli denge momentini sağlar; aynı pitch için daha az sürekli elevator deflection gerekir.",
  },
  {
    type: "Arıza teşhisi",
    topic: "Trim",
    text: "Pitch korunuyor, elevator sürekli sapmış, trim position hiç değişmiyor. İlk şüphe?",
    options: [
      "LOC receiver",
      "Heading selector",
      "Radio altimeter",
      "Trim actuator / interface",
    ],
    answer: 3,
    why: "Pitch kanalının elevator ile çalışması, otomatik trim yolunun da çalıştığını kanıtlamaz.",
  },
  {
    type: "Active mode",
    topic: "İrtifa",
    text: "Bu laboratuvarda ALT HOLD aktifken sadece selected altitude değiştirilirse ne olur?",
    options: [
      "Otomatik olarak dalış başlar",
      "Tutulan irtifa değişmez; ALT ACQ veya VS gerekir",
      "AP zorunlu ayrılır",
      "IAS hedefi değişir",
    ],
    answer: 1,
    why: "ALT HOLD yakalanmış irtifayı tutar. Yeni irtifaya geçiş ayrı bir vertical mode gerektirir.",
  },
  {
    type: "Yanıtı öngör",
    topic: "Pitch",
    text: "Pozitif pitch ile yükselme sürerken irtifa nasıl değişir?",
    options: [
      "Tek karede hedefe sıçrar",
      "Bank ile aynı değerde olur",
      "Vertical speed zamanla irtifaya entegre edilir",
      "Daima sabit kalır",
    ],
    answer: 2,
    why: "İrtifa değişimi vertical speed’in zaman integralidir; modelde ft/min değeri saniyeye çevrilir.",
  },
  {
    type: "Signal flow",
    topic: "ALT",
    text: "Doğru altitude-control zinciri hangisidir?",
    options: [
      "MCP → FCC → elevator → aircraft → air data → FCC",
      "RA → throttle → MCP → LOC",
      "Elevator → VOR → speed selector",
      "FCC → MCP → glideslope transmitter",
    ],
    answer: 0,
    why: "Hedef FCC’de feedback ile karşılaştırılır; elevator yanıtı irtifayı değiştirir ve air data yeniden ölçer.",
  },
  {
    type: "Bileşeni tanı",
    topic: "Sensörler",
    text: "Yer yüzeyine göre düşük irtifa referansını hangi bileşen sağlar?",
    options: [
      "Yaw-rate sensor",
      "Heading reference",
      "VOR receiver",
      "Radio altimeter",
    ],
    answer: 3,
    why: "Radio altitude yer yüzeyine göre yüksekliği sağlar; barometrik irtifa farklı bir referanstır.",
  },
  {
    type: "Çoktan seçmeli",
    topic: "ILS",
    text: "Localizer ve glideslope hangi guidance bilgilerini verir?",
    options: [
      "İkisi de yalnız hız",
      "LOC lateral, G/S vertical",
      "LOC vertical, G/S yaw rate",
      "İkisi de hydraulic pressure",
    ],
    answer: 1,
    why: "Localizer pist yaklaşma hattına yanal sapmayı, glideslope dikey yaklaşma yoluna sapmayı sağlar.",
  },
  {
    type: "Arıza teşhisi",
    topic: "APP",
    text: "LOC capture gerçekleşti, G/S invalid flag var. En mantıklı açıklama?",
    options: [
      "Tüm pitch servoları kesin arızalı",
      "AP hiçbir zaman bağlı değildi",
      "G/S sinyal yolu geçersiz; dikey capture engellenir",
      "LOC sinyali G/S yerine kullanılabilir",
    ],
    answer: 2,
    why: "Lateral ve vertical guidance ayrı geçerlilik bilgileri taşır. LOC capture, G/S sağlığını kanıtlamaz.",
  },
  {
    type: "Yanıtı öngör",
    topic: "A/T",
    text: "A/T açık, actual speed hedeften düşük; actuator sağlam. İlk komut?",
    options: [
      "Thrust talebini artırmak",
      "Hedef irtifayı sıfırlamak",
      "LOC’yi kapatmak",
      "Throttle’ı daima idle yapmak",
    ],
    answer: 0,
    why: "Pozitif speed error thrust komutunu yükseltir; motor gecikmesi nedeniyle hız daha sonra toparlanır.",
  },
  {
    type: "Çoktan seçmeli",
    topic: "Rüzgâr",
    text: "Sabit headwind, IAS sabit tutulurken öncelikle hangisini azaltır?",
    options: [
      "Radio altitude",
      "Yaw sensor validity",
      "Selected speed",
      "Ground speed",
    ],
    answer: 3,
    why: "Airspeed hava kütlesine, ground speed yere göredir. Sabit rüzgâr bu iki hızı ayırır.",
  },
  {
    type: "Yanıtı öngör",
    topic: "A/T",
    text: "Aynı net thrust farkında kütle artırılırsa ne beklenir?",
    options: [
      "Hız daha çabuk değişir",
      "Hız yanıtı yavaşlar",
      "Bütün modlar ayrılır",
      "Thrust komutu fiziksel olarak yok olur",
    ],
    answer: 1,
    why: "F = m·a ilişkisi nedeniyle aynı net kuvvet daha büyük kütlede daha az ivme oluşturur.",
  },
  {
    type: "Arıza teşhisi",
    topic: "A/T",
    text: "Speed error artıyor, FCC thrust command değişiyor, lever donmuş. Şüphe?",
    options: [
      "Selected heading",
      "G/S receiver",
      "Autothrottle servo",
      "Radio altitude",
    ],
    answer: 2,
    why: "Komut üretiliyor ama uygulanmıyor: command → actuator/lever yolu incelenmelidir.",
  },
  {
    type: "Çoktan seçmeli",
    topic: "Autoland",
    text: "Bu eğitim modelinde kritik sensor failure yaklaşmada ne yapar?",
    options: [
      "Autoland kesilir; devralma / go-around uyarılır",
      "Her koşulda TOUCHDOWN zorlanır",
      "Arıza saklanır",
      "Sertifikalı CAT III davranışı garanti edilir",
    ],
    answer: 0,
    why: "Model bilinçli olarak tek bir genel kesilme davranışı kullanır; aircraft-specific fail-operational mantığı iddia etmez.",
  },
  {
    type: "Active mode",
    topic: "Autoland",
    text: "FLARE sırasında hedeflenen temel değişim nedir?",
    options: [
      "Yaw oscillation büyütmek",
      "NAV course değiştirmek",
      "Bank limitini artırmak",
      "Alçalma hızını azaltarak temasa hazırlanmak",
    ],
    answer: 3,
    why: "Bu modelde flare, düşük radio altitude ile tetiklenen daha küçük negatif vertical-speed talebidir.",
  },
  {
    type: "Göstergeyi yorumla",
    topic: "Go-around",
    text: "AP CHANNEL FAIL sonrası GA seçildi. FD komutu görünmesi neyi kanıtlar?",
    options: [
      "Servo kontrolü mutlaka var",
      "Guidance talebi var; AP bağlı değilse manuel uygulama gerekir",
      "Arıza onarıldı",
      "Autoland sertifikasyonu devam ediyor",
    ],
    answer: 1,
    why: "Bir komutun gösterilmesi ile actuator’a otomatik uygulanması farklıdır. AP arızası GA tuşuyla onarılmaz.",
  },
  {
    type: "Bileşeni tanı",
    topic: "SAS",
    text: "Helicopter SAS’ın bu modeldeki temel görevi nedir?",
    options: [
      "Tam uçuş planı üretmek",
      "Pist friksiyonunu ölçmek",
      "İstenmeyen tutum değişimlerini sönümlemek",
      "Her zaman otomatik iniş yapmak",
    ],
    answer: 2,
    why: "SAS stabiliteyi destekler; rota/konum tutan tam autopilot ile aynı işlev değildir.",
  },
  {
    type: "Çoktan seçmeli",
    topic: "Power",
    text: "FCC doğru hesaplıyor ancak actuator’ın güç kaynağı yok. Ne beklenir?",
    options: [
      "Komut bulunabilir ama fiziksel hareket gerçekleşmez",
      "Fiziksel hareket enerji gerektirmez",
      "Sensör mutlaka fazladan enerji üretir",
      "Yalnızca seçilen heading artar",
    ],
    answer: 0,
    why: "Bilgi sinyali ile actuation power farklı arayüzlerdir; ikisi de hareket için gereklidir.",
  },
  {
    type: "Bileşeni tanı",
    topic: "Transducer",
    text: "Transducer için uygun örnek hangisidir?",
    options: [
      "Sadece bir yazı etiketi",
      "Pist boyası",
      "Bir mode request",
      "Açısal hızı elektriksel ölçüme dönüştüren yaw-rate sensörü",
    ],
    answer: 3,
    why: "Transducer fiziksel büyüklüğü kullanılabilir sinyal biçimine dönüştürür.",
  },
  {
    type: "Göstergeyi yorumla",
    topic: "Monitor",
    text: "İki air-data kaynağı uyuşmuyor. Tek birini rastgele doğru seçmek neden uygun değildir?",
    options: [
      "Her sensör aynı anda bozulmak zorundadır",
      "Geçerli referansın hangisi olduğu doğrulanmamıştır",
      "Hız hiçbir kontrol modunda kullanılmaz",
      "Monitor sadece dekorasyondur",
    ],
    answer: 1,
    why: "Disagreement bir güvenilirlik sorunudur. Bu model AP/A/T’yi ayırarak belirsiz referansı kullanmayı keser.",
  },
  {
    type: "Çoktan seçmeli",
    topic: "Mimari",
    text: "Temsilî component-location haritası nasıl kullanılmalı?",
    options: [
      "Tüm uçakların kesin yerleşimi sayılmalı",
      "AMM yerine kullanılmalı",
      "İşlevsel ilişkiler için; tam yerleşim tipe göre doğrulanmalı",
      "Sadece tailcone’da FCC vardır",
    ],
    answer: 2,
    why: "FCC, sensör ve actuator konumları farklı uçak mimarilerinde değişebilir.",
  },
  {
    type: "Arıza teşhisi",
    topic: "Roll",
    text: "HDG active, bank command var; aileron hareket etmiyor. En güçlü kanıt hangisi?",
    options: [
      "Command ile position feedback arasındaki uyumsuzluk",
      "Seçilmiş heading’in üç haneli olması",
      "Radio altitude’un geçerli olması",
      "Quiz skorunun düşük olması",
    ],
    answer: 0,
    why: "Komut-hareket karşılaştırması actuator/interface arızasını sensör veya mode-selection sorunundan ayırır.",
  },
  {
    type: "Signal flow",
    topic: "Signal processing",
    text: "Control-command limitlerinin işlevi nedir?",
    options: [
      "Feedback’i tümüyle silmek",
      "Tüm tepkileri rastgeleleştirmek",
      "Fiziksel dinamiği atlamak",
      "Talebi modelin/actuator’ın uygulanabilir aralığında tutmak",
    ],
    answer: 3,
    why: "Limit ve rate/damping işleme, kontrol komutunun aşırı büyümesini sınırlar. Limitler gerçek uçak performans verisi değildir.",
  },
];
export interface Scenario {
  title: string;
  symptom: string;
  evidence: Record<string, string>;
  options: string[];
  answer: number;
  why: string;
}
export const scenarios: Scenario[] = [
  {
    title: "Yaw damper etkisiz",
    symptom: "YD seçilmiş olmasına rağmen darbe sonrası yaw salınımı sürüyor.",
    evidence: {
      Indications: "YD INOP kaydı var; AP HDG çalışıyor.",
      Sensors:
        "Bağımsız attitude rate ölçümü ±4°/s değişiyor; yaw-rate transducer çıkışı sürekli 0.",
      "Signal trace": "FCC yaw damping girişinde rate 0; rudder command 0.",
      Actuators: "Rudder actuator kendi test komutuna yanıt veriyor.",
    },
    options: [
      "Yaw-rate sensor",
      "Aileron servo",
      "MCP heading selector",
      "Radio altimeter",
    ],
    answer: 0,
    why: "Bağımsız ölçüm hareketi görüyor, yaw-rate girişi görmüyor. Sağlam rudder testi arızayı sensor/feedback yoluna daraltır.",
  },
  {
    title: "ALT HOLD drift",
    symptom:
      "ALT HOLD active. Bağımsız irtifa göstergesinde yavaş alçalma görülüyor.",
    evidence: {
      Indications: "FMA ALT HOLD; tutulan referans 3000 ft.",
      Sensors:
        "FCC air-data altitude 3000 ft’de donmuş; bağımsız kaynak 2870 ft ve azalıyor.",
      "Signal trace": "FCC altitude error 0; yeni climb command üretmiyor.",
      Actuators:
        "Elevator servo test komutuna ve position feedback’e normal yanıt veriyor.",
    },
    options: [
      "G/S receiver",
      "Air-data altitude feedback",
      "Autothrottle servo",
      "Yaw-rate sensor",
    ],
    answer: 1,
    why: "Donmuş irtifa feedback’i FCC’ye hata yokmuş gibi görünür. Servo sağlam olduğundan komut üretimini besleyen ölçüm incelenir.",
  },
  {
    title: "HDG var, dönüş yok",
    symptom:
      "Selected heading 150°, heading 090°. HDG active ama uçak düz kalıyor.",
    evidence: {
      Indications: "AP engaged, HDG active; heading target 150°.",
      Sensors: "Heading ve attitude referansları iki kaynakta da tutarlı.",
      "Signal trace": "FCC bank command +25°, aileron request +12°.",
      Actuators:
        "Aileron position 0°; actuator testinde hareket yok, power-valid mevcut.",
    },
    options: [
      "Radio altimeter",
      "LOC receiver",
      "Aileron servo",
      "Speed selector",
    ],
    answer: 2,
    why: "Giriş, hesaplama ve güç mevcut; hareket eksik. Aileron servo/actuation yolu en güçlü şüphelidir.",
  },
  {
    title: "A/T hız tutamıyor",
    symptom: "Drag artışı sonrası hız düşüyor. A/T active gösteriliyor.",
    evidence: {
      Indications: "Speed target 180 kt, measured 156 kt; A/T active.",
      Sensors: "İki airspeed kaynağı 156 kt civarında tutarlı.",
      "Signal trace": "Thrust command %82’ye yükseliyor.",
      Actuators:
        "Lever %42’de sabit; engine mevcut lever talebine normal yanıt veriyor.",
    },
    options: [
      "Heading reference",
      "Yaw sensor",
      "Glideslope",
      "Autothrottle servo",
    ],
    answer: 3,
    why: "Speed feedback ve thrust hesaplaması doğru. Hareket etmeyen lever, A/T servo arayüzünü işaret eder.",
  },
  {
    title: "LOC capture, G/S yok",
    symptom:
      "Yaklaşmada localizer yakalanıyor, glideslope armed olarak kalıyor.",
    evidence: {
      Indications: "LOC active, G/S armed; G/S flag INVALID.",
      Sensors:
        "LOC sapması geçerli; G/S validity false. Air data ve attitude sağlıklı.",
      "Signal trace":
        "FCC G/S capture inhibit aktif; vertical deviation geçersiz.",
      Actuators: "Elevator VS modunda verilen komuta normal yanıt veriyor.",
    },
    options: [
      "Glideslope receiver / signal",
      "Aileron servo",
      "Yaw-rate sensor",
      "Trim actuator",
    ],
    answer: 0,
    why: "G/S validity kaybı capture’ı engelliyor. Başka bir vertical mode’da çalışan elevator, actuator arızasına karşı kanıt sağlar.",
  },
  {
    title: "Autoland kesildi",
    symptom: "Kararlı yaklaşmada AUTOLAND UNAVAILABLE uyarısı belirdi.",
    evidence: {
      Indications: "LOC ve G/S active idi; monitor RA INVALID kaydetti.",
      Sensors:
        "Radio altitude kaynakları 80 ft ve 410 ft; disagreement. Barometrik irtifa tutarlı.",
      "Signal trace": "FCC flare-height validity false; FLARE arming iptal.",
      Actuators: "Aileron, elevator ve throttle command/position uyumlu.",
    },
    options: [
      "MCP heading selector",
      "Radio-altitude disagreement",
      "Yaw damper gain",
      "Aileron servo",
    ],
    answer: 1,
    why: "Flare için gereken radio-altitude güvenilirliği kayboldu. Sağlam actuator’lar bu referans sorununu gideremez.",
  },
  {
    title: "Automatic trim unavailable",
    symptom:
      "Yeni pitch hedefi tutuluyor, fakat servo load uzun süre yüksek kalıyor.",
    evidence: {
      Indications: "AUTO TRIM FAIL; pitch hedefe yakın, HIGH SERVO LOAD.",
      Sensors: "Pitch ve elevator load ölçümleri geçerli.",
      "Signal trace":
        "FCC trim command değişiyor; sustained elevator demand mevcut.",
      Actuators:
        "Elevator hareket ediyor; trim position test komutuna rağmen sabit.",
    },
    options: [
      "Localizer signal",
      "Heading reference",
      "Trim actuator / interface",
      "Radio altimeter",
    ],
    answer: 2,
    why: "Pitch elevator ile tutuluyor. Komut alıp hareket etmeyen trim yolu yükün neden azalmadığını açıklar.",
  },
];
