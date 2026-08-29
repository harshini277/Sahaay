export type Category = 'pension' | 'service_delay' | 'complaint_lifecycle' | 'unknown_department' | 'out_of_scope' | 'fallback'
export type Subtype = 'payment_delay' | 'amount_issue' | 'not_started' | 'application_pending' | 'certificate_pending' | 'licence_service' | 'registration_service' | 'tax_service' | 'no_response' | 'unsatisfactory_resolution' | 'clarification_required' | 'department_unknown' | 'rti' | 'emergency' | 'non_government' | 'general_service'
export type Intent = 'pension_payment_delay' | 'delayed_service' | 'unsatisfactory_resolution' | 'unknown_department' | 'out_of_scope_rti' | 'out_of_scope_emergency' | 'view_grievances' | 'track_grievance' | 'appeal' | 'escalate' | 'general_guidance' | 'unknown'
export type ConversationState = 'initial' | 'understanding' | 'clarification' | 'identified' | 'preparation' | 'review'
export type ExpectedAnswer = 'pension_occurrence' | 'pension_expected' | 'service_duration' | 'service_location' | 'complaint_outcome' | 'fallback_category' | 'none'
export type ChatMessage = { role: 'user' | 'assistant' | 'system'; text: string; options?: string[]; why?: string }
export type Entities = {
  service?: string
  department?: string
  duration?: string
  expected?: string
  occurrence?: 'first' | 'repeated'
  departmentKnown?: boolean
  referenceAvailable?: boolean
  complaintOutcome?: 'closed_unresolved' | 'response_continued'
  location?: string
}
export type Understanding = { category?: Category; subtype?: Subtype; confidence: 'low' | 'medium' | 'high'; score: number; entities: Entities }
export type Conversation = {
  intent: Intent
  confidence: number
  turn: number
  answers: string[]
  messages: ChatMessage[]
  entities: Entities
  complete: boolean
  state: ConversationState
  understanding: Understanding
  originalDescription: string
  lastQuestion: ExpectedAnswer
}

type Rule = { category: Category; subtype: Subtype; stems: string[]; phrases: string[]; service?: string; weight?: number }
type FallbackChoice = { label:string; category:Category; subtype:Subtype; service?:string }
const fallbackChoices:FallbackChoice[] = [
 {label:'Roads, potholes & public works',category:'service_delay',subtype:'general_service',service:'Roads / public works'},
 {label:'Water supply & drainage',category:'service_delay',subtype:'general_service',service:'Water supply / drainage'},
 {label:'Garbage & sanitation',category:'service_delay',subtype:'general_service',service:'Sanitation / waste service'},
 {label:'Streetlights & civic maintenance',category:'service_delay',subtype:'general_service',service:'Municipal service'},
 {label:'Electricity / utility service',category:'service_delay',subtype:'general_service',service:'Electricity / utility service'},
 {label:'Driving licence or vehicle service',category:'service_delay',subtype:'licence_service',service:'Driving licence / Parivahan'},
 {label:'Vehicle registration or permit',category:'service_delay',subtype:'registration_service',service:'Vehicle registration / permit'},
 {label:'Pension or retirement payment',category:'pension',subtype:'payment_delay',service:'Pension'},
 {label:'Certificate or document application',category:'service_delay',subtype:'certificate_pending',service:'Certificate application'},
 {label:'Tax, GST or property tax',category:'service_delay',subtype:'tax_service',service:'Tax / GST / property tax service'},
 {label:'Housing, land or property service',category:'service_delay',subtype:'general_service',service:'Housing / land service'},
 {label:'Education or scholarship',category:'service_delay',subtype:'general_service',service:'Education / scholarship service'},
 {label:'Healthcare / public health',category:'service_delay',subtype:'general_service',service:'Public health service'},
 {label:'Benefits, welfare or ration',category:'service_delay',subtype:'general_service',service:'Benefits / welfare scheme'},
 {label:'Police or public safety',category:'service_delay',subtype:'general_service',service:'Public safety service'},
 {label:'Employment or labour service',category:'service_delay',subtype:'general_service',service:'Employment / labour service'},
 {label:'No response to an existing grievance',category:'complaint_lifecycle',subtype:'no_response'},
 {label:'My complaint was closed without solving it',category:'complaint_lifecycle',subtype:'unsatisfactory_resolution'},
 {label:'I need to provide additional information',category:'complaint_lifecycle',subtype:'clarification_required'},
 {label:'Something else — I’ll describe it myself',category:'fallback',subtype:'general_service',service:'Other government service'}
]
const fallbackOptions = fallbackChoices.map(x=>x.label)
const rules: Rule[] = [
  { category:'out_of_scope', subtype:'rti', stems:['rti'], phrases:['right to information','file rti','submit rti','rti request','want to file an rti'], weight:14 },
  { category:'out_of_scope', subtype:'emergency', stems:['emergency','ambulance','police','fire'], phrases:['urgent help','need emergency'], weight:14 },
  { category:'pension', subtype:'payment_delay', stems:['pension','retirement','annuity','payment','credited','deposit','arrived','received','missing'], phrases:['pension did not come','pension has not arrived','pension not received','haven t received my pension','havent received my pension','pension normally comes','monthly pension missing','pension payment delayed','money i receive as pension','pension hasnt arrived','pension has not come','nothing came this month'], service:'Pension', weight:4 },
  { category:'pension', subtype:'amount_issue', stems:['pension','amount','less','incorrect','deduction'], phrases:['pension amount is wrong','received less pension','pension amount incorrect'], service:'Pension', weight:4 },
  { category:'pension', subtype:'not_started', stems:['pension','start','started','sanction'], phrases:['pension has not started','pension not started','pension hasnt started'], service:'Pension', weight:4 },
  { category:'service_delay', subtype:'licence_service', stems:['licence','license','renewal','parivahan','driving','driver'], phrases:['driving licence','driving license','driver s license','drivers license','driver license','licence renewal','license renewal','driving licence renewal','driving license renewal','didnt receive my driver s license','did not receive my driver s license'], service:'Driving licence renewal', weight:7 },
  { category:'service_delay', subtype:'registration_service', stems:['vehicle','registration','permit','rc'], phrases:['vehicle registration','registration application','vehicle permit','rc registration'], service:'Vehicle registration or permit', weight:6 },
  { category:'service_delay', subtype:'certificate_pending', stems:['certificate','caste','income','domicile','birth','death'], phrases:['caste certificate','income certificate','domicile certificate','birth certificate','death certificate'], service:'Certificate application', weight:7 },
  { category:'service_delay', subtype:'tax_service', stems:['tax','refund','assessment','gst'], phrases:['tax grievance','tax refund','gst grievance'], service:'Tax or service administration', weight:5 },
  { category:'complaint_lifecycle', subtype:'unsatisfactory_resolution', stems:['complaint','closed','resolved','fixed','response','reply','unresolved','solved'], phrases:['closed my complaint','problem is still there','nothing actually changed','did not solve the problem','response did not solve','issue still exists','marked my complaint resolved','complaint was closed'], weight:7 },
  { category:'complaint_lifecycle', subtype:'clarification_required', stems:['clarification','additional','information','document'], phrases:['asked for more information','additional information requested'], weight:5 },
  { category:'complaint_lifecycle', subtype:'no_response', stems:['complaint','pending','response','heard','responding'], phrases:['nobody is responding','have not heard anything','no response','nobody responded'], weight:5 },
  { category:'service_delay', subtype:'application_pending', stems:['application','applied','pending','stuck','waiting','delay','forever','months'], phrases:['application has been pending','application is taking forever','has been stuck','haven t heard anything','application delayed','government application pending'], weight:4 },
  { category:'unknown_department', subtype:'department_unknown', stems:['department','contact'], phrases:['dont know who','don t know who','do not know who','which department','where to start','who to contact','not sure who handles this'], weight:8 },
]

