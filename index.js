import {calendar, selectedSlot} from "./calendar.js";

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

calendar()

document.getElementById("cancel").addEventListener("click", () => {
    flipCard()
})


function flipCard() {
    scrollTo(0, function () {
        document.getElementById("card").classList.toggle("flipped")
    })
}

function scrollTo(offset, callback) {
    const fixedOffset = offset.toFixed();
    const onScroll = function () {
        if (window.scrollY.toFixed() === fixedOffset) {
            window.removeEventListener('scroll', onScroll)
            callback()
        }
    }

    window.addEventListener('scroll', onScroll)
    onScroll()
    window.scrollTo({top: offset, behavior: 'smooth'})
}


const popup = document.getElementById("popup");
// const confirmSlotBtn = document.getElementById("confirm-slot-btn");
// const cancelSlotBtn = document.getElementById("cancel-slot-btn");
const chooseSlotBtn = document.querySelectorAll(".rounded-button");

chooseSlotBtn.forEach(e => e.addEventListener("click", function (e) {
    if (selectedSlot) {
        flipCard()
        // showMessage();
    }
}))

// confirmSlotBtn.addEventListener("click", () => {
//     // set(ref(database, "reservations/" + selectedSlot.getTime()), {
//     //     name: "wim",
//     //     phone: "0476/955.316",
//     //     at: selectedSlot.toDateString()
//     // });
//
//     chooseSlotBtn.forEach(e => e.setAttribute("disabled", ""));
//     popup.classList.remove("open");
// })

// cancelSlotBtn.addEventListener("click", () => {
//     popup.classList.remove("open");
// });

// onValue(slots, function (snapshot) {
//     if (snapshot.exists()) {
//         let slotEntries = Object.entries(snapshot.val())
//         slotEntries.forEach((day) => appendDaySlot(day));
//         slotEntries.forEach((element, index) => {
//             appendHourSlot(element[1].forDate, index)
//         })
//     }
// });
//
// onValue(reservations, (snapshot) => {
//     let reservationKeys = snapshot.exists() ? Object.keys(snapshot.val()) : [];
//     Array.from(document.getElementsByTagName("input"))
//         .forEach(element => {
//             if (reservationKeys.find(e => e === element.id)) {
//                 element.setAttribute("disabled", "");
//             } else {
//                 element.removeAttribute("disabled");
//             }
//         })
// });

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
