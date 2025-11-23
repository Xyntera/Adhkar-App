import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sun, Moon, Coffee, Star, ArrowLeft, ArrowRight, RefreshCw, 
  Copy, Check, Play, Pause, MapPin, Loader2, Navigation, 
  Heart, Home, Car, Utensils, CloudRain, Flame, Calendar,
  Bell, X
} from 'lucide-react';

// --- STYLES & FONTS ---
const FontLink = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
      .font-arabic { font-family: 'Amiri', serif; }
      .font-sans { font-family: 'Outfit', sans-serif; }
      
      /* Audio Visualizer Animation */
      @keyframes sound-wave {
        0%, 100% { height: 4px; }
        50% { height: 16px; }
      }
      .animate-wave { animation: sound-wave 1s ease-in-out infinite; }
      .delay-100 { animation-delay: 0.1s; }
      .delay-200 { animation-delay: 0.2s; }
      
      /* Progress Ring Animation */
      .progress-ring-circle {
        transition: stroke-dashoffset 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
      }
      
      /* Hide scrollbar */
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}
  </style>
);

// --- EXPANDED DATASET ---
const ADHKAR_DATASET = [
  // --- MORNING ---
  {
    id: 'm1',
    category: 'morning',
    count_target: 1,
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللهُ، وَحْدَهُ لَا شَرِيكَ لَهُ...",
    transliteration: "Asbahna wa-asbahal-mulku lillah wa-lhamdu lillah, la ilaha illal-lah...",
    translation: "We have entered the morning and the Kingdom belongs to Allah, and all praise is due to Allah...",
    reference: "Muslim 4/2088",
    virtue: "Protection against laziness and the torment of the grave."
  },
  {
    id: 'm2',
    category: 'morning',
    count_target: 3,
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shai'un fil-ardi wa la fis-sama'i, wa Huwas-Sami'ul-'Alim.",
    translation: "In the Name of Allah with Whose Name there is protection against every kind of harm in the earth or in the heaven...",
    reference: "Abu Dawud & Tirmidhi",
    virtue: "Nothing will harm him who recites it 3 times."
  },
  {
    id: 'm3',
    category: 'morning',
    count_target: 100,
    arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
    transliteration: "Subhan-Allahi wa bihamdihi.",
    translation: "Glory is to Allah and praise is to Him.",
    reference: "Bukhari & Muslim",
    virtue: "Review: Whoever says this 100 times, his sins will be forgiven."
  },
  {
    id: 'm4',
    category: 'morning',
    count_target: 1,
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا ، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna wa bika amsayna, wa bika nahya wa bika namutu wa ilaykan-nushur.",
    translation: "O Allah, by You we enter the morning and by You we enter the evening...",
    reference: "Tirmidhi 3391",
    virtue: "Acknowledging Allah's power over life and death."
  },

  // --- EVENING ---
  {
    id: 'e1',
    category: 'evening',
    count_target: 1,
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration: "Amsayna wa-amsal-mulku lillah walhamdu lillah...",
    translation: "We have reached the evening and at this very time unto Allah belongs all sovereignty...",
    reference: "Muslim 4/2088",
    virtue: "Affirming Tawheed at the end of the day."
  },
  {
    id: 'e2',
    category: 'evening',
    count_target: 3,
    arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bikalimatillahi-tammati min sharri ma khalaq.",
    translation: "I seek refuge in the Perfect Words of Allah from the evil of what He has created.",
    reference: "Muslim 4/2080",
    virtue: "Protection from harm (e.g. insect bites)."
  },
  {
    id: 'e3',
    category: 'evening',
    count_target: 7,
    arabic: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "HasbiyAllahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa Rabbul-'arshil-'azim.",
    translation: "Allah is sufficient for me. There is none worthy of worship but Him...",
    reference: "Abu Dawud",
    virtue: "Allah will be sufficient for him against anything that grieves him."
  },

  // --- SLEEP ---
  {
    id: 's1',
    category: 'sleep',
    count_target: 1,
    arabic: "بِاسْمِكَ رَبِّـي وَضَعْـتُ جَنْـبِي ، وَبِكَ أَرْفَعُـهُ",
    transliteration: "Bismika Rabbi wada'tu janbi, wa bika arfa'uh...",
    translation: "In Your Name my Lord I lie down, and in Your Name I rise...",
    reference: "Bukhari 11/126",
    virtue: "Protection during sleep."
  },
  {
    id: 's2',
    category: 'sleep',
    count_target: 33,
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhanallah",
    translation: "Glory is to Allah.",
    reference: "Bukhari",
    virtue: "Part of the 33/33/34 tasbih before sleep (Fatima's Tasbih)."
  },

  // --- TRAVEL ---
  {
    id: 't1',
    category: 'travel',
    count_target: 1,
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrinin...",
    translation: "Glory to Him who has brought this [vehicle] under our control, though we were unable to control it ourselves...",
    reference: "Quran 43:13-14",
    virtue: "Supplication for mounting a vehicle."
  },

  // --- HOME ---
  {
    id: 'h1',
    category: 'home',
    count_target: 1,
    arabic: "بِسْـمِ اللهِ وَلَجْنـا، وَبِسْـمِ اللهِ خَـرَجْنـا، وَعَلـى رَبِّنـا تَوَكّلْـنا",
    transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna.",
    translation: "In the Name of Allah we enter, in the Name of Allah we leave, and upon our Lord we depend.",
    reference: "Abu Dawud 4/325",
    virtue: "Entering the home."
  },

  // --- FOOD ---
  {
    id: 'f1',
    category: 'food',
    count_target: 1,
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwatin.",
    translation: "All praise is due to Allah Who fed me this and provided it for me without any might or power on my part.",
    reference: "Tirmidhi",
    virtue: "Forgiveness of past sins."
  },

  // --- DISTRESS ---
  {
    id: 'd1',
    category: 'distress',
    count_target: 1,
    arabic: "لا إِلَهَ إِلا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin.",
    translation: "There is no deity but You. Glory be to You! Verily, I have been among the wrongdoers.",
    reference: "Quran 21:87",
    virtue: "The prayer of Dhun-Nun (Yunus) which is answered."
  },
  {
    id: 'd2',
    category: 'distress',
    count_target: 1,
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan...",
    translation: "O Allah, I seek refuge in You from anxiety and sorrow...",
    reference: "Bukhari",
    virtue: "Removal of anxiety and debt."
  }
];

