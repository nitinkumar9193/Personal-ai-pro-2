const $ = (s) => document.querySelector(s);
const messagesEl = $("#messages"), promptEl = $("#prompt"), welcome = $("#welcome");
let chats = [], current = [], busy = false;

function renderHistory(){
  const box=$("#history"); box.innerHTML="";
  if(!chats.length){box.innerHTML='<p class="muted">Your chats appear here.</p>';return;}
  chats.slice().reverse().forEach((chat,i)=>{
    const b=document.createElement("button"); b.textContent="▸ "+(chat.title||"New chat");
    b.onclick=()=>{current=chat.messages.slice();renderMessages();}; box.appendChild(b);
  });
}
function addMessage(role,content){
  const row=document.createElement("div"); row.className="message "+role;
  const badge=document.createElement("div"); badge.className="badge"; badge.textContent=role==="user"?"Y":"✦";
  const bubble=document.createElement("div"); bubble.className="bubble"; bubble.textContent=content;
  row.append(badge,bubble); messagesEl.appendChild(row); messagesEl.scrollTop=messagesEl.scrollHeight;
}
function renderMessages(){
  messagesEl.innerHTML=""; welcome.classList.toggle("hidden",current.length>0);
  current.forEach(m=>addMessage(m.role==="assistant"?"assistant":"user",m.content));
}
function saveChat(){
  if(!current.length)return;
  const title=current.find(m=>m.role==="user")?.content.slice(0,34)||"New chat";
  const existing=chats.findIndex(c=>c.id===window.activeChat);
  const chat={id:window.activeChat||Date.now(),title,messages:current.slice()};
  if(existing>=0)chats[existing]=chat;else chats.push(chat);
  window.activeChat=chat.id; renderHistory();
}
async function send(text){
  text=(text||"").trim(); if(!text||busy)return;
  current.push({role:"user",content:text}); renderMessages(); saveChat(); promptEl.value="";
  busy=true;$("#sendBtn").disabled=true;addMessage("assistant","सोच रहा हूँ…");
  const placeholder=messagesEl.lastElementChild;
  try{
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:current})});
    const data=await r.json(); if(!r.ok)throw new Error(data.error||"Request failed");
    current.push({role:"assistant",content:data.reply||"No reply"}); placeholder.querySelector(".bubble").textContent=data.reply||"No reply"; saveChat();
  }catch(e){placeholder.querySelector(".bubble").textContent="Error: "+e.message;}
  finally{busy=false;$("#sendBtn").disabled=false;promptEl.focus();}
}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();send(promptEl.value);});
promptEl.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(promptEl.value);}});
document.querySelectorAll(".suggestion").forEach(b=>b.addEventListener("click",()=>send(b.dataset.prompt)));
$("#newChat").onclick=()=>{current=[];window.activeChat=null;renderMessages();$("#sidebar").classList.remove("open");promptEl.focus();};
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{
  const video=b.dataset.view==="video";$("#chatView").classList.toggle("hidden",video);$("#videoView").classList.toggle("hidden",!video);
  document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n===b));$("#sidebar").classList.remove("open");
});
$("#backToChat").onclick=()=>document.querySelector('[data-view="chat"]').click();
$("#upgradeBtn").onclick=()=>alert("Pro plans and payments are not configured in this starter.");
renderMessages(); renderHistory();