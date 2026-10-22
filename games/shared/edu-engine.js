/**
 * EduArcade Unified Educational Engine (v2.6)
 * Upravlja:
 * 1. Načinima rada: 'casual' (Ležerno), 'competitive' (Natjecanje + Kviz), 'school' (Škole / Fakulteti - vlastita pitanja profesora)
 * 2. Bogatom hrvatskom bazom pitanja po predmetima + dinamičkim generatorom matematike
 * 3. Kreiranjem i dijeljenjem profesorskih kvizova putem koda ili URL linka
 * 4. Univerzalnim Stitch Kviz Modalom za sve 4 igre (Pac-Man, Snake, Tablić, Pasijans)
 * 5. Ljestvicom (Leaderboard) i EduXP bodovanjem
 */

(function (global) {
    const STORAGE_KEY = 'eduarcade-storage';

    const SUBJECTS = {
        all: { id: 'all', label: 'Sve teme (Miks)', icon: '🎯', color: '#4ADE80' },
        math: { id: 'math', label: 'Matematika', icon: '🔢', color: '#22D3EE' },
        history: { id: 'history', label: 'Povijest', icon: '📜', color: '#EF4444' },
        geo: { id: 'geo', label: 'Geografija', icon: '🌍', color: '#F59E0B' },
        science: { id: 'science', label: 'Priroda i znanost', icon: '🔬', color: '#10B981' },
        art: { id: 'art', label: 'Umjetnost i kultura', icon: '🎨', color: '#C084FC' },
        pubquiz: { id: 'pubquiz', label: 'Pub Kviz & Nostalgija (90-e)', icon: '🕹️', color: '#F43F5E' }
    };

    // Bogata baza pitanja na hrvatskom jeziku
    const QUESTION_BANK = {
        history: [
            { q: "Koje je godine započeo Drugi svjetski rat?", a: "1939.", options: ["1939.", "1914.", "1941.", "1945."] },
            { q: "Koje je godine pao Berlinski zid?", a: "1989.", options: ["1989.", "1991.", "1985.", "1979."] },
            { q: "Tko je otkrio Ameriku 1492. godine?", a: "Kristofor Kolumbo", options: ["Kristofor Kolumbo", "Vasco da Gama", "Ferdinand Magellan", "Amerigo Vespucci"] },
            { q: "Koje je godine započeo Prvi svjetski rat?", a: "1914.", options: ["1914.", "1918.", "1905.", "1939."] },
            { q: "Koje je godine izbila Francuska revolucija?", a: "1789.", options: ["1789.", "1848.", "1776.", "1815."] },
            { q: "Koje je godine palo Zapadno Rimsko Carstvo?", a: "476.", options: ["476.", "313.", "800.", "1453."] },
            { q: "Koji je hrvatski kralj okrunjen 925. godine?", a: "Kralj Tomislav", options: ["Kralj Tomislav", "Petar Krešimir IV.", "Dmitar Zvonimir", "Knez Branimir"] },
            { q: "Kako se zvao brod koji je potonuo 1912. na svom prvom putovanju?", a: "Titanic", options: ["Titanic", "Lusitania", "Britannic", " Carpathia"] },
            { q: "Koje je godine čovjek prvi put sletio na Mjesec (Apollo 11)?", a: "1969.", options: ["1969.", "1961.", "1972.", "1957."] },
            { q: "Tko je bio vođa seljačke bune 1573. godine u Hrvatskoj?", a: "Matija Gubec", options: ["Matija Gubec", "Josip Jelačić", "Nikola Šubić Zrinski", "Petar Zrinski"] },
            { q: "Koje se pismo koristilo u najstarijim hrvatskim spomenicima poput Bašćanske ploče?", a: "Glagoljica", options: ["Glagoljica", "Latinica", "Ćirilica", "Hijeroglifi"] },
            { q: "U kojem je gradu Nikola Šubić Zrinski junački branio utvrdu 1566. godine?", a: "Siget", options: ["Siget", "Klis", "Knin", "Vukovar"] },
            { q: "Tko je izumio tiskarski stroj u 15. stoljeću?", a: "Johannes Gutenberg", options: ["Johannes Gutenberg", "Leonardo da Vinci", "Galileo Galilei", "Martin Luther"] },
            { q: "Koji je hrvatski ban ukinuo kmetstvo 1848. godine?", a: "Josip Jelačić", options: ["Josip Jelačić", "Ivan Mažuranić", "Ljudevit Gaj", "Stjepan Radić"] }
        ],
        geo: [
            { q: "Koji je glavni grad Hrvatske?", a: "Zagreb", options: ["Zagreb", "Split", "Varaždin", "Rijeka"] },
            { q: "Koja je najduža rijeka koja protječe kroz Hrvatsku?", a: "Sava", options: ["Sava", "Drava", "Dunav", "Kupa"] },
            { q: "Koji je najviši vrh Hrvatske (1831 m)?", a: "Dinara (Sinjal)", options: ["Dinara (Sinjal)", "Vaganski vrh", "Sveti Jure", "Sljeme"] },
            { q: "Koji je glavni grad Australije?", a: "Canberra", options: ["Canberra", "Sydney", "Melbourne", "Perth"] },
            { q: "Koji je glavni grad Kanade?", a: "Ottawa", options: ["Ottawa", "Toronto", "Vancouver", "Montreal"] },
            { q: "Koji je glavni grad Brazila?", a: "Brasília", options: ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"] },
            { q: "Koja je najduža rijeka na svijetu?", a: "Nil", options: ["Nil", "Dunav", "Volga", "Mississippi"] },
            { q: "Koji je najveći ocean na Zemlji?", a: "Tihi ocean", options: ["Tihi ocean", "Atlantski ocean", "Indijski ocean", "Arktički ocean"] },
            { q: "Koliko nacionalnih parkova ima Republika Hrvatska?", a: "8", options: ["8", "6", "10", "12"] },
            { q: "Koji se hrvatski nacionalni park sastoji od 16 kaskadnih jezera?", a: "Plitvička jezera", options: ["Plitvička jezera", "Krka", "Mljet", "Kornati"] },
            { q: "U kojoj se državi nalazi planina Fuji?", a: "Japan", options: ["Japan", "Kina", "Južna Koreja", "Tajland"] },
            { q: "Koji kontinent ima najviše država?", a: "Afrika", options: ["Afrika", "Azija", "Europa", "Južna Amerika"] },
            { q: "Koji je glavni grad Španjolske?", a: "Madrid", options: ["Madrid", "Barcelona", "Sevilla", "Valencia"] },
            { q: "Kroz koji europski glavni grad protječe rijeka Temza?", a: "London", options: ["London", "Pariz", "Rim", "Berlin"] }
        ],
        science: [
            { q: "Koja je kemijska oznaka za vodu?", a: "H2O", options: ["H2O", "CO2", "O2", "NaCl"] },
            { q: "Koji je planet najbliži Suncu?", a: "Merkur", options: ["Merkur", "Venera", "Mars", "Zemlja"] },
            { q: "Koji plin biljke proizvode procesom fotosinteze?", a: "Kisik", options: ["Kisik", "Ugljikov dioksid", "Dušik", "Vodik"] },
            { q: "Koji je naš poznati izumitelj zaslužan za izmjeničnu struju?", a: "Nikola Tesla", options: ["Nikola Tesla", "Slavoljub Penkala", "Faust Vrančić", "Ruđer Bošković"] },
            { q: "Na kojoj temperaturi voda vrije pri normalnom tlaku?", a: "100 °C", options: ["100 °C", "90 °C", "0 °C", "120 °C"] },
            { q: "Koji je najveći organ ljudskog tijela?", a: "Koža", options: ["Koža", "Jetra", "Pluća", "Srce"] },
            { q: "Koliko kostiju ima odrasli čovjek?", a: "206", options: ["206", "150", "300", "256"] },
            { q: "Koji je hrvatski izumitelj konstruirao prvu mehaničku olovku?", a: "Slavoljub Penkala", options: ["Slavoljub Penkala", "Ivan Vučetić", "Nikola Tesla", "Franjo Hanaman"] },
            { q: "Koji je najveći planet u našem Sunčevom sustavu?", a: "Jupiter", options: ["Jupiter", "Saturn", "Neptun", "Zemlja"] },
            { q: "Kako se zove sila koja privlači tijela prema središtu Zemlje?", a: "Gravitacija", options: ["Gravitacija", "Trenje", "Magnetizam", "Inercija"] }
        ],
        art: [
            { q: "Tko je naslikao čuvenu 'Mona Lisu'?", a: "Leonardo da Vinci", options: ["Leonardo da Vinci", "Vincent van Gogh", "Michelangelo", "Pablo Picasso"] },
            { q: "Tko je naslikao djelo 'Zvjezdana noć'?", a: "Vincent van Gogh", options: ["Vincent van Gogh", "Claude Monet", "Salvador Dalí", "Rembrandt"] },
            { q: "U kojem se gradu nalazi muzej Louvre?", a: "Pariz", options: ["Pariz", "Rim", "London", "Madrid"] },
            { q: "Tko je autor renesansne skulpture 'David'?", a: "Michelangelo", options: ["Michelangelo", "Donatello", "Leonardo da Vinci", "Auguste Rodin"] },
            { q: "Koja je hrvatska književnica napisala 'Priče iz davnine'?", a: "Ivana Brlić-Mažuranić", options: ["Ivana Brlić-Mažuranić", "Marija Jurić Zagorka", "Vesna Parun", "Dora Pejačević"] },
            { q: "Tko je skladao 'Odu radosti' (9. simfoniju)?", a: "Ludwig van Beethoven", options: ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Vatroslav Lisinski"] },
            { q: "Tko je autor romana 'Vlak u snijegu' i 'Družba Pere Kvržice'?", a: "Mato Lovrak", options: ["Mato Lovrak", "Ivan Kušan", "Grigor Vitez", "August Šenoa"] },
            { q: "Koji je slavni hrvatski kipar izradio 'Zdenac života' ispred HNK u Zagrebu?", a: "Ivan Meštrović", options: ["Ivan Meštrović", "Antun Augustinčić", "Robert Frangeš-Mihanović", "Vlaho Bukovac"] }
        ],
        pubquiz: [
            { q: "Koje je godine hrvatska nogometna reprezentacija osvojila broncu u Francuskoj?", a: "1998.", options: ["1998.", "1996.", "2002.", "1994."] },
            { q: "Na kojoj se popularnoj Nokiji krajem 90-ih masovno igrala Zmija (Snake)?", a: "Nokia 3310 / 3210", options: ["Nokia 3310 / 3210", "Motorola Razr", "Sony Ericsson T68", "Siemens C25"] },
            { q: "Kako se zvao popularni virtualni kućni ljubimac na privjesku iz 1990-ih?", a: "Tamagotchi", options: ["Tamagotchi", "Furby", "Game Boy", "Digimon"] },
            { q: "Koji je hrvatski tenisač osvojio Wimbledon 2001. godine s pozivnicom?", a: "Goran Ivanišević", options: ["Goran Ivanišević", "Ivan Ljubičić", "Mario Ančić", "Marin Čilić"] },
            { q: "Koji je operacijski sustav izašao 1995. i uveo legendarni gumb 'Start'?", a: "Windows 95", options: ["Windows 95", "MS-DOS 6.22", "Windows XP", "Windows 3.1"] },
            { q: "Kako se zove crveni duh u originalnom Pac-Manu?", a: "Blinky", options: ["Blinky", "Pinky", "Inky", "Clyde"] }
        ]
    };

    // Unaprijed pripremljeni školski predlošci kvizova (za brzi test u modu Škole)
    const PRESET_SCHOOL_PACKS = {
        "OS-5B-GEO": {
            code: "OS-5B-GEO",
            school: "OŠ EduArcade",
            grade: "5. razred",
            subject: "Geografija — Planeti i Kontinenti",
            teacher: "Prof. Horvat",
            questions: [
                { q: "Koji je najveći kontinent na Zemlji površinom?", a: "Azija", options: ["Azija", "Afrika", "Sjeverna Amerika", "Europa"] },
                { q: "Kako se zove zamišljena crta koja dijeli Zemlju na sjevernu i južnu polutku?", a: "Ekvator", options: ["Ekvator", "Početni meridijan", "Obratnica", "Polarni krug"] },
                { q: "Koliko kontinenata postoji na Zemlji?", a: "7", options: ["7", "5", "6", "8"] },
                { q: "Koji ocean razdvaja Europu i Sjevernu Ameriku?", a: "Atlantski ocean", options: ["Atlantski ocean", "Tihi ocean", "Indijski ocean", "Južni ocean"] }
            ]
        },
        "OS-6A-POV": {
            code: "OS-6A-POV",
            school: "OŠ EduArcade",
            grade: "6. razred",
            subject: "Povijest — Hrvatska u srednjem vijeku",
            teacher: "Prof. Kovačić",
            questions: [
                { q: "Na kojem se otoku nalazi Bašćanska ploča iz oko 1100. godine?", a: "Krk", options: ["Krk", "Cres", "Brač", "Hvar"] },
                { q: "Tko je bio prvi hrvatski kralj (925. g.)?", a: "Tomislav", options: ["Tomislav", "Zvonimir", "Krešimir IV.", "Trpimir"] },
                { q: "Kojim je pismom pisana Bašćanska ploča?", a: "Glagoljicom", options: ["Glagoljicom", "Latinicom", "Ćirilicom", "Grčkim alfabetom"] },
                { q: "S kojom je državom Hrvatska ušla u personalnu uniju 1102. godine?", a: "Ugarskom", options: ["Ugarskom", "Mletačkom Republikom", "Bizantom", "Austrijom"] }
            ]
        },
        "OS-7C-MAT": {
            code: "OS-7C-MAT",
            school: "OŠ EduArcade",
            grade: "7. razred",
            subject: "Matematika — Postoci i Jednadžbe",
            teacher: "Prof. Babić",
            questions: [
                { q: "Koliko iznosi 25% od broja 200?", a: "50", options: ["50", "25", "40", "75"] },
                { q: "Riješi jednadžbu: 3x + 5 = 20. Koliko je x?", a: "5", options: ["5", "4", "6", "15"] },
                { q: "Koliko iznosi 10% od 450?", a: "45", options: ["45", "4.5", "90", "50"] },
                { q: "Koliki je zbroj kutova u svakom trokutu?", a: "180°", options: ["180°", "360°", "90°", "270°"] }
            ]
        }
    };

    const DEFAULT_COMPETITORS = [
        { name: "Ana_K", xp: 4250, pacman: 3800, snake: 42, tablic: 65, pasijans: 1450 },
        { name: "Marko_99", xp: 3400, pacman: 2950, snake: 35, tablic: 52, pasijans: 1200 },
        { name: "Ivan_ZG", xp: 2650, pacman: 2100, snake: 28, tablic: 41, pasijans: 980 },
        { name: "Petra_OS", xp: 1900, pacman: 1400, snake: 21, tablic: 31, pasijans: 750 },
        { name: "Luka_ST", xp: 1200, pacman: 950, snake: 14, tablic: 21, pasijans: 500 }
    ];

    function getDefaultState() {
        return {
            username: '',
            mode: 'competitive', // 'casual' | 'competitive' | 'school'
            selectedSubject: 'all', // 'all' | 'math' | 'history' | 'geo' | 'science' | 'art' | 'pubquiz'
            activeSchoolCode: 'OS-5B-GEO',
            customSchoolPacks: {},
            savedGames: {},
            highScores: { pacman: 0, snake: 0, tablic: 0, pasijans: 0 },
            eduXP: 0,
            streak: 0,
            bestStreak: 0,
            subjectStats: {
                math: { correct: 0, total: 0 },
                history: { correct: 0, total: 0 },
                geo: { correct: 0, total: 0 },
                science: { correct: 0, total: 0 },
                art: { correct: 0, total: 0 },
                pubquiz: { correct: 0, total: 0 },
                school: { correct: 0, total: 0 }
            }
        };
    }

    function getState() {
        const def = getDefaultState();
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return def;
            const parsed = JSON.parse(raw);
            const s = (parsed && parsed.state) ? parsed.state : parsed;
            return {
                ...def,
                ...s,
                savedGames: { ...def.savedGames, ...(s.savedGames || {}) },
                highScores: { ...def.highScores, ...(s.highScores || {}) },
                customSchoolPacks: { ...def.customSchoolPacks, ...(s.customSchoolPacks || {}) },
                subjectStats: { ...def.subjectStats, ...(s.subjectStats || {}) }
            };
        } catch (e) {
            return def;
        }
    }

    function saveState(partial) {
        const current = getState();
        const updated = { ...current, ...partial };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: updated, version: 0 }));
        } catch (e) { }
        return updated;
    }

    function generateMathQuestion(difficulty = 2) {
        const ops = ['+', '-', '×', '÷'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a, b, ans, qText;

        if (op === '+') {
            a = Math.floor(Math.random() * (difficulty * 25)) + 8;
            b = Math.floor(Math.random() * (difficulty * 25)) + 6;
            ans = a + b;
            qText = `Koliko je ${a} + ${b}?`;
        } else if (op === '-') {
            a = Math.floor(Math.random() * (difficulty * 30)) + 20;
            b = Math.floor(Math.random() * (a - 5)) + 4;
            ans = a - b;
            qText = `Koliko je ${a} − ${b}?`;
        } else if (op === '×') {
            a = Math.floor(Math.random() * (difficulty * 4 + 5)) + 3;
            b = Math.floor(Math.random() * 9) + 3;
            ans = a * b;
            qText = `Koliko je ${a} × ${b}?`;
        } else {
            b = Math.floor(Math.random() * 9) + 2;
            ans = Math.floor(Math.random() * (difficulty * 4 + 5)) + 2;
            a = b * ans;
            qText = `Koliko je ${a} ÷ ${b}?`;
        }

        const opts = new Set([String(ans)]);
        while (opts.size < 4) {
            const offset = (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1);
            const wrong = ans + offset;
            if (wrong >= 0 && wrong !== ans) opts.add(String(wrong));
        }

        return {
            subject: 'math',
            subjectLabel: 'Matematika',
            q: qText,
            a: String(ans),
            options: Array.from(opts).sort(() => Math.random() - 0.5)
        };
    }

    function getAllSchoolPacks() {
        const st = getState();
        return { ...PRESET_SCHOOL_PACKS, ...(st.customSchoolPacks || {}) };
    }

    function getActiveSchoolPack() {
        const st = getState();
        const packs = getAllSchoolPacks();
        return packs[st.activeSchoolCode] || Object.values(packs)[0];
    }

    function getNextQuestion(preferredSubject = null, difficulty = 2) {
        const st = getState();

        // Ako smo u Školskom modu, vuci pitanja iz aktivnog paketa profesora!
        if (st.mode === 'school') {
            const pack = getActiveSchoolPack();
            if (pack && pack.questions && pack.questions.length > 0) {
                const item = pack.questions[Math.floor(Math.random() * pack.questions.length)];
                const shuffled = [...item.options].sort(() => Math.random() - 0.5);
                return {
                    subject: 'school',
                    subjectLabel: `${pack.grade} • ${pack.subject}`,
                    q: item.q,
                    a: item.a,
                    options: shuffled
                };
            }
        }

        // Odredi predmet
        let subj = preferredSubject || st.selectedSubject || 'all';
        if (subj === 'all') {
            const poolKeys = ['math', 'history', 'geo', 'science', 'art'];
            subj = poolKeys[Math.floor(Math.random() * poolKeys.length)];
        }

        if (subj === 'math') {
            return generateMathQuestion(difficulty);
        }

        const list = QUESTION_BANK[subj] || QUESTION_BANK.geo;
        const item = list[Math.floor(Math.random() * list.length)];
        const shuffled = [...item.options].sort(() => Math.random() - 0.5);
        return {
            subject: subj,
            subjectLabel: (SUBJECTS[subj] && SUBJECTS[subj].label) || 'Znanje',
            q: item.q,
            a: item.a,
            options: shuffled
        };
    }

    function recordAnswer(subjectKey, isCorrect, xpReward = 50, gameId = null, gameScore = null) {
        const st = getState();
        const key = st.mode === 'school' ? 'school' : (subjectKey || 'math');
        if (!st.subjectStats[key]) st.subjectStats[key] = { correct: 0, total: 0 };
        st.subjectStats[key].total += 1;

        let earnedXP = 0;
        if (isCorrect) {
            st.subjectStats[key].correct += 1;
            st.streak = (st.streak || 0) + 1;
            if (st.streak > (st.bestStreak || 0)) st.bestStreak = st.streak;
            const comboMultiplier = Math.min(3, 1 + Math.floor(st.streak / 3) * 0.5);
            earnedXP = Math.round(xpReward * comboMultiplier);
            st.eduXP = (st.eduXP || 0) + earnedXP;
        } else {
            st.streak = 0;
        }

        if (gameId && gameScore !== null) {
            const curHigh = st.highScores[gameId] || 0;
            if (gameScore > curHigh) st.highScores[gameId] = gameScore;
        }

        saveState(st);
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'edu_state_updated' }, '*');
            }
        } catch (e) { }

        return { earnedXP, streak: st.streak, totalXP: st.eduXP };
    }

    function addGameScore(gameId, scoreValue, bonusXP = 0) {
        const st = getState();
        const curHigh = st.highScores[gameId] || 0;
        if (scoreValue > curHigh) {
            st.highScores[gameId] = scoreValue;
        }
        if (bonusXP > 0 && st.mode !== 'casual') {
            st.eduXP = (st.eduXP || 0) + bonusXP;
        }
        saveState(st);
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'update_highscore', gameId, score: scoreValue }, '*');
            }
        } catch (e) { }
    }

    function getLeaderboard(category = 'xp') {
        const st = getState();
        const playerName = st.username ? `${st.username} (Ti)` : 'Ti (Gost)';
        const playerEntry = {
            name: playerName,
            isPlayer: true,
            xp: st.eduXP || 0,
            pacman: (st.highScores && st.highScores.pacman) || 0,
            snake: (st.highScores && st.highScores.snake) || 0,
            tablic: (st.highScores && st.highScores.tablic) || 0,
            pasijans: (st.highScores && st.highScores.pasijans) || 0
        };

        const all = [...DEFAULT_COMPETITORS.map(c => ({ ...c, isPlayer: false })), playerEntry];
        all.sort((a, b) => (b[category] || 0) - (a[category] || 0));
        return all.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    // Kreiranje i uvoz školskog paketa pitanja (kod za dijeljenje)
    function encodeSchoolPack(pack) {
        return 'EDU-' + btoa(encodeURIComponent(JSON.stringify(pack)));
    }

    function decodeAndSaveSchoolPack(codeOrJson) {
        const clean = String(codeOrJson || '').trim();
        const allPacks = getAllSchoolPacks();
        if (allPacks[clean.toUpperCase()]) {
            saveState({ mode: 'school', activeSchoolCode: clean.toUpperCase() });
            return allPacks[clean.toUpperCase()];
        }
        const rawB64 = clean.startsWith('EDU-') ? clean.slice(4) : clean;
        const decoded = JSON.parse(decodeURIComponent(atob(rawB64)));
        if (decoded && decoded.code && Array.isArray(decoded.questions)) {
            const st = getState();
            st.customSchoolPacks[decoded.code] = decoded;
            st.activeSchoolCode = decoded.code;
            st.mode = 'school';
            saveState(st);
            return decoded;
        }
        throw new Error('Neispravan kod kviza');
    }

    // Univerzalni Stitch Kviz Modal koji radi u svim igrama (Tablić, Pasijans, Pac-Man, Snake)
    let universalModalTimer = null;

    function ensureUniversalModalDOM() {
        let el = document.getElementById('edu-universal-quiz-modal');
        if (el) return el;

        el = document.createElement('div');
        el.id = 'edu-universal-quiz-modal';
        el.style.cssText = 'display:none; position:fixed; inset:0; z-index:9999; background:rgba(2,6,23,0.88); backdrop-filter:blur(12px); align-items:center; justify-content:center; padding:1rem; font-family:"Plus Jakarta Sans",sans-serif;';
        el.innerHTML = `
            <div style="width:100%; max-width:520px; background:#0F172A; border:2px solid rgba(74,222,128,0.4); border-radius:1.25rem; padding:1.5rem; box-shadow:0 0 50px rgba(2,6,23,0.95); color:#dae2fd;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; margin-bottom:0.75rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span id="edu-qm-badge" style="padding:0.25rem 0.65rem; border-radius:999px; background:rgba(34,211,238,0.15); color:#22D3EE; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em;">EDUKATIVNI KVIZ</span>
                        <span id="edu-qm-streak" style="padding:0.2rem 0.55rem; border-radius:999px; background:rgba(245,158,11,0.18); color:#F59E0B; font-size:11px; font-weight:800;">🔥 0 u nizu</span>
                    </div>
                    <span id="edu-qm-timer-txt" style="font-size:13px; font-weight:800; color:#4ADE80;">15s</span>
                </div>
                <div id="edu-qm-reason" style="font-size:12px; color:#bccbb9; margin-bottom:0.4rem; font-weight:600;">Odgovori točno za bonus bodove i napredak na ljestvici!</div>
                <div id="edu-qm-question" style="font-size:19px; font-weight:800; color:#ffffff; background:#131b2e; padding:1rem; border-radius:0.85rem; border:1px solid rgba(255,255,255,0.07); margin-bottom:0.85rem; line-height:1.35;">?</div>
                <div style="width:100%; height:6px; background:#060e20; border-radius:999px; overflow:hidden; margin-bottom:1rem;">
                    <div id="edu-qm-bar" style="width:100%; height:100%; background:linear-gradient(90deg, #22D3EE, #4ADE80); transition:width 0.1s linear;"></div>
                </div>
                <div id="edu-qm-options" style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem;"></div>
                <div id="edu-qm-feedback" style="display:none; margin-top:0.85rem; padding:0.65rem; border-radius:0.75rem; font-size:13px; font-weight:700; text-align:center;"></div>
            </div>
        `;
        document.body.appendChild(el);
        return el;
    }

    function askQuestion(config = {}) {
        const {
            reason = 'Točan odgovor donosi bonus bodove i skok na ljestvici!',
            xpReward = 75,
            timeLimit = 15,
            preferredSubject = null,
            gameId = null,
            currentGameScore = null,
            onCorrect = () => {},
            onWrong = () => {}
        } = config;

        const st = getState();
        // U ležernom modu nema kvizova - odmah izvrši akciju!
        if (st.mode === 'casual') {
            onCorrect({ earnedXP: 0, streak: 0, casual: true });
            return;
        }

        const modal = ensureUniversalModalDOM();
        const qObj = getNextQuestion(preferredSubject);

        document.getElementById('edu-qm-badge').textContent = qObj.subjectLabel;
        document.getElementById('edu-qm-streak').textContent = `🔥 ${st.streak || 0} u nizu`;
        document.getElementById('edu-qm-reason').textContent = reason;
        document.getElementById('edu-qm-question').textContent = qObj.q;

        const fb = document.getElementById('edu-qm-feedback');
        fb.style.display = 'none';

        const optsContainer = document.getElementById('edu-qm-options');
        optsContainer.innerHTML = '';

        let answered = false;
        let remaining = timeLimit;
        const bar = document.getElementById('edu-qm-bar');
        const timerTxt = document.getElementById('edu-qm-timer-txt');
        bar.style.width = '100%';
        timerTxt.textContent = `${remaining}s`;

        clearInterval(universalModalTimer);
        universalModalTimer = setInterval(() => {
            if (answered) return;
            remaining -= 0.1;
            const pct = Math.max(0, (remaining / timeLimit) * 100);
            bar.style.width = pct + '%';
            timerTxt.textContent = `${Math.ceil(Math.max(0, remaining))}s`;
            if (remaining <= 0) {
                finish(false);
            }
        }, 100);

        function finish(isCorrect, clickedBtn = null) {
            if (answered) return;
            answered = true;
            clearInterval(universalModalTimer);

            const res = recordAnswer(qObj.subject, isCorrect, xpReward, gameId, currentGameScore);

            if (clickedBtn) {
                clickedBtn.style.borderColor = isCorrect ? '#4ADE80' : '#EF4444';
                clickedBtn.style.background = isCorrect ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';
            }

            fb.style.display = 'block';
            if (isCorrect) {
                fb.style.background = 'rgba(34,197,94,0.18)';
                fb.style.color = '#4ADE80';
                fb.textContent = `✓ Točno! +${res.earnedXP} EduXP (Niz: ${res.streak}🔥)`;
            } else {
                fb.style.background = 'rgba(239,68,68,0.18)';
                fb.style.color = '#ffb4ab';
                fb.textContent = `✗ Netočan odgovor! Točno je: ${qObj.a}`;
            }

            setTimeout(() => {
                modal.style.display = 'none';
                if (isCorrect) onCorrect(res);
                else onWrong(res);
            }, 950);
        }

        const letters = ['A', 'B', 'C', 'D'];
        qObj.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'display:flex; align-items:center; gap:0.6rem; padding:0.75rem 0.85rem; border-radius:0.75rem; background:#171f33; border:1px solid rgba(255,255,255,0.1); color:#dae2fd; font-weight:700; font-size:14px; cursor:pointer; text-align:left; transition:all 0.15s;';
            btn.innerHTML = `<span style="width:24px; height:24px; border-radius:6px; background:#222a3d; color:#22D3EE; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0;">${letters[i] || '•'}</span><span>${opt}</span>`;
            btn.onmouseenter = () => { if (!answered) btn.style.borderColor = '#22D3EE'; };
            btn.onmouseleave = () => { if (!answered) btn.style.borderColor = 'rgba(255,255,255,0.1)'; };
            btn.onclick = () => {
                const ok = String(opt).trim().toLowerCase() === String(qObj.a).trim().toLowerCase();
                finish(ok, btn);
            };
            optsContainer.appendChild(btn);
        });

        modal.style.display = 'flex';
    }

    // Pomoćna funkcija za renderiranje mini Top 3 ljestvice u desnom stupcu svake igre
    function renderMiniLeaderboard(containerId, gameId, currentScore = 0) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const st = getState();
        if (gameId && currentScore > (st.highScores[gameId] || 0)) {
            st.highScores[gameId] = currentScore;
            saveState(st);
        }
        const board = getLeaderboard(gameId || 'xp');
        const top3 = board.slice(0, 3);
        const playerRow = board.find(r => r.isPlayer);
        if (playerRow && playerRow.rank > 3) {
            top3[2] = playerRow;
        }

        const badgeColors = [
            'bg-arcade-amber text-on-primary font-extrabold',
            'bg-slate-300 text-slate-950 font-extrabold',
            'bg-amber-700 text-white font-extrabold'
        ];

        container.innerHTML = top3.map((row, idx) => {
            const val = row[gameId || 'xp'] || 0;
            const highlight = row.isPlayer
                ? 'bg-primary-container/15 border border-primary/40'
                : 'bg-surface-container-low border border-white/5';
            return `
                <div class="flex items-center justify-between p-2.5 rounded-xl ${highlight}">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <span class="w-6 h-6 rounded-md ${badgeColors[idx] || 'bg-surface-container text-on-surface'} flex items-center justify-center text-xs shrink-0">${row.rank}</span>
                        <span class="text-xs font-bold ${row.isPlayer ? 'text-primary' : 'text-on-surface'} truncate">${row.name}</span>
                    </div>
                    <span class="text-xs font-extrabold ${row.isPlayer ? 'text-primary' : 'text-arcade-cyan'} font-mono">${Number(val).toLocaleString('hr-HR')}</span>
                </div>
            `;
        }).join('');
    }

    global.EduEngine = {
        SUBJECTS,
        PRESET_SCHOOL_PACKS,
        getState,
        saveState,
        getNextQuestion,
        recordAnswer,
        addGameScore,
        getLeaderboard,
        getAllSchoolPacks,
        getActiveSchoolPack,
        encodeSchoolPack,
        decodeAndSaveSchoolPack,
        askQuestion,
        renderMiniLeaderboard
    };
})(window);
