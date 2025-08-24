
import React, { useEffect, useMemo, useState } from "react"

// ---------- Utils ----------
const shuffle = (arr) => arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(([,v])=>v)
const pickN = (arr, n) => shuffle([...arr]).slice(0, Math.min(n, arr.length))
const uniq = (arr) => Array.from(new Set(arr))
const normalize = (s) => (s||"").toString().normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase().trim().replace(/\s+/g," ")

// ---------- Temas ----------
const TEMAS = {
  HUESOS: "Huesos del cráneo y cara",
  SUTURAS: "Suturas y puntos craneométricos",
  FORAMENES: "Forámenes y contenidos",
  FOSAS: "Fosas craneales y límites",
  ORBITA: "Órbita y conductos",
  FOSAS_NASALES: "Cavidad nasal y senos paranasales",
  ATM: "Articulación temporomandibular (ATM)",
}

// ---------- Banco de datos ----------
const huesosCraneales = ["Frontal","Parietal","Parietal","Temporal","Temporal","Occipital","Esfenoides","Etmoides"]
const huesosFaciales = ["Maxilar","Maxilar","Cigomático","Cigomático","Nasal","Nasal","Lagrimal","Lagrimal","Palatino","Palatino","Cornete inferior","Cornete inferior","Vómer","Mandíbula"]

const suturas = [
  { nombre: "Coronal", entre: "Frontal y parietales" },
  { nombre: "Sagital", entre: "Parietales" },
  { nombre: "Lambdoidea", entre: "Parietales y occipital" },
  { nombre: "Escamosa", entre: "Temporal y parietal" },
  { nombre: "Esfeno-frontal", entre: "Esfenoides y frontal" },
  { nombre: "Esfeno-parietal", entre: "Esfenoides y parietal" },
  { nombre: "Esfeno-escamosa", entre: "Esfenoides y temporal" },
  { nombre: "Occípito-mastoidea", entre: "Occipital y temporal" },
]

const puntos = [
  { nombre: "Glabela", dato: "Prominencia lisa en la línea media sobre la raíz nasal" },
  { nombre: "Nasion", dato: "Intersección de sutura frontonasal con sutura internasal" },
  { nombre: "Bregma", dato: "Intersección de suturas coronal y sagital" },
  { nombre: "Lambda", dato: "Intersección de suturas sagital y lambdoidea" },
  { nombre: "Pterion", dato: "Unión de frontal, parietal, ala mayor del esfenoides y escama del temporal; área delgada relacionada con la arteria meníngea media" },
  { nombre: "Asterion", dato: "Unión de parietal, occipital y porción mastoidea del temporal" },
  { nombre: "Inión", dato: "Protuberancia occipital externa" },
]

const foramenes = [
  { nombre: "Conducto óptico", fosa: "Media", pasa: ["Nervio óptico (II)", "Arteria oftálmica"] },
  { nombre: "Fisura orbitaria superior", fosa: "Media", pasa: ["III","IV","V1","VI","Venas oftálmicas"] },
  { nombre: "Fisura orbitaria inferior", fosa: "Media", pasa: ["Nervio infraorbitario (V2)","Nervio cigomático (V2)","Vasos infraorbitarios"] },
  { nombre: "Foramen redondo (rotundo)", fosa: "Media", pasa: ["V2 (nervio maxilar)"] },
  { nombre: "Foramen oval", fosa: "Media", pasa: ["V3 (nervio mandibular)","Nervio petroso menor","Arteria meníngea accesoria"] },
  { nombre: "Foramen espinoso", fosa: "Media", pasa: ["Arteria meníngea media","Ramo meníngeo de V3"] },
  { nombre: "Conducto carotídeo", fosa: "Media", pasa: ["Arteria carótida interna","Plexo simpático carotídeo"] },
  { nombre: "Foramen lacerum", fosa: "Media", pasa: ["Nervio del conducto pterigoideo (sobre su techo)"] },
  { nombre: "Meato acústico interno", fosa: "Posterior", pasa: ["VII (facial)","VIII (vestibulococlear)","Arteria laberíntica"] },
  { nombre: "Foramen yugular", fosa: "Posterior", pasa: ["IX","X","XI","Seno sigmoideo → VYI","Seno petroso inferior"] },
  { nombre: "Conducto del hipogloso", fosa: "Posterior", pasa: ["XII (hipogloso)"] },
  { nombre: "Foramen magno", fosa: "Posterior", pasa: ["Bulbo raquídeo/medula","Arterias vertebrales","Raíces espinales de XI","Meninges","Plexos venosos"] },
  { nombre: "Foramen estilomastoideo", fosa: "Base externa", pasa: ["Salida del VII (facial)"] },
  { nombre: "Foramen supraorbitario/incisura", fosa: "Cara", pasa: ["Nervio y vasos supraorbitarios"] },
  { nombre: "Foramen infraorbitario", fosa: "Cara", pasa: ["Nervio y vasos infraorbitarios"] },
  { nombre: "Foramen mentoniano", fosa: "Cara", pasa: ["Nervio y vasos mentonianos"] },
  { nombre: "Foramen mandibular", fosa: "Rama mandibular", pasa: ["Nervio alveolar inferior","Vasos alveolares inferiores"] },
  { nombre: "Conducto incisivo", fosa: "Paladar", pasa: ["Nervios nasopalatinos","Vasos esfenopalatinos"] },
  { nombre: "Foramen palatino mayor", fosa: "Paladar", pasa: ["Nervio y vasos palatinos mayores"] },
  { nombre: "Forámenes palatinos menores", fosa: "Paladar", pasa: ["Nervios y vasos palatinos menores"] },
]