const normalize = (text: string) => text.toLowerCase().replace(/([a-z])([0-9])/g, '$1 $2').replace(/([0-9])([a-z])/g, '$1 $2').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
const stem = (word: string) => word.replace(/(ing|ed|es|s)$/,'')
const close = (needle: string, tokens: string[]) => tokens.some(token => token === needle || (needle.length > 4 && token.length > 3 && (token.startsWith(needle.slice(0,-1)) || needle.startsWith(token.slice(0,-1)))))
const sensitive = /\b(aadhaar|aadhar|otp|password|passcode|bank account|account number|card number|debit card|credit card|pin)\b|\b\d{12}\b/i
export const hasSensitive = (text: string) => sensitive.test(text)

function extractEntities(text: string, previous: Entities = {}): Entities {
  const source = normalize(text)
  const next: Entities = {...previous}
  const durations = source.match(/\b(?:one|two|three|four|five|six|several|a few|few|\d+)\s+(?:month|months|week|weeks|day|days|year|years)\b/) || (source.includes('ages ago') ? ['several months'] : null)
  const day = source.match(/\b(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)\b/)
  if (durations) next.duration = durations[0]
  if (day) next.expected = `${day[1]}${['1','21','31'].includes(day[1])?'st':['2','22'].includes(day[1])?'nd':['3','23'].includes(day[1])?'rd':'th'}`
  if (/\b(?:august|september|october|november|december|january|february|march|april|may|june|july)\b/.test(source)) next.expected = source.match(/\b(?:august|september|october|november|december|january|february|march|april|may|june|july)\b/)?.[0]
  if (/first time|first missed|never happened|first ever/.test(source)) next.occurrence = 'first'
  if (/happened before|again|last year too|not the first|more than once|before too/.test(source)) next.occurrence = 'repeated'
  if (/don t know|do not know|not sure.*department|no idea who/.test(source)) next.departmentKnown = false
  if (/have.*reference|have.*application number|i know.*reference/.test(source)) next.referenceAvailable = true
  if (/don t have|do not have|no reference|not sure.*reference/.test(source)) next.referenceAvailable = false
  if (/closed.*without|closed.*unresolved|marked.*resolved.*still|closed.*but.*not|didn t.*fix|did not.*fix|problem.*still/.test(source)) next.complaintOutcome = 'closed_unresolved'
  if (/response.*came|they replied|reply.*came|response.*but|addressed.*but.*continued/.test(source)) next.complaintOutcome = 'response_continued'
  return next
}

