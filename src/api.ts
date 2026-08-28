import {citizens} from './data'
import {addGrievance,getGrievance,updateGrievance} from './store'
import {reply,startConversation} from './conversation'
import type {Conversation} from './conversation'
import type {Citizen,Grievance} from './types'

// A deliberately small in-browser mock API. Every screen calls these functions
// instead of selecting a hard-coded screen; replace each method with a matching
// Vercel route when connecting a real secure backend.
const later = <T,>(value:T) => new Promise<T>(resolve => setTimeout(() => resolve(value), 180))
const persist = (next:Grievance) => { updateGrievance(next); return later(next) }
export const api = {
  chat: { start:(text:string) => later(startConversation(text)), reply:(c:Conversation,text:string) => later(reply(c,text)) },
  auth: {
    register:(input:{name:string;email:string;phone:string}) => { const id=`citizen-${Date.now()}`; const citizen:Citizen={id,name:input.name,email:input.email,phone:input.phone,greeting:'Welcome'}; citizens.push(citizen); return later(citizen) },
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