// --- HELPERS ---

// Safe LocalStorage Wrapper to prevent crashes in sandboxed environments
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('LocalStorage access denied or unavailable', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage access denied or unavailable', e);
    }
  }
};

// --- COMPONENTS ---

const AudioVisualizer = ({ isPlaying }) => (
  <div className="flex items-center justify-center gap-1 h-6">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`w-1 bg-emerald-500 rounded-full ${isPlaying ? 'animate-wave' : 'h-1'} ${i % 2 === 0 ? 'delay-100' : 'delay-200'}`}
        style={{ animationDuration: `${0.8 + i * 0.1}s` }}
      />
    ))}
  </div>
);

const TasbihCounter = ({ target, current, onIncrement }) => {
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (current / target) * circumference;
  const isComplete = current >= target;

  return (
    <button 
      onClick={onIncrement}
      disabled={isComplete}
      className={`relative group transition-all duration-300 ${isComplete ? 'scale-95 opacity-80 cursor-default' : 'active:scale-95 cursor-pointer'}`}
    >
      <div className={`absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${isComplete ? 'hidden' : ''}`}></div>
      <svg height={radius * 2} width={radius * 2} className="rotate-0">
        <circle stroke="rgba(0,0,0,0.05)" strokeWidth={stroke} fill="white" r={normalizedRadius} cx={radius} cy={radius} />
        <circle
          className="progress-ring-circle"
          stroke={isComplete ? "#10B981" : "#34D399"}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-700 select-none">
        {isComplete ? (
           <Check size={32} className="text-emerald-600 animate-in zoom-in spin-in-90 duration-300" />
        ) : (
          <>
            <span className="text-3xl font-bold">{current}</span>
            <span className="text-xs text-stone-400 font-medium">/{target}</span>
          </>
        )}
      </div>
    </button>
  );
};

