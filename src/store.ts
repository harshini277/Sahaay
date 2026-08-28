import { seedGrievances } from './data'
import type { Grievance } from './types'
const key='sahaay-grievances'
const versionKey='sahaay-data-version'
const version='v8'
export const getGrievances=():Grievance[]=>{
  const existing=localStorage.getItem(key)
  if(localStorage.getItem(versionKey)!==version){
    localStorage.setItem(key,JSON.stringify(seedGrievances))
    localStorage.setItem(versionKey,version)
    return seedGrievances
  }
  return JSON.parse(existing||JSON.stringify(seedGrievances))
}
export const saveGrievances=(g:Grievance[])=>{localStorage.setItem(key,JSON.stringify(g));localStorage.setItem(versionKey,version)}
export const getGrievance=(id:string)=>getGrievances().find(g=>g.id===id)
export const updateGrievance=(next:Grievance)=>saveGrievances(getGrievances().map(g=>g.id===next.id?next:g))
export const addGrievance=(g:Grievance)=>saveGrievances([g,...getGrievances()])
