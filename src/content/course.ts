import type { Failure, Lab } from "../sim/engine";
export const labs: {
  id: Lab;
  title: string;
  short: string;
  group: string;
  code: string;
  learn: string;
  experiment: string;
  why: string;
}[] = [
  {
    id: "fundamentals",
    title: "Autoflight Fundamentals",
    short: "Kapalı çevrim",
    group: "KONTROL PRENSİPLERİ",
    code: "22.01",
    learn:
      "Referans ile ölçülen durum karşılaştırılır. FCC, hatayı azaltacak kumandayı üretir; yeni uçak tepkisi tekrar ölçülür.",
    experiment:
      "Bir düğüm seç. Adım modunda referanstan feedback yoluna kadar sinyali izle.",
    why: "Feedback olmadan bilgisayar, verdiği komutun istenen sonucu oluşturduğunu doğrulayamaz.",
  },
  {
    id: "axes",
    title: "Roll / Pitch / Yaw",
    short: "Üç eksen kontrolü",
    group: "KONTROL PRENSİPLERİ",
    code: "22.02",
    learn:
      "Aileron roll, elevator pitch, rudder yaw hareketini etkiler. İç kontrol çevrimi istenen tutuma yaklaşır.",
    experiment:
      "Bir eksenin referansını değiştir; darbeyi uygula ve kanalı kapatarak toparlanmayı karşılaştır.",
    why: "Kontrol kanalı açıkken hata, yüzey komutuna çevrilir. Kanal kapalıyken sadece modelin doğal tepkisi ve bozucular kalır.",
  },
  {
    id: "yaw",
    title: "Yaw Damper Lab",
    short: "Salınımı sönümle",
    group: "KONTROL PRENSİPLERİ",
    code: "22.03",
    learn:
      "Yaw damper, yaw-rate feedback ile istenmeyen salınımı azaltan rudder komutları üretir.",
    experiment:
      "YD OFF ile darbe uygula. Reset sonrası aynı darbeyi YD ON ile karşılaştır.",
    why: "Rudder komutu yaw rate ile ters işaretlidir. Ek sönümleme salınım enerjisini azaltır. Buradaki tek salınıcı, Dutch roll davranışının şematik temsilidir.",
  },
  {
    id: "trim",
    title: "Automatic Trim Lab",
    short: "Servo yükünü azalt",
    group: "KONTROL PRENSİPLERİ",
    code: "22.04",
    learn:
      "Elevator kısa sürede pitch komutunu karşılar. Otomatik trim, sürekli elevator talebini yavaşça üzerine alır.",
    experiment:
      "Pitch hedefini 8° yap. Elevator, trim ve servo yükünü izle; ardından trim arızasını ekle.",
    why: "Stabilizer trim denge momenti üretir. Aynı pitch korunurken elevator ve servo üzerindeki sürekli yük azalır.",
  },
  {
    id: "modes",
    title: "Autopilot Modes Simulator",
    short: "Mode Control Panel",
    group: "UÇUŞ LABORATUVARLARI",
    code: "22.05",
    learn:
      "MCP hedefleri seçer; active mod uçağı yönetir, armed mod yakalama koşulunu bekler. Flight director komutu ile AP bağlantısı farklı şeylerdir.",
    experiment:
      "Heading hedefini 150° yap ve HDG seç. İrtifa için hedefi seçip ALT ACQ kullan.",
    why: "Heading hatası azaldıkça bank komutu azalır. ALT HOLD mevcut irtifayı tutar; seçilen yeni irtifaya geçmek ALT ACQ veya VS gerektirir.",
  },
  {
    id: "navigation",
    title: "Navigation Aids Interface",
    short: "Sensörden guidance’a",
    group: "UÇUŞ LABORATUVARLARI",
    code: "22.06",
    learn:
      "VOR/NAV ve localizer yanal; glideslope dikey guidance sağlar. Attitude, heading, air data ve radio altitude farklı referanslardır.",
    experiment:
      "Bir girişi seçip sinyali kes. Etkilenen işlevleri ve cockpit uyarılarını gözle.",
    why: "Bir referansın kaybı bütün sensörlerin kaybı anlamına gelmez; örneğin LOC mevcutken G/S kaybolabilir.",
  },
  {
    id: "throttle",
    title: "Autothrottle Lab",
    short: "Hız ve thrust",
    group: "UÇUŞ LABORATUVARLARI",
    code: "22.07",
    learn:
      "A/T, seçilen ve ölçülen hava hızı arasındaki farkı thrust talebine çevirir. Motor gecikmesi yanıtı sınırlar.",
    experiment:
      "Hız hedefini ve drag değerini değiştir. Aynı deneyi farklı kütlede ve yavaş motor yanıtıyla tekrarla.",
    why: "Thrust drag kuvvetini aşarsa hız artar. Sabit headwind temel olarak ground speed’i değiştirir; rüzgâr değişimi kısa bir hava hızı geçişi üretir.",
  },
  {
    id: "autoland",
    title: "Automatic Landing Lab",
    short: "Yaklaşmadan temasa",
    group: "UÇUŞ LABORATUVARLARI",
    code: "22.08",
    learn:
      "Autoland; lateral guidance, vertical guidance, thrust, sensörler ve izleme işlevlerini birlikte kullanır.",
    experiment:
      "Başlangıç sapmalarını ayarla ve APP ARM seç. Yakalamayı izle, istersen yaklaşmada arıza ekle.",
    why: "LOC ve G/S sapmaları düzeltme komutlarını üretir. Radio altitude flare geçişini destekler. Bu model her kritik arızada autoland’i keser; sertifikasyon mantığı değildir.",
  },
  {
    id: "sas",
    title: "Helicopter SAS",
    short: "Stability augmentation",
    group: "UÇUŞ LABORATUVARLARI",
    code: "22.09",
    learn:
      "SAS, istenmeyen pitch, roll ve yaw değişimlerini azaltarak pilotun stabilizasyon işini destekler.",
    experiment:
      "Üç eksene darbe uygula. SAS ON ve OFF yanıtlarını aynı koşullarda karşılaştır.",
    why: "Rate feedback hızlı tutum değişimlerini sönümler. Bu SAS modeli rota, konum veya irtifa tutan tam bir autopilot değildir.",
  },
  {
    id: "architecture",
    title: "System Architecture",
    short: "Uçakta bileşenler",
    group: "SİSTEM & TEŞHİS",
    code: "22.10",
    learn:
      "Autoflight işlevi cockpit kontrollerinden elektronik bölmeye ve uçuş kumandalarına uzanan arayüzlerden oluşur.",
    experiment:
      "Uçak üzerindeki bir konumu seç; temsilî bileşenlerin giriş ve çıkışlarını incele.",
    why: "Fiziksel yerleşim aircraft type ve mimariye göre değişir. Görsel temsilî bir konum haritasıdır; bakım yerleşim dokümanı değildir.",
  },
  {
    id: "interfaces",
    title: "FCC Interface Explorer",
    short: "Sinyal yolunu izle",
    group: "SİSTEM & TEŞHİS",
    code: "22.11",
    learn:
      "FCC; güç, pilot referansı, sensör feedback’i ve actuator arayüzleriyle çalışır. Her bağlantı bir bağımlılık taşır.",
    experiment:
      "Bağlantıya tıkla. Trace Signal ile seçilen irtifanın elevator ve air data feedback yolunu izle.",
    why: "Aynı cockpit belirtisi farklı bağlantı arızalarından kaynaklanabilir. Sinyali girişten fiziksel tepkiye kadar takip etmek arızayı daraltır.",
  },
  {
    id: "components",
    title: "Components Explorer",
    short: "Donanımın işlevi",
    group: "SİSTEM & TEŞHİS",
    code: "22.12",
    learn:
      "Controller, sensor, transducer, servo ve indicator aynı işi yapmaz. Her biri ayrı bir fiziksel veya bilgi arayüzünü temsil eder.",
    experiment:
      "Bileşenleri ara veya ailelerine göre filtrele; işlev, sinyal ve arıza etkisini incele.",
    why: "Komut üretimi, komutun uygulanması ve sonucun ölçülmesi ayrı aşamalardır. Yalnızca MCP ışığına bakmak fiziksel tepkiyi kanıtlamaz.",
  },
  {
    id: "faults",
    title: "Failure & Troubleshooting",
    short: "Belirtiden kök nedene",
    group: "SİSTEM & TEŞHİS",
    code: "22.13",
    learn:
      "Teşhis; belirtileri, bağımsız sensörleri, FCC çıkışını ve actuator yanıtını karşılaştırır.",
    experiment:
      "Bir vakayı aç. Dört kontrol noktasından kanıt topla, sonra şüpheli bileşeni seç.",
    why: "Active mode bir komutun seçili olduğunu gösterir; yüzeyin gerçekten hareket ettiğini tek başına göstermez.",
  },
  {
    id: "sandbox",
    title: "Free Experiment",
    short: "Serbest deney alanı",
    group: "SİSTEM & TEŞHİS",
    code: "22.14",
    learn:
      "Referans, bozucu ve arızaları aynı uçuş çevriminde birleştir. Sonuçları kontrollü deneylerle karşılaştır.",
    experiment:
      "Bir değişkeni değiştir, grafik ve komutları izle. RESET ile tüm koşulları başlangıca döndür.",
    why: "Bir seferde tek değişken değiştirmek neden-sonuç bağını ayırmayı kolaylaştırır. Birden fazla arıza etkileşimi karmaşıklaştırır.",
  },
  {
    id: "quiz",
    title: "Quiz / Challenge Mode",
    short: "Bilgini uçuşa geçir",
    group: "SİSTEM & TEŞHİS",
    code: "22.15",
    learn:
      "Bileşenleri, modları, signal flow ve arıza belirtilerini yorumla. Her yanıt bir açıklamayla tamamlanır.",
    experiment:
      "Yanıtını seç ve kontrol et. Cevaplar bu tarayıcıda saklanır; sınavı sıfırlayabilirsin.",
    why: "Bir göstergenin anlamını kontrol çevrimindeki yeriyle ilişkilendirmek, yalnızca terimi ezberlemekten daha kalıcıdır.",
  },
];
export interface ComponentInfo {
  id: string;
  name: string;
  family: string;
  location: string;
  purpose: string;
  input: string;
  process: string;
  output: string;
  failure: string;
  related: string;
}
export const components: ComponentInfo[] = [
  {
    id: "command",
    name: "Command Input",
    family: "Controller",
    location: "Flight compartment",
    purpose: "Pilotun uçuş hedefini sisteme taşır.",
    input: "Heading, altitude, VS veya speed seçimi.",
    process: "Kullanıcı hedefi sayısal referansa dönüşür.",
    output: "Seçilmiş hedef.",
    failure: "Hedef güncellenmez veya geçersiz seçim izlenir.",
    related: "Tüm seçili modlar",
  },
  {
    id: "mcp",
    name: "Mode Control Panel",
    family: "Controller",
    location: "Instrument panel",
    purpose:
      "Düğme, seçici ve referans göstergelerini pilotun erişiminde toplar.",
    input: "Mod düğmeleri ve seçilen referanslar.",
    process:
      "Mod seçimini ve hedefi FCC arayüzüne iletir; yüzeyi doğrudan sürmez.",
    output: "Mode request, selected heading / altitude / speed.",
    failure: "Mod ya da referans seçimi FCC’ye ulaşmayabilir.",
    related: "HDG, ALT, VS, APP, A/T",
  },
  {
    id: "fcc",
    name: "Flight Control Computer",
    family: "Controller",
    location: "Electronic equipment compartment",
    purpose:
      "Elektronik işlem birimi içinde kontrol ve izleme işlevlerini yürütür.",
    input: "MCP komutu, attitude, air data, NAV ve sistem durumu.",
    process:
      "Hata, kontrol kazançları, limitler ve monitor kontrollerini hesaplar.",
    output: "Roll / pitch / yaw ve ilgili sistem talepleri.",
    failure: "Etkilenen AP kanalı ayrılabilir; göstergede arıza oluşur.",
    related: "AP, guidance, system monitors",
  },
  {
    id: "processing",
    name: "Command Signal Processing",
    family: "Controller",
    location: "Electronic equipment compartment",
    purpose: "Kontrol hatasını uygulanabilir yüzey talebine çevirir.",
    input: "Referans − ölçüm hatası; rate feedback.",
    process: "Kazanç, filtre, limit ve sönümleme uygular.",
    output: "Sınırlandırılmış actuator command.",
    failure: "Yanlış kazanç veya feedback, zayıf ya da kararsız yanıt üretir.",
    related: "Roll, pitch ve yaw kanalları",
  },
  {
    id: "aileron",
    name: "Aileron Servo",
    family: "Actuator",
    location: "Wings",
    purpose: "Roll komutunu aileron kumanda yoluna uygular.",
    input: "Roll-channel actuator command; güç.",
    process: "Elektrik/hidrolik enerjiyi mekanik harekete çevirir.",
    output: "Aileron hareketi ve position feedback.",
    failure: "FCC komutuna rağmen bank değişmeyebilir.",
    related: "HDG, NAV, LOC, roll",
  },
  {
    id: "elevator",
    name: "Elevator Servo",
    family: "Actuator",
    location: "Tailcone",
    purpose: "Pitch komutunu elevator kumanda yoluna uygular.",
    input: "Pitch command ve güç.",
    process: "Servo loop ile talep edilen konuma hareket eder.",
    output: "Elevator deflection ve load feedback.",
    failure: "Pitch / vertical-speed kontrolü kaybolabilir.",
    related: "ALT, VS, G/S",
  },
  {
    id: "rudder",
    name: "Rudder Actuator",
    family: "Actuator",
    location: "Tailcone",
    purpose: "Yaw düzeltmesini rudder hareketine çevirir.",
    input: "Yaw damper veya yaw-channel command.",
    process: "Sınırlandırılmış komutu mekanik yüzey hareketine dönüştürür.",
    output: "Rudder deflection.",
    failure: "Yaw rate ölçülse bile salınım sönümlenmez.",
    related: "Yaw damper, yaw channel",
  },
  {
    id: "surface",
    name: "Control Surface",
    family: "Airframe",
    location: "Wings",
    purpose:
      "Aileron, elevator ve rudder hava akımındaki kuvvet/momentleri değiştirir.",
    input: "Mekanik actuator hareketi ve hava akımı.",
    process: "Aerodinamik moment üretir.",
    output: "Roll / pitch / yaw ivmesi.",
    failure: "Kısıtlı veya sıkışmış yüzey istenen momenti üretemez.",
    related: "Üç eksen uçak tepkisi",
  },
  {
    id: "aircraft",
    name: "Aircraft Response",
    family: "Airframe",
    location: "Airframe",
    purpose: "Komut ve bozucuların uçuş durumuna etkisini temsil eder.",
    input: "Kuvvetler, momentler, rüzgâr ve başlangıç koşulları.",
    process: "Atalet ve dinamik tepki nedeniyle değişimler zaman alır.",
    output: "Tutum, hız, yön, irtifa ve rate.",
    failure:
      "Uçak tepkisi komuta uymuyorsa sensör ve actuator kanıtı karşılaştırılır.",
    related: "Kapalı çevrim feedback",
  },
  {
    id: "attitude",
    name: "Attitude / Heading Reference",
    family: "Sensor",
    location: "Electronic equipment compartment",
    purpose: "Uçağın tutumunu ve yön referansını sağlar.",
    input: "Ataletsel ölçümler.",
    process: "Sensör işleme ile roll, pitch, heading hesaplar.",
    output: "Attitude, heading ve rate bilgisi.",
    failure:
      "Referans kaybı ilgili guidance veya AP kanalını devre dışı bırakabilir.",
    related: "HDG, roll, pitch, SAS",
  },
  {
    id: "airdata",
    name: "Air Data Sensors",
    family: "Sensor",
    location: "Nose / fuselage",
    purpose: "Hava hızı ve barometrik irtifa için ölçüm sağlar.",
    input: "Pitot / static pressure ve sıcaklık.",
    process: "Air data computer basınçları uçuş parametrelerine dönüştürür.",
    output: "IAS, pressure altitude, vertical-speed bilgisi.",
    failure: "ALT / VS / speed control güvenilirliğini kaybeder.",
    related: "ALT, VS, A/T",
  },
  {
    id: "ra",
    name: "Radio Altimeter",
    family: "Sensor",
    location: "Lower fuselage",
    purpose: "Uçağın altındaki yüzeye göre yüksekliği ölçer.",
    input: "Yayılan RF sinyali ve yerden yansıması.",
    process: "Yansımanın ölçümüyle düşük irtifa referansı üretir.",
    output: "Radio altitude ve validity.",
    failure: "Autoland flare için kullanılan yükseklik referansı kaybolur.",
    related: "FLARE ve LAND",
  },
  {
    id: "nav",
    name: "Navigation Receiver",
    family: "Sensor",
    location: "Electronic equipment compartment",
    purpose: "VOR / LOC / G/S guidance sapmalarını sağlar.",
    input: "Alınan radyo navigasyon sinyalleri.",
    process: "Yanal/dikey sapmayı ve sinyal geçerliliğini çözer.",
    output: "NAV, localizer ve glideslope deviation.",
    failure: "İlgili yakalama veya izleme işlevi kullanılamaz.",
    related: "NAV, APP",
  },
  {
    id: "yawrate",
    name: "Yaw-rate Sensor / Transducer",
    family: "Sensor",
    location: "Airframe",
    purpose:
      "Fiziksel yaw hareketini bilgisayarın kullanacağı sinyale çevirir.",
    input: "Yaw angular velocity.",
    process: "Açısal hız ölçülür ve elektriksel/sayısal sinyale çevrilir.",
    output: "Yaw rate (°/s).",
    failure: "YD geçerli damping feedback’i alamaz.",
    related: "Yaw damper, SAS",
  },
  {
    id: "trim",
    name: "Trim Actuator / Interface",
    family: "Actuator",
    location: "Tailcone",
    purpose: "Sürekli elevator gereksinimini azaltır.",
    input: "Sustained elevator/load sinyali ve trim command.",
    process: "Stabilizer veya trim mekanizmasını yavaşça ayarlar.",
    output: "Trim position; azalmış servo load.",
    failure: "Elevator yükü yüksek kalır; trim monitor uyarabilir.",
    related: "Automatic pitch trim",
  },
  {
    id: "at",
    name: "Autothrottle Servo",
    family: "Actuator",
    location: "Flight compartment",
    purpose: "Thrust talebini throttle kumanda yoluna aktarır.",
    input: "Speed / thrust command ve güç.",
    process: "Temsilî throttle lever mekanizmasını hareket ettirir.",
    output: "Throttle lever / engine demand.",
    failure: "Speed error büyürken throttle sabit kalabilir.",
    related: "Speed hold, approach",
  },
  {
    id: "power",
    name: "Power Interface",
    family: "Interface",
    location: "Electronic equipment compartment",
    purpose: "Bilgisayar ve arayüzlere gerekli gücü sağlar.",
    input: "Elektrik bus beslemesi ve power status.",
    process: "Güç dönüştürme, dağıtım ve durum izleme.",
    output: "Besleme ve power-valid bilgisi.",
    failure: "Bu tek beslemeli modelde AP, YD ve A/T kaybolur.",
    related: "FCC, servos, indicators",
  },
  {
    id: "hydraulic",
    name: "Actuation Power Interface",
    family: "Interface",
    location: "Wheel well",
    purpose: "Temsilî hidrolik dağıtım, yüzey actuator’larına enerji sağlar.",
    input: "Basınçlı akışkan ve sistem durumu.",
    process: "Actuator ihtiyacına göre güç iletir.",
    output: "Yüzey hareketi için hidrolik enerji.",
    failure: "Elektronik komut mevcutken mekanik hareket olmayabilir.",
    related: "Flight-control actuation; konum tipe göre değişir",
  },
  {
    id: "indicators",
    name: "FMA / Cockpit Indicators",
    family: "Indicator",
    location: "Instrument panel",
    purpose: "Seçili, active, armed ve failure durumlarını ekibe bildirir.",
    input: "FCC mod ve monitor status.",
    process: "Durumu PFD/FMA ve uyarılarda sunar.",
    output: "Active: yeşil; armed: açık mavi; caution: amber (bu arayüz).",
    failure: "Yanlış/eksik gösterge automation farkındalığını azaltır.",
    related: "FMA, AP disconnect, fault indications",
  },
];
export const loopIds = [
  "command",
  "mcp",
  "fcc",
  "processing",
  "aileron",
  "surface",
  "aircraft",
  "attitude",
];
export const interfaceIds = [
  "power",
  "mcp",
  "surface",
  "airdata",
  "attitude",
  "nav",
  "ra",
  "trim",
  "yawrate",
  "at",
  "elevator",
  "indicators",
];
export const failureInfo: Record<
  Failure,
  { name: string; signal: string; effect: string }