const fosasCraneales = [
  { nombre: "Anterior", limites: "Borde posterior del ala menor del esfenoides/limbus esfenoidal", contenido: "Lóbulos frontales; lámina cribosa del etmoides con filetes del I" },
  { nombre: "Media", limites: "Ala mayor del esfenoides hasta el borde superior del peñasco", contenido: "Lóbulos temporales; forámenes rotundo, oval y espinoso; conducto carotídeo; fisura orbitaria superior" },
  { nombre: "Posterior", limites: "Borde superior del peñasco al surco del seno transverso", contenido: "Cerebelo, protuberancia y bulbo; meato acústico interno; foramen yugular; conducto del hipogloso; foramen magno" },
]

const orbita = {
  paredes: [
    { lado: "Techo (superior)", huesos: ["Frontal","Ala menor del esfenoides"] },
    { lado: "Pared lateral", huesos: ["Cigomático","Ala mayor del esfenoides"] },
    { lado: "Pared medial", huesos: ["Etmoides","Lagrimal","Proceso frontal del maxilar","Cuerpo del esfenoides (porción)"] },
    { lado: "Piso (inferior)", huesos: ["Maxilar","Cigomático","Palatino"] },
  ],
}

const fosasNasales = {
  septo: [{ estructura: "Tabique nasal", forma: "Vómer y lámina perpendicular del etmoides" }],
  meatos: [
    { meato: "Meato superior", drena: ["Celdillas etmoidales posteriores"] },
    { meato: "Meato medio", drena: ["Seno frontal","Seno maxilar","Celdillas etmoidales anteriores (a través del infundíbulo)"] },
    { meato: "Receso esfenoetmoidal", drena: ["Seno esfenoidal"] },
  ],
}

const atm = {
  tipo: "Articulación sinovial ginglimo modificada con disco articular de fibrocartílago",
  superficies: ["Fosa mandibular del temporal","Tubérculo articular","Cóndilo de la mandíbula"],
  ligamentos: ["Lateral (temporomandibular)","Esfenomandibular","Estilomandibular"],
  movimientos: {
    depresion: ["Apertura: suprahioideos y pterigoideo lateral (deslizamiento anterior del cóndilo y disco)"],
    elevacion: ["Cierre: masetero, temporal, pterigoideo medial"],
    protrusion: ["Pterigoideo lateral (principal)","Masetero superficial"],
    retrusion: ["Fibras posteriores del temporal","Masetero profundo"],
    lateralidad: ["Pterigoideos (contralateral)"],
  }
}

// ---------- SVGs para preguntas con imagen ----------
const svgCranioFrontal = (
  <svg viewBox="0 0 220 260" width="100%" style={{background:"#0f1220", borderRadius:12}}>
    <defs><style>{`.lbl{fill:#c8cdf8;font:700 12px system-ui}`}</style></defs>
    <path d="M110 10c-40 0-70 30-78 70-8 40 5 85 30 115 20 24 50 35 48 48 28-12 40-24 56-44 24-30 35-76 28-114-7-38-44-75-84-75z" fill="#1a1d33" stroke="#2a2f55"/>
    <circle cx="110" cy="40" r="10" fill="#6f7dff"/><text x="106" y="44" className="lbl">1</text>
    <circle cx="110" cy="70" r="8" fill="#9b7bff"/><text x="107" y="74" className="lbl">2</text>
    <circle cx="155" cy="95" r="10" fill="#6f7dff"/><text x="151" y="99" className="lbl">3</text>
    <circle cx="130" cy="120" r="9" fill="#9b7bff"/><text x="127" y="124" className="lbl">4</text>
    <circle cx="110" cy="185" r="12" fill="#6f7dff"/><text x="106" y="189" className="lbl">5</text>
  </svg>
)

