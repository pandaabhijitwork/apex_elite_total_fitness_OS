import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  User, Dumbbell, Utensils, LayoutDashboard, ChevronRight, ChevronLeft,
  Flame, Zap, Activity, Apple, ShoppingCart, TrendingDown,
  AlertTriangle, RefreshCw, Download, Check, Coffee, Sun, Moon,
  Sunset, Shield, Plus, X, FlaskConical, Info, Star
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const FULL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const ACT_MULTS: Record<string, number> = { Sedentary:1.2, Light:1.375, Moderate:1.55, 'Very Active':1.725 };
const TAG_COLORS: Record<string, string> = {
  Push:'#f59e0b', Pull:'#3b82f6', Lower:'#a78bfa', Core:'#06b6d4',
  HIIT:'#f43f5e', Cardio:'#34d399', Accessory:'#fb923c', Rest:'rgba(255,255,255,0.2)'
};

const GYM: Record<string, { focus: string; tag: string; exercises: { n: string; s: string }[] }> = {
  Mon:{ focus:'Chest & Triceps', tag:'Push', exercises:[{n:'Barbell Bench Press',s:'4×8'},{n:'Incline DB Press',s:'3×10'},{n:'Cable Flyes',s:'3×12'},{n:'Tricep Pushdowns',s:'3×12'},{n:'Overhead Extension',s:'3×10'}] },
  Tue:{ focus:'Back & Biceps',   tag:'Pull', exercises:[{n:'Deadlift',s:'4×6'},{n:'Lat Pulldown',s:'4×8'},{n:'Seated Cable Row',s:'3×10'},{n:'Barbell Curl',s:'3×10'},{n:'Hammer Curls',s:'3×12'}] },
  Wed:{ focus:'Active Recovery', tag:'Cardio', exercises:[{n:'30 min Incline Walk',s:'1×30m'},{n:'Foam Rolling',s:'10 min'},{n:'Mobility Drills',s:'15 min'}] },
  Thu:{ focus:'Shoulders & Abs', tag:'Push', exercises:[{n:'Overhead Press',s:'4×8'},{n:'Lateral Raises',s:'4×15'},{n:'Face Pulls',s:'3×15'},{n:'Plank',s:'3×60s'},{n:'Cable Crunches',s:'3×15'}] },
  Fri:{ focus:'Legs',            tag:'Lower', exercises:[{n:'Barbell Squat',s:'4×8'},{n:'Romanian Deadlift',s:'3×10'},{n:'Leg Press',s:'3×12'},{n:'Leg Curl',s:'3×12'},{n:'Calf Raises',s:'4×20'}] },
  Sat:{ focus:'Arms & Core',     tag:'Accessory', exercises:[{n:'EZ Bar Curl',s:'3×12'},{n:'Skull Crushers',s:'3×10'},{n:'Dips',s:'3×12'},{n:'Ab Wheel',s:'3×10'},{n:'Hanging Leg Raises',s:'3×12'}] },
  Sun:{ focus:'Rest Day',        tag:'Rest', exercises:[{n:'Light Walk / Stretching',s:'Optional'},{n:'Breathwork',s:'10 min'}] },
};

const HOME: Record<string, { focus: string; tag: string; exercises: { n: string; s: string }[] }> = {
  Mon:{ focus:'Push Day',          tag:'Push',  exercises:[{n:'Push-ups',s:'4×15'},{n:'Pike Push-ups',s:'3×12'},{n:'Diamond Push-ups',s:'3×12'},{n:'Tricep Dips (Chair)',s:'3×15'}] },
  Tue:{ focus:'Pull Day',          tag:'Pull',  exercises:[{n:'Doorframe Rows',s:'4×12'},{n:'Band Curls',s:'3×15'},{n:'Superman Hold',s:'3×30s'},{n:'Band Pull-Aparts',s:'3×20'}] },
  Wed:{ focus:'Core & Mobility',   tag:'Core',  exercises:[{n:'Plank',s:'3×60s'},{n:'Mountain Climbers',s:'3×20'},{n:'Bicycle Crunches',s:'3×20'},{n:'Yoga Flow',s:'15 min'}] },
  Thu:{ focus:'Legs',              tag:'Lower', exercises:[{n:'Bodyweight Squats',s:'4×20'},{n:'Bulgarian Split Squats',s:'3×12'},{n:'Glute Bridge',s:'3×20'},{n:'Jump Squats',s:'3×10'}] },
  Fri:{ focus:'Full Body HIIT',    tag:'HIIT',  exercises:[{n:'Burpees',s:'4×10'},{n:'Jump Lunges',s:'3×12'},{n:'Push-up T-Rotation',s:'3×10'},{n:'High Knees',s:'3×30s'}] },
  Sat:{ focus:'Shoulders & Arms',  tag:'Push',  exercises:[{n:'DB Lateral Raises',s:'3×15'},{n:'DB Overhead Press',s:'4×12'},{n:'DB Curls',s:'3×12'},{n:'Tricep Kickbacks',s:'3×15'}] },
  Sun:{ focus:'Rest Day',          tag:'Rest',  exercises:[{n:'Light Walk',s:'Optional'},{n:'Breathwork',s:'10 min'}] },
};

interface Meal { m: string; items: string; cal: number; pro: number; carb: number; fat: number; }

const VEG: Meal[][] = [
  [
    {m:'Breakfast',    items:'Moong dal chilla, mint chutney, black coffee',      cal:360,pro:18,carb:48,fat:8},
    {m:'Mid-Morning',  items:'Apple & peanut butter',                              cal:220,pro:6, carb:28,fat:9},
    {m:'Lunch',        items:'Rajma chawal, salad, curd',                          cal:540,pro:20,carb:72,fat:10},
    {m:'Pre-Workout',  items:'Banana & handful of walnuts',                        cal:200,pro:4, carb:30,fat:8},
    {m:'Dinner',       items:'Paneer tikka, brown rice, cucumber raita',           cal:550,pro:30,carb:55,fat:14},
    {m:'Evening',      items:'Chamomile tea & mixed nuts',                         cal:140,pro:4, carb:6, fat:12},
  ],
  [
    {m:'Breakfast',    items:'Oatmeal with banana & almond butter, green tea',     cal:380,pro:14,carb:58,fat:10},
    {m:'Mid-Morning',  items:'Plant-based Greek yogurt with berries',              cal:180,pro:10,carb:22,fat:4},
    {m:'Lunch',        items:'Quinoa & black bean bowl, roasted veggies, tahini',  cal:520,pro:22,carb:65,fat:14},
    {m:'Pre-Workout',  items:'Whole wheat toast with hummus',                      cal:210,pro:8, carb:32,fat:6},
    {m:'Dinner',       items:'Tofu stir-fry with soba noodles',                   cal:480,pro:26,carb:50,fat:12},
    {m:'Evening',      items:'Golden milk (turmeric latte)',                       cal:130,pro:7, carb:12,fat:4},
  ],
];

