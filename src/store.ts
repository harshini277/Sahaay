import { seedGrievances } from './data'
import type { Grievance } from './types'
const key='sahaay-grievances'
const versionKey='sahaay-data-version'
const version='v9'
export const getGrievances=():Grievance[]=>{
  const existing=localStorage.getItem(key)
  if(localStorage.getItem(versionKey)!==version){
    localStorage.setItem(key,JSON.stringify(seedGrievances))
    localStorage.setItem(versionKey,version)
    return seedGrievances
  }
  const parsed:Grievance[]=JSON.parse(existing||JSON.stringify(seedGrievances));
  // A completed grievance is one where the citizen has confirmed resolution and submitted a rating.
  // Normalise older saved records so they cannot reappear as active after a refresh.
  const normalised=parsed.map(g=>typeof g.rating==='number' && g.status!=='appeal_submitted' ? {...g,status:'feedback' as const} : g);
  if(JSON.stringify(normalised)!==JSON.stringify(parsed)) localStorage.setItem(key,JSON.stringify(normalised));
  return normalised
}
export const saveGrievances=(g:Grievance[])=>{localStorage.setItem(key,JSON.stringify(g));localStorage.setItem(versionKey,version)}
export const getGrievance=(id:string)=>getGrievances().find(g=>g.id===id)
export const updateGrievance=(next:Grievance)=>saveGrievances(getGrievances().map(g=>g.id===next.id?next:g))
export const addGrievance=(g:Grievance)=>saveGrievances([g,...getGrievances()])
