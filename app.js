const KEY="vimlesh-os-v1";
const defaultHabits=[
  {id:"workout",name:"Workout",time:"45–60 min",icon:"🏋️"},
  {id:"study",name:"Study",time:"3+ hours",icon:"📚"},
  {id:"english",name:"English Practice",time:"30 min",icon:"🗣️"},
  {id:"reading",name:"Read",time:"20 pages",icon:"📖"},
  {id:"sleep",name:"Sleep on time",time:"Before 11:00 PM",icon:"🌙"}
];
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{habits:defaultHabits,days:{}};
const today=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function dayData(d=today()){if(!state.days[d])state.days[d]={};return state.days[d]}
function isDone(id,d=today()){return !!dayData(d)[id]}
function toggle(id){const d=dayData();d[id]=!d[id];if(!d[id])delete d[id];save();render()}
function pct(){const total=state.habits.length;if(!total)return 0;return Math.round(state.habits.filter(h=>isDone(h.id)).length/total*100)}
function streak(){
  let n=0, d=new Date();
  while(true){const key=d.toISOString().slice(0,10);if(state.habits.length && state.habits.every(h=>isDone(h.id,key))){n++;d.setDate(d.getDate()-1)}else break}
  return n
}
function bestStreak(){
  let best=0, run=0;
  const keys=Object.keys(state.days).sort();
  for(const k of keys){if(state.habits.length && state.habits.every(h=>isDone(h.id,k)))run++;else run=0;best=Math.max(best,run)}
  return best
}
function totalCompletions(){return Object.values(state.days).reduce((a,d)=>a+Object.values(d).filter(Boolean).length,0)}
function renderHome(){
  const p=pct(), done=state.habits.filter(h=>isDone(h.id)).length;
  document.getElementById("progressPct").textContent=p+"%";
  document.getElementById("progressRing").style.setProperty("--p",(p*3.6)+"deg");
  document.getElementById("doneCount").textContent=done;
  document.getElementById("totalCount").textContent=state.habits.length;
  document.getElementById("streakCount").textContent=streak();
  document.getElementById("completeLabel").textContent=p+"% complete";
  const list=document.getElementById("habitList");
  list.innerHTML=state.habits.map(h=>`<div class="habit ${isDone(h.id)?"done":""}">
    <div class="habit-icon">${h.icon}</div><div class="habit-info"><div class="habit-name">${escapeHtml(h.name)}</div><div class="habit-time">${escapeHtml(h.time)}</div></div>
    <button class="check" data-id="${h.id}" aria-label="Complete ${escapeHtml(h.name)}">✓</button></div>`).join("");
  list.querySelectorAll(".check").forEach(b=>b.onclick=()=>toggle(b.dataset.id));
}
function renderCalendar(){
  const el=document.getElementById("calendar"), now=new Date(), y=now.getFullYear(), m=now.getMonth();
  const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate();
  const names=["S","M","T","W","T","F","S"];
  let html=`<div class="cal-head"><b>${now.toLocaleString("en",{month:"long"})} ${y}</b><span class="eyebrow">MONTH VIEW</span></div><div class="cal-grid">${names.map(x=>`<div class="cal-day label">${x}</div>`).join("")}`;
  for(let i=0;i<first;i++)html+=`<div class="cal-day"></div>`;
  for(let d=1;d<=days;d++){const k=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,done=state.habits.length&&state.habits.every(h=>isDone(h.id,k));html+=`<div class="cal-day ${done?"done":""} ${k===today()?"today":""}">${d}</div>`}
  el.innerHTML=html+"</div>";
}
function renderProgress(){
  document.getElementById("bestStreak").textContent=bestStreak();
  document.getElementById("totalCompletions").textContent=totalCompletions();
  const chart=document.getElementById("barChart"), vals=[];
  for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);vals.push({k,p:state.habits.length?Math.round(state.habits.filter(h=>isDone(h.id,k)).length/state.habits.length*100):0,label:d.getDate()})}
  chart.innerHTML=vals.map(v=>`<div class="bar" style="height:${Math.max(8,v.p)}%"><small>${v.label}</small></div>`).join("");
}
function showView(view){
  document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));
  document.getElementById("habitList").closest("section")?.classList.remove("hidden");
  if(view==="calendar"){document.getElementById("calendarView").classList.remove("hidden");document.getElementById("habitList").parentElement.classList.add("hidden")}
  else if(view==="progress"){document.getElementById("progressView").classList.remove("hidden");document.getElementById("habitList").parentElement.classList.add("hidden")}
  else if(view==="more"){document.getElementById("moreView").classList.remove("hidden");document.getElementById("habitList").parentElement.classList.add("hidden")}
  else document.getElementById("habitList").parentElement.classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  document.querySelector(".hero").classList.toggle("hidden",view!=="home");
  document.querySelector(".score-grid").classList.toggle("hidden",view!=="home");
  document.querySelector(".add-fab").classList.toggle("hidden",view!=="home");
}
function render(){renderHome();renderCalendar();renderProgress()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
document.getElementById("todayDate").textContent=new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showView(b.dataset.view));
document.getElementById("addBtn").onclick=()=>document.getElementById("habitModal").classList.remove("hidden");
document.getElementById("closeModal").onclick=()=>document.getElementById("habitModal").classList.add("hidden");
document.getElementById("saveHabit").onclick=()=>{
 const name=document.getElementById("habitName").value.trim(), time=document.getElementById("habitTime").value.trim();
 if(!name)return;
 state.habits.push({id:"h"+Date.now(),name,time:time||"Daily",icon:["◉","✦","◇","○","△"][state.habits.length%5]});
 save();document.getElementById("habitName").value="";document.getElementById("habitTime").value="";document.getElementById("habitModal").classList.add("hidden");render();
};
document.getElementById("resetBtn").onclick=()=>{state.days[today()]={};save();render()};
document.getElementById("clearData").onclick=()=>{if(confirm("Clear all routines and history?")){localStorage.removeItem(KEY);location.reload()}};
render();showView("home");
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
