import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Moon, Sun, ArrowLeft, Globe, X, BookMarked, Mic2,
  BookOpen
} from 'lucide-react';

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Scheherazade+New:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    .font-quran  { font-family: 'Amiri Quran', 'Scheherazade New', serif; }
    .font-ui     { font-family: 'Inter', sans-serif; }

    /* ── Skeleton shimmer ── */
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    .shimmer {
      background: linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    .dark-shimmer {
      background: linear-gradient(90deg,#374151 25%,#4b5563 50%,#374151 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }

    /* ── Wave bars (playing animation) ── */
    @keyframes wave {
      0%,100% { transform: scaleY(0.35); }
      50%      { transform: scaleY(1);   }
    }
    .wave-bar {
      display: inline-block;
      width: 3px;
      border-radius: 2px;
      transform-origin: bottom;
      animation: wave 1s ease-in-out infinite;
    }
    .wave-bar:nth-child(1){ animation-delay:0s;    }
    .wave-bar:nth-child(2){ animation-delay:0.15s; }
    .wave-bar:nth-child(3){ animation-delay:0.3s;  }
    .wave-bar:nth-child(4){ animation-delay:0.45s; }
    .wave-bar:nth-child(5){ animation-delay:0.6s;  }

    /* ── Active verse glow ── */
    @keyframes versePulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(234,179,8,0.4); }
      50%      { box-shadow: 0 0 0 8px rgba(234,179,8,0);  }
    }
    .verse-active { animation: versePulse 2s ease-in-out infinite; }

    /* ── Slide in ── */
    @keyframes slideUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0);    }
    }
    .slide-up { animation: slideUp 0.3s cubic-bezier(.4,0,.2,1) forwards; }

    /* ── Smooth scrollbar ── */
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:3px; }
  `}</style>
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const pad = (n, len = 3) => String(n).padStart(len, '0');

const verseAudioUrl = (surah, verse) =>
  `https://everyayah.com/data/Idrees_Abkar_128kbps/${pad(surah)}${pad(verse)}.mp3`;


const QURAN_API = 'https://api.quran.com/api/v4';
const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