export function understand(text: string, previous: Entities = {}): Understanding {
  const source = normalize(text)

  // IMPORTANT: broad words such as "received", "arrived", "missing", "payment",
  // "application", and "pending" are never sufficient to identify a specific
  // grievance. We only classify a specific service when there is a strong
  // service signal. Otherwise we deliberately stay uncertain and ask the
  // citizen to clarify instead of guessing.
  const explicit = {
    pension: /\b(pension|retirement pension|annuity|pensioner|pension scheme)\b/.test(source),
    licence: /\b(driver s license|drivers license|driver license|driving license|driving licence|licence renewal|license renewal|parivahan|driving licence renewal)\b/.test(source),
    certificate: /\b(caste certificate|income certificate|domicile certificate|birth certificate|death certificate|certificate application)\b/.test(source),
    vehicle: /\b(vehicle registration|vehicle permit|registration certificate|\brc\b|vehicle rc)\b/.test(source),
    tax: /\b(gst|income tax|tax refund|tax assessment|tax grievance)\b/.test(source),
    utility: /\b(electricity|water connection|water supply|gas connection|utility bill|power supply)\b/.test(source),
    municipal: /\b(municipal|municipality|property tax|garbage collection|waste collection|streetlight|civic service)\b/.test(source),
    education: /\b(scholarship|school admission|college admission|student benefit|education department)\b/.test(source),
    health: /\b(public hospital|government hospital|health centre|health center|government health|health scheme)\b/.test(source),
    housing: /\b(housing scheme|housing board|land record|property record|property registration|plot allotment|housing service)\b/.test(source),
    welfare: /\b(welfare scheme|benefit scheme|government benefit|ration card|social security benefit)\b/.test(source),
    roads: /\b(roadwork|road works|roads?|pothole|manhole|footpath|street repair|drainage|road repair|road damage)\b/.test(source),
    sanitation: /\b(garbage|waste collection|sewage|drain|sanitation)\b/.test(source),
    complaint: /\b(complaint|grievance)\b/.test(source),
    department: /\b(department|dept|who to contact|which department|who handles|where to complain|authority)\b/.test(source),
    rti: /\b(rti|right to information)\b/.test(source),
    emergency: /\b(emergency|ambulance|police|fire brigade|urgent danger)\b/.test(source)
  }

  if (explicit.rti) {
    return {category:'out_of_scope', subtype:'rti', confidence:'high', score:14, entities:extractEntities(text, previous)}
  }
  if (explicit.emergency) {
    return {category:'out_of_scope', subtype:'emergency', confidence:'high', score:14, entities:extractEntities(text, previous)}
  }

  const entities = extractEntities(text, previous)

  // Specific service signals always beat generic lifecycle language.
  if (explicit.pension) {
    entities.service = 'Pension'
    let subtype: Subtype = 'payment_delay'
    if (/\b(amount|less|incorrect|deducted|deduction)\b/.test(source)) subtype = 'amount_issue'
    else if (/\b(start|started|sanction)\b/.test(source) && /\b(not|never|hasn t|has not)\b/.test(source)) subtype = 'not_started'
    return {category:'pension', subtype, confidence:'high', score:10, entities}
  }

  if (explicit.licence) {
    entities.service = 'Driving licence renewal'
    return {category:'service_delay', subtype:'licence_service', confidence:'high', score:10, entities}
  }

  if (explicit.certificate) {
    entities.service = 'Certificate application'
    return {category:'service_delay', subtype:'certificate_pending', confidence:'high', score:10, entities}
  }

  if (explicit.vehicle) {
    entities.service = 'Vehicle registration or permit'
    return {category:'service_delay', subtype:'registration_service', confidence:'high', score:10, entities}
  }

  if (explicit.tax) {
    entities.service = 'Tax or GST service'
    return {category:'service_delay', subtype:'tax_service', confidence:'high', score:9, entities}
  }

  const serviceLifecycle = /\b(application|applied|pending|stuck|delayed|delay|waiting|months|weeks|roadwork|road works|pothole|garbage|waste|sanitation|street repair|drainage)\b/.test(source)
  if (serviceLifecycle) {
    // Specific public-service signals beat generic lifecycle language.
    if (explicit.roads) entities.service = 'Roads / public works'
    else if (explicit.sanitation) entities.service = 'Sanitation / waste service'
    else if (explicit.utility) entities.service = 'Electricity / utility service'
    else if (explicit.municipal) entities.service = 'Municipal service'
    else if (explicit.education) entities.service = 'Education / scholarship service'
    else if (explicit.health) entities.service = 'Public health service'
    else if (explicit.housing) entities.service = 'Housing / land service'
    else if (explicit.welfare) entities.service = 'Benefits / welfare scheme'
    else if (/\b(application|applied)\b/.test(source) && /\b(pending|stuck|delayed|delay|waiting)\b/.test(source)) {
      entities.service = 'Government application'
    }

    // A generic phrase like "residential agreement hasn't arrived" does not
    // contain enough evidence that this is a government application. Stay
    // uncertain and ask instead of forcing it into a grievance category.
    if (entities.service) {
      const localIssue = explicit.roads || explicit.sanitation || explicit.municipal
      return {category:'service_delay', subtype:'general_service', confidence:'high', score:9, entities}
    }
  }

  if (explicit.complaint) {
    if (/\b(closed|resolved|fixed|solved|still|nothing changed|didn t fix|did not fix|unresolved)\b/.test(source)) {
      entities.complaintOutcome = 'closed_unresolved'
      return {category:'complaint_lifecycle', subtype:'unsatisfactory_resolution', confidence:'high', score:9, entities}
    }
    if (/\b(no response|nobody responded|haven t heard|have not heard|not responding|waiting for response|pending)\b/.test(source)) {
      return {category:'complaint_lifecycle', subtype:'no_response', confidence:'high', score:8, entities}
    }
    return {category:'complaint_lifecycle', subtype:'no_response', confidence:'medium', score:5, entities}
  }

  if (explicit.department) {
    entities.departmentKnown = false
    return {category:'unknown_department', subtype:'department_unknown', confidence:'high', score:8, entities}
  }

  // No strong signal: do not guess.
  return {category:undefined, subtype:undefined, confidence:'low', score:0, entities}
}

