import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  BookOpen, Moon, Sun, ArrowLeft, Loader2,
  List, Globe, X, BookMarked, Mic2
} from 'lucide-react';

// ─── STYLES ───────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Scheherazade+New:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap');

    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; }

    .font-quran  { font-family: 'Amiri Quran', 'Scheherazade New', serif; }
    .font-arabic { font-family: 'Scheherazade New', serif; }
    .font-ui     { font-family: 'Inter', sans-serif; }

    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    .shimmer {
      background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .dark .shimmer {
      background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
      background-size: 200% 100%;
    }

    @keyframes wave {
      0%, 100% { transform: scaleY(0.4); }
      50%       { transform: scaleY(1);   }
    }
    .bar { animation: wave 1.2s ease-in-out infinite; transform-origin: bottom; }
    .bar:nth-child(1) { animation-delay: 0s;    }
    .bar:nth-child(2) { animation-delay: 0.15s; }
    .bar:nth-child(3) { animation-delay: 0.3s;  }
    .bar:nth-child(4) { animation-delay: 0.45s; }
    .bar:nth-child(5) { animation-delay: 0.6s;  }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
    .dark ::-webkit-scrollbar-thumb { background: #4b5563; }

    .verse-highlight { animation: highlightFade 0.4s ease; }
    @keyframes highlightFade {
      from { background-color: rgba(234, 179, 8, 0.25); }
      to   { background-color: transparent; }
    }

    .slide-up { animation: slideUp 0.35s cubic-bezier(0.4,0,0.2,1); }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
  `}</style>
);

// ─── ALL 114 SURAHS DATA ──────────────────────────────────────────────────────
const SURAHS = [
  { id:1,  name:'Al-Fatiha',       ar:'الفاتحة',         v:7,   t:'Meccan',  m:'The Opening',          j:1  },
  { id:2,  name:'Al-Baqara',       ar:'البقرة',           v:286, t:'Medinan', m:'The Cow',              j:1  },
  { id:3,  name:"Ali 'Imran",      ar:'آل عمران',         v:200, t:'Medinan', m:'Family of Imran',      j:3  },
  { id:4,  name:'An-Nisa',         ar:'النساء',           v:176, t:'Medinan', m:'The Women',            j:4  },
  { id:5,  name:"Al-Ma'ida",       ar:'المائدة',          v:120, t:'Medinan', m:'The Table Spread',     j:6  },
  { id:6,  name:"Al-An'am",        ar:'الأنعام',          v:165, t:'Meccan',  m:'The Cattle',           j:7  },
  { id:7,  name:"Al-A'raf",        ar:'الأعراف',          v:206, t:'Meccan',  m:'The Heights',          j:8  },
  { id:8,  name:'Al-Anfal',        ar:'الأنفال',          v:75,  t:'Medinan', m:'The Spoils of War',    j:9  },
  { id:9,  name:'At-Tawba',        ar:'التوبة',           v:129, t:'Medinan', m:'The Repentance',       j:10 },
  { id:10, name:'Yunus',           ar:'يونس',             v:109, t:'Meccan',  m:'Jonah',                j:11 },
  { id:11, name:'Hud',             ar:'هود',              v:123, t:'Meccan',  m:'Hud',                  j:11 },
  { id:12, name:'Yusuf',           ar:'يوسف',             v:111, t:'Meccan',  m:'Joseph',               j:12 },
  { id:13, name:"Ar-Ra'd",         ar:'الرعد',            v:43,  t:'Medinan', m:'The Thunder',          j:13 },
  { id:14, name:'Ibrahim',         ar:'إبراهيم',          v:52,  t:'Meccan',  m:'Abraham',              j:13 },
  { id:15, name:'Al-Hijr',         ar:'الحجر',            v:99,  t:'Meccan',  m:'The Rocky Tract',      j:14 },
  { id:16, name:'An-Nahl',         ar:'النحل',            v:128, t:'Meccan',  m:'The Bee',              j:14 },
  { id:17, name:'Al-Isra',         ar:'الإسراء',          v:111, t:'Meccan',  m:'The Night Journey',    j:15 },
  { id:18, name:'Al-Kahf',         ar:'الكهف',            v:110, t:'Meccan',  m:'The Cave',             j:15 },
  { id:19, name:'Maryam',          ar:'مريم',             v:98,  t:'Meccan',  m:'Mary',                 j:16 },
  { id:20, name:'Ta-Ha',           ar:'طه',               v:135, t:'Meccan',  m:'Ta-Ha',                j:16 },
  { id:21, name:"Al-Anbiya",       ar:'الأنبياء',         v:112, t:'Meccan',  m:'The Prophets',         j:17 },
  { id:22, name:'Al-Hajj',         ar:'الحج',             v:78,  t:'Medinan', m:'The Pilgrimage',       j:17 },
  { id:23, name:"Al-Mu'minun",     ar:'المؤمنون',         v:118, t:'Meccan',  m:'The Believers',        j:18 },
  { id:24, name:'An-Nur',          ar:'النور',            v:64,  t:'Medinan', m:'The Light',            j:18 },
  { id:25, name:'Al-Furqan',       ar:'الفرقان',          v:77,  t:'Meccan',  m:'The Criterion',        j:18 },
  { id:26, name:"Ash-Shu'ara",     ar:'الشعراء',          v:227, t:'Meccan',  m:'The Poets',            j:19 },
  { id:27, name:'An-Naml',         ar:'النمل',            v:93,  t:'Meccan',  m:'The Ant',              j:19 },
  { id:28, name:'Al-Qasas',        ar:'القصص',            v:88,  t:'Meccan',  m:'The Stories',          j:20 },
  { id:29, name:"Al-'Ankabut",     ar:'العنكبوت',         v:69,  t:'Meccan',  m:'The Spider',           j:20 },
  { id:30, name:'Ar-Rum',          ar:'الروم',            v:60,  t:'Meccan',  m:'The Romans',           j:21 },
  { id:31, name:'Luqman',          ar:'لقمان',            v:34,  t:'Meccan',  m:'Luqman',               j:21 },
  { id:32, name:'As-Sajda',        ar:'السجدة',           v:30,  t:'Meccan',  m:'The Prostration',      j:21 },
  { id:33, name:'Al-Ahzab',        ar:'الأحزاب',          v:73,  t:'Medinan', m:'The Combined Forces',  j:21 },
  { id:34, name:'Saba',            ar:'سبأ',              v:54,  t:'Meccan',  m:'Sheba',                j:22 },
  { id:35, name:'Fatir',           ar:'فاطر',             v:45,  t:'Meccan',  m:'Originator',           j:22 },
  { id:36, name:'Ya-Sin',          ar:'يس',               v:83,  t:'Meccan',  m:'Ya-Sin',               j:22 },
  { id:37, name:'As-Saffat',       ar:'الصافات',          v:182, t:'Meccan',  m:'Those Who Set The Ranks',j:23},
  { id:38, name:'Sad',             ar:'ص',                v:88,  t:'Meccan',  m:'The Letter Sad',       j:23 },
  { id:39, name:'Az-Zumar',        ar:'الزمر',            v:75,  t:'Meccan',  m:'The Troops',           j:23 },
  { id:40, name:'Ghafir',          ar:'غافر',             v:85,  t:'Meccan',  m:'The Forgiver',         j:24 },
  { id:41, name:'Fussilat',        ar:'فصلت',             v:54,  t:'Meccan',  m:'Explained in Detail',  j:24 },
  { id:42, name:'Ash-Shura',       ar:'الشورى',           v:53,  t:'Meccan',  m:'The Consultation',     j:25 },
  { id:43, name:'Az-Zukhruf',      ar:'الزخرف',           v:89,  t:'Meccan',  m:'The Ornaments of Gold',j:25 },
  { id:44, name:'Ad-Dukhan',       ar:'الدخان',           v:59,  t:'Meccan',  m:'The Smoke',            j:25 },
  { id:45, name:'Al-Jathiya',      ar:'الجاثية',          v:37,  t:'Meccan',  m:'The Crouching',        j:25 },
  { id:46, name:'Al-Ahqaf',        ar:'الأحقاف',          v:35,  t:'Meccan',  m:'The Wind-Curved Sandhills',j:26},
  { id:47, name:'Muhammad',        ar:'محمد',             v:38,  t:'Medinan', m:'Muhammad',             j:26 },
  { id:48, name:'Al-Fath',         ar:'الفتح',            v:29,  t:'Medinan', m:'The Victory',          j:26 },
  { id:49, name:'Al-Hujurat',      ar:'الحجرات',          v:18,  t:'Medinan', m:'The Rooms',            j:26 },
  { id:50, name:'Qaf',             ar:'ق',                v:45,  t:'Meccan',  m:'The Letter Qaf',       j:26 },
  { id:51, name:'Adh-Dhariyat',    ar:'الذاريات',         v:60,  t:'Meccan',  m:'The Winnowing Winds',  j:26 },
  { id:52, name:'At-Tur',          ar:'الطور',            v:49,  t:'Meccan',  m:'The Mount',            j:27 },
  { id:53, name:'An-Najm',         ar:'النجم',            v:62,  t:'Meccan',  m:'The Star',             j:27 },
  { id:54, name:'Al-Qamar',        ar:'القمر',            v:55,  t:'Meccan',  m:'The Moon',             j:27 },
  { id:55, name:'Ar-Rahman',       ar:'الرحمن',           v:78,  t:'Medinan', m:'The Beneficent',       j:27 },
  { id:56, name:"Al-Waqi'a",       ar:'الواقعة',          v:96,  t:'Meccan',  m:'The Inevitable',       j:27 },
  { id:57, name:'Al-Hadid',        ar:'الحديد',           v:29,  t:'Medinan', m:'The Iron',             j:27 },
  { id:58, name:'Al-Mujadila',     ar:'المجادلة',         v:22,  t:'Medinan', m:'The Pleading Woman',   j:28 },
  { id:59, name:'Al-Hashr',        ar:'الحشر',            v:24,  t:'Medinan', m:'The Exile',            j:28 },
  { id:60, name:'Al-Mumtahina',    ar:'الممتحنة',         v:13,  t:'Medinan', m:'She That Is To Be Examined',j:28},
  { id:61, name:'As-Saf',          ar:'الصف',             v:14,  t:'Medinan', m:'The Ranks',            j:28 },
  { id:62, name:"Al-Jumu'a",       ar:'الجمعة',           v:11,  t:'Medinan', m:'Friday',               j:28 },
  { id:63, name:'Al-Munafiqun',    ar:'المنافقون',        v:11,  t:'Medinan', m:'The Hypocrites',       j:28 },
  { id:64, name:'At-Taghabun',     ar:'التغابن',          v:18,  t:'Medinan', m:'The Mutual Disillusion',j:28},
  { id:65, name:'At-Talaq',        ar:'الطلاق',           v:12,  t:'Medinan', m:'The Divorce',          j:28 },
  { id:66, name:'At-Tahrim',       ar:'التحريم',          v:12,  t:'Medinan', m:'The Prohibition',      j:28 },
  { id:67, name:'Al-Mulk',         ar:'الملك',            v:30,  t:'Meccan',  m:'The Sovereignty',      j:29 },
  { id:68, name:'Al-Qalam',        ar:'القلم',            v:52,  t:'Meccan',  m:'The Pen',              j:29 },
  { id:69, name:'Al-Haqqa',        ar:'الحاقة',           v:52,  t:'Meccan',  m:'The Reality',          j:29 },
  { id:70, name:"Al-Ma'arij",      ar:'المعارج',          v:44,  t:'Meccan',  m:'The Ascending Stairways',j:29},
  { id:71, name:'Nuh',             ar:'نوح',              v:28,  t:'Meccan',  m:'Noah',                 j:29 },
  { id:72, name:'Al-Jinn',         ar:'الجن',             v:28,  t:'Meccan',  m:'The Jinn',             j:29 },
  { id:73, name:'Al-Muzzammil',    ar:'المزمل',           v:20,  t:'Meccan',  m:'The Enshrouded One',   j:29 },
  { id:74, name:'Al-Muddaththir',  ar:'المدثر',           v:56,  t:'Meccan',  m:'The Cloaked One',      j:29 },
  { id:75, name:'Al-Qiyama',       ar:'القيامة',          v:40,  t:'Meccan',  m:'The Resurrection',     j:29 },
  { id:76, name:'Al-Insan',        ar:'الإنسان',          v:31,  t:'Medinan', m:'The Human',            j:29 },
  { id:77, name:'Al-Mursalat',     ar:'المرسلات',         v:50,  t:'Meccan',  m:'The Emissaries',       j:29 },
  { id:78, name:"An-Naba'",        ar:'النبأ',            v:40,  t:'Meccan',  m:'The Tidings',          j:30 },
  { id:79, name:"An-Nazi'at",      ar:'النازعات',         v:46,  t:'Meccan',  m:'Those Who Drag Forth', j:30 },
  { id:80, name:'Abasa',           ar:'عبس',              v:42,  t:'Meccan',  m:'He Frowned',           j:30 },
  { id:81, name:'At-Takwir',       ar:'التكوير',          v:29,  t:'Meccan',  m:'The Overthrowing',     j:30 },
  { id:82, name:'Al-Infitar',      ar:'الانفطار',         v:19,  t:'Meccan',  m:'The Cleaving',         j:30 },
  { id:83, name:'Al-Mutaffifin',   ar:'المطففين',         v:36,  t:'Meccan',  m:'The Defrauding',       j:30 },
  { id:84, name:'Al-Inshiqaq',     ar:'الانشقاق',         v:25,  t:'Meccan',  m:'The Sundering',        j:30 },
  { id:85, name:'Al-Buruj',        ar:'البروج',           v:22,  t:'Meccan',  m:'The Mansions of The Stars',j:30},
  { id:86, name:'At-Tariq',        ar:'الطارق',           v:17,  t:'Meccan',  m:'The Nightcomer',       j:30 },
  { id:87, name:"Al-A'la",         ar:'الأعلى',           v:19,  t:'Meccan',  m:'The Most High',        j:30 },
  { id:88, name:'Al-Ghashiya',     ar:'الغاشية',          v:26,  t:'Meccan',  m:'The Overwhelming',     j:30 },
  { id:89, name:'Al-Fajr',         ar:'الفجر',            v:30,  t:'Meccan',  m:'The Dawn',             j:30 },
  { id:90, name:'Al-Balad',        ar:'البلد',            v:20,  t:'Meccan',  m:'The City',             j:30 },
  { id:91, name:'Ash-Shams',       ar:'الشمس',            v:15,  t:'Meccan',  m:'The Sun',              j:30 },
  { id:92, name:'Al-Layl',         ar:'الليل',            v:21,  t:'Meccan',  m:'The Night',            j:30 },
  { id:93, name:'Ad-Duha',         ar:'الضحى',            v:11,  t:'Meccan',  m:'The Morning Hours',    j:30 },
  { id:94, name:'Ash-Sharh',       ar:'الشرح',            v:8,   t:'Meccan',  m:'The Relief',           j:30 },
  { id:95, name:'At-Tin',          ar:'التين',            v:8,   t:'Meccan',  m:'The Fig',              j:30 },
  { id:96, name:"Al-'Alaq",        ar:'العلق',            v:19,  t:'Meccan',  m:'The Clot',             j:30 },
  { id:97, name:'Al-Qadr',         ar:'القدر',            v:5,   t:'Meccan',  m:'The Power',            j:30 },
  { id:98, name:'Al-Bayyina',      ar:'البينة',           v:8,   t:'Medinan', m:'The Clear Proof',      j:30 },
  { id:99, name:'Az-Zalzala',      ar:'الزلزلة',          v:8,   t:'Medinan', m:'The Earthquake',       j:30 },
  { id:100,name:"Al-'Adiyat",      ar:'العاديات',         v:11,  t:'Meccan',  m:'The Courser',          j:30 },
  { id:101,name:"Al-Qari'a",       ar:'القارعة',          v:11,  t:'Meccan',  m:'The Calamity',         j:30 },
  { id:102,name:'At-Takathur',     ar:'التكاثر',          v:8,   t:'Meccan',  m:'The Rivalry in World Increase',j:30},
  { id:103,name:"Al-'Asr",         ar:'العصر',            v:3,   t:'Meccan',  m:'The Declining Day',    j:30 },
  { id:104,name:'Al-Humaza',       ar:'الهمزة',           v:9,   t:'Meccan',  m:'The Traducer',         j:30 },
  { id:105,name:'Al-Fil',          ar:'الفيل',            v:5,   t:'Meccan',  m:'The Elephant',         j:30 },
  { id:106,name:'Quraysh',         ar:'قريش',             v:4,   t:'Meccan',  m:'Quraysh',              j:30 },
  { id:107,name:"Al-Ma'un",        ar:'الماعون',          v:7,   t:'Meccan',  m:'The Small Kindnesses', j:30 },
  { id:108,name:'Al-Kawthar',      ar:'الكوثر',           v:3,   t:'Meccan',  m:'The Abundance',        j:30 },
  { id:109,name:'Al-Kafirun',      ar:'الكافرون',         v:6,   t:'Meccan',  m:'The Disbelievers',     j:30 },
  { id:110,name:'An-Nasr',         ar:'النصر',            v:3,   t:'Medinan', m:'The Divine Support',   j:30 },
  { id:111,name:'Al-Masad',        ar:'المسد',            v:5,   t:'Meccan',  m:'The Palm Fibre',       j:30 },
  { id:112,name:'Al-Ikhlas',       ar:'الإخلاص',          v:4,   t:'Meccan',  m:'The Sincerity',        j:30 },
  { id:113,name:"Al-Falaq",        ar:'الفلق',            v:5,   t:'Meccan',  m:'The Daybreak',         j:30 },
  { id:114,name:'An-Nas',          ar:'الناس',            v:6,   t:'Meccan',  m:'The Mankind',          j:30 },
];

// ─── RECITERS / QIRA'AT ───────────────────────────────────────────────────────
const pad = (n, len = 3) => String(n).padStart(len, '0');

const RECITERS = [
  {
    id: 'idrees_hafs',
    name: 'Idrees Abkar',
    nameAr: 'إدريس أبكر',
    qirath: "Hafs 'an 'Asim",
    qirathAr: 'حفص عن عاصم',
    style: 'Murattal',
    flag: '🇸🇦',
    featured: true,
    surahUrl: (s) => `https://server8.mp3quran.net/idris/${pad(s)}.mp3`,
    verseUrl: (s, v) => `https://everyayah.com/data/Idrees_Abkar_128kbps/${pad(s)}${pad(v)}.mp3`,
    color: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'idrees_mujawwad',
    name: 'Idrees Abkar',
    nameAr: 'إدريس أبكر',
    qirath: "Hafs 'an 'Asim",
    qirathAr: 'حفص عن عاصم',
    style: 'Mujawwad',
    flag: '🇸🇦',
    featured: true,
    surahUrl: (s) => `https://server8.mp3quran.net/idris/${pad(s)}.mp3`,
    verseUrl: (s, v) => `https://everyayah.com/data/Idrees_Abkar_128kbps/${pad(s)}${pad(v)}.mp3`,
    color: 'from-amber-600 to-yellow-700',
  },
  {
    id: 'alafasy_hafs',
    name: 'Mishary Alafasy',
    nameAr: 'مشاري العفاسي',
    qirath: "Hafs 'an 'Asim",
    qirathAr: 'حفص عن عاصم',
    style: 'Murattal',
    flag: '🇰🇼',
    featured: false,
    surahUrl: (s) => `https://server7.mp3quran.net/afasy/${pad(s)}.mp3`,
    verseUrl: (s, v) => `https://everyayah.com/data/Alafasy_128kbps/${pad(s)}${pad(v)}.mp3`,
    color: 'from-sky-600 to-blue-700',
  },
  {
    id: 'abdulbasit_murattal',
    name: 'Abdul Basit',
    nameAr: 'عبد الباسط عبد الصمد',
    qirath: "Hafs 'an 'Asim",
    qirathAr: 'حفص عن عاصم',
    style: 'Murattal',
    flag: '🇪🇬',
    featured: false,
    surahUrl: (s) => `https://server1.mp3quran.net/basit/Rewayat-Hafs-A-n-Asim/${pad(s)}.mp3`,
    verseUrl: (s, v) => `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${pad(s)}${pad(v)}.mp3`,
    color: 'from-rose-600 to-pink-700',
  },
  {
    id: 'abdulbasit_mujawwad',
    name: 'Abdul Basit',
    nameAr: 'عبد الباسط عبد الصمد',
    qirath: "Hafs 'an 'Asim",
    qirathAr: 'حفص عن عاصم',
    style: 'Mujawwad',
    flag: '🇪🇬',
    featured: false,
    surahUrl: (s) => `https://server1.mp3quran.net/basit/${pad(s)}.mp3`,
    verseUrl: (s, v) => `https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/${pad(s)}${pad(v)}.mp3`,
    color: 'from-violet-600 to-purple-700',
  },
  {
    id: 'warsh_nafi',
    name: 'Warsh — Al-Tablawi',
    nameAr: 'ورش — الطبلاوي',
    qirath: "Warsh 'an Nafi'",
    qirathAr: 'ورش عن نافع',
    style: 'Murattal',
    flag: '🇲🇦',
    featured: false,
    surahUrl: (s) => `https://server12.mp3quran.net/warsh/${pad(s)}.mp3`,
    verseUrl: (s, v) => `https://everyayah.com/data/warsh_abdulrahim_annabulssi/${pad(s)}${pad(v)}.mp3`,
    color: 'from-stone-600 to-zinc-700',
  },
  {
    id: 'qalun_nafi',
    name: "Qalun — 'Iyad",
    nameAr: "قالون — إياد الغوج",
    qirath: "Qalun 'an Nafi'",
    qirathAr: 'قالون عن نافع',
    style: 'Murattal',
    flag: '🇱🇾',
    featured: false,
    surahUrl: (s) => `https://server11.mp3quran.net/qalun/${pad(s)}.mp3`,
    verseUrl: (s, v) => `https://everyayah.com/data/Husary_Murattal_128kbps/${pad(s)}${pad(v)}.mp3`,
    color: 'from-lime-600 to-green-700',
  },
  {
    id: 'husary_hafs',
    name: 'Mahmoud Al-Husary',
    nameAr: 'محمود خليل الحصري',
    qirath: "Hafs 'an 'Asim",
    qirathAr: 'حفص عن عاصم',
    style: 'Murattal',
    flag: '🇪🇬',
    featured: false,
    surahUrl: (s) => `https://server13.mp3quran.net/husr/${pad(s)}.mp3`,
    verseUrl: (s, v) => `https://everyayah.com/data/Husary_Murattal_128kbps/${pad(s)}${pad(v)}.mp3`,
    color: 'from-orange-600 to-amber-700',
  },
];

