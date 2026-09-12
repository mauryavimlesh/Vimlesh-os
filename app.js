const KEY="vimlesh-os-v1";
const defaultHabits=[
  {id:"workout",name:"Workout",time:"45–60 min",icon:"🏋️"},
  {id:"study",name:"Study",time:"3+ hours",icon:"📚"},
  {id:"english",name:"English Practice",time:"30 min",icon:"🗣️"},
  {id:"reading",name:"Read",time:"20 pages",icon:"📖"},
  {id:"sleep",name:"Sleep on time",time:"Before 11:00 PM",icon:"🌙"}
];
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{habits:defaultHabits,days:{},goals:[]};
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
  for(let d=1;d<=days;d++){const k=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,done=state.habits.length&&state.habits.every(h=>isDone(h.id,k));html+=`<div class="cal-day ${done?"done":""}" data-date="${k}">${d}</div>`}
  el.innerHTML=html+"</div>";
  el.querySelectorAll(".cal-day[data-date]").forEach(d=>d.onclick=()=>showCalendarDetail(d.dataset.date));
}
function showCalendarDetail(dateStr){
  const dayData_=dayData(dateStr);
  const completed=state.habits.filter(h=>isDone(h.id,dateStr)).length;
  const total=state.habits.length;
  const pct_=total?Math.round(completed/total*100):0;
  document.getElementById("detailDate").textContent=new Date(dateStr).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  document.getElementById("detailCompletion").textContent=pct_+"%";
  document.getElementById("detailCompleted").textContent=completed+"/"+total;
  const habitsHtml=state.habits.map(h=>`<div class="detail-habit ${isDone(h.id,dateStr)?"done":""}"><span>${h.icon} ${escapeHtml(h.name)}</span><span class="check-mark">${isDone(h.id,dateStr)?"✓":""}</span></div>`).join("");
  document.getElementById("detailHabits").innerHTML=habitsHtml;
  document.getElementById("calendarDetail").classList.remove("hidden");
}
function renderProgress(){
  document.getElementById("bestStreak").textContent=bestStreak();
  document.getElementById("totalCompletions").textContent=totalCompletions();
  const chart=document.getElementById("barChart"), vals=[];
  for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);vals.push({k,p:state.habits.length?Math.round(state.habits.filter(h=>isDone(h.id,k)).length/state.habits.length*100):0,label:new Date(k).toLocaleDateString("en",{month:"short",day:"numeric"})})}
  chart.innerHTML=vals.map(v=>`<div class="bar" style="height:${Math.max(8,v.p)}%"><small>${v.label}</small></div>`).join("");
}
function renderStatistics(){
  document.getElementById("overallCompletion").textContent=pct()+"%";
  document.getElementById("currentStreak").textContent=streak()+" 🔥";
  document.getElementById("bestStreakStat").textContent=bestStreak();
  document.getElementById("totalCompletedStat").textContent=totalCompletions();
  renderProgress();
}
function renderHabits(){
  const list=document.getElementById("habitsList");
  if(state.habits.length===0){
    document.getElementById("emptyHabitsManage").classList.remove("hidden");
    list.innerHTML="";
  }else{
    document.getElementById("emptyHabitsManage").classList.add("hidden");
    list.innerHTML=state.habits.map(h=>`<div class="habit-item card">
      <div style="display:flex;align-items:center;gap:12px;flex:1;">
        <span style="font-size:20px;">${h.icon}</span>
        <div>
          <div style="font-weight:500;">${escapeHtml(h.name)}</div>
          <div style="font-size:12px;color:var(--muted);">${escapeHtml(h.time)}</div>
        </div>
      </div>
      <button class="habit-action" data-id="${h.id}" data-action="delete" title="Delete habit">🗑</button>
    </div>`).join("");
    list.querySelectorAll(".habit-action").forEach(b=>b.onclick=()=>{
      const id=b.dataset.id;
      if(confirm("Delete this habit?")){
        state.habits=state.habits.filter(h=>h.id!==id);
        save();
        render();
        renderHabits();
      }
    });
  }
}
function showView(view){
  document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));
  document.getElementById("homeRoutine").classList.toggle("hidden",view!=="home");
  document.getElementById("calendarView").classList.toggle("hidden",view!=="calendar");
  document.getElementById("moreView").classList.toggle("hidden",view!=="more");
  document.getElementById("statisticsView").classList.toggle("hidden",view!=="statistics");
  document.getElementById("habitsView").classList.toggle("hidden",view!=="habits");
  document.getElementById("goalsView").classList.toggle("hidden",view!=="goals");
  document.getElementById("habitDetailView").classList.toggle("hidden",view!=="habitDetail");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  document.querySelector(".hero").classList.toggle("hidden",view!=="home");
  document.querySelector(".score-grid").classList.toggle("hidden",view!=="home");
  document.querySelector(".add-fab").classList.toggle("hidden",view!=="home");
  if(view==="statistics")renderStatistics();
  if(view==="habits")renderHabits();
}
function goBack(){
  showView("more");
  document.getElementById("calendarDetail").classList.add("hidden");
}
function render(){renderHome();renderCalendar();renderProgress()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
document.getElementById("todayDate").textContent=new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showView(b.dataset.view));
document.getElementById("addBtn").onclick=()=>document.getElementById("habitModal").classList.remove("hidden");
document.getElementById("closeModal").onclick=()=>document.getElementById("habitModal").classList.add("hidden");
document.getElementById("addHabitFromEmpty").onclick=()=>document.getElementById("habitModal").classList.remove("hidden");
document.getElementById("addHabitFromManage").onclick=()=>document.getElementById("habitModal").classList.remove("hidden");
document.getElementById("saveHabit").onclick=()=>{
 const name=document.getElementById("habitName").value.trim(), time=document.getElementById("habitTime").value.trim();
 if(!name)return;
 state.habits.push({id:"h"+Date.now(),name,time:time||"Daily",icon:["◉","✦","◇","○","△"][state.habits.length%5]});
 save();document.getElementById("habitName").value="";document.getElementById("habitTime").value="";document.getElementById("habitModal").classList.add("hidden");render();
};
document.querySelectorAll(".more-item").forEach(btn=>btn.onclick=()=>{
  const action=btn.dataset.action;
  switch(action){
    case "statistics":showView("statistics");break;
    case "habits":showView("habits");break;
    case "goals":showView("goals");break;
    case "export":exportData();break;
    case "import":document.getElementById("importModal").classList.remove("hidden");break;
    case "reset":if(confirm("Clear today's completions?")){state.days[today()]={};save();render();alert("Today reset.");}break;
    case "clear":if(confirm("Clear all routines and history?")){localStorage.removeItem(KEY);location.reload();}break;
  }
});
document.getElementById("backFromStats").onclick=()=>goBack();
document.getElementById("backFromHabits").onclick=()=>goBack();
document.getElementById("backFromGoals").onclick=()=>goBack();
document.getElementById("backFromHabitDetail").onclick=()=>goBack();
document.getElementById("addGoalBtn").onclick=()=>document.getElementById("goalModal").classList.remove("hidden");
document.getElementById("closeGoalModal").onclick=()=>document.getElementById("goalModal").classList.add("hidden");
document.getElementById("goalForm").onsubmit=(e)=>{
  e.preventDefault();
  const name=document.getElementById("goalName").value.trim();
  const target=document.getElementById("goalTarget").value;
  const unit=document.getElementById("goalUnit").value.trim();
  if(!name||!target)return;
  if(!state.goals)state.goals=[];
  state.goals.push({id:"g"+Date.now(),name,target:parseInt(target),unit:unit||"units",progress:0,createdAt:new Date().toISOString()});
  save();
  document.getElementById("goalName").value="";
  document.getElementById("goalTarget").value="";
  document.getElementById("goalUnit").value="";
  document.getElementById("goalModal").classList.add("hidden");
  renderGoals();
};
function renderGoals(){
  const list=document.getElementById("goalsList");
  if(!state.goals||state.goals.length===0){
    document.getElementById("emptyGoals").classList.remove("hidden");
    list.innerHTML="";
  }else{
    document.getElementById("emptyGoals").classList.add("hidden");
    list.innerHTML=state.goals.map(g=>`<div class="goal-item card">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
        <div><strong>${escapeHtml(g.name)}</strong></div>
        <button class="goal-delete" data-id="${g.id}" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;">✕</button>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:8px;">${g.progress}/${g.target} ${escapeHtml(g.unit)}</div>
      <div style="display:flex;gap:8px;">
        <button class="goal-progress" data-id="${g.id}" style="flex:1;padding:8px;background:var(--accent);color:#0b0b0d;border:none;border-radius:8px;cursor:pointer;font-size:12px;">+1</button>
      </div>
    </div>`).join("");
    list.querySelectorAll(".goal-delete").forEach(b=>b.onclick=()=>{
      const id=b.dataset.id;
      state.goals=state.goals.filter(g=>g.id!==id);
      save();
      renderGoals();
    });
    list.querySelectorAll(".goal-progress").forEach(b=>b.onclick=()=>{
      const id=b.dataset.id;
      const goal=state.goals.find(g=>g.id===id);
      if(goal&&goal.progress<goal.target){
        goal.progress++;
        save();
        renderGoals();
      }
    });
  }
}
document.getElementById("closeImportModal").onclick=()=>document.getElementById("importModal").classList.add("hidden");
document.getElementById("importCancel").onclick=()=>document.getElementById("importModal").classList.add("hidden");
document.getElementById("importForm").onsubmit=(e)=>{
  e.preventDefault();
  try{
    const data=JSON.parse(document.getElementById("importData").value);
    if(data.habits&&data.days){
      state=data;
      if(!state.goals)state.goals=[];
      save();
      document.getElementById("importData").value="";
      document.getElementById("importModal").classList.add("hidden");
      render();
      alert("Data imported successfully!");
      showView("home");
    }else{
      alert("Invalid data format.");
    }
  }catch(err){
    alert("Invalid JSON.");
  }
};
function exportData(){
  const json=JSON.stringify(state,null,2);
  const blob=new Blob([json],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="vimlesh-os-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}
render();showView("home");
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