export function interpret(text: string) {
  const u = understand(text)
  return { intent: intentFrom(u), confidence: Math.min(1, u.score / 10), entities: u.entities }
}

const privacy = "Please don't share sensitive information such as Aadhaar numbers, OTPs, passwords or bank details here. We don't need it to understand your issue."
const friendlyCategory = (u: Understanding) => {
  if (u.category === 'pension') return u.subtype === 'amount_issue' ? 'Pension amount issue' : u.subtype === 'not_started' ? 'Pension not started' : 'Pension payment delay'
  if (u.category === 'complaint_lifecycle') return u.subtype === 'no_response' ? 'No response to a grievance' : 'Unsatisfactory complaint resolution'
  if (u.category === 'service_delay') return 'Delayed government service'
  if (u.category === 'fallback') return 'Government service grievance'
  return 'Government service grievance'
}
const serviceName = (u: Understanding) => u.entities.service || (u.category === 'pension' ? 'pension service' : 'government service')
const intentFrom = (u: Understanding): Intent => u.subtype === 'rti' ? 'out_of_scope_rti' : u.subtype === 'emergency' ? 'out_of_scope_emergency' : u.category === 'pension' ? 'pension_payment_delay' : u.category === 'complaint_lifecycle' ? 'unsatisfactory_resolution' : u.category === 'unknown_department' ? 'unknown_department' : u.category === 'service_delay' || u.category === 'fallback' ? 'delayed_service' : 'unknown'

function answerFromContext(lastQuestion: ExpectedAnswer, text: string, previous: Entities): Entities {
  const source = normalize(text)
  const next = extractEntities(text, previous)
  if (lastQuestion === 'pension_occurrence') {
    if (/\b(yes|first|never|first time|only once)\b/.test(source)) next.occurrence = 'first'
    else if (/\b(no|again|before|happened before|repeated)\b/.test(source)) next.occurrence = 'repeated'
  }
  if (lastQuestion === 'pension_expected') {
    if (/\b(this month|this week|today|yesterday|last month|last week|more than one month ago)\b/.test(source)) next.expected = source
    if (/\b(?:august|september|october|november|december|january|february|march|april|may|june|july)\b/.test(source)) next.expected = source.match(/\b(?:august|september|october|november|december|january|february|march|april|may|june|july)\b/)?.[0]
  }
  if (lastQuestion === 'service_location' && !next.location) next.location = text.trim()
  if (lastQuestion === 'service_duration' && !next.duration) {
    if (/\b(a few weeks|few weeks|weeks|month|months|year|years|forever|ages)\b/.test(source)) next.duration = text.trim()
  }
  if (lastQuestion === 'complaint_outcome') {
    if (/closed|without addressing|didn t fix|did not fix|still|unresolved|nothing changed/.test(source)) next.complaintOutcome = 'closed_unresolved'
    else if (/response|replied|reply|addressed|came back/.test(source)) next.complaintOutcome = 'response_continued'
  }
  return next
}

