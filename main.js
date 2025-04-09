const base64Credentials = btoa("coalition:skills-test");
let allPatients = [];

fetch("https://fedskillstest.coalitiontechnologies.workers.dev", {
    method: "GET",
    headers: {
        Authorization: `Basic ${base64Credentials}`,
        "Content-Type": "application/json",
    },
})
.then((response) => response.json())
.then((data) => {
    allPatients = data;

    getUsers();
    usersParams(0);
    showInfo(0);
    showDiagnosis(0);
    showLabRes(0);
});

// CHART SETUP
const ctx = document.getElementById('myChart');
const qraf = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Oct, 2023', 'Nov, 2023', 'Dec, 2023', 'Jan, 2024', 'Feb, 2024', 'Mar, 2024'],
        datasets: [
            {
                label: 'Systolic Blood Pressure',
                data: [],
                borderWidth: 4,
                borderColor: '#C26EB4',
                pointRadius: 10,
                pointBackgroundColor: '#E66FD2',
                pointBorderWidth: 1,
                pointBorderColor: '#fff',
                tension: 0.5
            },
            {
                label: 'Diastolic Blood Pressure',
                data: [],
                borderWidth: 4,
                borderColor: '#7E6CAB',
                pointRadius: 10,
                pointBackgroundColor: '#7E6CAB',
                pointBorderWidth: 1,
                pointBorderColor: '#fff',
                tension: 0.5
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 60,
                max: 180,
                ticks: {
                    color: '#666',
                    font: { size: 12 }
                },
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },
            x: {
                ticks: {
                    color: '#666',
                    font: { size: 12 }
                },
                grid: {
                    display: false
                }
            }
        }
    }
});

const userParameters = document.getElementsByClassName('userParameters');
const diagnosticList = document.getElementById('diagnosticList');
const labResults = document.getElementById('labResults');
const usersSearch = document.getElementById('usersSearch');
const patientsTitle = document.getElementById("patients-title");
const patientsContainer = document.getElementById('patients');
const syscValue = document.getElementById("syscValue");
const syscLevel = document.getElementById("syscLevel");
const dyslcValue = document.getElementById("dyscValue");
const dyslcLevel = document.getElementById("dyscLevel");
const respiratory = document.getElementById("respiratory");
const respLevel = document.getElementById("resp-level");
const temp = document.getElementById("temp");
const tempLevel = document.getElementById("temp-level");
const heart = document.getElementById("heart");
const heartLevel = document.getElementById("heart-level");

function getUsers() {
    let html = '';
    for (let i in allPatients) {
        const p = allPatients[i];
        html += `<div onclick="usersParams(${i}); showInfo(${i}); showDiagnosis(${i}); showLabRes(${i})" class="flex gap-2 rounded-xl p-3 users cursor-pointer hover:bg-gray-100">
            <img src="${p.profile_picture}" width="40" class="rounded-full" />
            <div>
                <p class="text-base font-medium">${p.name}</p>
                <p class="text-sm text-[#707070]">${p.gender}, ${p.age}</p>
            </div>
        </div>`;
    }
    patientsContainer.innerHTML = html;
}

function showInfo(index) {
    const p = allPatients[index];
    const infoHTML = `
        <div class="flex justify-center items-center">
            <img width="200px" src="${p.profile_picture}" />
        </div>
        <h2 class="font-bold text-2xl flex justify-center items-center">${p.name}</h2>
        <div class="flex flex-col gap-7">
            <div class="flex gap-2 items-center"><img src="img/BirthIcon.png"><div><p>Date of birth</p><p>${p.date_of_birth}</p></div></div>
            <div class="flex gap-2 items-center"><img src="img/FemaleIcon.png"><div><p>Gender</p><p>${p.gender}</p></div></div>
            <div class="flex gap-2 items-center"><img src="img/PhoneIcon.png"><div><p>Contact Info.</p><p>+${p.phone_number}</p></div></div>
            <div class="flex gap-2 items-center"><img src="img/PhoneIcon.png"><div><p>Emergency contact</p><p>+${p.emergency_contact}</p></div></div>
            <div class="flex gap-2 items-center"><img src="img/InsuranceIcon.png"><div><p>Insurance Provider</p><p>${p.insurance_type}</p></div></div>
            <button class="p-3 bg-[#01F0D0] rounded-full font-bold">Show All Information</button>
        </div>`;
    for (let i of userParameters) i.innerHTML = infoHTML;
}

function usersParams(index) {
    const history = allPatients[index].diagnosis_history?.slice(0, 6).reverse();
    if (!history) return;

    const systolic = history.map(item => item.blood_pressure.systolic.value);
    const diastolic = history.map(item => item.blood_pressure.diastolic.value);
    const dates = history.map(item => item.date);

    qraf.data.labels = dates;
    qraf.data.datasets[0].data = systolic;
    qraf.data.datasets[1].data = diastolic;
    qraf.update();

    const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

    const avgSys = avg(systolic);
    const avgDys = avg(diastolic);

    syscValue.innerText = avgSys;
    dyslcValue.innerText = avgDys;

    syscLevel.innerText =
        avgSys < 90 ? "Low" :
        avgSys <= 129 ? "Normal" :
        avgSys <= 139 ? "Higher than Average" :
        avgSys <= 149 ? "High" : "Very High";

    dyslcLevel.innerText =
        avgDys < 60 ? "Low" :
        avgDys <= 85 ? "Normal" :
        avgDys <= 119 ? "Higher than Average" : "High";

    const last = history[history.length - 1];
    respiratory.innerText = `${last.respiratory_rate.value} bpm`;
    respLevel.innerText = last.respiratory_rate.levels;
    temp.innerText = `${last.temperature.value} °F`;
    tempLevel.innerText = last.temperature.levels;
    heart.innerText = `${last.heart_rate.value} bpm`;
    heartLevel.innerText = last.heart_rate.levels;
}

function showDiagnosis(index) {
    const list = allPatients[index].diagnostic_list || [];
    let html = '';
    for (let i of list) {
        html += `<div class="flex justify-between text-center my-4 px-2">
            <p class="text-left">${i.name}</p>
            <p>${i.description}</p>
            <p class="text-right">${i.status}</p>
        </div><hr class="text-[#ccc]" />`;
    }
    diagnosticList.innerHTML = html;
}

function showLabRes(index) {
    const res = allPatients[index].lab_results || [];
    labResults.innerHTML = res.map(item =>
        `<div class="flex justify-between">
            <p>${item}</p><i class="fa-solid fa-download text-xl"></i>
        </div>`).join('');
}

function findUsers() {
    const query = usersSearch.value.toLowerCase();
    const filtered = allPatients.filter(p => p.name.toLowerCase().includes(query));
    patientsContainer.innerHTML = '';
    filtered.forEach((p, i) => {
        patientsContainer.innerHTML += `<div onclick="usersParams(${i}); showInfo(${i}); showDiagnosis(${i}); showLabRes(${i})" class="flex gap-2 rounded-xl p-3 users cursor-pointer hover:bg-gray-100">
            <img src="${p.profile_picture}" width="40" class="rounded-full" />
            <div>
                <p class="text-base font-medium">${p.name}</p>
                <p class="text-sm text-[#707070]">${p.gender}, ${p.age}</p>
            </div>
        </div>`;
    });
}

function searchBar() {
    usersSearch.classList.toggle("hidden");
    patientsTitle.classList.toggle("hidden");
}