// ─── ALL 114 SURAHS ───────────────────────────────────────────────────────────
const SURAHS = [
  {id:1,  name:'Al-Fatiha',       ar:'الفاتحة',      v:7,   t:'Meccan',  m:'The Opening',           j:1 },
  {id:2,  name:'Al-Baqara',       ar:'البقرة',        v:286, t:'Medinan', m:'The Cow',               j:1 },
  {id:3,  name:"Ali 'Imran",      ar:'آل عمران',      v:200, t:'Medinan', m:'Family of Imran',       j:3 },
  {id:4,  name:'An-Nisa',         ar:'النساء',        v:176, t:'Medinan', m:'The Women',             j:4 },
  {id:5,  name:"Al-Ma'ida",       ar:'المائدة',       v:120, t:'Medinan', m:'The Table Spread',      j:6 },
  {id:6,  name:"Al-An'am",        ar:'الأنعام',       v:165, t:'Meccan',  m:'The Cattle',            j:7 },
  {id:7,  name:"Al-A'raf",        ar:'الأعراف',       v:206, t:'Meccan',  m:'The Heights',           j:8 },
  {id:8,  name:'Al-Anfal',        ar:'الأنفال',       v:75,  t:'Medinan', m:'The Spoils of War',     j:9 },
  {id:9,  name:'At-Tawba',        ar:'التوبة',        v:129, t:'Medinan', m:'The Repentance',        j:10},
  {id:10, name:'Yunus',           ar:'يونس',          v:109, t:'Meccan',  m:'Jonah',                 j:11},
  {id:11, name:'Hud',             ar:'هود',           v:123, t:'Meccan',  m:'Hud',                   j:11},
  {id:12, name:'Yusuf',           ar:'يوسف',          v:111, t:'Meccan',  m:'Joseph',                j:12},
  {id:13, name:"Ar-Ra'd",         ar:'الرعد',         v:43,  t:'Medinan', m:'The Thunder',           j:13},
  {id:14, name:'Ibrahim',         ar:'إبراهيم',       v:52,  t:'Meccan',  m:'Abraham',               j:13},
  {id:15, name:'Al-Hijr',         ar:'الحجر',         v:99,  t:'Meccan',  m:'The Rocky Tract',       j:14},
  {id:16, name:'An-Nahl',         ar:'النحل',         v:128, t:'Meccan',  m:'The Bee',               j:14},
  {id:17, name:'Al-Isra',         ar:'الإسراء',       v:111, t:'Meccan',  m:'The Night Journey',     j:15},
  {id:18, name:'Al-Kahf',         ar:'الكهف',         v:110, t:'Meccan',  m:'The Cave',              j:15},
  {id:19, name:'Maryam',          ar:'مريم',          v:98,  t:'Meccan',  m:'Mary',                  j:16},
  {id:20, name:'Ta-Ha',           ar:'طه',            v:135, t:'Meccan',  m:'Ta-Ha',                 j:16},
  {id:21, name:"Al-Anbiya",       ar:'الأنبياء',      v:112, t:'Meccan',  m:'The Prophets',          j:17},
  {id:22, name:'Al-Hajj',         ar:'الحج',          v:78,  t:'Medinan', m:'The Pilgrimage',        j:17},
  {id:23, name:"Al-Mu'minun",     ar:'المؤمنون',      v:118, t:'Meccan',  m:'The Believers',         j:18},
  {id:24, name:'An-Nur',          ar:'النور',         v:64,  t:'Medinan', m:'The Light',             j:18},
  {id:25, name:'Al-Furqan',       ar:'الفرقان',       v:77,  t:'Meccan',  m:'The Criterion',         j:18},
  {id:26, name:"Ash-Shu'ara",     ar:'الشعراء',       v:227, t:'Meccan',  m:'The Poets',             j:19},
  {id:27, name:'An-Naml',         ar:'النمل',         v:93,  t:'Meccan',  m:'The Ant',               j:19},
  {id:28, name:'Al-Qasas',        ar:'القصص',         v:88,  t:'Meccan',  m:'The Stories',           j:20},
  {id:29, name:"Al-'Ankabut",     ar:'العنكبوت',      v:69,  t:'Meccan',  m:'The Spider',            j:20},
  {id:30, name:'Ar-Rum',          ar:'الروم',         v:60,  t:'Meccan',  m:'The Romans',            j:21},
  {id:31, name:'Luqman',          ar:'لقمان',         v:34,  t:'Meccan',  m:'Luqman',                j:21},
  {id:32, name:'As-Sajda',        ar:'السجدة',        v:30,  t:'Meccan',  m:'The Prostration',       j:21},
  {id:33, name:'Al-Ahzab',        ar:'الأحزاب',       v:73,  t:'Medinan', m:'The Combined Forces',   j:21},
  {id:34, name:'Saba',            ar:'سبأ',           v:54,  t:'Meccan',  m:'Sheba',                 j:22},
  {id:35, name:'Fatir',           ar:'فاطر',          v:45,  t:'Meccan',  m:'Originator',            j:22},
  {id:36, name:'Ya-Sin',          ar:'يس',            v:83,  t:'Meccan',  m:'Ya-Sin',                j:22},
  {id:37, name:'As-Saffat',       ar:'الصافات',       v:182, t:'Meccan',  m:'Those Who Set The Ranks',j:23},
  {id:38, name:'Sad',             ar:'ص',             v:88,  t:'Meccan',  m:'The Letter Sad',        j:23},
  {id:39, name:'Az-Zumar',        ar:'الزمر',         v:75,  t:'Meccan',  m:'The Troops',            j:23},
  {id:40, name:'Ghafir',          ar:'غافر',          v:85,  t:'Meccan',  m:'The Forgiver',          j:24},
  {id:41, name:'Fussilat',        ar:'فصلت',          v:54,  t:'Meccan',  m:'Explained in Detail',   j:24},
  {id:42, name:'Ash-Shura',       ar:'الشورى',        v:53,  t:'Meccan',  m:'The Consultation',      j:25},
  {id:43, name:'Az-Zukhruf',      ar:'الزخرف',        v:89,  t:'Meccan',  m:'The Ornaments of Gold', j:25},
  {id:44, name:'Ad-Dukhan',       ar:'الدخان',        v:59,  t:'Meccan',  m:'The Smoke',             j:25},
  {id:45, name:'Al-Jathiya',      ar:'الجاثية',       v:37,  t:'Meccan',  m:'The Crouching',         j:25},
  {id:46, name:'Al-Ahqaf',        ar:'الأحقاف',       v:35,  t:'Meccan',  m:'The Wind-Curved Sandhills',j:26},
  {id:47, name:'Muhammad',        ar:'محمد',          v:38,  t:'Medinan', m:'Muhammad',              j:26},
  {id:48, name:'Al-Fath',         ar:'الفتح',         v:29,  t:'Medinan', m:'The Victory',           j:26},
  {id:49, name:'Al-Hujurat',      ar:'الحجرات',       v:18,  t:'Medinan', m:'The Rooms',             j:26},
  {id:50, name:'Qaf',             ar:'ق',             v:45,  t:'Meccan',  m:'The Letter Qaf',        j:26},
  {id:51, name:'Adh-Dhariyat',    ar:'الذاريات',      v:60,  t:'Meccan',  m:'The Winnowing Winds',   j:26},
  {id:52, name:'At-Tur',          ar:'الطور',         v:49,  t:'Meccan',  m:'The Mount',             j:27},
  {id:53, name:'An-Najm',         ar:'النجم',         v:62,  t:'Meccan',  m:'The Star',              j:27},
  {id:54, name:'Al-Qamar',        ar:'القمر',         v:55,  t:'Meccan',  m:'The Moon',              j:27},
  {id:55, name:'Ar-Rahman',       ar:'الرحمن',        v:78,  t:'Medinan', m:'The Beneficent',        j:27},
  {id:56, name:"Al-Waqi'a",       ar:'الواقعة',       v:96,  t:'Meccan',  m:'The Inevitable',        j:27},
  {id:57, name:'Al-Hadid',        ar:'الحديد',        v:29,  t:'Medinan', m:'The Iron',              j:27},
  {id:58, name:'Al-Mujadila',     ar:'المجادلة',      v:22,  t:'Medinan', m:'The Pleading Woman',    j:28},
  {id:59, name:'Al-Hashr',        ar:'الحشر',         v:24,  t:'Medinan', m:'The Exile',             j:28},
  {id:60, name:'Al-Mumtahina',    ar:'الممتحنة',      v:13,  t:'Medinan', m:'She That Is To Be Examined',j:28},
  {id:61, name:'As-Saf',          ar:'الصف',          v:14,  t:'Medinan', m:'The Ranks',             j:28},
  {id:62, name:"Al-Jumu'a",       ar:'الجمعة',        v:11,  t:'Medinan', m:'Friday',                j:28},
  {id:63, name:'Al-Munafiqun',    ar:'المنافقون',     v:11,  t:'Medinan', m:'The Hypocrites',        j:28},
  {id:64, name:'At-Taghabun',     ar:'التغابن',       v:18,  t:'Medinan', m:'The Mutual Disillusion',j:28},
  {id:65, name:'At-Talaq',        ar:'الطلاق',        v:12,  t:'Medinan', m:'The Divorce',           j:28},
  {id:66, name:'At-Tahrim',       ar:'التحريم',       v:12,  t:'Medinan', m:'The Prohibition',       j:28},
  {id:67, name:'Al-Mulk',         ar:'الملك',         v:30,  t:'Meccan',  m:'The Sovereignty',       j:29},
  {id:68, name:'Al-Qalam',        ar:'القلم',         v:52,  t:'Meccan',  m:'The Pen',               j:29},
  {id:69, name:'Al-Haqqa',        ar:'الحاقة',        v:52,  t:'Meccan',  m:'The Reality',           j:29},
  {id:70, name:"Al-Ma'arij",      ar:'المعارج',       v:44,  t:'Meccan',  m:'The Ascending Stairways',j:29},
  {id:71, name:'Nuh',             ar:'نوح',           v:28,  t:'Meccan',  m:'Noah',                  j:29},
  {id:72, name:'Al-Jinn',         ar:'الجن',          v:28,  t:'Meccan',  m:'The Jinn',              j:29},
  {id:73, name:'Al-Muzzammil',    ar:'المزمل',        v:20,  t:'Meccan',  m:'The Enshrouded One',    j:29},
  {id:74, name:'Al-Muddaththir',  ar:'المدثر',        v:56,  t:'Meccan',  m:'The Cloaked One',       j:29},
  {id:75, name:'Al-Qiyama',       ar:'القيامة',       v:40,  t:'Meccan',  m:'The Resurrection',      j:29},
  {id:76, name:'Al-Insan',        ar:'الإنسان',       v:31,  t:'Medinan', m:'The Human',             j:29},
  {id:77, name:'Al-Mursalat',     ar:'المرسلات',      v:50,  t:'Meccan',  m:'The Emissaries',        j:29},
  {id:78, name:"An-Naba'",        ar:'النبأ',         v:40,  t:'Meccan',  m:'The Tidings',           j:30},
  {id:79, name:"An-Nazi'at",      ar:'النازعات',      v:46,  t:'Meccan',  m:'Those Who Drag Forth',  j:30},
  {id:80, name:'Abasa',           ar:'عبس',           v:42,  t:'Meccan',  m:'He Frowned',            j:30},
  {id:81, name:'At-Takwir',       ar:'التكوير',       v:29,  t:'Meccan',  m:'The Overthrowing',      j:30},
  {id:82, name:'Al-Infitar',      ar:'الانفطار',      v:19,  t:'Meccan',  m:'The Cleaving',          j:30},
  {id:83, name:'Al-Mutaffifin',   ar:'المطففين',      v:36,  t:'Meccan',  m:'The Defrauding',        j:30},
  {id:84, name:'Al-Inshiqaq',     ar:'الانشقاق',      v:25,  t:'Meccan',  m:'The Sundering',         j:30},
  {id:85, name:'Al-Buruj',        ar:'البروج',        v:22,  t:'Meccan',  m:'The Mansions of Stars', j:30},
  {id:86, name:'At-Tariq',        ar:'الطارق',        v:17,  t:'Meccan',  m:'The Nightcomer',        j:30},
  {id:87, name:"Al-A'la",         ar:'الأعلى',        v:19,  t:'Meccan',  m:'The Most High',         j:30},
  {id:88, name:'Al-Ghashiya',     ar:'الغاشية',       v:26,  t:'Meccan',  m:'The Overwhelming',      j:30},
  {id:89, name:'Al-Fajr',         ar:'الفجر',         v:30,  t:'Meccan',  m:'The Dawn',              j:30},
  {id:90, name:'Al-Balad',        ar:'البلد',         v:20,  t:'Meccan',  m:'The City',              j:30},
  {id:91, name:'Ash-Shams',       ar:'الشمس',         v:15,  t:'Meccan',  m:'The Sun',               j:30},
  {id:92, name:'Al-Layl',         ar:'الليل',         v:21,  t:'Meccan',  m:'The Night',             j:30},
  {id:93, name:'Ad-Duha',         ar:'الضحى',         v:11,  t:'Meccan',  m:'The Morning Hours',     j:30},
  {id:94, name:'Ash-Sharh',       ar:'الشرح',         v:8,   t:'Meccan',  m:'The Relief',            j:30},
  {id:95, name:'At-Tin',          ar:'التين',         v:8,   t:'Meccan',  m:'The Fig',               j:30},
  {id:96, name:"Al-'Alaq",        ar:'العلق',         v:19,  t:'Meccan',  m:'The Clot',              j:30},
  {id:97, name:'Al-Qadr',         ar:'القدر',         v:5,   t:'Meccan',  m:'The Power',             j:30},
  {id:98, name:'Al-Bayyina',      ar:'البينة',        v:8,   t:'Medinan', m:'The Clear Proof',       j:30},
  {id:99, name:'Az-Zalzala',      ar:'الزلزلة',       v:8,   t:'Medinan', m:'The Earthquake',        j:30},
  {id:100,name:"Al-'Adiyat",      ar:'العاديات',      v:11,  t:'Meccan',  m:'The Courser',           j:30},
  {id:101,name:"Al-Qari'a",       ar:'القارعة',       v:11,  t:'Meccan',  m:'The Calamity',          j:30},
  {id:102,name:'At-Takathur',     ar:'التكاثر',       v:8,   t:'Meccan',  m:'The Rivalry in World Increase',j:30},
  {id:103,name:"Al-'Asr",         ar:'العصر',         v:3,   t:'Meccan',  m:'The Declining Day',     j:30},
  {id:104,name:'Al-Humaza',       ar:'الهمزة',        v:9,   t:'Meccan',  m:'The Traducer',          j:30},
  {id:105,name:'Al-Fil',          ar:'الفيل',         v:5,   t:'Meccan',  m:'The Elephant',          j:30},
  {id:106,name:'Quraysh',         ar:'قريش',          v:4,   t:'Meccan',  m:'Quraysh',               j:30},
  {id:107,name:"Al-Ma'un",        ar:'الماعون',       v:7,   t:'Meccan',  m:'The Small Kindnesses',  j:30},
  {id:108,name:'Al-Kawthar',      ar:'الكوثر',        v:3,   t:'Meccan',  m:'The Abundance',         j:30},
  {id:109,name:'Al-Kafirun',      ar:'الكافرون',      v:6,   t:'Meccan',  m:'The Disbelievers',      j:30},
  {id:110,name:'An-Nasr',         ar:'النصر',         v:3,   t:'Medinan', m:'The Divine Support',    j:30},
  {id:111,name:'Al-Masad',        ar:'المسد',         v:5,   t:'Meccan',  m:'The Palm Fibre',        j:30},
  {id:112,name:'Al-Ikhlas',       ar:'الإخلاص',       v:4,   t:'Meccan',  m:'The Sincerity',         j:30},
  {id:113,name:"Al-Falaq",        ar:'الفلق',         v:5,   t:'Meccan',  m:'The Daybreak',          j:30},
  {id:114,name:'An-Nas',          ar:'الناس',         v:6,   t:'Meccan',  m:'The Mankind',           j:30},
];

