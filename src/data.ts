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

export const seedGrievances: Grievance[] = [
 {id:'PG-2026-09001-001',citizenId:'demo',title:'Pension payment delay',category:'Pension grievance',issue:'Delayed / missing pension payment',authority:'Pension Disbursing Authority',status:'under_review',expected:'15 Sep 2026',events:base(1)},
 {id:'PG-2026-08425-017',citizenId:'anita',title:'Pension payment delay',category:'Pension grievance',issue:'Delayed / missing pension payment',authority:'Pension Disbursing Authority',status:'under_review',expected:'15 Sep 2026',events:[...base(4),{title:'Response expected',date:'15 Sep 2026',detail:'The department is expected to send a response by this date.',action:'Nothing needed unless the date passes.',state:'upcoming' as const},{title:'Resolution',date:'Waiting',detail:'A department response will appear here.',action:'You can give feedback when a response arrives.',state:'upcoming' as const}]},
 {id:'PG-2026-08421-044',citizenId:'ravi',title:'Application pending',category:'Service delivery grievance',issue:'Delayed service',authority:'District Service Centre',status:'action_required',expected:'08 Sep 2026',events:[...base(2),{title:'Information needed',date:fmt(at(1)),detail:'The department needs one additional document to continue reviewing your grievance.',action:'Provide your application acknowledgement or a supporting record.',state:'attention' as const},{title:'Response expected',date:'By 08 Sep 2026',detail:'Review resumes after you provide information.',action:'Action required from you first.',state:'upcoming' as const}]},
 {id:'PG-2026-07211-309',citizenId:'meena',title:'Previous resolution did not solve issue',category:'Existing grievance',issue:'Unsatisfactory resolution',authority:'State Service Department',status:'resolved',expected:'Resolved',events:[...base(8),{title:'Resolution received',date:fmt(at(2)),detail:'The department marked this grievance resolved. You told us the problem remains.',action:'You may ask for the resolution to be reviewed.',state:'current' as const}]}
]