function nextQuestion(u: Understanding, entities: Entities): { message: ChatMessage; expected: ExpectedAnswer } | undefined {
  if (u.category === 'pension' && !entities.occurrence) return {
    message:{role:'assistant', text:"I can help you work out the right grievance path. Is this the first time you've missed a pension payment?", options:['Yes, first missed payment','No, this has happened before'], why:'This helps distinguish a one-off delay from a recurring pension issue.'}, expected:'pension_occurrence'
  }
  if (u.category === 'pension' && !entities.expected) return {
    message:{role:'assistant', text:'When was the payment expected? You can answer in your own words — for example, “around August 5th” or “earlier this month.”', options:['This month','Last month','More than one month ago'], why:'This helps describe the delay clearly.'}, expected:'pension_expected'
  }
  if (u.category === 'service_delay' && (u.entities.service === 'Roads / public works' || u.entities.service === 'Sanitation / waste service' || u.entities.service === 'Municipal service') && !entities.location) return {
    message:{role:'assistant', text:`This sounds like a ${serviceName(u).toLowerCase()} issue. Where is the problem located? You can enter a locality, city or PIN code.`, why:'The location helps identify the local authority responsible for the service.'}, expected:'service_location'
  }
  if (u.category === 'service_delay' && !entities.duration) return {
    message:{role:'assistant', text:`Understood. It sounds like your ${serviceName(u)} has been delayed. Roughly how long has it been pending?`, why:'This helps establish whether the service has been delayed.'}, expected:'service_duration'
  }
  if (u.category === 'complaint_lifecycle' && u.subtype === 'unsatisfactory_resolution' && !entities.complaintOutcome) return {
    message:{role:'assistant', text:'I understand. Was the complaint closed without addressing the original problem, or did a response arrive but the issue continued?', options:['Closed without addressing it','A response came, but the issue continued'], why:'This helps prepare the right feedback or appeal path.'}, expected:'complaint_outcome'
  }
  return undefined
}

function makeConversation(messages: ChatMessage[], understanding: Understanding, turn: number, answers: string[], originalDescription: string, lastQuestion: ExpectedAnswer): Conversation {
  const intent = intentFrom(understanding)
  if (understanding.subtype === 'rti' || understanding.subtype === 'emergency') {
    messages.push({role:'assistant', text:understanding.subtype === 'rti' ? "RTI requests follow a different process and aren't handled through this grievance route. I can explain the distinction, but I won't submit an RTI request here." : 'This is not the right route for an emergency. Please use local emergency services for immediate help.'})
    return {intent,confidence:Math.min(1, understanding.score/10),turn,answers,messages,entities:understanding.entities,complete:true,state:'identified',understanding,originalDescription,lastQuestion:'none'}
  }
  const q = nextQuestion(understanding, understanding.entities)
  if (q) messages.push(q.message)
  else if (understanding.confidence === 'low' || !understanding.category) messages.push({
    role:'assistant',
    text:"I'm not quite sure what kind of public-service issue you're describing yet. That's okay — choose the closest option below, or select “Something else” and describe it yourself.",
    options:fallbackOptions,
    why:'These are broad starting points, not fixed categories. Your own description remains the primary source of information.'
  })
  else messages.push({role:'assistant', text:`Thanks. Based on what you've told me, this appears to be a **${friendlyCategory(understanding).toLowerCase()}**${understanding.entities.service ? ` involving ${understanding.entities.service}` : ''}. I have enough to prepare the next step.`})
  const complete = !!understanding.category && understanding.confidence !== 'low' && !q && understanding.category !== 'unknown_department'
  return {intent,confidence:Math.min(1, understanding.score/10),turn,answers,messages,entities:understanding.entities,complete,state:complete?'identified':understanding.confidence==='low'?'understanding':'clarification',understanding,originalDescription,lastQuestion:q?.expected || ((understanding.confidence === 'low' || !understanding.category) ? 'fallback_category' : 'none')}
}

export function startConversation(text: string): Conversation {
  const normalized = normalize(text)
  if (/\b(show|see|view|list|check)\b.*\b(my|existing|previous)\b.*\b(grievance|grievances|complaint|complaints|cases)\b|\bwhere\b.*\b(my|existing)\b.*\b(grievances|complaints|cases)\b/.test(normalized)) {
    return startConversationWithLLM(text, {intent:'view_grievances',confidence:.95})
  }
  const understanding = understand(text)
  const messages: ChatMessage[] = [{role:'user',text}]
  if(hasSensitive(text)) messages.push({role:'assistant',text:privacy})
  return makeConversation(messages, understanding, 0, [], text, 'none')
}

export type LocalInterpretation = { intent: 'create_grievance' | 'view_grievances' | 'track_grievance' | 'appeal' | 'escalate' | 'general_guidance'; service?: string; issue?: string; location?: string; missing?: string[]; confidence?: number; reply?: string }

const llmServiceLabels: Record<string,string> = {
  roads_public_works:'Roads / public works',
  water_drainage:'Water supply / drainage',
  sanitation_waste:'Sanitation / waste service',
  municipal_civic:'Municipal service',
  electricity_utility:'Electricity / utility service',
  driving_licence:'Driving licence renewal',
  vehicle_registration:'Vehicle registration or permit',
  pension:'Pension',
  certificate_document:'Certificate application',
  tax_property:'Tax / property tax service',
  housing_land:'Housing / land service',
  education_scholarship:'Education / scholarship service',
  health_public_health:'Public health service',
  welfare_ration:'Benefits / welfare scheme',
  employment_labour:'Employment / labour service',
  other:'Other government service'
}