// ─── WAVE BARS COMPONENT ──────────────────────────────────────────────────────
const WaveBars = ({ color = '#f59e0b', size = 16 }) => (
  <span style={{ display:'inline-flex', alignItems:'flex-end', gap:'2px', height:size }}>
    {[1,2,3,4,5].map(i => (
      <span
        key={i}
        className="wave-bar"
        style={{ height:'100%', background: color }}
      />
    ))}
  </span>
);

// ─── SKELETON ROW ─────────────────────────────────────────────────────────────
const SkeletonVerse = ({ dark }) => (
  <div style={{ padding:'20px 20px', borderBottom:'1px solid', borderColor: dark ? '#374151' : '#f3f4f6' }}>
    <div className={dark ? 'dark-shimmer' : 'shimmer'} style={{ height:8, borderRadius:4, width:'20%', marginLeft:'auto', marginBottom:16 }} />
    <div className={dark ? 'dark-shimmer' : 'shimmer'} style={{ height:28, borderRadius:6, width:'90%', marginLeft:'auto', marginBottom:10 }} />
    <div className={dark ? 'dark-shimmer' : 'shimmer'} style={{ height:28, borderRadius:6, width:'70%', marginLeft:'auto', marginBottom:14 }} />
    <div className={dark ? 'dark-shimmer' : 'shimmer'} style={{ height:14, borderRadius:4, width:'85%', marginBottom:6 }} />
    <div className={dark ? 'dark-shimmer' : 'shimmer'} style={{ height:14, borderRadius:4, width:'60%' }} />
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function QuranApp() {
  const [view, setView]             = useState('home');
  const [dark, setDark]             = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [search, setSearch]         = useState('');
  const [surah, setSurah]           = useState(null);
  const [verses, setVerses]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showTrans, setShowTrans]   = useState(true);
  const [bookmarks, setBookmarks]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('iq_bm') || '[]'); } catch { return []; }
  });

  // ── Audio state ────────────────────────────────────────────────────────────
  const audioRef              = useRef(null);
  const verseRefs             = useRef({});
  const [activeIdx, setActiveIdx]       = useState(-1);   // -1 = not started
  const [playing, setPlaying]           = useState(false);
  const [muted, setMuted]               = useState(false);
  const [volume, setVolume]             = useState(1);
  const [progress, setProgress]         = useState(0);    // 0-100 within current verse
  const [elapsed, setElapsed]           = useState(0);
  const [duration, setDuration]         = useState(0);
  const activeIdxRef = useRef(-1);

  // Keep ref in sync
  useEffect(() => { activeIdxRef.current = activeIdx; }, [activeIdx]);

  // ── Filtered surahs ────────────────────────────────────────────────────────
  const filtered = SURAHS.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ar.includes(search) ||
    s.m.toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  );

  // ── Load surah ─────────────────────────────────────────────────────────────
  const openSurah = useCallback(async (s) => {
    setSurah(s);
    setView('surah');
    setLoading(true);
    setVerses([]);
    setActiveIdx(-1);
    setPlaying(false);
    setProgress(0);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    document.title = `${s.ar} — ${s.name} | إدريس أبكر`;

    try {
      const res = await fetch(
        `${QURAN_API}/verses/by_chapter/${s.id}?language=en&words=false&translations=131&per_page=300&fields=text_uthmani`
      );
      const data = await res.json();
      const merged = (data.verses || []).map(v => ({
        key:    v.verse_key,
        num:    parseInt(v.verse_key.split(':')[1]),
        arabic: v.text_uthmani,
        trans:  (v.translations?.[0]?.text || '').replace(/<[^>]+>/g, ''),
      }));
      setVerses(merged);
    } catch (e) {
      console.error('Failed to load surah', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Play verse at index ────────────────────────────────────────────────────
  const playAt = useCallback((idx, verses_) => {
    const list = verses_ || verses;
    if (idx < 0 || idx >= list.length || !audioRef.current) return;
    const v = list[idx];
    const url = verseAudioUrl(surah.id, v.num);

    audioRef.current.src = url;
    audioRef.current.load();
    audioRef.current.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));

    setActiveIdx(idx);
    setProgress(0);

    // Scroll into view after short delay for render
    setTimeout(() => {
      const el = verseRefs.current[idx];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }, [verses, surah]);

  // ── Auto-advance on verse end ──────────────────────────────────────────────
  const handleEnded = useCallback(() => {
    const next = activeIdxRef.current + 1;
    if (verses.length > 0 && next < verses.length) {
      playAt(next);
    } else {
      setPlaying(false);
      setActiveIdx(-1);
      setProgress(0);
    }
  }, [verses, playAt]);

  // ── Toggle play/pause ──────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else if (activeIdx === -1 && verses.length > 0) {
      playAt(0);
    } else {
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  // ── Volume sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // ── Go home ────────────────────────────────────────────────────────────────
  const goHome = () => {
    setView('home');
    setPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    document.title = 'القرآن الكريم — إدريس أبكر | Idrees Abkar';
  };

  // ── Bookmark toggle ────────────────────────────────────────────────────────
  const toggleBm = (id) => {
    const next = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(next);
    try { localStorage.setItem('iq_bm', JSON.stringify(next)); } catch {}
  };

  // ── Theme tokens ───────────────────────────────────────────────────────────
  const bg     = dark ? '#0f172a' : '#fdf8f0';
  const cardBg = dark ? '#1e293b' : '#ffffff';
  const border = dark ? '#334155' : '#f1f5f9';
  const text   = dark ? '#f1f5f9' : '#1e293b';
  const muted_ = dark ? '#94a3b8' : '#64748b';
  const hdrBg  = dark ? 'rgba(15,23,42,0.95)' : 'rgba(253,248,240,0.95)';

  const pct = verses.length > 0 && activeIdx >= 0
    ? Math.round(((activeIdx + 1) / verses.length) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:bg, color:text, fontFamily:'Inter,sans-serif', transition:'background .3s,color .3s' }}>
      <GlobalStyles />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          const d = audioRef.current.duration || 0;
          const c = audioRef.current.currentTime || 0;
          setElapsed(c);
          setDuration(d);
          if (d) setProgress((c / d) * 100);
        }}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* ══════════════ HEADER ══════════════ */}
      <header style={{
        position:'sticky', top:0, zIndex:50,
        background: hdrBg,
        backdropFilter:'blur(12px)',
        borderBottom:`1px solid ${border}`,
      }}>
        <div style={{ maxWidth:860, margin:'0 auto', padding:'0 16px', height:60, display:'flex', alignItems:'center', gap:12 }}>

          {/* Back / Logo */}
          {view === 'surah' ? (
            <button onClick={goHome} style={{ background:'none', border:'none', cursor:'pointer', color:text, padding:'6px', display:'flex', alignItems:'center' }}>
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{
                width:38, height:38, borderRadius:12,
                background:'linear-gradient(135deg,#059669,#0d9488)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 2px 8px rgba(5,150,105,.35)'
              }}>
                <span style={{ color:'#fff', fontFamily:'Amiri Quran,serif', fontSize:20 }}>ق</span>
              </div>
              <div style={{ lineHeight:1.2 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>القرآن الكريم</div>
                <div style={{ fontSize:11, color:muted_, display:'flex', alignItems:'center', gap:4 }}>
                  <Mic2 size={11} />إدريس أبكر · Idrees Abkar
                </div>
              </div>
            </div>
          )}

          {/* Surah title when inside surah */}
          {view === 'surah' && surah && (
            <div style={{ flex:1, lineHeight:1.2 }}>
              <div style={{ fontWeight:700, fontSize:16, fontFamily:'Scheherazade New,serif', direction:'rtl' }}>{surah.ar}</div>
              <div style={{ fontSize:11, color:muted_ }}>{surah.name} · {surah.v} verses · {surah.t}</div>
            </div>
          )}

          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
            {/* Search (home only) */}
            {view === 'home' && (
              <div style={{
                display:'flex', alignItems:'center', gap:8,
                background: cardBg,
                border:`1px solid ${border}`,
                borderRadius:24, padding:'6px 14px',
                boxShadow:'0 1px 4px rgba(0,0,0,.06)'
              }}>
                <Search size={14} color={muted_} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search surah…"
                  style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:text, width:130 }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:muted_, display:'flex' }}>
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Toggle translation */}
            {view === 'surah' && (
              <button
                onClick={() => setShowTrans(p => !p)}
                title="Toggle translation"
                style={{
                  background: showTrans ? (dark ? 'rgba(5,150,105,.25)' : '#d1fae5') : 'transparent',
                  border: `1px solid ${showTrans ? '#059669' : border}`,
                  color: showTrans ? '#059669' : muted_,
                  borderRadius:8, padding:'5px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600
                }}
              >
                <Globe size={14} /> EN
              </button>
            )}

            {/* Bookmark surah */}
            {view === 'surah' && surah && (
              <button
                onClick={() => toggleBm(surah.id)}
                style={{ background:'none', border:'none', cursor:'pointer', color: bookmarks.includes(surah.id) ? '#f59e0b' : muted_, display:'flex', padding:6 }}
              >
                <BookMarked size={18} />
              </button>
            )}

            {/* Dark toggle */}
            <button
              onClick={() => setDark(p => !p)}
              style={{ background:'none', border:'none', cursor:'pointer', color:muted_, display:'flex', padding:6 }}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════ HOME VIEW ══════════════ */}
      {view === 'home' && (
        <main style={{ maxWidth:860, margin:'0 auto', padding:'0 16px 80px' }}>

          {/* Hero card */}
          <div style={{
            margin:'24px 0 20px',
            borderRadius:24,
            background:'linear-gradient(135deg,#065f46 0%,#0f766e 50%,#064e3b 100%)',
            padding:'28px 24px',
            color:'#fff',
            position:'relative',
            overflow:'hidden',
            boxShadow:'0 12px 40px rgba(6,95,70,.3)'
          }}>
            <div style={{ position:'absolute', top:-30, right:-30, width:160, height:160, background:'rgba(255,255,255,.07)', borderRadius:'50%' }} />
            <div style={{ position:'absolute', bottom:-20, left:20, width:100, height:100, background:'rgba(0,0,0,.1)', borderRadius:'50%' }} />
            <div style={{ position:'relative' }}>
              <span style={{ display:'inline-block', background:'#f59e0b', color:'#78350f', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, letterSpacing:.5, textTransform:'uppercase', marginBottom:14 }}>
                ★ Featured Reciter
              </span>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                <div>
                  <div style={{ fontSize:32, fontFamily:'Scheherazade New,serif', marginBottom:4 }}>إدريس أبكر</div>
                  <div style={{ fontSize:20, fontWeight:600, marginBottom:6 }}>Idrees Abkar</div>
                  <div style={{ color:'rgba(255,255,255,.7)', fontSize:13, marginBottom:14 }}>حفص عن عاصم · Hafs ʿan ʿĀṣim · Full Quran</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['Verse-by-Verse Sync','Live Ayah Highlight','Full 114 Surahs'].map(tag => (
                      <span key={tag} style={{ background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)', fontSize:12, padding:'4px 12px', borderRadius:20 }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize:72, opacity:.15, fontFamily:'Amiri Quran,serif', lineHeight:1, flexShrink:0 }}>ق</div>
              </div>
            </div>
          </div>

          {/* Surah count */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>
              {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : '114 Surahs'}
            </div>
            {bookmarks.length > 0 && (
              <div style={{ fontSize:12, color:muted_ }}>{bookmarks.length} bookmarked</div>
            )}
          </div>

          {/* Surah grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:10 }}>
            {filtered.map(s => {
              const gradients = [
                'linear-gradient(135deg,#059669,#0d9488)',
                'linear-gradient(135deg,#d97706,#ea580c)',
                'linear-gradient(135deg,#2563eb,#7c3aed)',
                'linear-gradient(135deg,#db2777,#e11d48)',
              ];
              const grad = gradients[Math.floor((s.id - 1) / 30) % gradients.length];

              return (
                <button
                  key={s.id}
                  onClick={() => openSurah(s)}
                  style={{
                    display:'flex', alignItems:'center', gap:12,
                    background: cardBg,
                    border:`1px solid ${border}`,
                    borderRadius:16,
                    padding:'14px 16px',
                    cursor:'pointer',
                    textAlign:'left',
                    transition:'box-shadow .15s,transform .1s',
                    color: text,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow=`0 4px 20px rgba(0,0,0,.12)`; e.currentTarget.style.transform='translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform=''; }}
                >
                  {/* Number badge */}
                  <div style={{
                    width:40, height:40, borderRadius:12,
                    background: grad,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'#fff', fontWeight:700, fontSize:13, flexShrink:0,
                    boxShadow:'0 2px 8px rgba(0,0,0,.2)'
                  }}>
                    {s.id}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontWeight:600, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</span>
                      {bookmarks.includes(s.id) && <BookMarked size={12} color="#f59e0b" style={{ flexShrink:0 }} />}
                    </div>
                    <div style={{ fontSize:11, color:muted_, marginTop:2 }}>{s.m} · {s.v}v · {s.t} · J{s.j}</div>
                  </div>

                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontFamily:'Scheherazade New,serif', fontSize:20, lineHeight:1.3 }}>{s.ar}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 0', color:muted_ }}>
              <BookOpen size={40} style={{ margin:'0 auto 12px', opacity:.4, display:'block' }} />
              <p>No surahs match "<strong>{search}</strong>"</p>
            </div>
          )}
        </main>
      )}

      {/* ══════════════ SURAH VIEW ══════════════ */}
      {view === 'surah' && surah && (
        <main style={{ maxWidth:780, margin:'0 auto', padding:'0 16px 200px' }}>

          {/* Surah banner */}
          <div style={{
            margin:'20px 0 16px',
            borderRadius:20,
            background:'linear-gradient(135deg,#065f46,#0f766e)',
            padding:'22px 24px',
            color:'#fff',
            textAlign:'center',
          }}>
            <div style={{ fontFamily:'Amiri Quran,serif', fontSize:36, marginBottom:4 }}>{surah.ar}</div>
            <div style={{ fontSize:14, opacity:.8 }}>{surah.name} · {surah.m}</div>
            <div style={{ fontSize:12, opacity:.6, marginTop:4 }}>
              {surah.v} verses · {surah.t} · Juz {surah.j}
            </div>
            {/* Surah progress bar */}
            {activeIdx >= 0 && (
              <div style={{ marginTop:14, background:'rgba(255,255,255,.2)', borderRadius:4, height:4, overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, background:'#f59e0b', height:'100%', borderRadius:4, transition:'width .4s ease' }} />
              </div>
            )}
          </div>

          {/* Bismillah */}
          {surah.id !== 9 && (
            <div style={{
              textAlign:'center',
              fontFamily:'Amiri Quran,serif',
              fontSize:26,
              lineHeight:2,
              color: dark ? '#fcd34d' : '#065f46',
              margin:'8px 0 4px',
              padding:'10px 0'
            }}>
              {BISMILLAH}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ borderRadius:16, border:`1px solid ${border}`, overflow:'hidden', background:cardBg }}>
              {[...Array(5)].map((_, i) => <SkeletonVerse key={i} dark={dark} />)}
            </div>
          )}

          {/* Verse list */}
          {!loading && verses.length > 0 && (
            <div style={{ borderRadius:16, border:`1px solid ${border}`, overflow:'hidden', background:cardBg }}>
              {verses.map((v, idx) => {
                const isActive = idx === activeIdx;
                const isPlaying_ = isActive && playing;

                return (
                  <div
                    key={v.key}
                    ref={el => { verseRefs.current[idx] = el; }}
                    className={isActive ? 'verse-active' : ''}
                    style={{
                      padding:'20px 20px',
                      borderBottom: idx < verses.length - 1 ? `1px solid ${border}` : 'none',
                      transition:'background .25s',
                      background: isActive
                        ? (dark ? 'rgba(234,179,8,.12)' : 'rgba(254,243,199,.6)')
                        : 'transparent',
                      borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => playAt(idx)}
                  >
                    {/* Verse header row */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      {/* Play status + verse number */}
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{
                          width:32, height:32, borderRadius:'50%',
                          background: isActive ? '#f59e0b' : (dark ? '#334155' : '#f1f5f9'),
                          display:'flex', alignItems:'center', justifyContent:'center',
                          flexShrink:0, transition:'background .2s',
                        }}>
                          {isPlaying_
                            ? <WaveBars color="#fff" size={14} />
                            : <span style={{ fontSize:12, fontWeight:700, color: isActive ? '#fff' : muted_ }}>{v.num}</span>
                          }
                        </div>
                        {isActive && (
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontSize:11, fontWeight:600, color:'#f59e0b', textTransform:'uppercase', letterSpacing:.5 }}>
                              {isPlaying_ ? '● Now reciting' : '● Paused'}
                            </span>
                            {isPlaying_ && <WaveBars color="#f59e0b" size={12} />}
                          </div>
                        )}
                      </div>

                      {/* Verse key */}
                      <div style={{ fontSize:11, color:muted_, fontWeight:500 }}>{v.key}</div>
                    </div>

                    {/* Verse progress bar (only active) */}
                    {isActive && duration > 0 && (
                      <div style={{ marginBottom:12, background: dark ? '#334155' : '#e2e8f0', borderRadius:3, height:3, overflow:'hidden' }}>
                        <div style={{ width:`${progress}%`, background:'#f59e0b', height:'100%', borderRadius:3, transition:'width .1s linear' }} />
                      </div>
                    )}

                    {/* Arabic text */}
                    <div
                      dir="rtl"
                      style={{
                        fontFamily:'Amiri Quran,serif',
                        fontSize:26,
                        lineHeight:2.2,
                        textAlign:'right',
                        marginBottom:10,
                        color: isActive ? (dark ? '#fde68a' : '#065f46') : text,
                        transition:'color .2s',
                        userSelect:'text',
                      }}
                    >
                      {v.arabic}
                    </div>

                    {/* Translation */}
                    {showTrans && v.trans && (
                      <div style={{
                        fontSize:14,
                        lineHeight:1.7,
                        color: muted_,
                        borderTop:`1px solid ${border}`,
                        paddingTop:10,
                        marginTop:4,
                      }}>
                        {v.trans}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* ══════════════ FLOATING PLAYER ══════════════ */}
      {view === 'surah' && surah && (
        <div style={{
          position:'fixed', bottom:0, left:0, right:0, zIndex:60,
          background: hdrBg,
          backdropFilter:'blur(16px)',
          borderTop:`1px solid ${border}`,
          boxShadow:`0 -4px 30px rgba(0,0,0,.12)`,
        }}>
          {/* Thin overall surah progress */}
          <div style={{ height:3, background: dark ? '#334155' : '#e2e8f0' }}>
            <div style={{
              width:`${pct}%`,
              height:'100%',
              background:'linear-gradient(90deg,#059669,#f59e0b)',
              transition:'width .5s ease',
            }} />
          </div>

          <div style={{ maxWidth:780, margin:'0 auto', padding:'10px 16px 12px' }}>

            {/* Now playing info */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{
                width:36, height:36, borderRadius:10,
                background:'linear-gradient(135deg,#059669,#0d9488)',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
              }}>
                {playing
                  ? <WaveBars color="#fff" size={14} />
                  : <Mic2 size={16} color="#fff" />
                }
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {activeIdx >= 0
                    ? <>Verse {verses[activeIdx]?.num} of {surah.v} — <span style={{ fontFamily:'Scheherazade New,serif' }}>{surah.ar}</span></>
                    : <>{surah.name} — <span style={{ fontFamily:'Scheherazade New,serif' }}>{surah.ar}</span></>
                  }
                </div>
                <div style={{ fontSize:11, color: playing ? '#059669' : muted_, marginTop:1, fontWeight:500 }}>
                  إدريس أبكر · {playing ? 'Now Reciting' : activeIdx >= 0 ? 'Paused' : 'Ready'}
                  {duration > 0 && (
                    <span style={{ color:muted_, marginLeft:6, fontWeight:400 }}>
                      {Math.floor(elapsed)}s / {Math.floor(duration)}s
                    </span>
                  )}
                </div>
              </div>
              {/* Verse progress % */}
              {activeIdx >= 0 && (
                <div style={{ fontSize:11, color:muted_, fontWeight:600, flexShrink:0 }}>
                  {pct}%
                </div>
              )}
            </div>

            {/* Verse seek bar */}
            {duration > 0 && (
              <input
                type="range" min={0} max={100} step={0.2} value={progress}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (audioRef.current && duration) audioRef.current.currentTime = (val / 100) * duration;
                  setProgress(val);
                }}
                style={{ width:'100%', height:4, accentColor:'#f59e0b', cursor:'pointer', marginBottom:10 }}
              />
            )}

            {/* Controls row */}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {/* Prev verse */}
              <button
                onClick={() => { if (activeIdx > 0) playAt(activeIdx - 1); }}
                disabled={activeIdx <= 0}
                style={{ background:'none', border:'none', cursor: activeIdx > 0 ? 'pointer' : 'default', color: activeIdx > 0 ? text : muted_, display:'flex', padding:8, opacity: activeIdx > 0 ? 1 : .4 }}
              >
                <SkipBack size={20} />
              </button>

              {/* Play / Pause main button */}
              <button
                onClick={togglePlay}
                style={{
                  width:52, height:52, borderRadius:'50%',
                  background:'linear-gradient(135deg,#059669,#0d9488)',
                  border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 4px 16px rgba(5,150,105,.4)',
                  color:'#fff',
                  transition:'transform .1s',
                  flexShrink:0,
                }}
                onMouseDown={e => e.currentTarget.style.transform='scale(.95)'}
                onMouseUp={e => e.currentTarget.style.transform=''}
              >
                {playing
                  ? <Pause size={22} fill="currentColor" />
                  : <Play size={22} fill="currentColor" style={{ marginLeft:2 }} />
                }
              </button>

              {/* Next verse */}
              <button
                onClick={() => { if (activeIdx < verses.length - 1) playAt(activeIdx + 1); }}
                disabled={activeIdx >= verses.length - 1}
                style={{ background:'none', border:'none', cursor: activeIdx < verses.length - 1 ? 'pointer' : 'default', color: activeIdx < verses.length - 1 ? text : muted_, display:'flex', padding:8, opacity: activeIdx < verses.length - 1 ? 1 : .4 }}
              >
                <SkipForward size={20} />
              </button>

              {/* Spacer */}
              <div style={{ flex:1 }} />

              {/* Volume */}
              <button
                onClick={() => setMuted(p => !p)}
                style={{ background:'none', border:'none', cursor:'pointer', color: muted ? '#ef4444' : muted_, display:'flex', padding:6 }}
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                style={{ width:72, height:4, accentColor:'#059669', cursor:'pointer' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
