const credentials = btoa("coalition:skills-test");

let patientsData = [];

const patientListEl = document.getElementById('patients');
const searchInput = document.getElementById('usersSearch');
const infoBoxes = document.getElementsByClassName('userParameters');
const diagnosisBox = document.getElementById('diagnosticList');
const labBox = document.getElementById('labResults');
const titleEl = document.getElementById("patients-title");
const ctx = document.getElementById('myChart');

const sysValEl = document.getElementById("syscValue");
const sysLvlEl = document.getElementById("syscLevel");
const dysValEl = document.getElementById("dyscValue");
const dysLvlEl = document.getElementById("dyscLevel");
const respEl = document.getElementById("respiratory");
const respLvl = document.getElementById("resp-level");
const tempEl = document.getElementById("temp");
const tempLvl = document.getElementById("temp-level");
const heartEl = document.getElementById("heart");
const heartLvl = document.getElementById("heart-level");

fetch("https://fedskillstest.coalitiontechnologies.workers.dev", {
    method: "GET",
    headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json"
    }
})
.then(res => res.json())
.then(data => {
    patientsData = data;
    renderPatients();
    updateAll(0);
});

function renderPatients() {
    let html = '';
    for (let i = 0; i < patientsData.length; i++) {
        let p = patientsData[i];
        html += `
        <div onclick="updateAll(${i})" class="flex flex-w gap-2 rounded-xl py-3 lg:px-3 users">
            <img class="w-[40px]" src="${p.profile_picture}" />
            <div>
                <p class="text-base">${p.name}</p>
                <p class="text-sm text-[#707070]">${p.gender}, ${p.age}</p>
            </div>
        </div>`;
    }
    patientListEl.innerHTML = html;
}

function updateAll(index) {
    showPatientInfo(index);
    updateVitals(index);
    showDiagnosis(index);
    showLabResults(index);
}

function showPatientInfo(i) {
    let p = patientsData[i];
    let html = `
        <div class="flex justify-center items-center">
            <img width="200px" src="${p.profile_picture}" alt="">
        </div>
        <h2 class="font-bold text-2xl text-center">${p.name}</h2>
        <div class="flex flex-col gap-7">
            <div class="flex gap-2 items-center">
                <img src="img/BirthIcon.png" />
                <div><p>Date of Birth</p><p>${p.date_of_birth}</p></div>
            </div>
            <div class="flex gap-2 items-center">
                <img src="img/FemaleIcon.png" />
                <div><p>Gender</p><p>${p.gender}</p></div>
            </div>
            <div class="flex gap-2 items-center">
                <img src="img/PhoneIcon.png" />
                <div><p>Phone</p><p>+${p.phone_number}</p></div>
            </div>
            <div class="flex gap-2 items-center">
                <img src="img/PhoneIcon.png" />
                <div><p>Emergency</p><p>+${p.emergency_contact}</p></div>
            </div>
            <div class="flex gap-2 items-center">
                <img src="img/InsuranceIcon.png" />
                <div><p>Insurance</p><p>${p.insurance_type}</p></div>
            </div>
        </div>
    `;
    for (let box of infoBoxes) {
        box.innerHTML = html;
    }
}

function updateVitals(i) {
    let history = patientsData[i].diagnosis_history.slice(-6);
    let systolic = [];
    let diastolic = [];

    for (let j = 0; j < history.length; j++) {
        systolic.push(history[j].blood_pressure.systolic.value);
        diastolic.push(history[j].blood_pressure.diastolic.value);
    }

    let sysAvg = Math.round(systolic.reduce((a, b) => a + b, 0) / systolic.length);
    let sysStatus = sysAvg < 90 ? "Low" : sysAvg <= 129 ? "Normal" : sysAvg <= 139 ? "Elevated" : sysAvg <= 149 ? "High" : "Very High";
    sysValEl.innerText = sysAvg;
    sysLvlEl.innerText = sysStatus;

    let dysAvg = Math.round(diastolic.reduce((a, b) => a + b, 0) / diastolic.length);
    let dysStatus = dysAvg < 60 ? "Low" : dysAvg <= 85 ? "Normal" : dysAvg <= 119 ? "Elevated" : "High";
    dysValEl.innerText = dysAvg;
    dysLvlEl.innerText = dysStatus;

    let last = history[history.length - 1];
    respEl.innerText = last.respiratory_rate.value + " bpm";
    respLvl.innerText = last.respiratory_rate.levels;
    tempEl.innerText = last.temperature.value + " °F";
    tempLvl.innerText = last.temperature.levels;
    heartEl.innerText = last.heart_rate.value + " bpm";
    heartLvl.innerText = last.heart_rate.levels;

    chart.data.datasets[0].data = systolic;
    chart.data.datasets[1].data = diastolic;
    chart.update();
}

function showDiagnosis(i) {
    let diag = patientsData[i].diagnostic_list;
    let html = '';
    for (let j = 0; j < diag.length; j++) {
        html += `
            <div class="flex justify-between text-center my-4 px-2">
                <p class="text-left">${diag[j].name}</p>
                <p>${diag[j].description}</p>
                <p class="text-right">${diag[j].status}</p>
            </div>
            <hr />
        `;
    }
    diagnosisBox.innerHTML = html;
}

function showLabResults(i) {
    let labs = patientsData[i].lab_results;
    let html = '';
    for (let j = 0; j < labs.length; j++) {
        html += `
            <div class="flex justify-between">
                <p>${labs[j]}</p>
                <i class="fa-solid fa-download text-xl"></i>
            </div>
        `;
    }
    labBox.innerHTML = html;
}

function searchBar() {
    searchInput.classList.toggle("hidden");
    titleEl.classList.toggle("hidden");
}

function findUsers() {
    let search = searchInput.value.toLowerCase();
    let html = '';
    for (let i = 0; i < patientsData.length; i++) {
        if (patientsData[i].name.toLowerCase().includes(search)) {
            html += `
            <div onclick="updateAll(${i})" class="flex flex-w gap-2 rounded-xl py-3 lg:px-3 users">
                <img class="w-[40px]" src="${patientsData[i].profile_picture}" />
                <div>
                    <p class="text-base">${patientsData[i].name}</p>
                    <p class="text-sm text-[#707070]">${patientsData[i].gender}, ${patientsData[i].age}</p>
                </div>
            </div>`;
        }
    }
    patientListEl.innerHTML = html;
}

searchBar(); 

let chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [
            {
                label: 'Systolic',
                data: [],
                borderColor: '#C26EB4',
                pointBackgroundColor: '#E66FD2',
                borderWidth: 4,
                tension: 0.5
            },
            {
                label: 'Diastolic',
                data: [],
                borderColor: '#7E6CAB',
                pointBackgroundColor: '#7E6CAB',
                borderWidth: 4,
                tension: 0.5
            }
        ]
    },
    options: {
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } } }
    }
});