// Reminder Banner Component
const ReminderBanner = ({ type, text, onClose, onAction }) => {
  const colors = {
    morning: 'bg-amber-50 border-amber-200 text-amber-800',
    evening: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    sleep: 'bg-slate-50 border-slate-200 text-slate-800',
    default: 'bg-emerald-50 border-emerald-200 text-emerald-800'
  };
  const theme = colors[type] || colors.default;

  return (
    <div className={`mb-4 p-4 rounded-2xl border ${theme} flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/50 rounded-full">
           <Bell size={20} className="animate-pulse" />
        </div>
        <div>
           <h4 className="font-bold text-sm uppercase tracking-wide opacity-80">{type} Reminder</h4>
           <p className="font-medium text-sm">{text}</p>
        </div>
      </div>
      <div className="flex gap-2">
         <button onClick={onAction} className="px-3 py-1 bg-white/60 hover:bg-white rounded-lg text-xs font-bold transition-colors">
           Start
         </button>
         <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
           <X size={16} />
         </button>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('home'); // home, detail, favorites
  
  // Data State
  const [prayerData, setPrayerData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState(null);
  const [reminder, setReminder] = useState(null);
  
  // Selection State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentAdhkar, setCurrentAdhkar] = useState(null);
  const [queue, setQueue] = useState([]); // Array of adhkar for current session
  const [queueIndex, setQueueIndex] = useState(0);
  
  // Interaction State
  const [counter, setCounter] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- INIT & PERSISTENCE ---
  useEffect(() => {
    // 1. Load Favorites safely
    const savedFavs = safeStorage.getItem('adhkar_favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error("Error parsing favorites", e);
      }
    }
    
    // 2. Load Streak Logic safely
    const savedStreak = safeStorage.getItem('adhkar_streak');
    const savedDate = safeStorage.getItem('adhkar_last_active');
    
    if (savedStreak) setStreak(parseInt(savedStreak) || 0);
    if (savedDate) setLastActiveDate(savedDate);
    
    // 3. Check for Reminders based on time
    checkReminders();

    // 4. Get Location safely
    getUserLocation();
  }, []);

useEffect(() => {
  // Update browser title based on what the user is doing
  if (view === 'home') {
    document.title = "Dhikr Daily | Morning & Evening Adhkar";
  } else if (selectedCategory) {
    // Capitalize first letter
    const catName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
    document.title = `${catName} Adhkar | Dhikr Daily`;
  }
}, [view, selectedCategory]);

  const checkReminders = () => {
    const hour = new Date().getHours();
    let type = null;
    let text = "";

    if (hour >= 5 && hour < 11) {
       type = 'morning';
       text = "It's morning! Start your day with Barakah.";
    } else if (hour >= 15 && hour < 20) {
       type = 'evening';
       text = "The sun is setting. Time for evening Adhkar.";
    } else if (hour >= 21 || hour < 4) {
       type = 'sleep';
       text = "Don't forget your Adhkar before sleeping.";
    }

    if (type) {
       setReminder({ type, text });
    }
  };

  const toggleFavorite = (id) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    safeStorage.setItem('adhkar_favorites', JSON.stringify(newFavs));
  };

  // --- STREAK LOGIC ---
  const handleComplete = () => {
    const today = new Date().toDateString();
    
    // Only increment streak if we haven't already done it today
    if (lastActiveDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastActiveDate(today);
      
      safeStorage.setItem('adhkar_streak', newStreak.toString());
      safeStorage.setItem('adhkar_last_active', today);
    }
  };

  // --- API ---
  const fetchPrayerTimes = async (lat, long) => {
    try {
      const date = Math.floor(Date.now() / 1000);
      const response = await fetch(`https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${long}&method=2`);
      const data = await response.json();
      if (data.code === 200) setPrayerData(data.data);
    } catch (err) { 
      console.error("Failed to fetch prayer times:", err); 
    }
  };

  const getUserLocation = () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => fetchPrayerTimes(position.coords.latitude, position.coords.longitude),
          (error) => {
             console.warn("Geolocation permission denied or failed. Using default.", error.message);
             // Fallback to Makkah coordinates if location fails
             fetchPrayerTimes(21.4225, 39.8262); 
          }
        );
      } else {
        // Fallback if geolocation not supported
        fetchPrayerTimes(21.4225, 39.8262);
      }
    } catch (e) {
      console.error("Error accessing geolocation API", e);
      // Fallback
      fetchPrayerTimes(21.4225, 39.8262);
    }
  };

  // --- AUDIO ---
  const toggleAudio = () => {
    if (audioPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setAudioPlaying(false);
    } else {
      setAudioPlaying(true);
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(currentAdhkar.arabic);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.85;
        utterance.onend = () => setAudioPlaying(false);
        utterance.onerror = (e) => {
          console.error("Speech synthesis error", e);
          setAudioPlaying(false);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn("Speech synthesis not supported in this browser");
        setAudioPlaying(false);
      }
    }
  };

  // --- NAVIGATION LOGIC ---
  const startSession = (category, startId = null) => {
    let items;
    if (category === 'favorites') {
      items = ADHKAR_DATASET.filter(a => favorites.includes(a.id));
    } else if (category === 'all') {
      items = [...ADHKAR_DATASET]; 
    } else {
      items = ADHKAR_DATASET.filter(d => d.category === category);
    }
    
    if (items.length === 0) return;

    setQueue(items);
    
    let startIndex = 0;
    if (startId) {
        startIndex = items.findIndex(i => i.id === startId);
        if (startIndex === -1) startIndex = 0;
    }

    setQueueIndex(startIndex);
    setCurrentAdhkar(items[startIndex]);
    setSelectedCategory(category);
    setCounter(0);
    setView('detail');
    setAudioPlaying(false);
    setReminder(null); // Dismiss reminder when starting
  };

  const handleNext = () => {
    setAudioPlaying(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    const nextIndex = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIndex);
    setCurrentAdhkar(queue[nextIndex]);
    setCounter(0);
  };

  const handlePrev = () => {
    setAudioPlaying(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIndex);
    setCurrentAdhkar(queue[prevIndex]);
    setCounter(0);
  };

  // --- DHIKR OF THE DAY LOGIC ---
  const dhikrOfTheDay = useMemo(() => {
    // Determine index based on date string hash to be consistent for 24 hours
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) hash = today.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % ADHKAR_DATASET.length;
    return ADHKAR_DATASET[index];
  }, []);

  const categories = [
    { id: 'morning', label: 'Morning', icon: <Sun size={24} />, color: 'from-amber-200 to-orange-100', text: 'text-amber-800' },
    { id: 'evening', label: 'Evening', icon: <Moon size={24} />, color: 'from-indigo-200 to-blue-100', text: 'text-indigo-800' },
    { id: 'sleep', label: 'Sleep', icon: <Coffee size={24} />, color: 'from-slate-200 to-gray-100', text: 'text-slate-800' },
    { id: 'prayer', label: 'Salah', icon: <Star size={24} />, color: 'from-emerald-200 to-teal-100', text: 'text-emerald-800' },
    { id: 'travel', label: 'Travel', icon: <Car size={24} />, color: 'from-blue-200 to-cyan-100', text: 'text-blue-800' },
    { id: 'home', label: 'Home', icon: <Home size={24} />, color: 'from-stone-200 to-warmGray-100', text: 'text-stone-800' },
    { id: 'food', label: 'Food', icon: <Utensils size={24} />, color: 'from-orange-200 to-red-100', text: 'text-orange-800' },
    { id: 'distress', label: 'Distress', icon: <CloudRain size={24} />, color: 'from-gray-300 to-slate-200', text: 'text-slate-700' },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 font-sans selection:bg-emerald-200 overflow-x-hidden">
      <FontLink />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-amber-100 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl shadow-lg flex items-center justify-center text-white font-serif font-bold text-xl">
              ذ
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-800 leading-none">Dhikr Daily</h1>
              <div className="flex items-center gap-1 mt-1">
                <Flame size={12} className={`transition-colors ${lastActiveDate === new Date().toDateString() ? 'text-orange-500' : 'text-stone-400'}`} fill="currentColor" />
                <span className="text-xs text-stone-400 font-medium uppercase">{streak} Day Streak</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {view !== 'home' && (
               <button onClick={() => setView('home')} className="p-2 bg-white/50 backdrop-blur hover:bg-white rounded-full transition-all shadow-sm">
                 <Home size={20} className="text-stone-600" />
               </button>
            )}
             <button 
               onClick={() => startSession('favorites')} 
               className="p-2 bg-white/50 backdrop-blur hover:bg-white rounded-full transition-all shadow-sm relative"
             >
               <Heart size={20} className={favorites.length > 0 ? "text-rose-500 fill-rose-500" : "text-stone-400"} />
               {favorites.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>}
             </button>
          </div>
        </header>

        {view === 'home' ? (
          <main className="flex-1 px-6 pb-20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* --- REMINDER BANNER --- */}
            {reminder && (
              <ReminderBanner 
                type={reminder.type} 
                text={reminder.text} 
                onClose={() => setReminder(null)}
                onAction={() => startSession(reminder.type)}
              />
            )}

            {/* Dhikr of the Day Card */}
            <div 
              onClick={() => startSession(dhikrOfTheDay.category, dhikrOfTheDay.id)}
              className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden group cursor-pointer"
            >
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                      <Calendar size={12} /> Dhikr of the Day
                    </span>
                    <ArrowRight className="text-white/60 group-hover:translate-x-1 transition-transform" />
                 </div>
                 <h3 className="text-2xl font-arabic leading-relaxed mb-2 truncate max-w-full" dir="rtl">
                   {dhikrOfTheDay.arabic}
                 </h3>
                 <p className="text-emerald-100 text-sm line-clamp-2 opacity-90">
                   {dhikrOfTheDay.translation}
                 </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Smart Widget (Prayer Times) */}
            {prayerData && (
               <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-3xl shadow-sm">
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                     {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => (
                       <div key={p} className="flex-shrink-0 px-4 py-2 bg-white rounded-xl border border-stone-100 shadow-sm flex flex-col items-center min-w-[70px]">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{p}</span>
                          <span className="text-sm font-bold text-emerald-700">{prayerData.timings[p].split(' ')[0]}</span>
                       </div>
                     ))}
                   </div>
               </div>
            )}

            {/* Categories Grid */}
            <div>
              <h2 className="text-lg font-bold text-stone-800 mb-4 px-1">Categories</h2>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => startSession(cat.id)}
                    className={`relative p-4 h-28 rounded-3xl bg-gradient-to-br ${cat.color} border border-white/60 shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col justify-between group`}
                  >
                    <div className={`w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center ${cat.text} group-hover:scale-110 transition-transform duration-300`}>
                      {cat.icon}
                    </div>
                    <span className={`text-base font-bold ${cat.text} text-left`}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </main>
        ) : (
          <main className="flex-1 px-4 pb-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Detail Card */}
            {currentAdhkar && (
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-white p-6 md:p-8 flex-1 flex flex-col relative overflow-hidden">
                
                {/* Top Actions */}
                <div className="flex justify-between items-center mb-6 z-10">
                   <button 
                     onClick={toggleAudio}
                     className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${audioPlaying ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                   >
                     {audioPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                     {audioPlaying ? 'Playing' : 'Listen'}
                     {audioPlaying && <AudioVisualizer isPlaying={audioPlaying} />}
                   </button>
                   
                   <button 
                    onClick={() => toggleFavorite(currentAdhkar.id)}
                    className={`p-2 rounded-full transition-all ${favorites.includes(currentAdhkar.id) ? 'bg-rose-50 text-rose-500' : 'bg-transparent text-stone-300 hover:text-stone-500'}`}
                   >
                     <Heart size={24} fill={favorites.includes(currentAdhkar.id) ? "currentColor" : "none"} />
                   </button>
                </div>

                {/* Arabic Content */}
                <div className="flex-1 flex items-center justify-center py-2">
                  <div className="w-full text-right space-y-4" dir="rtl">
                    <p className="font-arabic text-3xl md:text-4xl leading-[2.4] text-stone-800 drop-shadow-sm select-text">
                      {currentAdhkar.arabic}
                    </p>
                  </div>
                </div>

                {/* Translation & Virtue */}
                <div className="space-y-4 mt-6 z-10">
                  <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-100">
                     <p className="text-stone-600 text-sm italic mb-2 opacity-80">{currentAdhkar.transliteration}</p>
                     <p className="text-stone-800 font-medium leading-relaxed">"{currentAdhkar.translation}"</p>
                  </div>
                  
                  {currentAdhkar.virtue && (
                    <div className="flex gap-2 items-start text-xs text-stone-500 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                       <Star size={14} className="text-emerald-500 mt-0.5 shrink-0" fill="currentColor" />
                       <span>{currentAdhkar.virtue}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-bold text-stone-300 uppercase tracking-widest px-2">
                     <span>{currentAdhkar.reference}</span>
                     <span>{queueIndex + 1} / {queue.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation & Counter Bar */}
            <div className="bg-white rounded-3xl p-3 shadow-lg border border-stone-100 flex items-center justify-between gap-3">
              <button 
                onClick={handlePrev}
                className="p-4 rounded-2xl text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>

              <div className="flex-1 flex justify-center -mt-12 relative z-20">
                 <div className="bg-white p-2 rounded-full shadow-2xl shadow-emerald-200/50">
                    <TasbihCounter 
                      target={currentAdhkar?.count_target || 1} 
                      current={counter}
                      onIncrement={() => {
                         if (counter < (currentAdhkar?.count_target || 1)) {
                            const newValue = counter + 1;
                            setCounter(newValue);
                            if (newValue === (currentAdhkar?.count_target || 1)) {
                               handleComplete();
                            }
                            if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
                         }
                      }}
                    />
                 </div>
              </div>

              <button 
                onClick={handleNext}
                className="p-4 rounded-2xl text-stone-800 bg-stone-100 hover:bg-stone-200 transition-colors flex flex-col items-center justify-center gap-1"
              >
                <ArrowRight size={24} />
              </button>
            </div>

          </main>
        )}
      </div>
    </div>
  );
}