const NV: Meal[][] = [
  [
    {m:'Breakfast',    items:'Scrambled eggs (3), spinach, whole wheat toast',     cal:420,pro:32,carb:30,fat:16},
    {m:'Mid-Morning',  items:'Greek yogurt with honey & almonds',                  cal:200,pro:15,carb:18,fat:6},
    {m:'Lunch',        items:'Grilled chicken breast, brown rice, broccoli',       cal:560,pro:48,carb:52,fat:10},
    {m:'Pre-Workout',  items:'Banana & whey shake',                                cal:220,pro:26,carb:30,fat:2},
    {m:'Dinner',       items:'Baked salmon, quinoa & asparagus',                   cal:520,pro:40,carb:38,fat:16},
    {m:'Evening',      items:'Cottage cheese & mixed nuts',                        cal:180,pro:14,carb:8, fat:10},
  ],
  [
    {m:'Breakfast',    items:'Omelette (3 eggs, turkey, veggies)',                 cal:380,pro:34,carb:10,fat:20},
    {m:'Mid-Morning',  items:'Protein shake with skim milk',                       cal:180,pro:28,carb:12,fat:2},
    {m:'Lunch',        items:'Tuna pasta salad with olive oil dressing',           cal:520,pro:38,carb:48,fat:14},
    {m:'Pre-Workout',  items:'Rice cakes & peanut butter',                         cal:210,pro:6, carb:32,fat:8},
    {m:'Dinner',       items:'Chicken curry (lean), roti & dal',                   cal:580,pro:42,carb:55,fat:12},
    {m:'Evening',      items:'Boiled eggs (2) & green tea',                        cal:150,pro:12,carb:2, fat:10},
  ],
];

const GROCERY: Record<string, string[]> = {
  '🥬 Produce': ['Spinach','Broccoli','Asparagus','Cucumber','Mixed berries','Banana (6)','Apple','Tomatoes','Onion','Garlic','Ginger','Lemon'],
  '🥩 Protein': ['Chicken breast (1.5 kg)','Salmon fillet (500 g)','Eggs (18)','Greek yogurt','Paneer (250 g)','Tuna cans (4)','Tofu (400 g)'],
  '🫙 Pantry':  ['Oatmeal','Brown rice','Quinoa','Whole wheat bread','Almonds','Walnuts','Peanut butter','Olive oil','Honey','Black beans','Green tea','Hummus'],
};

const LIM: Record<string, string[]> = {
  back:     ['Deadlift','Barbell Squat','Overhead Press','Romanian Deadlift'],
  knee:     ['Barbell Squat','Jump Squats','Jump Lunges','Leg Press','Bulgarian Split Squats'],
  shoulder: ['Overhead Press','DB Overhead Press','Pike Push-ups','Lateral Raises'],
};

const MEAL_ICONS: Record<string, React.ReactNode> = {
  Breakfast:    <Sun size={13} />,
  'Mid-Morning':<Coffee size={13} />,
  Lunch:        <Utensils size={13} />,
  'Pre-Workout':<Zap size={13} />,
  Dinner:       <Sunset size={13} />,
  Evening:      <Moon size={13} />,
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const G: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '16px 18px',
};

const INP: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: 'white',
  fontSize: 13,
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
};

// ─── Helper functions ─────────────────────────────────────────────────────────

function idealWeight(h: number, g: string): number {
  const hIn = (h - 152.4) / 2.54;
  return Math.max(40, +((g === 'Female' ? 45.5 : 50) + 2.3 * hIn).toFixed(1));
}

function n(v: string | number): number { return Number(v) || 0; }

// ─── Shared Components (module-level — never recreated on render) ─────────────

function MacroRing({ label, value, max, color, size = 84 }: {
  label: string; value: number; max: number; color: string; size?: number;
}) {
  const r = 32, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / Math.max(1, max));
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={7} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} style={{ transition:'stroke-dashoffset 0.9s ease' }} />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize={11} fontWeight={700}>{value}g</text>
      </svg>
      <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'0.04em' }}>{label}</span>
    </div>
  );
}

function CalBar({ target, suppCals, remaining }: { target: number; suppCals: number; remaining: number }) {
  const suppPct = Math.min(100, (suppCals / Math.max(1, target)) * 100);
  const remPct  = Math.min(100 - suppPct, (remaining / Math.max(1, target)) * 100);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.38)' }}>Daily Calorie Budget</span>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:700 }}>{target} kcal target</span>
      </div>
      <div style={{ height:10, borderRadius:999, background:'rgba(255,255,255,0.06)', overflow:'hidden', display:'flex' }}>
        <div style={{ width:`${suppPct}%`, background:'#f59e0b', transition:'width 0.9s ease' }} />
        <div style={{ width:`${remPct}%`,  background:'#bef264', transition:'width 0.9s ease' }} />
      </div>
      <div style={{ display:'flex', gap:16, marginTop:6 }}>
        <span style={{ fontSize:11, color:'#f59e0b', display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:'#f59e0b', display:'inline-block' }} />
          Supps &amp; Fixed {suppCals} kcal
        </span>
        <span style={{ fontSize:11, color:'#bef264', display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:'#bef264', display:'inline-block' }} />
          Meal Budget {remaining} kcal
        </span>
      </div>
    </div>
  );
}

function FadeSlide({ children }: { children: React.ReactNode }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), 40);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      {children}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