const svgBaseCraneo = (
  <svg viewBox="0 0 240 180" width="100%" style={{background:"#0f1220", borderRadius:12}}>
    <defs><style>{`.lbl{fill:#c8cdf8;font:700 12px system-ui}`}</style></defs>
    <rect x="10" y="20" width="220" height="140" rx="10" fill="#1a1d33" stroke="#2a2f55"/>
    <ellipse cx="120" cy="120" rx="26" ry="18" fill="#6f7dff"/><text x="116" y="124" className="lbl">1</text>
    <ellipse cx="85" cy="90" rx="14" ry="8" fill="#9b7bff"/><text x="81" y="94" className="lbl">2</text>
    <circle cx="105" cy="90" r="5" fill="#6f7dff"/><text x="102" y="94" className="lbl">3</text>
    <circle cx="150" cy="80" r="6" fill="#9b7bff"/><text x="147" y="84" className="lbl">4</text>
  </svg>
)

// ---------- Generadores de preguntas (incluye nuevos tipos) ----------
// Tipos: mcq | tf | match | input | image
function genMCQ_HuesosCranio(){
  const options = shuffle([
    `Frontal, parietal, temporal, occipital, esfenoides y etmoides`,
    `Frontal, parietal, cigomático, occipital, esfenoides y etmoides`,
    `Frontal, maxilar, temporal, occipital, esfenoides y etmoides`,
    `Frontal, parietal, temporal, occipital y vómer`,
  ])
  const correctIndex = options.findIndex(o=>o.includes("temporal") && o.includes("parietal") && o.includes("esfenoides") && o.includes("etmoides") && o.includes("occipital") && o.includes("Frontal"))
  return { tema:TEMAS.HUESOS, type:"mcq", prompt:"¿Cuáles son los huesos del neurocráneo? Elige la opción correcta.", options, correctIndex, explicacion:"Los huesos del neurocráneo son: Frontal, Parietales (2), Temporales (2), Occipital, Esfenoides y Etmoides." }
}
function genMCQ_HuesosFaciales(){
  const options = shuffle([
    `Maxilares, cigomáticos, nasales, lagrimales, palatinos, cornetes inferiores, vómer y mandíbula`,
    `Maxilares, parietales, nasales, lagrimales, palatinos, cornetes superiores, vómer y mandíbula`,
    `Maxilares, cigomáticos, nasales, lagrimales, palatinos, etmoides, vómer y mandíbula`,
    `Frontal, cigomáticos, nasales, lagrimales, palatinos, vómer y mandíbula`,
  ])
  const correctIndex = options.findIndex(o=>o.includes("cigomáticos") && o.includes("cornetes inferiores") && o.includes("Maxilares") && o.includes("vómer") && o.includes("mandíbula"))
  return { tema:TEMAS.HUESOS, type:"mcq", prompt:"¿Cuáles son los huesos de la cara (viscerocráneo)?", options, correctIndex, explicacion:"Los huesos de la cara: Maxilares (2), Cigomáticos (2), Nasales (2), Lagrimales (2), Palatinos (2), Cornetes inferiores (2), Vómer y Mandíbula." }
}
function genTF_Pterion(){
  return { tema:TEMAS.SUTURAS, type:"tf", prompt:"El pterion es la unión de frontal, parietal, ala mayor del esfenoides y escama del temporal, y se relaciona con la arteria meníngea media.", answer:true, explicacion:"Es un punto débil del cráneo; fracturas aquí pueden lesionar la arteria meníngea media y causar hematoma epidural." }
}
function genTF_LacerumCarotida(){
  return { tema:TEMAS.FORAMENES, type:"tf", prompt:"La arteria carótida interna atraviesa directamente el foramen lacerum.", answer:false, explicacion:"El foramen lacerum está cerrado por cartílago; la carótida interna pasa por encima de su techo tras salir del conducto carotídeo." }
}
function genMCQ_Foramen_Contenido(){
  const f = pickN(foramenes.filter(f=>f.pasa.length),1)[0]
  const correcto = f.pasa[0]
  const otros = shuffle(foramenes.filter(x=>x.nombre!==f.nombre).flatMap(x=>x.pasa))
  const options = shuffle(uniq([correcto, ...otros]).slice(0,4))
  return { tema:TEMAS.FORAMENES, type:"mcq", prompt:`¿Qué estructura pasa por el ${f.nombre}?`, options, correctIndex: options.indexOf(correcto), explicacion:`${f.nombre}: ${f.pasa.join(", ")}.` }
}
function genMCQ_Estructura_Foramen(){
  const candidatos = foramenes.flatMap(f=>f.pasa.map(p=>({estructura:p, foramen:f.nombre, fosa:f.fosa})))
  const c = pickN(candidatos,1)[0]
  const correct = c.foramen
  const options = shuffle(uniq([correct, ...pickN(foramenes.map(f=>f.nombre).filter(n=>n!==correct), 6)]).slice(0,4))
  return { tema:TEMAS.FORAMENES, type:"mcq", prompt:`¿Por qué foramen/conducto transcurre: ${c.estructura}?`, options, correctIndex: options.indexOf(correct), explicacion:`${c.estructura} → ${correct} (fosa ${c.fosa}).` }
}
function genMCQ_FosaDeForamen(){
  const f = pickN(foramenes,1)[0]
  const options = shuffle(["Anterior","Media","Posterior","Base externa / cara"])
  const mapa = {
    "Media": ["Conducto óptico","Fisura orbitaria superior","Fisura orbitaria inferior","Foramen redondo (rotundo)","Foramen oval","Foramen espinoso","Conducto carotídeo","Foramen lacerum"],
    "Posterior": ["Meato acústico interno","Foramen yugular","Conducto del hipogloso","Foramen magno"],
  }
  const correcta = Object.entries(mapa).find(([k,lista])=>lista.some(n=>normalize(n)===normalize(f.nombre)))?.[0] || "Base externa / cara"
  return { tema:TEMAS.FOSAS, type:"mcq", prompt:`¿En qué fosa craneal se localiza principalmente el ${f.nombre}?`, options, correctIndex: options.indexOf(correcta), explicacion:`${f.nombre} se reconoce en la fosa ${correcta}.` }
}
function genMATCH_Suturas(){
  const pairs = pickN(suturas,5).map(s=>({left:s.nombre,right:s.entre}))
  return { tema:TEMAS.SUTURAS, type:"match", prompt:"Relaciona cada sutura con los huesos que une:", pairs, explicacion:"Coronal: frontal-parietales; sagital: parietales; lambdoidea: parietales-occipital; escamosa: temporal-parietal." }
}
function genMATCH_OrbitaParedes(){
  const pairs = pickN(orbita.paredes,4).map(p=>({left:p.lado, right:p.huesos.join(", ")}))
  return { tema:TEMAS.ORBITA, type:"match", prompt:"Relaciona pared de la órbita con sus huesos:", pairs, explicacion:"Techo: frontal y ala menor del esfenoides. Lateral: cigomático y ala mayor. Medial: etmoides, lagrimal, proceso frontal del maxilar, parte del esfenoides. Piso: maxilar, cigomático y palatino." }
}
function genTF_ATM(){
  return { tema:TEMAS.ATM, type:"tf", prompt:"La ATM es una articulación sinovial con disco de fibrocartílago; los movimientos de protrusión dependen principalmente del pterigoideo lateral.", answer:true, explicacion:"La ATM es un ginglimo modificado con disco; protrusión: pterigoideo lateral (principal)." }
}
function genMCQ_SenosParanasales(){
  const bancos = [
    { seno: "Maxilar", meato: "Meato medio" },
    { seno: "Frontal", meato: "Meato medio" },
    { seno: "Esfenoidal", meato: "Receso esfenoetmoidal" },
    { seno: "Celdillas etmoidales posteriores", meato: "Meato superior" },
  ]
  const item = pickN(bancos,1)[0]
  const options = shuffle(["Meato superior","Meato medio","Meato inferior","Receso esfenoetmoidal"])
  return { tema:TEMAS.FOSAS_NASALES, type:"mcq", prompt:`¿Dónde drena principalmente el seno/celdillas: ${item.seno}?`, options, correctIndex: options.indexOf(item.meato), explicacion:`${item.seno} → ${item.meato}.` }
}
function genMCQ_SeptumNasal(){
  const options = shuffle([
    "Vómer y lámina perpendicular del etmoides",
    "Lámina perpendicular del esfenoides y vómer",
    "Cartílago alar y hueso nasal",
    "Lámina cribosa y vómer",
  ])
  const correctIndex = options.indexOf("Vómer y lámina perpendicular del etmoides")
  return { tema:TEMAS.FOSAS_NASALES, type:"mcq", prompt:"¿De qué huesos está formado el tabique nasal óseo principalmente?", options, correctIndex, explicacion:"El septo óseo es principalmente el vómer y la lámina perpendicular del etmoides (más el cartílago del tabique anteriormente)." }
}
function genMCQ_Landmarks(){
  const p = pickN(puntos,1)[0]
  const options = shuffle(["Intersección coronal-sagital","Intersección sagital-lambdoidea","Protuberancia occipital externa","En la línea media sobre la raíz nasal"])
  const mapa = {
    "Bregma": "Intersección coronal-sagital",
    "Lambda": "Intersección sagital-lambdoidea",
    "Inión": "Protuberancia occipital externa",
    "Glabela": "En la línea media sobre la raíz nasal",
  }
  const correcta = mapa[p.nombre] || "En la línea media sobre la raíz nasal"
  return { tema:TEMAS.SUTURAS, type:"mcq", prompt:`¿Cuál es la mejor descripción de ${p.nombre}?`, options, correctIndex: options.indexOf(correcta), explicacion:`${p.nombre}: ${p.dato}.` }
}