// ─── BISMILLAH ────────────────────────────────────────────────────────────────
const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const WaveBar = ({ playing }) => (
  <div className="flex items-end gap-[3px] h-5">
    {[1,2,3,4,5].map(i => (
      <div
        key={i}
        className={`w-1 rounded-full bg-current ${playing ? 'bar' : ''}`}
        style={{ height: playing ? '100%' : '30%' }}
      />
    ))}
  </div>
);

const SkeletonVerse = () => (
  <div className="py-5 px-4 border-b border-gray-100 dark:border-gray-700/50">
    <div className="shimmer h-8 rounded-lg mb-3 w-3/4 ml-auto" />
    <div className="shimmer h-4 rounded mb-2 w-full" />
    <div className="shimmer h-4 rounded w-2/3" />
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function QuranApp() {
  const [view, setView]                 = useState('home');      // home | surah | settings
  const [dark, setDark]                 = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [search, setSearch]             = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses]             = useState([]);
  const [translation, setTranslation]   = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showTrans, setShowTrans]       = useState(true);
  const [reciter, setReciter]           = useState(RECITERS[0]);
  const [bookmarks, setBookmarks]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('q_bookmarks') || '[]'); }
    catch { return []; }
  });
  const [showReciterPanel, setShowReciterPanel] = useState(false);

  // Audio state
  const audioRef        = useRef(null);
  const [playing, setPlaying]           = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);   // 0 = full surah
  const [verseMode, setVerseMode]       = useState(false); // false = full surah stream
  const [progress, setProgress]         = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolume]             = useState(1);
  const [muted, setMuted]               = useState(false);
  const verseRefs = useRef({});

  // ── filtered surahs ──────────────────────────────────────────────────────
  const filtered = SURAHS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ar.includes(search) ||
    s.m.toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  );

  // ── fetch surah data ──────────────────────────────────────────────────────
  const loadSurah = useCallback(async (surahObj) => {
    setLoading(true);
    setVerses([]);
    setTranslation([]);
    setCurrentVerse(0);
    setPlaying(false);
    setProgress(0);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }

    try {
      const [arabicRes, transRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahObj.id}`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahObj.id}/en.sahih`),
      ]);
      const arabicData = await arabicRes.json();
      const transData  = await transRes.json();

      if (arabicData.code === 200) setVerses(arabicData.data.ayahs);
      if (transData.code  === 200) setTranslation(transData.data.ayahs);
    } catch (e) {
      console.error('Failed to load surah', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const openSurah = (s) => {
    setSelectedSurah(s);
    setView('surah');
    loadSurah(s);
    document.title = `${s.name} | القرآن الكريم — Idrees Abkar`;
  };

  // ── audio helpers ─────────────────────────────────────────────────────────
  const getAudioSrc = useCallback(() => {
    if (!selectedSurah) return '';
    if (verseMode && currentVerse > 0) {
      return reciter.verseUrl(selectedSurah.id, currentVerse);
    }
    return reciter.surahUrl(selectedSurah.id);
  }, [selectedSurah, reciter, verseMode, currentVerse]);

  const loadAudio = useCallback((src) => {
    if (!audioRef.current || !src) return;
    audioRef.current.src = src;
    audioRef.current.load();
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      const src = getAudioSrc();
      if (!audioRef.current.src || audioRef.current.src === window.location.href) {
        loadAudio(src);
      } else {
        audioRef.current.play().then(() => setPlaying(true)).catch(()=>{});
      }
    }
  };

  const playVerse = (verseNum) => {
    setVerseMode(true);
    setCurrentVerse(verseNum);
    loadAudio(reciter.verseUrl(selectedSurah.id, verseNum));
    // Scroll to verse
    const el = verseRefs.current[verseNum];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const playFullSurah = () => {
    setVerseMode(false);
    setCurrentVerse(0);
    loadAudio(reciter.surahUrl(selectedSurah.id));
  };

  const handleEnded = () => {
    if (verseMode && currentVerse < selectedSurah.v) {
      const next = currentVerse + 1;
      setCurrentVerse(next);
      loadAudio(reciter.verseUrl(selectedSurah.id, next));
      const el = verseRefs.current[next];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setPlaying(false);
      setCurrentVerse(0);
      setProgress(0);
    }
  };

  const seek = (e) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (val / 100) * duration;
    }
    setProgress(val);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // ── bookmark helpers ──────────────────────────────────────────────────────
  const toggleBookmark = (id) => {
    const next = bookmarks.includes(id)
      ? bookmarks.filter(b => b !== id)
      : [...bookmarks, id];
    setBookmarks(next);
    try { localStorage.setItem('q_bookmarks', JSON.stringify(next)); } catch {}
  };

  // ── reciter change ────────────────────────────────────────────────────────
  const changeReciter = (r) => {
    setReciter(r);
    setShowReciterPanel(false);
    setPlaying(false);
    setProgress(0);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
  };

  // ── volume ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // ── back home ─────────────────────────────────────────────────────────────
  const goHome = () => {
    setView('home');
    setPlaying(false);
    if (audioRef.current) { audioRef.current.pause(); }
    document.title = 'القرآن الكريم — Idrees Abkar | Qira\'at';
  };

  // ── dark mode class ───────────────────────────────────────────────────────
  const bg  = dark ? 'bg-gray-900 text-gray-100' : 'bg-[#fdf8f0] text-gray-900';
  const card = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const sub  = dark ? 'text-gray-400' : 'text-gray-500';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${bg} font-ui transition-colors duration-300`}>
      <GlobalStyles />

      {/* hidden audio */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current && duration)
            setProgress((audioRef.current.currentTime / duration) * 100);
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 ${dark ? 'bg-gray-900/95' : 'bg-[#fdf8f0]/95'} backdrop-blur-sm border-b ${dark ? 'border-gray-800' : 'border-amber-100'}`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">

          {/* Left: back / logo */}
          <div className="flex items-center gap-3">
            {view !== 'home' && (
              <button onClick={goHome} className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            {view === 'home' && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow">
                  <span className="text-white font-quran text-lg">ق</span>
                </div>
                <div className="leading-tight">
                  <div className="font-bold text-base">القرآن الكريم</div>
                  <div className={`text-[11px] ${sub}`}>Idrees Abkar · Qira'at</div>
                </div>
              </div>
            )}
            {view === 'surah' && selectedSurah && (
              <div className="leading-tight">
                <div className="font-bold font-arabic text-xl" dir="rtl">{selectedSurah.ar}</div>
                <div className={`text-xs ${sub}`}>{selectedSurah.name} · {selectedSurah.v} verses</div>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {view === 'home' && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <Search size={15} className={sub} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search surah..."
                  className={`bg-transparent outline-none text-sm w-32 ${sub}`}
                />
                {search && <button onClick={() => setSearch('')}><X size={14} className={sub} /></button>}
              </div>
            )}
            {view === 'surah' && (
              <>
                <button
                  onClick={() => setShowTrans(p => !p)}
                  title="Toggle translation"
                  className={`p-2 rounded-full transition-colors text-xs font-bold px-3 py-1 border ${showTrans ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800' : dark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <Globe size={16} />
                </button>
                <button
                  onClick={() => toggleBookmark(selectedSurah.id)}
                  className={`p-2 rounded-full transition-colors ${bookmarks.includes(selectedSurah?.id) ? 'text-amber-500' : sub}`}
                >
                  <BookMarked size={18} />
                </button>
              </>
            )}
            <button onClick={() => setDark(p => !p)} className={`p-2 rounded-full transition-colors ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── HOME VIEW ──────────────────────────────────────────────────── */}
      {view === 'home' && (
        <main className="max-w-4xl mx-auto px-4 pb-10">

          {/* Featured Reciter Hero */}
          <div className="my-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 p-6 text-white shadow-2xl shadow-emerald-200/30 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <span className="inline-block bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                ★ Featured Reciter
              </span>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-arabic mb-1" dir="rtl">إدريس أبكر</h2>
                  <p className="text-xl font-semibold mb-1">Idrees Abkar</p>
                  <p className="text-emerald-200 text-sm mb-3">حفص عن عاصم · Hafs ʿan ʿĀṣim</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-white/20 backdrop-blur text-xs px-3 py-1 rounded-full">Murattal</span>
                    <span className="bg-white/20 backdrop-blur text-xs px-3 py-1 rounded-full">Mujawwad</span>
                    <span className="bg-white/20 backdrop-blur text-xs px-3 py-1 rounded-full">Full Quran</span>
                  </div>
                </div>
                <div className="text-6xl opacity-30 font-quran" dir="rtl">ق</div>
              </div>
            </div>
          </div>

          {/* Reciter / Qira'at selector row */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Reciter & Qira'at</h3>
              <button onClick={() => setShowReciterPanel(p => !p)} className={`text-xs font-semibold text-emerald-600 dark:text-emerald-400`}>
                {showReciterPanel ? 'Close' : 'Change'}
              </button>
            </div>

            {/* Active reciter badge */}
            <div className={`flex items-center gap-3 p-3 rounded-2xl border ${card} shadow-sm`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${reciter.color} flex items-center justify-center text-white text-lg`}>
                <Mic2 size={18} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{reciter.name} <span className="font-arabic text-base" dir="rtl">({reciter.nameAr})</span></div>
                <div className={`text-xs ${sub}`}>{reciter.qirath} · {reciter.style}</div>
              </div>
              {reciter.featured && <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">Featured</span>}
            </div>

            {/* Expandable reciter panel */}
            {showReciterPanel && (
              <div className={`mt-3 rounded-2xl border ${card} overflow-hidden shadow-lg slide-up`}>
                <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${dark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-400'}`}>
                  Choose Reciter & Qira'at Style
                </div>
                {RECITERS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => changeReciter(r)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b last:border-0 ${dark ? 'border-gray-700 hover:bg-gray-700/40' : 'border-gray-50 hover:bg-gray-50'} ${reciter.id === r.id ? (dark ? 'bg-emerald-900/30' : 'bg-emerald-50') : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-white shrink-0`}>
                      <Mic2 size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{r.name}</div>
                      <div className={`text-xs ${sub} truncate`}>{r.qirath} · {r.style}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-arabic text-sm" dir="rtl">{r.qirathAr}</div>
                      {r.featured && <span className="text-[10px] text-amber-600 font-bold">★</span>}
                    </div>
                    {reciter.id === r.id && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Surah Grid */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">
              {search ? `${filtered.length} results` : '114 Surahs'}
            </h3>
            {bookmarks.length > 0 && (
              <span className={`text-xs ${sub}`}>{bookmarks.length} bookmarked</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(s => (
              <button
                key={s.id}
                onClick={() => openSurah(s)}
                className={`flex items-center gap-3 p-4 rounded-2xl border ${card} shadow-sm hover:shadow-md transition-all active:scale-[.98] text-left group`}
              >
                {/* Number badge */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.id <= 10 ? 'from-emerald-500 to-teal-600' : s.id <= 50 ? 'from-amber-500 to-orange-600' : s.id <= 86 ? 'from-blue-500 to-indigo-600' : 'from-rose-500 to-pink-600'} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow`}>
                  {s.id}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{s.name}</span>
                    {bookmarks.includes(s.id) && <BookMarked size={12} className="text-amber-500 shrink-0" />}
                  </div>
                  <div className={`text-xs ${sub} truncate`}>{s.m} · {s.v} verses · {s.t} · Juz {s.j}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-arabic text-xl leading-tight" dir="rtl">{s.ar}</div>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
              <p>No surahs found for "<strong>{search}</strong>"</p>
            </div>
          )}
        </main>
      )}

      {/* ── SURAH VIEW ─────────────────────────────────────────────────── */}
      {view === 'surah' && selectedSurah && (
        <main className="max-w-3xl mx-auto px-4 pb-48">

          {/* Surah info banner */}
          <div className={`my-4 p-5 rounded-2xl bg-gradient-to-r ${reciter.color} text-white text-center shadow-lg`}>
            <div className="font-quran text-4xl mb-1" dir="rtl">{selectedSurah.ar}</div>
            <div className="text-white/80 text-sm">{selectedSurah.name} · {selectedSurah.m}</div>
            <div className="text-white/60 text-xs mt-1">{selectedSurah.v} verses · {selectedSurah.t} · Juz {selectedSurah.j}</div>
          </div>

          {/* Bismillah (except At-Tawba #9) */}
          {selectedSurah.id !== 9 && (
            <div className={`text-center py-5 font-quran text-2xl md:text-3xl leading-loose ${dark ? 'text-amber-300' : 'text-emerald-800'}`} dir="rtl">
              {BISMILLAH}
            </div>
          )}

          {/* Verse list */}
          {loading && (
            <div className={`rounded-2xl border ${card} overflow-hidden`}>
              {[...Array(6)].map((_, i) => <SkeletonVerse key={i} />)}
            </div>
          )}

          {!loading && verses.length > 0 && (
            <div className={`rounded-2xl border ${card} overflow-hidden shadow-sm`}>
              {verses.map((v, idx) => {
                const trans = translation[idx];
                const isActive = verseMode && currentVerse === v.numberInSurah;
                return (
                  <div
                    key={v.number}
                    ref={el => { verseRefs.current[v.numberInSurah] = el; }}
                    className={`px-4 md:px-6 py-5 border-b last:border-0 transition-colors ${dark ? 'border-gray-700/50' : 'border-gray-100'} ${isActive ? (dark ? 'bg-emerald-900/30' : 'bg-emerald-50') : ''}`}
                  >
                    {/* Verse number + play btn */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => playVerse(v.numberInSurah)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isActive && playing ? 'bg-emerald-500 text-white shadow' : dark ? 'bg-gray-700 hover:bg-emerald-900/50 text-gray-300' : 'bg-gray-100 hover:bg-emerald-100 text-gray-500 hover:text-emerald-700'}`}
                      >
                        {isActive && playing
                          ? <><WaveBar playing={true} /><span>Playing</span></>
                          : <><Play size={12} fill="currentColor" /><span>Verse {v.numberInSurah}</span></>
                        }
                      </button>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${dark ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-400'}`}>
                        {v.numberInSurah}
                      </div>
                    </div>

                    {/* Arabic text */}
                    <p className="font-quran text-2xl md:text-3xl leading-[2.2] text-right mb-3 select-text" dir="rtl">
                      {v.text}
                    </p>

                    {/* Translation */}
                    {showTrans && trans && (
                      <p className={`text-sm leading-relaxed ${sub} border-t pt-3 ${dark ? 'border-gray-700/50' : 'border-gray-100'}`}>
                        {trans.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && verses.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <Loader2 size={36} className="mx-auto mb-3 animate-spin" />
              <p>Loading verses…</p>
            </div>
          )}
        </main>
      )}

      {/* ── FLOATING AUDIO PLAYER ──────────────────────────────────────── */}
      {view === 'surah' && selectedSurah && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 ${dark ? 'bg-gray-900/97' : 'bg-white/97'} backdrop-blur-xl border-t ${dark ? 'border-gray-800' : 'border-gray-200'} shadow-2xl`}>
          {/* Progress bar */}
          <div className="relative h-1">
            <div className={`absolute inset-0 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range" min="0" max="100" step="0.1"
              value={progress}
              onChange={seek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-1"
            />
          </div>

          <div className="max-w-3xl mx-auto px-4 py-3">
            {/* Top row: reciter + mode toggle */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${reciter.color} flex items-center justify-center text-white`}>
                  <Mic2 size={12} />
                </div>
                <span className="text-xs font-semibold truncate max-w-[140px]">
                  {reciter.name}
                  <span className={`ml-1 font-normal ${sub}`}>· {reciter.qirath}</span>
                </span>
              </div>

              <div className={`flex text-xs rounded-lg overflow-hidden border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={playFullSurah}
                  className={`px-3 py-1 transition-colors ${!verseMode ? 'bg-emerald-500 text-white' : dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  Full
                </button>
                <button
                  onClick={() => setVerseMode(true)}
                  className={`px-3 py-1 transition-colors ${verseMode ? 'bg-emerald-500 text-white' : dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  Verse
                </button>
              </div>
            </div>

            {/* Main controls */}
            <div className="flex items-center gap-3">
              {/* Skip prev */}
              <button
                onClick={() => {
                  if (verseMode && currentVerse > 1) playVerse(currentVerse - 1);
                  else if (!verseMode) {
                    const prev = SURAHS.find(s => s.id === selectedSurah.id - 1);
                    if (prev) openSurah(prev);
                  }
                }}
                className={`p-2 rounded-full ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <SkipBack size={18} />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                {playing
                  ? <Pause size={20} fill="currentColor" />
                  : <Play size={20} fill="currentColor" className="ml-0.5" />
                }
              </button>

              {/* Skip next */}
              <button
                onClick={() => {
                  if (verseMode && currentVerse < selectedSurah.v) playVerse(currentVerse + 1);
                  else if (!verseMode) {
                    const next = SURAHS.find(s => s.id === selectedSurah.id + 1);
                    if (next) openSurah(next);
                  }
                }}
                className={`p-2 rounded-full ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <SkipForward size={18} />
              </button>

              {/* Surah name / now playing */}
              <div className="flex-1 min-w-0 px-1">
                <div className="font-semibold text-sm truncate">
                  {verseMode && currentVerse > 0
                    ? `Verse ${currentVerse} of ${selectedSurah.v}`
                    : selectedSurah.name}
                </div>
                <div className={`text-xs ${sub}`}>
                  {playing ? <span className="text-emerald-500 font-medium">Now playing</span> : 'Paused'}
                  {duration > 0 && <span className="ml-1">· {fmt(duration)}</span>}
                </div>
              </div>

              {/* Volume */}
              <button
                onClick={() => setMuted(p => !p)}
                className={`p-2 rounded-full ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                {muted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} />}
              </button>

              {/* Reciter switch shortcut */}
              <button
                onClick={() => setShowReciterPanel(p => !p)}
                className={`p-2 rounded-full ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Volume slider */}
            <div className="mt-2 flex items-center gap-2">
              <Volume2 size={12} className={sub} />
              <input
                type="range" min="0" max="1" step="0.05"
                value={muted ? 0 : volume}
                onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                className="flex-1 h-1 accent-emerald-500"
              />
              <span className={`text-xs w-8 text-right ${sub}`}>{Math.round((muted ? 0 : volume) * 100)}%</span>
            </div>
          </div>

          {/* Inline reciter panel (inside player) */}
          {showReciterPanel && (
            <div className={`border-t ${dark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'} max-h-64 overflow-y-auto`}>
              <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${sub}`}>Switch Reciter / Qira'at</div>
              {RECITERS.map(r => (
                <button
                  key={r.id}
                  onClick={() => changeReciter(r)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b last:border-0 ${dark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-white'} ${reciter.id === r.id ? (dark ? 'bg-emerald-900/30' : 'bg-emerald-50') : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center text-white shrink-0`}>
                    <Mic2 size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{r.name} {r.flag}</div>
                    <div className={`text-xs ${sub} truncate`}>{r.qirath} · {r.style}</div>
                  </div>
                  <div className="font-arabic text-sm shrink-0" dir="rtl">{r.qirathAr}</div>
                  {reciter.id === r.id && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