export function startConversationWithLLM(text: string, ai: LocalInterpretation): Conversation {
  if (ai.intent === 'view_grievances') {
    return {intent:'view_grievances',confidence:ai.confidence ?? 0.95,turn:0,answers:[],messages:[{role:'user',text},{role:'assistant',text:ai.reply || 'Absolutely — I can take you to your existing grievances.'}],entities:{},complete:true,state:'identified',understanding:{confidence:'high',score:10,entities:{}},originalDescription:text,lastQuestion:'none'}
  }
  if (ai.intent === 'track_grievance') {
    return {intent:'track_grievance',confidence:ai.confidence ?? 0.95,turn:0,answers:[],messages:[{role:'user',text},{role:'assistant',text:ai.reply || 'Sure — I can take you to your grievance timeline.'}],entities:{},complete:true,state:'identified',understanding:{confidence:'high',score:10,entities:{}},originalDescription:text,lastQuestion:'none'}
  }
  if (ai.intent === 'appeal' || ai.intent === 'escalate') {
    return {intent:ai.intent,confidence:ai.confidence ?? 0.9,turn:0,answers:[],messages:[{role:'user',text},{role:'assistant',text:ai.reply || 'I can help with that. Open the relevant grievance to continue.'}],entities:{},complete:true,state:'identified',understanding:{confidence:'high',score:9,entities:{}},originalDescription:text,lastQuestion:'none'}
  }

  const serviceLabel = ai.service ? llmServiceLabels[ai.service] : ''
  const augmented = [text, serviceLabel, ai.issue].filter(Boolean).join(' — ')
  const understanding = understand(augmented)
  if (serviceLabel) understanding.entities.service = serviceLabel
  if (ai.location) understanding.entities.location = ai.location
  if (ai.service === 'pension') understanding.category = 'pension'
  if (ai.service && ai.service !== 'pension' && understanding.category === undefined) {
    understanding.category = 'service_delay'
    understanding.subtype = 'general_service'
    understanding.confidence = 'high'
    understanding.score = 9
  }

  // The model's missing fields are allowed to make the conversation more natural,
  // while the application's verified workflow still decides what can be submitted.
  if (ai.missing?.some(x => /location|locality|city|area|pin/i.test(x)) && !understanding.entities.location) {
    understanding.entities.location = undefined
  }
  const messages: ChatMessage[] = [{role:'user',text}]
  if(hasSensitive(text)) messages.push({role:'assistant',text:privacy})

  const required = nextQuestion(understanding, understanding.entities)
  const modelAskedSomething = /\?/.test(ai.reply || '')
  if (required) {
    // The application owns the required workflow question; the model can make
    // the wording warmer, but it cannot skip a required field.
    const textReply = ai.reply && modelAskedSomething ? ai.reply : `${ai.reply ? ai.reply + ' ' : ''}${required.message.text}`
    messages.push({...required.message, text:textReply})
  } else if (ai.reply) messages.push({role:'assistant',text:ai.reply})
  else messages.push({role:'assistant',text:`Got it. ${friendlyCategory(understanding)} is the likely route. I can help you review the details next.`})

  const needsLocation = !!required && required.expected === 'service_location'
  const needsMore = !!required
  const complete = !!understanding.category && understanding.confidence !== 'low' && !needsMore && understanding.category !== 'unknown_department'
  return {intent:ai.intent === 'create_grievance' ? intentFrom(understanding) : (ai.intent || intentFrom(understanding)),confidence:ai.confidence ?? Math.min(1,understanding.score/10),turn:0,answers:[],messages,entities:understanding.entities,complete,state:complete?'identified':'clarification',understanding,originalDescription:text,lastQuestion:required?.expected || 'none'}
}