// Nuevos generadores: respuesta escrita e imagen
function genINPUT_Punto(){
  const p = pickN(puntos,1)[0]
  return { tema:TEMAS.SUTURAS, type:"input", prompt:`Nombra el punto craneométrico descrito: "${p.dato}"`, answer: p.nombre, explicacion:`Descripción de ${p.nombre}.` }
}
function genIMAGE_CranioAnteriores(){
  const mapping = { 1: "Frontal", 2: "Nasal", 3: "Cigomático", 4: "Maxilar", 5: "Mandíbula" }
  const key = pickN(Object.keys(mapping),1)[0]
  return { tema:TEMAS.HUESOS, type:"image", prompt:`En la siguiente imagen, identifica la estructura marcada con el número ${key}. Escribe su nombre anatómico.`, image: svgCranioFrontal, answer: mapping[key], explicacion:`Marcado ${key}: ${mapping[key]}.` }
}
function genIMAGE_Base(){
  const mapping = { 1: "Foramen magno", 2: "Foramen oval", 3: "Foramen espinoso", 4: "Meato acústico interno" }
  const key = pickN(Object.keys(mapping),1)[0]
  return { tema:TEMAS.FORAMENES, type:"image", prompt:`En la vista inferior simplificada de la base del cráneo, nombra la estructura señalada con ${key}.`, image: svgBaseCraneo, answer: mapping[key], explicacion:`Marcado ${key}: ${mapping[key]}.` }
}

