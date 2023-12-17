import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {getDatabase, onValue, ref, set} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyD4y_hQWJ7P9q5BHLDkaqMOBGSnKcwf1oA",
    authDomain: "knipknap-9bdb9.firebaseapp.com",
    databaseURL: "https://knipknap-9bdb9-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "knipknap-9bdb9",
    storageBucket: "knipknap-9bdb9.appspot.com",
    messagingSenderId: "470305534086",
    appId: "1:470305534086:web:fc1667632b869df4582107"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const slots = ref(database, "slots");
const reservations = ref(database, "reservations");

const amHours = ["10:00", "10:30", "11:00", "11:30"];
const pmHours = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
const daysOfWeek = [
    ["Zo", amHours],
    ["Ma", pmHours],
    ["Di", amHours],
    ["Wo", amHours.concat(pmHours)],
    ["Do", amHours.concat(pmHours)],
    ["Vr", amHours],
    ["Za", amHours.concat(pmHours)]
];

let selectedSlot;

for (let i = 0; i < 14; i++) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + i);

    set(ref(database, "slots/" + i), {
        forDate: currentDate.toDateString(),
    });
}

const timeslotDiv = document.getElementById("timeslot");
const popup = document.getElementById("popup");
const confirmSlotBtn = document.getElementById("confirm-slot-btn");
const cancelSlotBtn = document.getElementById("cancel-slot-btn");
const chooseSlotBtn = document.querySelectorAll(".rounded-button");

chooseSlotBtn.forEach(e => e.addEventListener("click", function (e) {
    if (selectedSlot) {
        showMessage();
    }
}))

confirmSlotBtn.addEventListener("click", () => {
    set(ref(database, "reservations/" + selectedSlot.getTime()), {
        name: "wim",
        phone: "0476/955.316",
        at: selectedSlot.toDateString()
    });

    chooseSlotBtn.forEach(e => e.setAttribute("disabled", ""));
    popup.classList.remove("open");
})

cancelSlotBtn.addEventListener("click", () => {
    popup.classList.remove("open");
});

onValue(slots, function (snapshot) {
    if (snapshot.exists()) {
        let slotEntries = Object.entries(snapshot.val())
        slotEntries.forEach((day) => appendDaySlot(day));
        slotEntries.forEach((element, index) => {
            appendHourSlot(element[1].forDate, index)
        })
    }
});

onValue(reservations, (snapshot) => {
    let reservationKeys = snapshot.exists() ? Object.keys(snapshot.val()) : [];
    Array.from(document.getElementsByTagName("input"))
        .forEach(element => {
            if (reservationKeys.find(e => e === element.id)) {
                element.setAttribute("disabled", "");
            } else {
                element.removeAttribute("disabled");
            }
        })
});

function showMessage() {
    const title = document.getElementById("popup-title");
    const message = document.getElementById("popup-message");
    const date = selectedSlot.toLocaleDateString("nl-BE", {day: "2-digit", month: "2-digit", year: "2-digit"});
    const time = selectedSlot.toLocaleString("nl-BE", {hour: "2-digit", minute: "2-digit"});

    const user = 'Wim Drapier';
    title.innerHTML = `Geweldig ${user}`;
    message.innerHTML = `
        Bevestig je afspraak op ${date} om ${time}h.<br>
        Tot dan 😉`;

    popup.classList.add("open");
}

function appendDaySlot(element) {
    const [index, slot] = element;
    const currentDate = new Date(slot.forDate);
    const formattedDay = currentDate.toLocaleDateString("nl-BE", {day: "2-digit"});
    const formattedMonth = currentDate.toLocaleDateString("nl-BE", {month: "short"});
    const formattedWeekDay = currentDate.toLocaleDateString("nl-BE", {weekday: "long"});
    timeslotDiv.innerHTML += `
  <fieldset id="day_${index}">
    <legend>${formattedWeekDay} <span>${formattedDay}</spam> <span class="small"> ${formattedMonth}</span></legend>
  </fieldset>`;
}

function appendHourSlot(date, index) {
    const currentDate = new Date(date);
    daysOfWeek[currentDate.getDay()][1].forEach((time) => {
        const [hour, minute] = time.split(":");
        currentDate.setHours(hour, minute);

        const timeTag = document.createElement("time");
        timeTag.setAttribute("datetime", `${currentDate}`);
        timeTag.textContent = time;
        timeTag.addEventListener("click", function (e) {
            selectedSlot = new Date(e.target.getAttribute("datetime"));
            chooseSlotBtn.forEach(e => e.removeAttribute("disabled"));
        });

        const label = document.createElement("label");
        label.innerHTML = `<input id="${currentDate.getTime()}" type="radio" name="timeslot" data-sr>`;
        label.append(timeTag);

        const fieldset = document.getElementById("day_" + index);
        fieldset.append(label);
    })
}
