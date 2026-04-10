function initDatePicker(){

let old = document.getElementById("date");

if(!old) return;

old.outerHTML = `
<div class="date-wrapper">
<input type="text" id="date" placeholder="Select Date" readonly>
<div class="calendar" id="calendar"></div>
</div>
`;

let dateInput = document.getElementById("date");
let calendar = document.getElementById("calendar");

let current = new Date();

function renderCalendar(){

let year = current.getFullYear();
let month = current.getMonth();

let firstDay = new Date(year, month, 1).getDay();
let lastDate = new Date(year, month+1, 0).getDate();

let html = `

<div class="cal-header">

<select id="monthSelect">
${[...Array(12)].map((_,i)=>`
<option value="${i}" ${i===month?"selected":""}>
${new Date(0,i).toLocaleString("default",{month:"long"})}
</option>
`).join("")}
</select>

<select id="yearSelect">
${[...Array(20)].map((_,i)=>{
let y = year-10+i;
return `<option ${y===year?"selected":""}>${y}</option>`;
}).join("")}
</select>

</div>

<div class="cal-days">

<div class="day-name">Su</div>
<div class="day-name">Mo</div>
<div class="day-name">Tu</div>
<div class="day-name">We</div>
<div class="day-name">Th</div>
<div class="day-name">Fr</div>
<div class="day-name">Sa</div>
`;

for(let i=0;i<firstDay;i++){
html+="<div></div>";
}

for(let d=1; d<=lastDate; d++){
html+=`<div onclick="selectDate(${d})">${d}</div>`;
}

html+="</div>";

calendar.innerHTML = html;

// month change
document.getElementById("monthSelect").onchange = function(){
current.setMonth(this.value);
renderCalendar();
};

// year change
document.getElementById("yearSelect").onchange = function(){
current.setFullYear(this.value);
renderCalendar();
};

}

// open
dateInput.onclick = ()=>{
calendar.style.display="block";
renderCalendar();
};

// select
window.selectDate = function(day){

let y=current.getFullYear();
let m=current.getMonth()+1;

m = m<10?"0"+m:m;
day = day<10?"0"+day:day;

dateInput.value = `${day}-${m}-${y}`;

calendar.style.display="none";

};

// close
document.addEventListener("click",(e)=>{
if(!e.target.closest(".date-wrapper")){
calendar.style.display="none";
}
});

}