const GENERADORES = [
  genMCQ_HuesosCranio,
  genMCQ_HuesosFaciales,
  genTF_Pterion,
  genTF_LacerumCarotida,
  genMCQ_Foramen_Contenido,
  genMCQ_Estructura_Foramen,
  genMCQ_FosaDeForamen,
  genMATCH_Suturas,
  genMATCH_OrbitaParedes,
  genTF_ATM,
  genMCQ_SenosParanasales,
  genMCQ_SeptumNasal,
  genMCQ_Landmarks,
  // nuevos
  genINPUT_Punto,
  genIMAGE_CranioAnteriores,
  genIMAGE_Base,
]

// ---------- Construcción del examen ----------
function buildExam({ num=40, temasSeleccionados=Object.values(TEMAS) }){
  const preguntas = []
  const porTemaDeseado = Math.max(2, Math.floor(num / Object.keys(TEMAS).length))
  const porTema = Object.values(TEMAS).reduce((acc,t)=> (acc[t]=0, acc), {})
  let guard = 0
  while (preguntas.length < num && guard < num*30){
    guard++
    const g = pickN(GENERADORES,1)[0]
    const q = g()
    if (!temasSeleccionados.includes(q.tema)) continue
    if (porTema[q.tema] < porTemaDeseado || Math.random()>0.4){
      if (!preguntas.some(x=> normalize(x.prompt)===normalize(q.prompt))){
        preguntas.push(q); porTema[q.tema]++
      }
    }
  }
  return preguntas.slice(0, num)
}

// ---------- Componentes base ----------
function Progress({value}){
  return <div className="progress"><div style={{width:`${Math.min(100, Math.max(0,value))}%`}}/></div>
}