interface Supp { name: string; cal: number; pro: number; }

function App() {

  const [step, setStep]           = useState(0);
  const [completed, setCompleted] = useState([false, false, false, false]);

  // Profile
  const [name, setName]                   = useState('');
  const [age, setAge]                     = useState('');
  const [gender, setGender]               = useState('Male');
  const [heightCm, setHeightCm]           = useState('');
  const [weightKg, setWeightKg]           = useState('');
  const [goalWeightKg, setGoalWeightKg]   = useState('');
  const [activityLevel, setActivityLevel] = useState('Moderate');
  const [fitnessGoal, setFitnessGoal]     = useState('Weight Loss');
  const [bodyGoal, setBodyGoal]           = useState('Athletic');

  // Training
  const [envMap, setEnvMap]         = useState<Record<string,string>>({ Mon:'Gym',Tue:'Gym',Wed:'Home',Thu:'Gym',Fri:'Gym',Sat:'Home',Sun:'Rest' });
  const [limitations, setLimitations] = useState('');

  // Nutrition
  const [dietType, setDietType]     = useState('Non-Veg');
  const [mixedDays, setMixedDays]   = useState<Record<string,string>>({ Mon:'Non-Veg',Tue:'Non-Veg',Wed:'Veg',Thu:'Non-Veg',Fri:'Non-Veg',Sat:'Veg',Sun:'Veg' });
  const [supps, setSupps]           = useState<Supp[]>([{ name:'Whey Protein', cal:120, pro:25 }]);
  const [fixed, setFixed]           = useState<Supp[]>([{ name:'Morning Oats', cal:300, pro:10 }]);
  const [nsName, setNsName]         = useState(''); const [nsCal, setNsCal] = useState(''); const [nsPro, setNsPro] = useState('');
  const [nfName, setNfName]         = useState(''); const [nfCal, setNfCal] = useState(''); const [nfPro, setNfPro] = useState('');
  const [mealVars, setMealVars]     = useState<number[]>(Array(7).fill(0));

  // ── Derived calculations ──
  const hCm = n(heightCm), wKg = n(weightKg);
  const ideal = hCm > 100 ? idealWeight(hCm, gender) : null;
  const bmi   = hCm > 0 ? +(wKg / (hCm / 100) ** 2).toFixed(1) : null;
  const bmiLabel = bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese') : '';

  // BMR — Mifflin-St Jeor
  const bmr = gender === 'Female'
    ? 10 * n(weightKg) + 6.25 * n(heightCm) - 5 * n(age) - 161
    : 10 * n(weightKg) + 6.25 * n(heightCm) - 5 * n(age) + 5;

  const tdee      = Math.round(bmr * (ACT_MULTS[activityLevel] || 1.55));
  const target    = fitnessGoal === 'Weight Loss' ? tdee - 400 : tdee + 350;
  const proteinG  = Math.round(n(weightKg) * (fitnessGoal === 'Weight Loss' ? 1.7 : 1.9));
  const carbG     = Math.round((target * 0.40) / 4);
  const fatG      = Math.round((target * 0.25) / 9);
  const suppCals  = supps.reduce((s, x) => s + n(x.cal), 0) + fixed.reduce((s, x) => s + n(x.cal), 0);
  const suppPro   = supps.reduce((s, x) => s + n(x.pro), 0) + fixed.reduce((s, x) => s + n(x.pro), 0);
  const remaining = Math.max(0, target - suppCals);
  const remPro    = Math.max(0, proteinG - suppPro);

  const getDiet    = (d: string) => dietType === 'Mixed' ? mixedDays[d] || 'Non-Veg' : dietType === 'Veg' ? 'Veg' : 'Non-Veg';
  const getWorkout = (d: string) => {
    const e = envMap[d];
    if (e === 'Rest') return { focus:'Rest Day', tag:'Rest', exercises:[{n:'Complete Rest / Gentle Walk',s:'Optional'},{n:'Breathwork',s:'10 min'}] };
    return e === 'Home' ? HOME[d] : GYM[d];
  };
  const getNote = (ex: string): string | null => {
    const l = limitations.toLowerCase();
    if (l.includes('back')     && LIM.back.some(k => ex.includes(k)))     return 'Use lighter load, neutral spine. Try trap-bar or DB variant.';
    if (l.includes('knee')     && LIM.knee.some(k => ex.includes(k)))     return 'Limit ROM. Prefer leg press (partial) or box squats.';
    if (l.includes('shoulder') && LIM.shoulder.some(k => ex.includes(k))) return 'Use cable raises. Limit overhead range. Rotator cuff warmup essential.';
    return null;
  };

  function projData() {
    const diff  = n(weightKg) - n(goalWeightKg);
    const wkly  = (400 * 7) / 7700;
    const weeks = Math.min(24, Math.max(1, Math.ceil(Math.abs(diff) / Math.max(0.01, wkly))));
    return Array.from({ length: weeks + 1 }, (_, i) => ({
      week: `W${i}`,
      weight: Math.max(n(goalWeightKg), +(n(weightKg) - i * (diff / weeks)).toFixed(1)),
    }));
  }

  const step0Valid = name.trim() && n(age) > 0 && n(heightCm) > 0 && n(weightKg) > 0 && n(goalWeightKg) > 0;

  function tryNext() {
    if (step === 0 && !step0Valid) return;
    const nc = [...completed]; nc[step] = true; setCompleted(nc);
    setStep(s => s + 1);
  }
  function tryGoTo(i: number) {
    if (i > 0 && !completed[i - 1] && i > step) return;
    setStep(i);
  }

  function addSupp()  { if (nsName) { setSupps(p => [...p, { name:nsName, cal:+nsCal||0, pro:+nsPro||0 }]); setNsName(''); setNsCal(''); setNsPro(''); } }
  function addFixed() { if (nfName) { setFixed(p => [...p, { name:nfName, cal:+nfCal||0, pro:+nfPro||0 }]); setNfName(''); setNfCal(''); setNfPro(''); } }

  const hov   = (e: React.MouseEvent<HTMLDivElement>): void => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'; };
  const unHov = (e: React.MouseEvent<HTMLDivElement>): void => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = 'none'; };

  const envCols: Record<string, string> = { Gym:'#3b82f6', Home:'#bef264', Rest:'rgba(255,255,255,0.3)' };

  const SH = ({ children, mt }: { children: React.ReactNode; mt?: number }) => (
    <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10, marginTop: mt ?? 20 }}>
      {children}
    </p>
  );
  const Lbl = ({ children }: { children: React.ReactNode }) => (
    <span style={{ fontSize:12, color:'rgba(255,255,255,0.42)', marginBottom:4, display:'block' }}>{children}</span>
  );

  const stepDefs = [
    { label:'Profile',   icon:<User size={14} /> },
    { label:'Training',  icon:<Dumbbell size={14} /> },
    { label:'Nutrition', icon:<Utensils size={14} /> },
    { label:'Dashboard', icon:<LayoutDashboard size={14} /> },
  ];

  // ── Step renderers (plain functions returning JSX — not React components) ──

  const renderStep0 = () => (
    <FadeSlide key="s0">
      <SH mt={4}>Bio-Metrics</SH>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={{ gridColumn:'1/-1' }}>
          <Lbl>Full Name</Lbl>
          <input style={INP} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Abhijit Panda" />
        </div>
        <div>
          <Lbl>Age</Lbl>
          <input style={INP} type="text" inputMode="decimal" value={age}
            onChange={e => { if (e.target.value === '' || /^\d*$/.test(e.target.value)) setAge(e.target.value); }}
            placeholder="25" />
        </div>
        <div>
          <Lbl>Gender</Lbl>
          <div style={{ display:'flex', gap:6 }}>
            {['Male','Female','Other'].map(g => (
              <button key={g} onClick={() => setGender(g)}
                style={{ flex:1, padding:'8px 0', borderRadius:8, border:`1px solid ${gender === g ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`, background: gender === g ? 'rgba(59,130,246,0.14)' : 'transparent', color: gender === g ? '#3b82f6' : 'rgba(255,255,255,0.4)', fontSize:12, cursor:'pointer', fontWeight: gender === g ? 700 : 400, fontFamily:'inherit' }}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>Height (cm)</Lbl>
          <input style={INP} type="text" inputMode="decimal" value={heightCm}
            onChange={e => { if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setHeightCm(e.target.value); }}
            placeholder="175" />
        </div>
        <div>
          <Lbl>Current Weight (kg)</Lbl>
          <input style={INP} type="text" inputMode="decimal" value={weightKg}
            onChange={e => { if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setWeightKg(e.target.value); }}
            placeholder="75" />
        </div>
      </div>

      {ideal !== null && n(weightKg) > 0 && (
        <div style={{ ...G, marginTop:12, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.22)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Star size={13} style={{ color:'#3b82f6' }} />
            <span style={{ fontSize:12, fontWeight:700, color:'#3b82f6' }}>Ideal Weight Suggestion</span>
          </div>
          <div style={{ display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
            <div>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', display:'block' }}>Devine Formula</span>
              <span style={{ fontSize:22, fontWeight:700, color:'#bef264' }}>{ideal} kg</span>
            </div>
            {bmi !== null && (
              <div>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', display:'block' }}>Your BMI</span>
                <span style={{ fontSize:22, fontWeight:700, color: bmi < 18.5 || bmi >= 30 ? '#f87171' : bmi < 25 ? '#bef264' : '#f59e0b' }}>
                  {bmi} <span style={{ fontSize:12, fontWeight:400, color:'rgba(255,255,255,0.38)' }}>{bmiLabel}</span>
                </span>
              </div>
            )}
            <button onClick={() => setGoalWeightKg(String(ideal))}
              style={{ padding:'7px 14px', borderRadius:8, border:'1px solid rgba(59,130,246,0.4)', background:'rgba(59,130,246,0.12)', color:'#3b82f6', fontSize:12, cursor:'pointer', fontWeight:700, marginLeft:'auto', fontFamily:'inherit' }}>
              Use as Goal →
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop:10 }}>
        <Lbl>Goal Weight (kg)</Lbl>
        <input style={INP} type="text" inputMode="decimal" value={goalWeightKg}
          onChange={e => { if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setGoalWeightKg(e.target.value); }}
          placeholder={ideal ? `Suggested: ${ideal} kg` : 'Enter goal weight'} />
      </div>

      <SH>Fitness Goal</SH>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[{v:'Weight Loss',icon:<TrendingDown size={20}/>,d:'Cut calories, preserve muscle'},{v:'Weight Gain',icon:<Activity size={20}/>,d:'Lean bulk, quality mass'}].map(({ v, icon, d }) => {
          const sel = fitnessGoal === v;
          return (
            <div key={v} onClick={() => setFitnessGoal(v)} onMouseEnter={hov} onMouseLeave={unHov}
              style={{ ...G, cursor:'pointer', border: sel ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)', boxShadow: sel ? '0 0 20px rgba(59,130,246,0.2)' : 'none', textAlign:'center', padding:'14px 10px', transition:'all 0.18s' }}>
              <div style={{ color: sel ? '#3b82f6' : 'rgba(255,255,255,0.32)', marginBottom:6, display:'flex', justifyContent:'center' }}>{icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color: sel ? '#3b82f6' : 'white', marginBottom:2 }}>{v}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)' }}>{d}</div>
            </div>
          );
        })}
      </div>

      <SH>Activity Level</SH>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {[{v:'Sedentary',d:'Desk job, no exercise'},{v:'Light',d:'1–3 days/wk'},{v:'Moderate',d:'3–5 days/wk'},{v:'Very Active',d:'6–7 days/wk'}].map(({ v, d }) => {
          const sel = activityLevel === v;
          return (
            <div key={v} onClick={() => setActivityLevel(v)} onMouseEnter={hov} onMouseLeave={unHov}
              style={{ ...G, cursor:'pointer', border: sel ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)', boxShadow: sel ? '0 0 20px rgba(59,130,246,0.2)' : 'none', textAlign:'center', padding:'14px 10px', transition:'all 0.18s' }}>
              <div style={{ color: sel ? '#3b82f6' : 'rgba(255,255,255,0.32)', marginBottom:6, display:'flex', justifyContent:'center' }}><Flame size={18} /></div>
              <div style={{ fontSize:13, fontWeight:700, color: sel ? '#3b82f6' : 'white', marginBottom:2 }}>{v}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)' }}>{d}</div>
            </div>
          );
        })}
      </div>

      <SH>Body Goal</SH>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {[{v:'Athletic',icon:<Activity size={18}/>,d:'Power & agility'},{v:'Muscular',icon:<Dumbbell size={18}/>,d:'Maximum mass'},{v:'Lean',icon:<Zap size={18}/>,d:'Toned & defined'}].map(({ v, icon, d }) => {
          const sel = bodyGoal === v;
          return (
            <div key={v} onClick={() => setBodyGoal(v)} onMouseEnter={hov} onMouseLeave={unHov}
              style={{ ...G, cursor:'pointer', border: sel ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)', boxShadow: sel ? '0 0 20px rgba(59,130,246,0.2)' : 'none', textAlign:'center', padding:'14px 10px', transition:'all 0.18s' }}>
              <div style={{ color: sel ? '#3b82f6' : 'rgba(255,255,255,0.32)', marginBottom:6, display:'flex', justifyContent:'center' }}>{icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color: sel ? '#3b82f6' : 'white', marginBottom:2 }}>{v}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)' }}>{d}</div>
            </div>
          );
        })}
      </div>

      {!step0Valid && (
        <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', fontSize:12, color:'#f87171', display:'flex', gap:8, alignItems:'center' }}>
          <Info size={13} style={{ flexShrink:0 }} /> Fill in Name, Age, Height, Weight and Goal Weight to continue.
        </div>
      )}
    </FadeSlide>
  );

  const renderStep1 = () => (
    <FadeSlide key="s1">
      <SH mt={4}>Environment Map — 7-Day Schedule</SH>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, marginBottom:16 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign:'center' }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:4 }}>{d}</div>
            {['Gym','Home','Rest'].map(e => (
              <button key={e} onClick={() => setEnvMap(p => ({ ...p, [d]:e }))}
                style={{ display:'block', width:'100%', padding:'5px 0', marginBottom:3, borderRadius:7, border:`1px solid ${envMap[d] === e ? envCols[e] : 'rgba(255,255,255,0.06)'}`, background: envMap[d] === e ? `${envCols[e]}22` : 'transparent', color: envMap[d] === e ? envCols[e] : 'rgba(255,255,255,0.2)', fontSize:9, cursor:'pointer', fontWeight: envMap[d] === e ? 700 : 400, transition:'all 0.15s', fontFamily:'inherit' }}>
                {e}
              </button>
            ))}
          </div>
        ))}
      </div>

      <SH>Physical Limitations</SH>
      <Lbl>Describe injuries to avoid (e.g. "back pain, knee issues")</Lbl>
      <input style={{ ...INP, marginBottom:16 }} placeholder="Leave blank if none" value={limitations} onChange={e => setLimitations(e.target.value)} />

      <SH>Calorie Summary</SH>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {[
          ['BMR',          `${Math.round(bmr)} kcal`, 'Mifflin-St Jeor'],
          ['TDEE',         `${tdee} kcal`,             'Total Daily Energy'],
          ['Daily Target', `${target} kcal`,           'Adjusted for goal'],
          ['Protein Goal', `${proteinG}g`,             `${fitnessGoal === 'Weight Loss' ? '1.7' : '1.9'}g × kg body weight`],
        ].map(([k, v, sub]) => (
          <div key={k} style={{ ...G, transition:'all 0.18s' }} onMouseEnter={hov} onMouseLeave={unHov}>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', display:'block' }}>{sub}</span>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.42)', display:'block', marginTop:2 }}>{k}</span>
            <span style={{ fontSize:22, fontWeight:700, color:'#bef264', display:'block', marginTop:2 }}>{v}</span>
          </div>
        ))}
      </div>
    </FadeSlide>
  );

  const renderStep2 = () => (
    <FadeSlide key="s2">
      <SH mt={4}>Diet Preference</SH>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[{v:'Veg',e:'🥦'},{v:'Non-Veg',e:'🍗'},{v:'Mixed',e:'🔀'}].map(({ v, e }) => (
          <button key={v} onClick={() => setDietType(v)}
            style={{ padding:'8px 20px', borderRadius:20, border:`1px solid ${dietType === v ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`, background: dietType === v ? 'rgba(59,130,246,0.14)' : 'transparent', color: dietType === v ? '#3b82f6' : 'rgba(255,255,255,0.4)', fontSize:13, cursor:'pointer', fontWeight: dietType === v ? 700 : 400, transition:'all 0.15s', fontFamily:'inherit' }}>
            {e} {v}
          </button>
        ))}
      </div>

      {dietType === 'Mixed' && (
        <div style={{ ...G, marginBottom:16 }}>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.42)', marginBottom:10 }}>Weekly Diet Calendar — tap to toggle</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6 }}>
            {DAYS.map(d => {
              const isV = mixedDays[d] === 'Veg';
              return (
                <div key={d} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', marginBottom:4 }}>{d}</div>
                  <button onClick={() => setMixedDays(p => ({ ...p, [d]: p[d] === 'Veg' ? 'Non-Veg' : 'Veg' }))}
                    style={{ width:'100%', padding:'6px 0', borderRadius:8, border:`1px solid ${isV ? '#bef264' : '#f87171'}`, background: isV ? 'rgba(190,242,100,0.1)' : 'rgba(248,113,113,0.1)', color: isV ? '#bef264' : '#f87171', fontSize:10, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>
                    {isV ? '🥦 V' : '🍗 NV'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SH>Supplements</SH>
      <div style={{ ...G, marginBottom:10 }}>
        {supps.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ flex:1, fontSize:12, color:'white' }}>{s.name}</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.32)' }}>{s.cal} kcal</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.32)' }}>{s.pro}g P</span>
            <button onClick={() => setSupps(p => p.filter((_, j) => j !== i))} style={{ border:'none', background:'none', color:'#f87171', cursor:'pointer', padding:2 }}><X size={13} /></button>
          </div>
        ))}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:6, marginTop:8 }}>
          <input style={INP} placeholder="Name"  value={nsName} onChange={e => setNsName(e.target.value)} />
          <input style={INP} placeholder="kcal"  inputMode="decimal" value={nsCal} onChange={e => { if (/^\d*$/.test(e.target.value)) setNsCal(e.target.value); }} />
          <input style={INP} placeholder="g pro" inputMode="decimal" value={nsPro} onChange={e => { if (/^\d*$/.test(e.target.value)) setNsPro(e.target.value); }} />
          <button onClick={addSupp} style={{ padding:'8px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'white', cursor:'pointer', fontFamily:'inherit' }}><Plus size={13} /></button>
        </div>
      </div>

      <SH>Fixed Daily Items</SH>
      <div style={{ ...G, marginBottom:12 }}>
        {fixed.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ flex:1, fontSize:12, color:'white' }}>{s.name}</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.32)' }}>{s.cal} kcal</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.32)' }}>{s.pro}g P</span>
            <button onClick={() => setFixed(p => p.filter((_, j) => j !== i))} style={{ border:'none', background:'none', color:'#f87171', cursor:'pointer', padding:2 }}><X size={13} /></button>
          </div>
        ))}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:6, marginTop:8 }}>
          <input style={INP} placeholder="Name"  value={nfName} onChange={e => setNfName(e.target.value)} />
          <input style={INP} placeholder="kcal"  inputMode="decimal" value={nfCal} onChange={e => { if (/^\d*$/.test(e.target.value)) setNfCal(e.target.value); }} />
          <input style={INP} placeholder="g pro" inputMode="decimal" value={nfPro} onChange={e => { if (/^\d*$/.test(e.target.value)) setNfPro(e.target.value); }} />
          <button onClick={addFixed} style={{ padding:'8px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'white', cursor:'pointer', fontFamily:'inherit' }}><Plus size={13} /></button>
        </div>
      </div>

      <div style={{ ...G, border:'1px solid rgba(59,130,246,0.25)', background:'rgba(59,130,246,0.05)' }}>
        <p style={{ fontSize:11, color:'#3b82f6', marginBottom:6, fontWeight:700 }}>Remaining Meal Budget</p>
        <div style={{ display:'flex', gap:20 }}>
          <span style={{ fontSize:22, fontWeight:700, color:'#bef264' }}>{remaining} kcal</span>
          <span style={{ fontSize:22, fontWeight:700, color:'#bef264' }}>{remPro}g protein</span>
        </div>
        <p style={{ fontSize:10, color:'rgba(255,255,255,0.28)', marginTop:4 }}>
          After deducting {suppCals} kcal &amp; {suppPro}g protein from supps/fixed items
        </p>
      </div>
    </FadeSlide>
  );

  const renderDashboard = () => {
    const proj = projData();
    return (
      <FadeSlide key="s3">
        {/* Hero */}
        <div style={{ ...G, marginBottom:14, background:'linear-gradient(135deg,rgba(59,130,246,0.14),rgba(190,242,100,0.06))', border:'1px solid rgba(59,130,246,0.22)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:18, fontWeight:700, color:'white', margin:0 }}>{name || 'Your'}<span style={{ color:'#3b82f6' }}>'s Apex Plan</span></p>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', margin:'3px 0 0' }}>{bodyGoal} · {fitnessGoal} · {activityLevel} · {dietType} Diet</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', margin:0 }}>Goal</p>
              <p style={{ fontSize:24, fontWeight:700, color:'#bef264', margin:0 }}>{goalWeightKg}<span style={{ fontSize:12, fontWeight:400 }}> kg</span></p>
            </div>
          </div>
        </div>

        {/* Macro rings + calorie bar */}
        <div style={{ ...G, marginBottom:14 }}>
          <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.28)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:14 }}>Macro Targets &amp; Calorie Budget</p>
          <div style={{ display:'flex', justifyContent:'space-around', marginBottom:18 }}>
            <MacroRing label="Protein" value={proteinG} max={300} color="#3b82f6" />
            <MacroRing label="Carbs"   value={carbG}    max={400} color="#bef264" />
            <MacroRing label="Fats"    value={fatG}     max={150} color="#f59e0b" />
          </div>
          <CalBar target={target} suppCals={suppCals} remaining={remaining} />
        </div>

        {/* Progress projector */}
        <div style={{ ...G, marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
            <TrendingDown size={13} style={{ color:'#bef264' }} />
            <span style={{ fontSize:12, fontWeight:700, color:'white' }}>Progress Projector</span>
            <span style={{ marginLeft:'auto', fontSize:10, color:'rgba(255,255,255,0.3)' }}>{proj.length - 1} weeks to goal</span>
          </div>
          <div style={{ height:160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={proj} margin={{ top:8, right:12, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fontSize:9, fill:'rgba(255,255,255,0.22)' }} interval={Math.ceil(proj.length / 6)} />
                <YAxis domain={['auto','auto']} tick={{ fontSize:9, fill:'rgba(255,255,255,0.22)' }} width={28} />
                <Tooltip contentStyle={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:11, color:'white' }} />
                <ReferenceLine y={n(goalWeightKg)} stroke="#bef264" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Full 7-day plan */}
        <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.28)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12 }}>Complete 7-Day Training &amp; Meal Plan</p>
        {DAYS.map((d, dayIdx) => {
          const diet    = getDiet(d);
          const mealSet = (diet === 'Veg' ? VEG : NV)[mealVars[dayIdx] % 2];
          const workout = getWorkout(d);
          const env     = envMap[d];
          const tc      = TAG_COLORS[workout.tag] || 'rgba(255,255,255,0.2)';
          const ec      = env === 'Gym' ? '#3b82f6' : env === 'Home' ? '#bef264' : 'rgba(255,255,255,0.3)';
          return (
            <div key={d} style={{ ...G, marginBottom:12, transition:'all 0.18s' }} onMouseEnter={hov} onMouseLeave={unHov}>
              {/* Day header */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:10, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(59,130,246,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:'#3b82f6' }}>{d}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'white' }}>{FULL_DAYS[dayIdx]}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{workout.focus} · {diet === 'Veg' ? '🥦 Veg' : '🍗 Non-Veg'} · {env}</div>
                </div>
                <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                  <span style={{ fontSize:9, padding:'2px 8px', borderRadius:20, background:`${tc}22`, color:tc, border:`1px solid ${tc}`, fontWeight:700 }}>{workout.tag}</span>
                  <span style={{ fontSize:9, padding:'2px 8px', borderRadius:20, background: env==='Gym'?'rgba(59,130,246,0.15)':env==='Home'?'rgba(190,242,100,0.1)':'rgba(255,255,255,0.05)', color:ec, border:`1px solid ${env==='Gym'?'rgba(59,130,246,0.3)':env==='Home'?'rgba(190,242,100,0.3)':'rgba(255,255,255,0.1)'}`, fontWeight:700 }}>{env}</span>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {/* Training */}
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.28)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Training</p>
                  {workout.exercises.map((ex, i) => {
                    const note = getNote(ex.n);
                    return (
                      <div key={i} style={{ marginBottom: note ? 10 : 5 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                          <span style={{ color:'rgba(255,255,255,0.8)' }}>{ex.n}</span>
                          <span style={{ color:'rgba(255,255,255,0.28)', fontSize:11 }}>{ex.s}</span>
                        </div>
                        {note && (
                          <div style={{ display:'flex', gap:4, marginTop:3, padding:'3px 7px', borderRadius:6, background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
                            <AlertTriangle size={10} style={{ color:'#f59e0b', flexShrink:0, marginTop:2 }} />
                            <span style={{ fontSize:10, color:'#f59e0b' }}>{note}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Meals */}
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.28)', letterSpacing:'0.08em', textTransform:'uppercase', margin:0 }}>Meals</p>
                    <button onClick={() => setMealVars(v => { const nv = [...v]; nv[dayIdx] = (nv[dayIdx] + 1) % 2; return nv; })}
                      style={{ display:'flex', alignItems:'center', gap:3, fontSize:9, padding:'3px 7px', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.38)', cursor:'pointer', fontFamily:'inherit' }}>
                      <RefreshCw size={9} /> Swap
                    </button>
                  </div>
                  {mealSet.map((m, i) => (
                    <div key={i} style={{ marginBottom:6, paddingBottom:6, borderBottom: i < mealSet.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:1 }}>
                        <span style={{ color:'#3b82f6' }}>{MEAL_ICONS[m.m] || <Utensils size={12} />}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.8)' }}>{m.m}</span>
                        <span style={{ marginLeft:'auto', fontSize:10, color:'rgba(255,255,255,0.25)' }}>{m.cal}k · {m.pro}g</span>
                      </div>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.38)' }}>{m.items}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Grocery */}
        <div style={{ ...G, marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
            <ShoppingCart size={13} style={{ color:'#bef264' }} />
            <span style={{ fontSize:12, fontWeight:700, color:'white' }}>7-Day Grocery List</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {Object.entries(GROCERY).map(([cat, items]) => (
              <div key={cat}>
                <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', marginBottom:8 }}>{cat}</p>
                {items.map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:5, marginBottom:5 }}>
                    <Check size={9} style={{ color:'#bef264', flexShrink:0, marginTop:3 }} />
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.52)' }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop:20, paddingTop:18, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          {[
            { bg:'rgba(59,130,246,0.05)',   border:'rgba(59,130,246,0.14)',   icon:<Star size={13} style={{color:'#3b82f6',flexShrink:0,marginTop:2}}/>,         title:"A Note from the Builder", tc:'#3b82f6',  text:'"Built this for fun to explore the intersection of AI, health, and code. I hope it helps you on your journey as much as building it helped mine."' },
            { bg:'rgba(245,158,11,0.04)',   border:'rgba(245,158,11,0.15)',   icon:<AlertTriangle size={13} style={{color:'#f59e0b',flexShrink:0,marginTop:2}}/>, title:'Medical Disclaimer',      tc:'#f59e0b',  text:'This is an AI experiment, not a doctor. Calculations are estimates. Please talk to a professional before changing your diet or lifting heavy things!' },
            { bg:'rgba(190,242,100,0.03)',  border:'rgba(190,242,100,0.1)',   icon:<Shield size={13} style={{color:'#bef264',flexShrink:0,marginTop:2}}/>,         title:'Terms of Fun',            tc:'#bef264',  text:"I built this for knowledge-sharing. By using it, you agree that I'm not responsible for any gym fails or sore muscles. Stay safe out there. 💪" },
          ].map(({ bg, border, icon, title, tc, text }) => (
            <div key={title} style={{ ...G, marginBottom:10, background:bg, border:`1px solid ${border}` }}>
              <div style={{ display:'flex', gap:9, alignItems:'flex-start' }}>
                {icon}
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:tc, margin:'0 0 3px' }}>{title}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.7, margin:0 }}>{text}</p>
                </div>
              </div>
            </div>
          ))}
          <div style={{ textAlign:'center', paddingBottom:8 }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', margin:0 }}>
              © 2026 Panda's Playbook AI &nbsp;|&nbsp; Crafted with ❤️ by <span style={{ color:'#3b82f6' }}>Abhijit Panda</span> &nbsp;|&nbsp; Powered by <span style={{ color:'#bef264' }}>Claude AI</span>
            </p>
          </div>
        </div>
      </FadeSlide>
    );
  };

  // ── Shell ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ background:'#09090b', fontFamily:'system-ui, -apple-system, sans-serif', color:'white' }}>
      <style>{`
  input::placeholder { color: rgba(255,255,255,0.18); }
  input:focus { outline: none; border-color: rgba(59,130,246,0.5) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  button { font-family: inherit; }

  @media print {
    .no-print { display: none !important; }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body, html {
      background: #09090b !important;
    }

    /* Boost all faint white text to fully visible */
    [style*="color: rgba(255,255,255,0.2)"],
    [style*="color:rgba(255,255,255,0.2)"],
    [style*="color: rgba(255,255,255,0.22)"],
    [style*="color:rgba(255,255,255,0.22)"],
    [style*="color: rgba(255,255,255,0.25)"],
    [style*="color:rgba(255,255,255,0.25)"],
    [style*="color: rgba(255,255,255,0.28)"],
    [style*="color:rgba(255,255,255,0.28)"],
    [style*="color: rgba(255,255,255,0.3)"],
    [style*="color:rgba(255,255,255,0.3)"],
    [style*="color: rgba(255,255,255,0.35)"],
    [style*="color:rgba(255,255,255,0.35)"],
    [style*="color: rgba(255,255,255,0.38)"],
    [style*="color:rgba(255,255,255,0.38)"],
    [style*="color: rgba(255,255,255,0.4)"],
    [style*="color:rgba(255,255,255,0.4)"],
    [style*="color: rgba(255,255,255,0.42)"],
    [style*="color:rgba(255,255,255,0.42)"],
    [style*="color: rgba(255,255,255,0.45)"],
    [style*="color:rgba(255,255,255,0.45)"],
    [style*="color: rgba(255,255,255,0.5)"],
    [style*="color:rgba(255,255,255,0.5)"],
    [style*="color: rgba(255,255,255,0.52)"],
    [style*="color:rgba(255,255,255,0.52)"],
    [style*="color: rgba(255,255,255,0.55)"],
    [style*="color:rgba(255,255,255,0.55)"],
    [style*="color: rgba(255,255,255,0.6)"],
    [style*="color:rgba(255,255,255,0.6)"],
    [style*="color: rgba(255,255,255,0.65)"],
    [style*="color:rgba(255,255,255,0.65)"],
    [style*="color: rgba(255,255,255,0.7)"],
    [style*="color:rgba(255,255,255,0.7)"],
    [style*="color: rgba(255,255,255,0.8)"],
    [style*="color:rgba(255,255,255,0.8)"],
    [style*="color: rgba(255,255,255,0.82)"],
    [style*="color:rgba(255,255,255,0.82)"],
    [style*="color: rgba(255,255,255,0.85)"],
    [style*="color:rgba(255,255,255,0.85)"] {
      color: #ffffff !important;
    }

    /* Keep accent colors vivid */
    [style*="color: #3b82f6"],
    [style*="color:#3b82f6"] { color: #3b82f6 !important; }

    [style*="color: #bef264"],
    [style*="color:#bef264"] { color: #bef264 !important; }

    [style*="color: #f59e0b"],
    [style*="color:#f59e0b"] { color: #f59e0b !important; }

    [style*="color: #f87171"],
    [style*="color:#f87171"] { color: #f87171 !important; }

    [style*="color: #34d399"],
    [style*="color:#34d399"] { color: #34d399 !important; }

    /* Keep card backgrounds */
    [style*="background: rgba(255,255,255,0.04)"],
    [style*="background:rgba(255,255,255,0.04)"] {
      background: rgba(255,255,255,0.08) !important;
    }
  }
`}</style>

      <div style={{ maxWidth:680, margin:'0 auto', padding:'0 16px 48px' }}>
        {/* Header */}
        <div style={{ padding:'18px 0 14px', borderBottom:'1px solid rgba(255,255,255,0.05)', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🐼</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)', letterSpacing:'0.04em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                Panda's Playbook AI · A personal lab project by Abhijit Panda · Powered by Claude
              </div>
              <div style={{ fontSize:18, fontWeight:700, color:'white', lineHeight:1.3 }}>
                Apex Elite <span style={{ color:'#bef264' }}>Total Fitness OS</span>
              </div>
            </div>
            <div style={{ marginLeft:'auto', background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'5px 10px', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              <FlaskConical size={11} style={{ color:'#bef264' }} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>Step {step + 1}/4</span>
            </div>
          </div>
        </div>

        {/* Step tabs */}
        <div className="no-print" style={{ display:'flex', gap:0, marginBottom:20, background:'rgba(255,255,255,0.02)', borderRadius:12, padding:4, border:'1px solid rgba(255,255,255,0.05)' }}>
          {stepDefs.map((s, i) => {
            const unlocked = i === 0 || completed[i - 1] || i <= step;
            return (
              <button key={i} onClick={() => unlocked && tryGoTo(i)}
                style={{ flex:1, padding:'8px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:3, borderRadius:8, background: step === i ? 'rgba(59,130,246,0.18)' : 'transparent', border:'none', cursor: unlocked ? 'pointer' : 'not-allowed', color: step === i ? '#3b82f6' : unlocked ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.15)', transition:'all 0.2s', fontWeight: step === i ? 700 : 400, opacity: unlocked ? 1 : 0.45, fontFamily:'inherit' }}>
                {s.icon}
                <span style={{ fontSize:10 }}>{s.label}</span>
                {completed[i] && i !== step && <span style={{ fontSize:8, color:'#bef264' }}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div>
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderDashboard()}
        </div>

        {/* Nav buttons */}
        <div className="no-print" style={{ display:'flex', justifyContent:'space-between', marginTop:24, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:10, border:'1px solid rgba(255,255,255,0.09)', background:'rgba(255,255,255,0.03)', cursor: step === 0 ? 'not-allowed' : 'pointer', color: step === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.6)', fontSize:13, fontFamily:'inherit' }}>
            <ChevronLeft size={14} /> Back
          </button>
          {step < 3 ? (
            <button onClick={tryNext}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 22px', borderRadius:10, border:`1px solid ${step === 0 && !step0Valid ? 'rgba(255,255,255,0.1)' : 'rgba(59,130,246,0.4)'}`, background: step === 0 && !step0Valid ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.14)', cursor: step === 0 && !step0Valid ? 'not-allowed' : 'pointer', color: step === 0 && !step0Valid ? 'rgba(255,255,255,0.2)' : '#3b82f6', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>
              {step === 2 ? 'Launch Dashboard →' : 'Next'}{step < 2 && <ChevronRight size={14} />}
            </button>
          ) : (
            <button onClick={() => window.print()}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 22px', borderRadius:10, border:'1px solid rgba(190,242,100,0.35)', background:'rgba(190,242,100,0.08)', cursor:'pointer', color:'#bef264', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>
              <Download size={13} /> Export Full PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;
