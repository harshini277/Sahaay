export type AuthorityContact = {
  jurisdiction: string
  department: string
  role: string
  name: string
  office: string
  phone: string
  email: string
  responseWindow: string
  escalationRole: string
  escalationName: string
  escalationOffice: string
  sourceLabel: string
  sourceUrl: string
  synthetic: boolean
}

// Demo directory only. Names, phone numbers and email addresses are synthetic
// so the deployed demo never presents invented people as real government officials.
const demoDirectory: Record<string, AuthorityContact> = {
  'Tamil Nadu|Chennai': {
    jurisdiction:'Greater Chennai / Chennai district', department:'Municipal roads & public works', role:'Zone-level Executive Engineer', name:'Arun Prakash', office:'Sahaay Demo — Chennai Zone Engineering Office', phone:'+91 90000 11001', email:'chennai.roads@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Chief Engineer / municipal appellate authority', escalationName:'Meera Krishnan', escalationOffice:'Sahaay Demo — Chennai Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://chennaicorporation.gov.in/', synthetic:true
  },
  'Maharashtra|Pune': {
    jurisdiction:'Pune district', department:'Municipal services & public works', role:'Ward-level Executive Engineer', name:'Vikram Deshmukh', office:'Sahaay Demo — Pune Ward Engineering Office', phone:'+91 90000 11002', email:'pune.services@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Municipal Chief Engineer / appellate authority', escalationName:'Neha Kulkarni', escalationOffice:'Sahaay Demo — Pune Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://www.pmc.gov.in/', synthetic:true
  },
  'Karnataka|Bengaluru': {
    jurisdiction:'Bengaluru district', department:'Civic services & public works', role:'Ward-level Assistant Executive Engineer', name:'Rohan Rao', office:'Sahaay Demo — Bengaluru Civic Services Office', phone:'+91 90000 11003', email:'bengaluru.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Executive Engineer / grievance appellate authority', escalationName:'Ananya Iyer', escalationOffice:'Sahaay Demo — Bengaluru Civic Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://site.bbmp.gov.in/', synthetic:true
  },
  'Delhi|Delhi': {
    jurisdiction:'Delhi', department:'Municipal / civic service', role:'Area Executive Engineer', name:'Amit Verma', office:'Sahaay Demo — Delhi Civic Services Office', phone:'+91 90000 11004', email:'delhi.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Chief Engineer / appellate authority', escalationName:'Priya Bhatia', escalationOffice:'Sahaay Demo — Delhi Civic Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://mcdonline.nic.in/', synthetic:true
  },
  'West Bengal|Kolkata': {
    jurisdiction:'Kolkata district', department:'Municipal roads & civic services', role:'Borough Executive Engineer', name:'Sourav Sen', office:'Sahaay Demo — Kolkata Borough Engineering Office', phone:'+91 90000 11005', email:'kolkata.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Chief Municipal Engineer / appellate authority', escalationName:'Ritu Banerjee', escalationOffice:'Sahaay Demo — Kolkata Civic Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://www.kmcgov.in/', synthetic:true
  },
  'Telangana|Hyderabad': {
    jurisdiction:'Hyderabad district', department:'Municipal roads & civic services', role:'Circle Executive Engineer', name:'Karthik Reddy', office:'Sahaay Demo — Hyderabad Civic Services Office', phone:'+91 90000 11006', email:'hyderabad.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Chief Engineer / appellate authority', escalationName:'Lavanya Rao', escalationOffice:'Sahaay Demo — Hyderabad Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://www.ghmc.gov.in/', synthetic:true
  },
  'Kerala|Thiruvananthapuram': {
    jurisdiction:'Thiruvananthapuram district', department:'Municipal civic services', role:'Municipal Engineering Officer', name:'Nikhil Menon', office:'Sahaay Demo — Thiruvananthapuram Civic Services Office', phone:'+91 90000 11007', email:'tvpm.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Municipal Secretary / appellate authority', escalationName:'Asha Nair', escalationOffice:'Sahaay Demo — Kerala Municipal Services Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://lsgkerala.gov.in/', synthetic:true
  },
  'Gujarat|Ahmedabad': {
    jurisdiction:'Ahmedabad district', department:'Municipal roads & civic services', role:'Ward Executive Engineer', name:'Dhruv Shah', office:'Sahaay Demo — Ahmedabad Ward Engineering Office', phone:'+91 90000 11008', email:'ahmedabad.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'City Engineer / appellate authority', escalationName:'Isha Patel', escalationOffice:'Sahaay Demo — Ahmedabad Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://ahmedabadcity.gov.in/', synthetic:true
  },
  'Rajasthan|Jaipur': {
    jurisdiction:'Jaipur district', department:'Municipal roads & civic services', role:'Zone Executive Engineer', name:'Manish Sharma', office:'Sahaay Demo — Jaipur Zone Engineering Office', phone:'+91 90000 11009', email:'jaipur.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Chief Engineer / appellate authority', escalationName:'Kavita Joshi', escalationOffice:'Sahaay Demo — Jaipur Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://jaipurmc.org/', synthetic:true
  },
  'Uttar Pradesh|Lucknow': {
    jurisdiction:'Lucknow district', department:'Civic services & public works', role:'Zone Executive Engineer', name:'Aditya Singh', office:'Sahaay Demo — Lucknow Zone Engineering Office', phone:'+91 90000 11010', email:'lucknow.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Chief Engineer / appellate authority', escalationName:'Shalini Mishra', escalationOffice:'Sahaay Demo — Lucknow Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://lmc.up.nic.in/', synthetic:true
  },
  'Madhya Pradesh|Bhopal': {
    jurisdiction:'Bhopal district', department:'Municipal roads & civic services', role:'Zone Executive Engineer', name:'Rahul Tiwari', office:'Sahaay Demo — Bhopal Zone Engineering Office', phone:'+91 90000 11011', email:'bhopal.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Chief Engineer / appellate authority', escalationName:'Pooja Soni', escalationOffice:'Sahaay Demo — Bhopal Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://www.bhopalmunicipal.com/', synthetic:true
  },
  'Odisha|Bhubaneswar': {
    jurisdiction:'Bhubaneswar district', department:'Municipal roads & civic services', role:'Ward Executive Engineer', name:'Siddharth Das', office:'Sahaay Demo — Bhubaneswar Ward Engineering Office', phone:'+91 90000 11012', email:'bhubaneswar.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'City Engineer / appellate authority', escalationName:'Madhuri Mohanty', escalationOffice:'Sahaay Demo — Bhubaneswar Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://www.bmc.gov.in/', synthetic:true
  },
  'Bihar|Patna': {
    jurisdiction:'Patna district', department:'Municipal roads & civic services', role:'Ward Executive Engineer', name:'Abhishek Kumar', office:'Sahaay Demo — Patna Ward Engineering Office', phone:'+91 90000 11013', email:'patna.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Chief Engineer / appellate authority', escalationName:'Rashmi Sinha', escalationOffice:'Sahaay Demo — Patna Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://pmc.bihar.gov.in/', synthetic:true
  },
  'Punjab|Amritsar': {
    jurisdiction:'Amritsar district', department:'Municipal roads & civic services', role:'Zone Executive Engineer', name:'Harpreet Singh', office:'Sahaay Demo — Amritsar Zone Engineering Office', phone:'+91 90000 11014', email:'amritsar.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Chief Engineer / appellate authority', escalationName:'Simran Kaur', escalationOffice:'Sahaay Demo — Amritsar Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://amritsarcorp.com/', synthetic:true
  },
  'Assam|Guwahati': {
    jurisdiction:'Guwahati district', department:'Municipal roads & civic services', role:'Ward Executive Engineer', name:'Partha Deka', office:'Sahaay Demo — Guwahati Ward Engineering Office', phone:'+91 90000 11015', email:'guwahati.civic@demo.sahaay.in', responseWindow:'2–7 working days', escalationRole:'Chief Engineer / appellate authority', escalationName:'Mitali Bora', escalationOffice:'Sahaay Demo — Guwahati Municipal Engineering Directorate', sourceLabel:'Demo authority directory', sourceUrl:'https://gmc.assam.gov.in/', synthetic:true
  }
}

