// The mock backend exposes the same explicit lifecycle states the UI describes.
// `action_required` is retained as a legacy alias for seeded demo records.
export type Status = 'draft' | 'submitted' | 'routed' | 'under_review' | 'clarification_required' | 'clarification_submitted' | 'delayed' | 'resolved' | 'feedback' | 'appeal_available' | 'appeal_submitted' | 'action_required'
export type Event = { title:string; date:string; detail:string; action:string; state:'done'|'current'|'upcoming'|'attention' }
export type SubmissionDetails = { fullName:string; email:string; mobile:string; state:string; district:string; address:string; referenceNumber:string }
export type Grievance = { id:string; citizenId:string; title:string; category:string; issue:string; authority:string; status:Status; expected:string; submittedAt?:string; events:Event[]; document?:boolean; feedback?:string; appealId?:string; appealReason?:string; submission?:SubmissionDetails }
export type Citizen = { id:string; name:string; email:string; phone:string; address:string; greeting:string }
export type Session = { intent:string; step:number; answers:Record<string,string>; description:string }
