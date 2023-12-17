import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getDatabase,
    onValue,
    ref,
    set,
    get,
    query,
    orderByChild,
    equalTo,
    limitToFirst,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const reservations = ref(database, "reservations");

onValue(reservations, (snapshot) => {
    let reservationKeys = snapshot.exists() ? Object.keys(snapshot.val()) : [];
    document.querySelectorAll("input[type=radio]")
        .forEach(element => {
            if (reservationKeys.find(e => e === element.id)) {
                element.setAttribute("disabled", "");
            } else {
                element.removeAttribute("disabled");
            }
        })
});

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

const popup = document.getElementById("popup");
const popupContent = document.querySelector(".popup-content");

document.getElementById("popup-close")
    .addEventListener("click",
        () => popup.classList.remove("open"));

window.onclick = function (event) {
    if (event.target === popup) {
        popup.classList.remove("open");
    }
}

const myAppointment = document.querySelector("#my-appointment");
myAppointment.addEventListener("click", () => {
    showAppointment();
})

function showAppointment() {
    const name = getCookie("username");

    get(query(reservations, orderByChild("name"), equalTo(name), limitToFirst(1)))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const reservation = Object.values(snapshot.val())[0];
                const reservationDate = new Date(reservation.at);
                const date = reservationDate.toLocaleDateString("nl-BE", {day: "2-digit", month: "2-digit", year: "2-digit"});
                const time = reservationDate.toLocaleTimeString("nl-BE", {hour: "2-digit", minute: "2-digit"});

                popupContent.innerHTML = `<p>Hallo ${name}, jouw afspraak gaat door op <i>${date}</i> om <i>${time} h</i>.</p>`;
            } else {
                popupContent.innerHTML = `<p>Hallo ${name}, we hebben geen afspraken gevonden voor jouw.</p>`;
                console.log("No data available");
            }
            popup.classList.add("open");
        }).catch((error) => {
        console.error(error);
    });
}

function showMessage() {
    const timeInput = document.querySelector("input[name=timeslot]:checked");
    const selectedSlot = new Date();
    selectedSlot.setTime(timeInput.getAttribute("id"));

    const date = selectedSlot.toLocaleDateString("nl-BE", {day: "2-digit", month: "2-digit", year: "2-digit"});
    const time = selectedSlot.toLocaleTimeString("nl-BE", {hour: "2-digit", minute: "2-digit"});

    const message = document.createElement("p");
    message.innerHTML = `Geweldig, we plannen jouw afspraak in op <i>${date}</i> om <i>${time}h</i>.`;

    const nameInput = document.createElement("input");
    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("placeholder", "Naam");
    nameInput.addEventListener("input", (e) => {
        if (e.target.value.length > 2) {
            confirmButton.removeAttribute("disabled");
        } else {
            confirmButton.setAttribute("disabled", "");
        }
    })

    const contactInput = document.createElement("input");
    contactInput.setAttribute("type", "text");
    contactInput.setAttribute("placeholder", "Telefoon (Optioneel)");

    const confirmButton = document.createElement("input");
    confirmButton.setAttribute("type", "button");
    confirmButton.setAttribute("value", "Bevestig je afspraak");
    confirmButton.setAttribute("disabled", "");
    confirmButton.addEventListener("click", () => {
        setCookie('username', nameInput.value, 14);

        set(ref(database, "reservations/" + selectedSlot.getTime()), {
            name: nameInput.value,
            phone: contactInput.value,
            at: selectedSlot.toString()
        });
        popup.classList.remove("open");
    })

    popupContent.replaceChildren(message, nameInput, contactInput, confirmButton);

    popup.classList.add("open");
}

function setCookie(key, value, daysToExpire) {
    let date = new Date();
    date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000))
    const expires = "expires" + date.toUTCString();
    document.cookie = `${key}=${value};${expires};path=/`;
}

function getCookie(key) {
    const name = key += "="
    const decoded = decodeURIComponent(document.cookie);
    let result;
    decoded.split(";").forEach(value => {
        if (value.indexOf(name) === 0)
            result = value.substring(name.length);
    })
    return result;
}

async function init() {
    const currentDate = new Date();
    for (let i = 0; i < 14; i++) {
        currentDate.setDate(currentDate.getDate() + i);

        const formattedDay = currentDate.toLocaleDateString("nl-BE", {day: "2-digit", month: "short"});
        const formattedWeekDay = currentDate.toLocaleDateString("nl-BE", {weekday: "long"});

        const fieldset = document.createElement("fieldset");
        fieldset.innerHTML = `<legend>${formattedWeekDay}<span>${formattedDay}</span></legend>`;

        daysOfWeek[currentDate.getDay()][1].forEach((time) => {
            const [hour, minute] = time.split(":");
            currentDate.setHours(hour, minute, 0, 0);

            const slot = document.createElement("input");
            slot.setAttribute("id", currentDate.getTime());
            slot.setAttribute("type", "radio");
            slot.setAttribute("name", "timeslot");
            slot.setAttribute("data-sr", "");
            slot.addEventListener("click", () => {
                showMessage();
            })
            const timeTag = document.createElement("time");
            timeTag.setAttribute("datetime", `${currentDate}`);
            timeTag.textContent = time;

            const label = document.createElement("label");
            label.append(slot)
            label.append(timeTag);
            fieldset.append(label);
        })

        document
            .getElementById("timeslot")
            .appendChild(fieldset)
    }
}

await init()