export function continueConversationWithLLM(c: Conversation, text: string, ai: LocalInterpretation): Conversation {
  if (ai.intent === 'view_grievances' || ai.intent === 'track_grievance' || ai.intent === 'appeal' || ai.intent === 'escalate') {
    const textByIntent = ai.reply || (ai.intent === 'view_grievances' ? 'Absolutely — I can take you to your existing grievances.' : ai.intent === 'track_grievance' ? 'Sure — I can take you to your grievance timeline.' : 'I can help with that. Open the relevant grievance to continue.')
    return {...c, intent:ai.intent, confidence:ai.confidence ?? .9, turn:c.turn+1, answers:[...c.answers,text], messages:[...c.messages,{role:'user',text},{role:'assistant',text:textByIntent}], complete:true, state:'identified', lastQuestion:'none'}
  }

  const serviceLabel = ai.service ? llmServiceLabels[ai.service] : c.entities.service
  const combined = [c.originalDescription, text, ai.issue].filter(Boolean).join(' — ')
  const understanding = understand(combined, {...c.entities, ...(serviceLabel ? {service:serviceLabel} : {}), ...(ai.location ? {location:ai.location} : {})})
  if (serviceLabel) understanding.entities.service = serviceLabel
  if (ai.location) understanding.entities.location = ai.location
  if (c.understanding.category === 'complaint_lifecycle') {
    understanding.category = c.understanding.category
    understanding.subtype = c.understanding.subtype
  }
  if (!understanding.category && c.understanding.category) understanding.category = c.understanding.category
  if (!understanding.subtype && c.understanding.subtype) understanding.subtype = c.understanding.subtype
  if (serviceLabel && understanding.category === undefined) {
    understanding.category = 'service_delay'; understanding.subtype='general_service'; understanding.confidence='high'; understanding.score=9
  }

  const messages = [...c.messages, {role:'user' as const,text}]
  if (hasSensitive(text)) messages.push({role:'assistant',text:privacy})

  const q = nextQuestion(understanding,understanding.entities)
  if (q) {
    const textReply = ai.reply && /\?/.test(ai.reply) ? ai.reply : `${ai.reply ? ai.reply + ' ' : ''}${q.message.text}`
    messages.push({...q.message,text:textReply})
  } else messages.push({role:'assistant',text:ai.reply || `Thanks — I have enough to understand this. ${friendlyCategory(understanding)} is the likely route, and we can review the details before anything is submitted.`})

  const complete = !!understanding.category && understanding.confidence !== 'low' && !q && understanding.category !== 'unknown_department'
  return {...c,intent:ai.intent === 'general_guidance' || ai.intent === 'create_grievance' ? intentFrom(understanding) : ai.intent,confidence:ai.confidence ?? Math.min(1,understanding.score/10),turn:c.turn+1,answers:[...c.answers,text],messages,entities:understanding.entities,complete,state:complete?'identified':'clarification',understanding,originalDescription:c.originalDescription,lastQuestion:q?.expected || 'none'}
}

function contextualReply(c: Conversation, text: string): ChatMessage | undefined {
  const source = normalize(text)
  if (/what happens next|then what|what now|how does this work|what will happen/.test(source)) {
    return {role:'assistant', text:'Next, we can review the grievance details you have provided. After you confirm them, the service takes you through a simulated submission and gives you a grievance ID to track. You will be able to see what is happening at each stage and whether you need to act.'}
  }
  if (/why.*(ask|question)|why do you need|why are you asking/.test(source)) {
    return {role:'assistant', text:'I only ask questions that can change the next step. The aim is to avoid making you learn government categories or terminology just to lodge a grievance.'}
  }
  if (/can i track|where.*track|track.*grievance/.test(source)) {
    return {role:'assistant', text:'Yes. Once a grievance is submitted in this service, you receive a registration ID and can follow the timeline from routing and review through clarification, resolution and appeal if needed.'}
  }
  if (/which department|who handles|who will handle/.test(source)) {
    return {role:'assistant', text:'You do not need to know that before starting. Sahaay first understands the problem; the responsible authority is shown later in the grievance review and tracking steps.'}
  }
  return undefined
}

function fallbackUnderstanding(label:string, previous:Understanding): Understanding {
  const choice=fallbackChoices.find(x=>x.label===label)
  if (!choice) return previous
  return {
    category:choice.category,
    subtype:choice.subtype,
    confidence:'high',
    score:9,
    entities:{...previous.entities,service:choice.service || previous.entities.service}
  }
}
function fallbackOtherUnderstanding(text:string, previous:Understanding): Understanding {
  return {
    category:'fallback',
    subtype:'general_service',
    confidence:'medium',
    score:6,
    entities:{...previous.entities,service:'Other government service'}
  }
}


