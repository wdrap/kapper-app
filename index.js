import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {get, getDatabase, onValue, orderByKey, query, ref, set, startAt, remove }
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const refReservations = ref(database, "reservations");

onValue(refReservations, (snapshot) => {
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
const popupClose = document.getElementById("popup-close")
popupClose.addEventListener("click", () => {
    popup.classList.remove("open")
})

function removeReservation(id) {
    remove(ref(database, 'reservations/' + id));
}

function listReservations() {
    const currentDate = new Date().getTime();

    get(query(refReservations, orderByKey(), startAt(currentDate.toString())))
        .then((snapshot) => {
            const result = [];
            if (snapshot.exists()) {
                popupContent.innerHTML = `<h2>Geplande afspraken:</h2>`;
                const reservations = Object.values(snapshot.val());
                reservations.forEach(reservation => {
                    if (localGet().indexOf(reservation.name.trim().toUpperCase()) < 0) return
                    result.push({
                        at: new Date(reservation.at),
                        name: reservation.name
                    });
                })
            }

            if (result.length === 0) {
                localStorage.clear();
                const p = Object.assign(document.createElement("p"), { innerHTML: `Geen afspraken gepland voor de komende 14 dagen.` });
                popupContent.replaceChildren(p);
                popup.classList.add("open");
            } else {
                const ol = document.createElement("ol");

                result.forEach(value => {
                    const date = value.at.toLocaleDateString("nl-BE", {weekday: "long", day: "2-digit", month: "2-digit"});
                    const time = value.at.toLocaleTimeString("nl-BE", {hour: "2-digit", minute: "2-digit"});
                    const p = Object.assign(document.createElement("p"), {innerHTML: `${date} om ${time} op naam van <i>${value.name}</i>`})

                    const button = document.createElement("input");
                    button.setAttribute("type", "button");

                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    d.setHours(23, 59, 0, 0);
                    if (value.at > d) {
                        button.setAttribute("value", "Annuleer deze afspraak");
                    } else {
                        button.setAttribute("value", "Tot binnekort");
                        button.setAttribute("disabled", "")
                    }
                    p.append(button)

                    button.addEventListener("click", () => {
                        removeReservation(value.at.getTime())
                        popup.classList.remove("open")
                    })
                    const li = document.createElement("li")
                    li.append(p)
                    ol.append(li)
                });
                popupContent.innerHTML = (`<p><b>Afspraken:</b></p>`);
                const title = Object.assign(document.createElement("p"), { innerHTML: `<b>Afspraken:</b>`})
                popupContent.replaceChildren(title ,ol);
                popup.classList.add("open");
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

function showCreateReservation() {
    const timeInput = document.querySelector("input[name=timeslot]:checked");
    const selectedSlot = new Date();
    selectedSlot.setTime(timeInput.getAttribute("id"));

    const date = selectedSlot.toLocaleDateString("nl-BE", { weekday: "long", day: "2-digit", month: "2-digit" });
    const time = selectedSlot.toLocaleTimeString("nl-BE", {hour: "2-digit", minute: "2-digit"});

    const message = document.createElement("p");
    message.innerHTML = `Geweldig, we plannen jouw afspraak in op <i>${date}</i> om <i>${time}</i>.`;

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
    contactInput.setAttribute("placeholder", "Telefoon of email (Optioneel)");

    const confirmButton = document.createElement("input");
    confirmButton.setAttribute("type", "button");
    confirmButton.setAttribute("value", "Bevestig je afspraak");
    confirmButton.setAttribute("disabled", "");
    confirmButton.addEventListener("click", () => {
        set(ref(database, "reservations/" + selectedSlot.getTime()), {
            name: nameInput.value,
            phone: contactInput.value,
            at: selectedSlot.toString()
        });
        localSave(nameInput.value);
        popup.classList.remove("open");
    })

    popupContent.replaceChildren(message, nameInput, contactInput, confirmButton);

    popup.classList.add("open");
}

function localSave(name) {
    let names = localStorage.getItem("names");
    if (names) {
        names = names.split(",");
        if (names.indexOf(name) < 0) {
            names.push(name);
        }
    } else {
        names = [name];
    }
    localStorage.setItem("names", names.toString())
}

function localGet() {
    const names = localStorage.getItem("names") || "";
    return names.split(",")
        .map(name => name.trim().toUpperCase());

}

document.addEventListener("click", (e) => {
    if (e.target.matches("input[data-sr]")) {
        showCreateReservation()
    } else if (e.target.id === "my-appointment" ){
        listReservations();
    }
})

window.addEventListener("click", (e) => {
    if (e.target.matches(".popup")) {
        popup.classList.remove("open");
    }
})

function init() {
    const currentDate = new Date();
    const now = new Date();
    now.setMinutes(now.getMinutes() + 20);
    let totalDays = 14;
    for (let i = 0; i < totalDays; i++) {

        const formattedDay = currentDate.toLocaleDateString("nl-BE", {day: "2-digit", month: "short"});
        const formattedWeekDay = currentDate.toLocaleDateString("nl-BE", {weekday: "long"});

        const fieldset = document.createElement("fieldset");
        fieldset.innerHTML = `<legend>${formattedWeekDay}<span>${formattedDay}</span></legend>`;

        daysOfWeek[currentDate.getDay()][1].forEach((time) => {
            const [hour, minute] = time.split(":");
            currentDate.setHours(hour, minute, 0, 0);
            if (currentDate < now) return

            const slot = document.createElement("input");
            slot.setAttribute("id", currentDate.getTime().toString());
            slot.setAttribute("type", "radio");
            slot.setAttribute("name", "timeslot");
            slot.setAttribute("data-sr", "");

            const timeTag = document.createElement("time");
            timeTag.setAttribute("datetime", `${currentDate}`);
            timeTag.textContent = time;

            const label = document.createElement("label");
            label.append(slot)
            label.append(timeTag);
            fieldset.append(label);
        })

        if (fieldset.children.length > 1) {
            document
                .getElementById("timeslot")
                .appendChild(fieldset);
        } else {
            totalDays += 1;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

init()