> = {
  loc: {
    name: "LOCALIZER FAIL",
    signal: "LOC lateral deviation + validity",
    effect: "LOC capture / tracking kayıp. Bu modelde autoland devam etmez.",
  },
  gs: {
    name: "GLIDESLOPE FAIL",
    signal: "G/S vertical deviation + validity",
    effect:
      "Dikey ILS guidance kayıp. LOC bağımsız kalabilir; autoland kesilir.",
  },
  ra: {
    name: "RADIO ALTIMETER FAIL",
    signal: "Radio altitude validity",
    effect:
      "FLARE referansı kayıp. Barometrik irtifa çalışsa bile autoland kesilir.",
  },
  atServo: {
    name: "AUTOTHROTTLE SERVO FAIL",
    signal: "Thrust command → throttle hareketi",
    effect:
      "Lever mevcut konumda donar. Hız kontrolü bozulur; autoland kullanılamaz.",
  },
  ap: {
    name: "AUTOPILOT CHANNEL FAIL",
    signal: "FCC → AP channel",
    effect:
      "AP ayrılır. GO-AROUND komutu FD olarak gösterilir; manuel kontrol gerekir.",
  },
  sensorDisagree: {
    name: "SENSOR DISAGREEMENT",
    signal: "Bağımsız referanslar tutarsız",
    effect: "Model hangi ölçümün doğru olduğunu seçmez; AP ve A/T ayrılır.",
  },
  airData: {
    name: "AIR DATA FAIL",
    signal: "IAS / altitude / VS validity",
    effect:
      "ALT, VS ve A/T kullanılamaz. Ekran fiziksel değeri eğitim için TRUE olarak tutar.",
  },
  attitude: {
    name: "ATTITUDE REF FAIL",
    signal: "Roll / pitch reference",
    effect: "AP ayrılır ve SAS damping kaybolur.",
  },
  heading: {
    name: "HEADING REF FAIL",
    signal: "Heading reference",
    effect: "HDG, ROLL moduna döner. Hedefe yönlendirme yoktur.",
  },
  nav: {
    name: "VOR / NAV FAIL",
    signal: "NAV lateral deviation",
    effect: "NAV tracking yerine HDG kalır; ILS sinyalleri ayrı arızalardır.",
  },
  yawSensor: {
    name: "YAW-RATE SENSOR FAIL",
    signal: "Yaw-rate feedback",
    effect: "Yaw damper ayrılır; rudder damping komutu oluşmaz.",
  },
  rollServo: {
    name: "AILERON SERVO FAIL",
    signal: "FCC roll command → aileron",
    effect:
      "Aileron servo hareketi sıfıra döner; komut olsa da dönüş başlayamaz.",
  },
  pitchServo: {
    name: "ELEVATOR SERVO FAIL",
    signal: "FCC pitch command → elevator",
    effect: "Pitch ve irtifa kontrol komutu uygulanamaz.",
  },
  trim: {
    name: "AUTO TRIM FAIL",
    signal: "Trim command → stabilizer movement",
    effect:
      "Trim mevcut konumda donar; pitch değişiminde sustained elevator load kalır.",
  },
  power: {
    name: "POWER INTERFACE FAIL",
    signal: "FCC / servo power valid",
    effect:
      "Modelde ortak tek besleme kaybı: AP, YD ve A/T ayrılır. Gerçek yedeklilik modellenmez.",
  },
  engineSlow: {
    name: "SLOW ENGINE RESPONSE",
    signal: "Engine thrust response",
    effect: "Motor zaman sabiti 1.7 s yerine 10 s olur; hız yanıtı yavaşlar.",
  },
  atDisconnect: {
    name: "AUTOTHROTTLE DISCONNECT",
    signal: "A/T engagement",
    effect:
      "Thrust manuel lever seçimine döner; otomatik speed correction yoktur.",
  },
};
export const sources = [
  {
    name: "FAA · Advanced Avionics Handbook, Automated Flight Control",
    url: "https://www.faasafety.gov/files/events/EA/EA03/2019/EA0392003/aah_ch04.pdf",
    note: "Active / armed, capture ve automation farkındalığı.",
  },
  {
    name: "FAA AIM · Air Navigation / ILS",
    url: "https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap1_section_1.html",
    note: "Localizer, glideslope ve ILS sinyal işlevleri.",
  },
  {
    name: "FAA AIM · Helicopter Operations",
    url: "https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap10_section_1.html",
    note: "SAS, autopilot ve flight director ayrımı.",
  },
  {
    name: "Garmin · Autopilot, Yaw Damper & Automatic Trim",
    url: "https://www8.garmin.com/manuals/webhelp/GUID-1FA95EDE-BA0A-4000-B109-7E73945389F7/EN-US/GUID-85E10FEF-706A-40C3-BC32-FA1E6E4348B5.html",
    note: "AP / YD / trim işlevlerine bir üretici örneği; model bu uçağın replikası değildir.",
  },
];
