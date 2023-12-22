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
const chooseSlotBtn = document.querySelectorAll(".rounded-button");

export var selectedSlot

export function calendar() {
    for (let i = 0; i < 14; i++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);

        appendDaySlot(currentDate, i)
        // set(ref(database, "slots/" + i), {
        //     forDate: currentDate.toDateString(),
        // });
    }
}

function appendDaySlot(currentDate, index) {
    const formattedDay = currentDate.toLocaleDateString("nl-BE", {day: "2-digit"});
    const formattedMonth = currentDate.toLocaleDateString("nl-BE", {month: "short"});
    const formattedWeekDay = currentDate.toLocaleDateString("nl-BE", {weekday: "long"});

    const fieldset = document.createElement("fieldset")
    fieldset.setAttribute("id", `day_${index}`)

    const legend = document.createElement("legend");
    legend.innerHTML += `<legend>${formattedWeekDay} <span>${formattedDay}</spam> <span class="small"> ${formattedMonth}</span></legend>`;
    fieldset.appendChild(legend)

    daysOfWeek[currentDate.getDay()][1].forEach((time) => {
        const [hour, minute] = time.split(":");
        currentDate.setHours(hour, minute);

        const timeTag = document.createElement("time");
        timeTag.setAttribute("datetime", `${currentDate}`);
        timeTag.textContent = `${time}`;
        timeTag.addEventListener("click", function (e) {
            selectedSlot = new Date(e.target.getAttribute("datetime"));
            console.log(e.target)
            chooseSlotBtn.forEach(e => e.removeAttribute("disabled"));
        });

        const label = document.createElement("label");
        label.innerHTML = `<input id="${currentDate.getTime()}" type="radio" name="timeslot" data-sr>`;
        label.append(timeTag);

        fieldset.append(label);
    })

    const timeslotDiv = document.getElementById("timeslot");
    timeslotDiv.append(fieldset)
}
