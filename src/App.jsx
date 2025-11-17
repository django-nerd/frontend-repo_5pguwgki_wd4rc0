import { useEffect, useMemo, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function StatCard({ label, value, sublabel }) {
  return (
    <div className="p-4 rounded-xl bg-white shadow border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  )
}

function MealItemRow({ i, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-6">
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Food name (e.g., Oats)"
          value={i.name}
          onChange={e => i.set({ ...i.state, name: e.target.value })}
        />
      </div>
      <div className="col-span-3">
        <input
          type="number"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Calories"
          value={i.state.calories}
          onChange={e => i.set({ ...i.state, calories: Number(e.target.value) })}
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Qty"
          value={i.state.quantity}
          onChange={e => i.set({ ...i.state, quantity: Number(e.target.value) })}
        />
      </div>
      <div className="col-span-1 text-right">
        <button onClick={onRemove} className="text-red-600 hover:text-red-700 text-sm">✕</button>
      </div>
    </div>
  )
}

function useMealItems() {
  const [items, setItems] = useState([{ name: '', calories: 0, quantity: 1 }])
  const itemControllers = items.map((it, idx) => ({
    key: idx,
    state: it,
    set: (next) => setItems(prev => prev.map((p, i) => (i === idx ? next : p))),
  }))
  const add = () => setItems(prev => [...prev, { name: '', calories: 0, quantity: 1 }])
  const remove = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))
  const total = useMemo(() => items.reduce((sum, it) => sum + (Number(it.calories) || 0) * (Number(it.quantity) || 1), 0), [items])
  return { items, itemControllers, add, remove, total, setItems }
}

function DietForm({ onPlan }) {
  const [form, setForm] = useState({
    age: 28, sex: 'male', height_cm: 175, weight_kg: 70, activity_level: 'moderate', goal: 'maintain'
  })
  const submit = async (e) => {
    e.preventDefault()
    const res = await fetch(`${BACKEND}/api/diet/plan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    onPlan(data)
  }
  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3">
      <input className="border rounded px-3 py-2" type="number" value={form.age} onChange={e=>setForm({...form, age:Number(e.target.value)})} placeholder="Age"/>
      <select className="border rounded px-3 py-2" value={form.sex} onChange={e=>setForm({...form, sex:e.target.value})}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input className="border rounded px-3 py-2" type="number" value={form.height_cm} onChange={e=>setForm({...form, height_cm:Number(e.target.value)})} placeholder="Height (cm)"/>
      <input className="border rounded px-3 py-2" type="number" value={form.weight_kg} onChange={e=>setForm({...form, weight_kg:Number(e.target.value)})} placeholder="Weight (kg)"/>
      <select className="border rounded px-3 py-2 col-span-2" value={form.activity_level} onChange={e=>setForm({...form, activity_level:e.target.value})}>
        <option value="sedentary">Sedentary</option>
        <option value="light">Light</option>
        <option value="moderate">Moderate</option>
        <option value="active">Active</option>
        <option value="very_active">Very Active</option>
      </select>
      <select className="border rounded px-3 py-2 col-span-2" value={form.goal} onChange={e=>setForm({...form, goal:e.target.value})}>
        <option value="lose">Lose</option>
        <option value="maintain">Maintain</option>
        <option value="gain">Gain</option>
      </select>
      <button className="col-span-2 bg-blue-600 text-white rounded py-2">Get Diet Plan</button>
    </form>
  )
}

function ExerciseForm() {
  const [query, setQuery] = useState('squat')
  const [guide, setGuide] = useState(null)
  const fetchGuide = async () => {
    const res = await fetch(`${BACKEND}/api/exercise/form`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exercise: query }) })
    if (res.ok) setGuide(await res.json()); else setGuide({ error: 'Not found' })
  }
  useEffect(() => { fetchGuide() }, [])
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2 flex-1" value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g., squat, push-up, deadlift"/>
        <button onClick={fetchGuide} className="bg-gray-800 text-white rounded px-3">Guide</button>
      </div>
      {guide && !guide.error && (
        <div className="bg-gray-50 border rounded p-3">
          <p className="font-semibold capitalize">{guide.name}</p>
          <p className="text-sm mt-2 font-medium">Cues</p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {guide.cues.map((c,i)=>(<li key={i}>{c}</li>))}
          </ul>
          <p className="text-sm mt-2 font-medium">Common mistakes</p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {guide.mistakes.map((c,i)=>(<li key={i}>{c}</li>))}
          </ul>
        </div>
      )}
      {guide && guide.error && <p className="text-red-600 text-sm">{guide.error}</p>}
    </div>
  )
}

function App() {
  const { items, itemControllers, add, remove, total, setItems } = useMealItems()
  const [userId] = useState('demo-user')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [summary, setSummary] = useState(null)
  const [diet, setDiet] = useState(null)

  const logToday = async () => {
    const payload = { user_id: userId, date, items: items.map(({name, calories, quantity})=>({ name, calories: Number(calories), quantity: Number(quantity)})) }
    const res = await fetch(`${BACKEND}/api/meal/log`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    await fetchSummary()
    return data
  }

  const fetchSummary = async () => {
    const res = await fetch(`${BACKEND}/api/meal/summary/${userId}/${date}`)
    const data = await res.json()
    setSummary(data)
  }

  useEffect(() => { fetchSummary() }, [date])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Fitness Coach</h1>
          <a href="/test" className="text-sm text-blue-700 hover:underline">Check backend</a>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <StatCard label="Today's Calories" value={summary ? Math.round(summary.total_calories) : '--'} sublabel={summary ? summary.date : ''} />
          <StatCard label="Target Calories" value={diet ? diet.target_calories : '--'} sublabel={diet ? 'From your plan' : 'Get a plan below'} />
          <StatCard label="Macros (P/C/F)" value={diet ? `${diet.protein_g}/${diet.carbs_g}/${diet.fat_g} g` : '--'} />
        </section>

        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Log your meals</h2>
            <input type="date" className="border rounded px-3 py-2 text-sm" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
          <div className="space-y-3">
            {itemControllers.map((ctrl, idx) => (
              <MealItemRow key={ctrl.key} i={ctrl} onRemove={() => remove(idx)} />
            ))}
            <div className="flex gap-3">
              <button onClick={add} className="px-3 py-2 rounded border">Add item</button>
              <div className="ml-auto text-sm text-gray-600">Subtotal: <span className="font-semibold text-gray-800">{Math.round(total)} kcal</span></div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setItems([{ name: '', calories: 0, quantity: 1 }])} className="px-3 py-2 rounded border">Clear</button>
            <button onClick={logToday} className="px-4 py-2 rounded bg-blue-600 text-white">Save for today</button>
            <button onClick={fetchSummary} className="px-4 py-2 rounded bg-gray-800 text-white">Refresh summary</button>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personalized diet plan</h2>
            <DietForm onPlan={setDiet} />
            {diet && (
              <div className="mt-4 p-4 rounded border bg-gray-50">
                <p className="font-medium">Your target: <span className="font-semibold">{diet.target_calories} kcal</span></p>
                <p className="text-sm text-gray-600 mt-1">Macros: {diet.protein_g}g protein, {diet.carbs_g}g carbs, {diet.fat_g}g fat</p>
                <ul className="list-disc pl-5 text-sm text-gray-700 mt-2 space-y-1">
                  {diet.tips.map((t,i)=>(<li key={i}>{t}</li>))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Exercise form guidance</h2>
            <ExerciseForm />
          </div>
        </section>

        <footer className="text-center text-xs text-gray-500">Built with ❤️ for healthy habits</footer>
      </div>
    </div>
  )
}

export default App
