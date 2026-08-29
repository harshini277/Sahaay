import { understand } from './conversation'
export type LLMIntent =
  | 'create_grievance'
  | 'view_grievances'
  | 'track_grievance'
  | 'appeal'
  | 'escalate'
  | 'general_guidance'

export type LLMInterpretation = {
  intent: LLMIntent
  service: string
  issue: string
  location: string
  missing: string[]
  confidence: number
  reply: string
}

type ChatTurn = { role: 'user' | 'assistant'; content: string }
type WebLLMModule = {
  CreateMLCEngine: (model: string, options?: { initProgressCallback?: (report: { text?: string }) => void }) => Promise<any>
}

const MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'
const WEBLLM_VERSION = '0.2.82'
let enginePromise: Promise<any> | null = null

const fallback: LLMInterpretation = {
  intent: 'general_guidance', service: '', issue: '', location: '', missing: [], confidence: 0, reply: ''
}

async function loadEngine(onProgress?: (text: string) => void) {
  const gpu = typeof navigator !== 'undefined' ? (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<any> } }).gpu : undefined
  if (!gpu) {
    throw new Error('WebGPU is not available in this browser')
  }
  if (!enginePromise) {
    enginePromise = (async () => {
      const adapter = await gpu.requestAdapter()
      if (!adapter) throw new Error('No WebGPU adapter is available')
      onProgress?.('Preparing Sahaay on this device…')
      const moduleUrl = `https://esm.run/@mlc-ai/web-llm@${WEBLLM_VERSION}`
      const webllm = await import(/* @vite-ignore */ moduleUrl) as unknown as WebLLMModule
      return webllm.CreateMLCEngine(MODEL, {
        initProgressCallback: report => onProgress?.(report.text || 'Loading Sahaay AI…')
      })
    })().catch(error => {
      // A failed initialization must not poison the singleton forever.
      enginePromise = null
      throw error
    })
  }
  return enginePromise
}

function parseJson(text: string): LLMInterpretation | null {
  try {
    const clean = text.trim().replace(/^```json\s*/i, '').replace(/```$/,'').trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    if (start < 0 || end <= start) return null
    const parsed = JSON.parse(clean.slice(start, end + 1))
    if (!parsed || typeof parsed !== 'object') return null
    const intents: LLMIntent[] = ['create_grievance','view_grievances','track_grievance','appeal','escalate','general_guidance']
    return {
      intent: intents.includes(parsed.intent) ? parsed.intent : 'general_guidance',
      service: typeof parsed.service === 'string' ? parsed.service : '',
      issue: typeof parsed.issue === 'string' ? parsed.issue : '',
      location: typeof parsed.location === 'string' ? parsed.location : '',
      missing: Array.isArray(parsed.missing) ? parsed.missing.filter((x: unknown) => typeof x === 'string').slice(0, 4) : [],
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      reply: typeof parsed.reply === 'string' ? parsed.reply.trim() : ''
    }
  } catch {
    return null
  }
}

const systemPrompt = `You are Sahaay, a calm citizen-facing guide for Indian public-service grievances.
Have a real conversation with the citizen. Do not behave like a form or a category picker.
First understand what the citizen is trying to do, using the whole conversation. Then respond directly.
Navigation questions are actions, not grievance categories. For example: “how do I submit a grievance?”, “where are my grievances?”, “show my complaints”, “how do I track a grievance?” must NOT become a no-response grievance.
For an obvious issue, recognise it immediately. “potholes”, “potholes on my road”, “open manholes”, “damaged road”, “broken footpath” -> roads_public_works. “garbage not collected” -> sanitation_waste. “water supply is cut” -> water_drainage.
Never ask the citizen to choose a category when their meaning is already clear. Ask one useful next question only when information is genuinely missing.
For local civic issues, location is usually the next useful detail. If the citizen gives a locality, city, ward, landmark or PIN, treat it as location and move forward.
Never invent an officer, department, jurisdiction, legal deadline, contact detail, grievance ID or status.
Keep replies short, natural and specific to what the citizen just said. Avoid generic filler such as “this appears to be” when you can simply say what you understood.
Write only the message Sahaay should show the citizen. Do not output JSON, labels, analysis, categories or internal notes. Usually use one or two sentences. Ask at most one question.`