export default function App(){
  const [modo,setModo] = useState("examen") // estudio | practica | examen (pero feedback silencioso en todos, por pedido)
  const [num,setNum] = useState(40)
  const [temasSel,setTemasSel] = useState(Object.values(TEMAS))
  const [indice,setIndice] = useState(0)
  const [preguntas,setPreguntas] = useState([])
  const [respuestas,setRespuestas] = useState({}) // idx -> raw (score se calcula al final)
  const [inicio,setInicio] = useState(null)
  const [usarTimer,setUsarTimer] = useState(true)
  const [limiteMin,setLimiteMin] = useState(45)

  const total = preguntas.length
  const actual = preguntas[indice]

  // Timer
  const tiempoTrans = inicio ? Math.floor((Date.now()-inicio)/1000) : 0
  const restante = usarTimer ? Math.max(0, limiteMin*60 - tiempoTrans) : null
  useEffect(()=>{ if (usarTimer && restante===0 && inicio){ setInicio(null) } }, [usarTimer, restante, inicio])

  // Iniciar / finalizar
  const empezar = ()=>{
    setPreguntas(buildExam({num:Number(num), temasSeleccionados:temasSel}))
    setIndice(0); setRespuestas({}); setInicio(Date.now())
  }
  const terminar = ()=> setInicio(null)

  // Estado final (resultado solo al final)
  const terminado = !inicio && total>0

  // Grading al finalizar
  const resultados = useMemo(()=>{
    if (!terminado) return null
    let correctas = 0
    const porTema = {}
    const errores = []
    preguntas.forEach((q, i)=>{
      const raw = respuestas[i]
      let ok = false
      if (q.type==="mcq" && typeof raw === "number") ok = raw === q.correctIndex
      else if (q.type==="tf" && typeof raw === "boolean") ok = raw === q.answer
      else if (q.type==="match" && raw && typeof raw === "object"){
        ok = Object.keys(raw).length===q.pairs.length && q.pairs.every(p=> normalize(raw[p.left])===normalize(p.right))
      } else if ((q.type==="input" || q.type==="image") && typeof raw === "string"){
        ok = normalize(raw) === normalize(q.answer)
      }
      if (ok) correctas++
      if (!porTema[q.tema]) porTema[q.tema] = {ok:0, tot:0}
      porTema[q.tema].tot++
      porTema[q.tema].ok += ok?1:0
      if (!ok){
        const correcto = q.type==='mcq' ? q.options[q.correctIndex] : q.answer
        errores.push({ i, tema:q.tema, prompt:q.prompt, correcto, explicacion:q.explicacion })
      }
    })
    const pct = total? Math.round((correctas/total)*100) : 0
    const peor = Object.entries(porTema).sort((a,b)=> (a[1].ok/a[1].tot) - (b[1].ok/b[1].tot)).slice(0,3)
    const sugerencias = peor.map(([tema])=> ({ tema, foco: sugerirFoco(tema) }))
    return { correctas, pct, porTema, errores, sugerencias }
  }, [terminado, preguntas, respuestas, total])

  function sugerirFoco(tema){
    switch(tema){
      case TEMAS.FORAMENES: return "Practica mnemotecnias V1/V2/V3 y rutas carotídeas. Haz tarjetas: '¿qué pasa por…?' y '¿por dónde pasa…?'."
      case TEMAS.SUTURAS: return "Memoriza pterion/bregma con imágenes; repasa uniones entre huesos en voz alta."
      case TEMAS.HUESOS: return "Ubica frontal/nasal/cigomático/maxilar/mandíbula en vistas anterior y lateral con mapas mudos."
      case TEMAS.FOSAS: return "Dibuja límites de fosas y asocia forámenes por región (anterior/media/posterior)."
      case TEMAS.ORBITA: return "Regla de paredes: techo-frontal, lateral-cigomático+ala mayor, medial-etmoides+lagrimal+proceso frontal, piso-maxilar+cigomático+palatino."
      case TEMAS.FOSAS_NASALES: return "Drenajes clave: frontal y maxilar→meato medio; esfenoidal→receso esfenoetmoidal; etmoidales post.→meato superior."
      case TEMAS.ATM: return "Movimientos y músculos: protrusión (pterigoideo lateral), elevación (masetero y temporal)."
      default: return "Refuerza con atlas, mapas mudos y 10 tarjetas activas por subtema."
    }
  }

  const answeredCount = useMemo(()=>{
    return Object.keys(respuestas).filter(k=>{
      const raw = respuestas[k]
      if (raw===undefined || raw===null) return False
      if (typeof raw === "string") return raw.trim() !== ""
      if (typeof raw === "object") return Object.keys(raw).length > 0
      return true
    }).length
  }, [respuestas])

  const tiempoFmt = (seg)=>{ const m=Math.floor(seg/60), s=seg%60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` }

  return (
    <div className="container">
      <div className="header" style={{marginBottom:16}}>
        <div className="logo">CQ</div>
        <div>
          <h1 className="h1">Test de Anatomía del Cráneo</h1>
          <div className="sub">Corrección silenciosa • Explicaciones y resultados solo al finalizar • Imágenes y respuesta escrita</div>
        </div>
      </div>

      {/* Configuración (modos incluidos para mantener paridad, pero sin feedback en vivo) */}
      <div className="card" style={{marginBottom:16}}>
        <div className="row">
          <div className="col-4">
            <div className="label">Modo</div>
            <select className="select" value={modo} onChange={e=>setModo(e.target.value)}>
              <option value="estudio">Estudio</option>
              <option value="practica">Práctica</option>
              <option value="examen">Examen</option>
            </select>
            <div className="sub" style={{marginTop:6}}>En todos los modos, el feedback se muestra al final.</div>
          </div>
          <div className="col-4">
            <div className="label">Cantidad de preguntas</div>
            <input type="number" min="10" max="120" step="5" className="input" value={num} onChange={e=>setNum(e.target.value)} />
            <div className="sub" style={{marginTop:6}}>Recomendado: 40–60</div>
          </div>
          <div className="col-4">
            <div className="label">Temporizador</div>
            <div className="spaced">
              <button className={"btn "+(usarTimer?"primary":"ghost")} onClick={()=>setUsarTimer(v=>!v)}>{usarTimer? "Activado":"Desactivado"}</button>
              <input className="input" style={{width:90}} type="number" min="10" step="5" value={limiteMin} onChange={e=>setLimiteMin(Number(e.target.value)||0)} />
              <span className="sub">min</span>
            </div>
          </div>
        </div>
        <div className="label" style={{marginTop:16}}>Temas incluidos</div>
        <div className="row">
          {Object.values(TEMAS).map(t=>{
            const activo = temasSel.includes(t)
            return (
              <div className="col-6" key={t}>
                <button className={"btn "+(activo?"primary":"ghost")} style={{width:"100%"}} onClick={()=> setTemasSel(s=> activo ? s.filter(x=>x!==t) : [...s,t])}>{t}</button>
              </div>
            )
          })}
        </div>
        <div className="spaced" style={{marginTop:14}}>
          <div className="sub">Las explicaciones y la nota aparecen <b>solo al final</b>.</div>
          <button className="btn primary" onClick={empezar}>Comenzar</button>
        </div>
      </div>

      {/* Ejecución */}
      {total>0 && (
        <div className="card" style={{marginBottom:16}}>
          <div className="spaced" style={{marginBottom:10}}>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <button className="btn ghost" onClick={()=> setIndice(i=>Math.max(0, i-1))} disabled={indice===0}>⟵</button>
              <button className="btn ghost" onClick={()=> setIndice(i=>Math.min(total-1, i+1))} disabled={indice===total-1}>⟶</button>
              <span className="sub">Pregunta {indice+1} / {total}</span>
            </div>
            <div style={{display:"flex", gap:10, alignItems:"center"}}>
              {usarTimer && inicio && (<span className="timer">{tiempoFmt(restante||0)}</span>)}
              <div style={{minWidth:160}}><div className="progress"><div style={{width:`${(answeredCount/total)*100}%`}}/></div></div>
            </div>
          </div>

          {actual && <Question q={actual} onAnswer={(raw)=> setRespuestas(m=> ({...m, [indice]: raw}))} />}

          <div className="spaced" style={{marginTop:12}}>
            <div className="sub">No se muestra si acertaste o fallaste hasta finalizar.</div>
            <div style={{display:"flex", gap:8}}>
              <button className="btn ghost" onClick={()=> setPreguntas(p=>[...p])}>Reintentar pregunta</button>
              <button className="btn ghost" onClick={()=>{ setPreguntas(buildExam({num:Number(num), temasSeleccionados:temasSel})); setIndice(0); setRespuestas({}); setInicio(Date.now()) }}>Nuevo set</button>
              <button className="btn primary" onClick={()=> setInicio(null)} disabled={!inicio}>Finalizar</button>
            </div>
          </div>
        </div>
      )}

      {/* Resultados (solo al final) */}
      {terminado && resultados && (
        <Results {...resultados} total={total} tiempo={tiempoFmt(tiempoTrans)} />
      )}
    </div>
  )
}

// ---------- Question (no feedback durante la prueba) ----------
function Question({ q, onAnswer }){
  const [local, setLocal] = useState(null)
  useEffect(()=>{ setLocal(null) }, [q])

  const update = (raw)=>{
    setLocal(raw)
    onAnswer && onAnswer(raw)
  }

  return (
    <div>
      <div style={{fontSize:"1.1rem", marginBottom:10}}>{q.prompt}</div>

      {q.type==="mcq" && (
        <div className="list">
          {q.options.map((opt,i)=>(
            <button key={i} className="opt" onClick={()=> update(i)}>{opt}</button>
          ))}
        </div>
      )}

      {q.type==="tf" && (
        <div style={{display:"flex", gap:8}}>
          <button className="btn ghost" onClick={()=> update(true)}>Verdadero</button>
          <button className="btn ghost" onClick={()=> update(false)}>Falso</button>
        </div>
      )}

      {q.type==="match" && (
        <div className="grid2">
          {q.pairs.map((p,idx)=>(
            <div className="row" key={idx}>
              <div><b>{p.left}</b></div>
              <select className="select" defaultValue="" onChange={e=> update({ ...(local||{}), [p.left]: e.target.value })}>
                <option value="" disabled>Elige…</option>
                {shuffle(q.pairs.map(pp=>pp.right)).map((r,i)=>(<option key={i} value={r}>{r}</option>))}
              </select>
            </div>
          ))}
          <div className="helper">{local && typeof local==="object" && Object.keys(local).length<q.pairs.length ? "Completa todas las relaciones…" : " "}</div>
        </div>
      )}

      {q.type==="input" && (
        <input className="input" style={{width:"100%", marginTop:6}} placeholder="Escribe el nombre anatómico"
               onChange={e=> setLocal(e.target.value)} onBlur={(e)=> update(e.target.value)} />
      )}

      {q.type==="image" && (
        <div>
          <div style={{marginBottom:8}}>{q.image}</div>
          <input className="input" style={{width:"100%"}} placeholder="Escribe el nombre anatómico"
                 onChange={e=> setLocal(e.target.value)} onBlur={(e)=> update(e.target.value)} />
        </div>
      )}
    </div>
  )
}

// ---------- Resultados y sugerencias ----------
function Results({ correctas, pct, porTema, errores, sugerencias, tiempo, total }){
  return (
    <div className="card" style={{marginBottom:16}}>
      <div style={{fontWeight:700, marginBottom:8}}>Resultado</div>
      <div className="row">
        <div className="col-6 kpi"><div className="label">Preguntas</div><div className="val">{total}</div></div>
        <div className="col-6 kpi"><div className="label">Correctas</div><div className="val" style={{color:"#2ecc71"}}>{correctas}</div></div>
        <div className="col-6 kpi"><div className="label">Puntaje</div><div className="val">{pct}%</div></div>
        <div className="col-6 kpi"><div className="label">Tiempo</div><div className="val">{tiempo}</div></div>
      </div>

      <div className="divider"></div>
      <div style={{fontWeight:700, marginBottom:8}}>Desglose por tema</div>
      <div className="row">
        {Object.entries(porTema).map(([tema, {ok, tot}])=> (
          <div className="col-6 kpi" key={tema}>
            <div className="label">{tema}</div>
            <div className="val">{ok}/{tot} ({tot? Math.round(100*ok/tot):0}%)</div>
          </div>
        ))}
      </div>

      {!!errores.length && (<>
        <div className="divider"></div>
        <div style={{fontWeight:700, marginBottom:8}}>Correcciones y explicaciones</div>
        <ul>
          {errores.map((e,idx)=>(
            <li key={idx} style={{marginBottom:6}}>
              <div style={{fontSize:14}}><b>Q{e.i+1}</b> — {e.prompt}</div>
              <div className="sub">Correcto: <b>{e.correcto}</b>. {e.explicacion}</div>
            </li>
          ))}
        </ul>
      </>)}

      <div className="divider"></div>
      <div style={{fontWeight:700, marginBottom:8}}>Sugerencias de foco (temas más débiles)</div>
      <ul>
        {sugerencias.map((s,i)=>(<li key={i}><b>{s.tema}:</b> {s.foco}</li>))}
      </ul>
    </div>
  )
}