function departmentAnswer(c: Conversation, text: string): Conversation | undefined {
  if (c.understanding.category !== 'unknown_department') return undefined
  const source = normalize(text)
  if (!source || /^(which department|who handles this|i don t know|i dont know|not sure)$/.test(source)) return undefined

  const cleaned = source
    .replace(/\b(the|a|an|government|public|responsible|department|dept|office|authority)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const knownService =
    /\b(road|roads|roadwork|road works|pothole|street|footpath|drainage)\b/.test(source) ? 'Roads / public works' :
    /\b(garbage|waste|sanitation|sewage)\b/.test(source) ? 'Sanitation / waste service' :
    /\b(electricity|power|water|gas)\b/.test(source) ? 'Electricity / utility service' :
    /\b(transport|bus|vehicle|driving|licence|license)\b/.test(source) ? 'Transport service' :
    cleaned ? cleaned.replace(/\b\w/g, x => x.toUpperCase()) : 'the service you mentioned'

  const understanding: Understanding = {
    category:'service_delay',
    subtype:'general_service',
    confidence:'high',
    score:8,
    entities:{...c.entities, service:knownService, department:cleaned || undefined, departmentKnown:true}
  }

  return {
    ...c,
    turn:c.turn+1,
    answers:[...c.answers,text],
    entities:understanding.entities,
    understanding,
    intent:'delayed_service',
    confidence:.8,
    complete:false,
    state:'clarification',
    lastQuestion:'none',
    messages:[
      ...c.messages,
      {role:'user',text},
      {role:'assistant',text:`Got it — I'll use ${knownService.toLowerCase()} as the service area. What happened with the service? Tell me what happened in your own words.`}
    ]
  }
}

export function reply(c: Conversation, text: string): Conversation {
  const messages: ChatMessage[] = [...c.messages, {role:'user',text}]
  if(hasSensitive(text)) messages.push({role:'assistant',text:privacy})
  const deptReply = departmentAnswer(c, text)
  if (deptReply) return deptReply
  const direct = contextualReply(c, text)
  if (direct) {
    messages.push(direct)
    return {...c, messages, turn:c.turn+1, answers:[...c.answers,text]}
  }

  // A short acknowledgement should advance the existing conversation rather than
  // re-classifying the word “okay” against the original grievance.
  const source = normalize(text)
  const acknowledgement = /^(ok|okay|alright|all right|thanks|thank you|got it|sure|yes|yep|nope|no|not really|i don t know)$/i.test(source)
  const contextEntities = answerFromContext(c.lastQuestion, text, c.entities)

  let understanding = c.understanding
  if (c.lastQuestion === 'fallback_category') {
    const selected = fallbackChoices.find(x=>x.label===text.trim())
    if (selected) {
      understanding = fallbackUnderstanding(text.trim(), c.understanding)
      if (selected.label.startsWith('Something else')) {
        messages.push({role:'assistant', text:"That's completely fine. Describe the issue in your own words. I won't force it into a category."})
        return {...c, messages, turn:c.turn+1, answers:[...c.answers,text], entities:understanding.entities, complete:false, state:'understanding', understanding, intent:intentFrom(understanding), confidence:.5, originalDescription:c.originalDescription, lastQuestion:'fallback_category'}
      }
    } else {
      const followUp=understand(text,c.entities)
      if (followUp.confidence !== 'low') understanding={...followUp,entities:{...c.entities,...followUp.entities}}
      else understanding=fallbackOtherUnderstanding(text,c.understanding)
      const completeOther = understanding.confidence !== 'low'
      const otherMessages = completeOther
        ? [...messages, {role:'assistant' as const, text:'Thanks. I’ll keep your description as the grievance description and use the closest available public-service route without guessing a more specific department.'}]
        : messages
      return {...c, messages:otherMessages, turn:c.turn+1, answers:[...c.answers,text], entities:understanding.entities, complete:completeOther, state:completeOther?'identified':'understanding', understanding, intent:intentFrom(understanding), confidence:Math.min(1,understanding.score/10), originalDescription:text, lastQuestion:'none'}
    }
  }
  const contextualAnswer = c.lastQuestion !== 'none' ? contextEntities : c.entities

  if (c.lastQuestion !== 'none' && c.lastQuestion !== 'fallback_category') {
    // Preserve the established intent and only use the new turn to update entities.
    understanding = {...c.understanding, entities: contextualAnswer}
  } else if (c.lastQuestion === 'fallback_category') {
    // The fallback choice or free-form continuation above determines the new understanding.
  } else if (!acknowledgement) {
    const followUp = understand(text, c.entities)
    const merged = understand(`${c.originalDescription} ${text}`, {...c.entities, ...followUp.entities})
    if (c.understanding.category === 'unknown_department' && followUp.category && followUp.category !== 'unknown_department') understanding = {...followUp, entities:{...merged.entities,...followUp.entities}}
    else if (followUp.confidence !== 'low') understanding = {...merged, category:followUp.category, subtype:followUp.subtype, confidence:followUp.confidence, score:followUp.score, entities:{...merged.entities,...followUp.entities}}
    else understanding = {...c.understanding, entities:{...c.entities,...followUp.entities}}
  }

  // Once a question has been answered, ask the next relevant question or finish.
  const q = nextQuestion(understanding, understanding.entities)
  if (q) messages.push(q.message)
  else if (understanding.category === 'unknown_department' && !acknowledgement) messages.push({role:'assistant', text:"That's okay — you don't need to know the department. Tell me what happened and I'll help work out the likely grievance path."})
  else if (c.complete || c.lastQuestion === 'none') {
    const lastAssistant = [...c.messages].reverse().find(m=>m.role==='assistant')?.text
    const readyText = 'Thanks — I have enough to move forward. Your grievance path is ready to review.'
    messages.push({role:'assistant', text:lastAssistant===readyText ? 'You can review the grievance details below when you are ready. If anything is missing, tell me and I can update it.' : readyText})
  } else messages.push({role:'assistant', text:`Thanks. Based on what you've told me, this appears to be a **${friendlyCategory(understanding).toLowerCase()}**${understanding.entities.service ? ` involving ${understanding.entities.service}` : ''}. I have enough to prepare the next step.`})

  const complete = !!understanding.category && understanding.confidence !== 'low' && !q && understanding.category !== 'unknown_department'
  return {intent:intentFrom(understanding),confidence:Math.min(1,understanding.score/10),turn:c.turn+1,answers:[...c.answers,text],messages,entities:understanding.entities,complete,state:complete?'identified':understanding.confidence==='low'?'understanding':'clarification',understanding,originalDescription:c.originalDescription,lastQuestion:q?.expected || ((understanding.confidence === 'low' || !understanding.category) ? 'fallback_category' : 'none')}
}