function heuristicInterpretation(history: ChatTurn[]): LLMInterpretation {
  const text = history.filter(x => x.role === 'user').at(-1)?.content?.trim() || ''
  const source = text.toLowerCase()
  const u = understand(text)

  if (/\b(show|view|see|find|where|list)\b.*\b(my|existing)\b.*\b(grievances?|complaints?|cases?)\b|\bhow do i (view|see|find|check) my (grievances?|complaints?|cases?)/i.test(source)) {
    return {intent:'view_grievances',service:'',issue:'',location:'',missing:[],confidence:.99,reply:'Absolutely — I can take you to your existing grievances.'}
  }
  if (/\b(track|tracking)\b.*\b(grievance|complaint|case)|\bwhere is my (grievance|complaint|case)\b/i.test(source)) {
    return {intent:'track_grievance',service:'',issue:'',location:'',missing:[],confidence:.99,reply:'Sure — I can take you to your grievance timeline.'}
  }
  if (/\bhow do i (submit|lodge|file)|\bhow can i (submit|lodge|file)|\bwhere do i (submit|lodge|file)\b/i.test(source)) {
    return {intent:'general_guidance',service:'',issue:'',location:'',missing:[],confidence:.99,reply:'You can start here by telling me what went wrong. I’ll guide you through the grievance steps.'}
  }

  const service = u.entities.service || ''
  const serviceMap: Record<string,string> = {
    'Roads / public works':'roads_public_works','Sanitation / waste service':'sanitation_waste','Electricity / utility service':'electricity_utility','Municipal service':'municipal_civic','Driving licence renewal':'driving_licence','Vehicle registration or permit':'vehicle_registration','Pension':'pension','Certificate application':'certificate_document','Tax or service administration':'tax_property','Tax or GST service':'tax_property','Housing / land service':'housing_land','Education / scholarship service':'education_scholarship','Public health service':'health_public_health','Benefits / welfare scheme':'welfare_ration'
  }
  if (service) {
    const road = /pothole|manhole|road|footpath|street repair/i.test(source)
    const sanitation = /garbage|waste|sanitation/i.test(source)
    const issue = road ? 'road or public-works problem' : sanitation ? 'waste or sanitation problem' : text
    const missing = /Roads \/ public works|Sanitation \/ waste service|Municipal service/.test(service) && !u.entities.location ? ['location'] : []
    const reply = missing.length ? `Got it — this is a ${service.toLowerCase()} issue. Where is the problem located? A locality, city or PIN is enough.` : `Got it. I understand this as a ${service.toLowerCase()} issue. Let’s take the next step.`
    return {intent:'create_grievance',service:serviceMap[service] || 'other',issue,location:u.entities.location || '',missing,confidence:.95,reply}
  }

  if (/\b(complaint|grievance)\b/.test(source) && !/\b(no response|nobody|closed|resolved|still|pending|not fixed)\b/.test(source)) {
    return {intent:'general_guidance',service:'',issue:'',location:'',missing:[],confidence:.8,reply:'I can help with that. Tell me what you want to do with the grievance, or describe the problem if you’re starting a new one.'}
  }
  return {intent:'general_guidance',service:'',issue:'',location:'',missing:[],confidence:.55,reply:'Tell me what happened or what you’re trying to do, and I’ll guide you from there.'}
}

export async function chatWithLocalLLM(history: ChatTurn[], onProgress?: (text: string) => void): Promise<LLMInterpretation> {
  const safe = heuristicInterpretation(history)
  try {
    const engine = await Promise.race([
      loadEngine(onProgress),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Local model timed out')), 12000))
    ])
    const interpretation = `Application interpretation for this turn (treat this as ground truth): intent=${safe.intent}; service=${safe.service || 'none'}; issue=${safe.issue || 'not yet known'}; location=${safe.location || 'not yet known'}; next information needed=${safe.missing.join(', ') || 'none'}.`
    const response = await Promise.race([
      engine.chat.completions.create({
        messages: [
          {role:'system',content:systemPrompt},
          {role:'system',content:interpretation},
          ...history.slice(-12)
        ],
        temperature: 0.35,
        max_tokens: 150,
        stream: false,
        enable_thinking: false
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Local response timed out')), 9000))
    ])
    const reply = String(response?.choices?.[0]?.message?.content || '').trim()
      .replace(/^['“”]+|['“”]+$/g,'')
      .replace(/^Sahaay:\s*/i,'')
    if (!reply || reply.length < 4) return safe
    return {...safe, reply}
  } catch (error) {
    console.warn('Sahaay local AI unavailable; using local guided interpretation.', error)
    return safe
  }
}


export async function interpretWithLocalLLM(text: string, onProgress?: (text: string) => void): Promise<LLMInterpretation> {
  return chatWithLocalLLM([{role:'user',content:text}], onProgress)
}

export async function warmupLocalLLM(onProgress?: (text: string) => void) {
  try {
    await loadEngine(onProgress)
    return true
  } catch (error) {
    console.warn('Sahaay local AI could not start:', error)
    return false
  }
}

export function localAIAvailable() {
  return typeof navigator !== 'undefined' && !!(navigator as Navigator & { gpu?: unknown }).gpu
}
