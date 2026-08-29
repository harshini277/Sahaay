import type { Citizen, Grievance } from './types'

export const citizens: Citizen[] = [
 {id:'demo',name:'Demo User',email:'demo_user@gmail.com',phone:'+91 90000 00000',state:'Karnataka',district:'Bengaluru',address:'12 Star Road, Bengaluru, Karnataka',greeting:'Good morning'},
 {id:'anita',name:'Anita Sharma',email:'anita.demo@example.com',phone:'+91 90000 12345',state:'Tamil Nadu',district:'Chennai',address:'24 Lake View Road, Chennai, Tamil Nadu',greeting:'Good morning'},
 {id:'ravi',name:'Ravi Kumar',email:'ravi.demo@example.com',phone:'+91 90000 56789',state:'Maharashtra',district:'Pune',address:'8 Station Road, Pune, Maharashtra',greeting:'Hello'},
 {id:'meena',name:'Meena Iyer',email:'meena.demo@example.com',phone:'+91 90000 98765',state:'Kerala',district:'Kochi',address:'16 Temple Street, Kochi, Kerala',greeting:'Hello'}
]

const fmt=(date:Date)=>new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}).format(date).replace(',', ' ·')
const now=new Date()
const at=(daysAgo:number,hoursAgo=0)=>new Date(now.getTime()-((daysAgo*24+hoursAgo)*60*60*1000))
const base=(daysAgo:number) => {
 const submitted=at(daysAgo)
 const routed=new Date(submitted.getTime()+22*60*1000)
 const reviewed=new Date(routed.getTime()+3*60*60*1000)
 return [
  {title:'Submitted',date:fmt(submitted),detail:'Your grievance was successfully registered.',action:'Nothing needed — your grievance is safely registered.',state:'done' as const},
  {title:'Routed to responsible authority',date:fmt(routed),detail:'Your grievance was sent to the department responsible for this service.',action:'Nothing needed right now.',state:'done' as const},
  {title:'Under review',date:fmt(reviewed),detail:'The responsible grievance officer is reviewing the information you submitted.',action:'Nothing right now. We will tell you if you need to act.',state:'current' as const}
 ]
}

export const seedGrievances: Grievance[] = []
