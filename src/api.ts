import {citizens} from './data'
import {addGrievance,getGrievance,updateGrievance} from './store'
import {reply,startConversation,startConversationWithLLM,continueConversationWithLLM} from './conversation'
import {chatWithLocalLLM,interpretWithLocalLLM,warmupLocalLLM} from './llm'
import type {Conversation} from './conversation'
import type {Citizen,Grievance} from './types'

// A deliberately small in-browser mock API. Every screen calls these functions
// instead of selecting a hard-coded screen; replace each method with a matching
// Vercel route when connecting a real secure backend.
const later = <T,>(value:T) => new Promise<T>(resolve => setTimeout(() => resolve(value), 180))
const persist = (next:Grievance) => { updateGrievance(next); return later(next) }
export const api = {
  chat: {
    // The deterministic path is immediate so a citizen is never blocked by
    // first-time WebGPU/model loading. The LLM enhancement runs separately.
    start: async (text:string) => later(startConversation(text)),
    reply: async (c:Conversation,text:string) => later(reply(c,text)),
    enhanceStart: async (text:string) => {
      const ai = await interpretWithLocalLLM(text)
      if (!ai.reply && !ai.issue && !ai.service) return null
      return startConversationWithLLM(text, ai)
    },
    warmup: warmupLocalLLM,
    enhanceReply: async (c:Conversation,text:string) => {
      const history = c.messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({role:m.role as 'user'|'assistant', content:m.text}))
      history.push({role:'user',content:text})
      const ai = await chatWithLocalLLM(history)
      if (!ai.reply && !ai.issue && !ai.service) return null
      return continueConversationWithLLM(c,text,ai)
    }
  },
  auth: {
    register:(input:{name:string;email:string;phone:string}) => { const id=`citizen-${Date.now()}`; const citizen:Citizen={id,name:input.name,email:input.email,phone:input.phone,address:'',greeting:'Welcome'}; citizens.push(citizen); return later(citizen) },
    login:(email:string,password:string) => later((email==='demo_user@gmail.com' && password==='demo166') ? citizens.find(c=>c.id==='demo') : (password==='Citizen2026!' ? citizens.find(c=>c.email===email) : undefined)),
  },
  grievances: {
    get:(id:string) => later(getGrievance(id)),
    create:(g:Grievance) => { addGrievance(g); return later(g) },
    update:persist,
    clarification:(g:Grievance) => persist({...g,status:'clarification_submitted'}),
    reminder:(g:Grievance) => persist({...g,status:'under_review'}),
    feedback:(g:Grievance,feedback:string) => persist({...g,status:feedback==='No, my problem remains'?'appeal_available':'feedback',feedback}),
    appeal:(g:Grievance,appealId:string) => persist({...g,status:'appeal_submitted',appealId}),
  },
}