const stateFallback: Record<string, AuthorityContact> = {
  'Tamil Nadu': demoDirectory['Tamil Nadu|Chennai'], 'Maharashtra': demoDirectory['Maharashtra|Pune'], 'Karnataka': demoDirectory['Karnataka|Bengaluru'], 'Telangana': demoDirectory['Telangana|Hyderabad'], 'Kerala': demoDirectory['Kerala|Thiruvananthapuram'], 'Gujarat': demoDirectory['Gujarat|Ahmedabad'], 'Rajasthan': demoDirectory['Rajasthan|Jaipur'], 'Uttar Pradesh': demoDirectory['Uttar Pradesh|Lucknow'], 'Madhya Pradesh': demoDirectory['Madhya Pradesh|Bhopal'], 'Odisha': demoDirectory['Odisha|Bhubaneswar'], 'Bihar': demoDirectory['Bihar|Patna'], 'Punjab': demoDirectory['Punjab|Amritsar'], 'Assam': demoDirectory['Assam|Guwahati'], 'Delhi': demoDirectory['Delhi|Delhi'], 'West Bengal': demoDirectory['West Bengal|Kolkata']
}

const indiaStates = ['Andhra Pradesh','Arunachal Pradesh','Chhattisgarh','Goa','Haryana','Himachal Pradesh','Jharkhand','Manipur','Meghalaya','Mizoram','Nagaland','Sikkim','Tripura','Uttarakhand','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry']

export function authorityFor(state?:string, district?:string, service?:string): AuthorityContact {
  const s=(state||'').trim()
  const d=(district||'').trim()
  const exact=demoDirectory[`${s}|${d}`]
  const base=exact || stateFallback[s]
  if(base) return service && /pension|licence|license|certificate|tax|vehicle|registration/i.test(service)
    ? {...base, department: service}
    : base
  const safeState = indiaStates.includes(s) ? s : (s || 'India')
  return {
    jurisdiction:d?`${d} district, ${safeState}`:`${safeState} local jurisdiction`,
    department:service||'Public service',
    role:'Local grievance officer',
    name:'Riya Malhotra',
    office:`Sahaay Demo — ${safeState} Public Service Office`,
    phone:'+91 90000 11999',
    email:'local.authority@demo.sahaay.in',
    responseWindow:'2–7 working days',
    escalationRole:'District grievance appellate authority',
    escalationName:'Vivek Rao',
    escalationOffice:`Sahaay Demo — ${safeState} District Grievance Office`,
    sourceLabel:'Demo authority directory',
    sourceUrl:'https://pgportal.gov.in/',
    synthetic:true
  }
}
