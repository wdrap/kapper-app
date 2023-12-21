import Component from "./Component.js"

const template = document.createElement("template")
template.innerHTML = `
    <p>test</p>
`

export class Calendar extends HTMLElement {
    static amHours = ["10:00", "10:30", "11:00", "11:30"];
    static pmHours = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
    static daysOfWeek = [
        ["Zo", this.amHours],
        ["Ma", this.pmHours],
        ["Di", this.amHours],
        ["Wo", this.amHours.concat(this.pmHours)],
        ["Do", this.amHours.concat(this.pmHours)],
        ["Vr", this.amHours],
        ["Za", this.amHours.concat(this.pmHours)]
    ];

    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: "open"})
        // this.shadowRoot.appendChild(template.content.cloneNode(true))
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../main.css');
        shadowRoot.appendChild(linkElem);

        const currentDate = new Date();
        for (let i = 0; i < 14; i++) {
            currentDate.setDate(currentDate.getDate() + i);

            const formattedDay = currentDate.toLocaleDateString("nl-BE", {day: "2-digit"});
            const formattedMonth = currentDate.toLocaleDateString("nl-BE", {month: "short"});
            const formattedWeekDay = currentDate.toLocaleDateString("nl-BE", {weekday: "long"});

            const fieldset = document.createElement("fieldset")
            fieldset.setAttribute("i", `day_${i}`)
            fieldset.innerHTML =
                `<legend>${formattedWeekDay} <span>${formattedDay}</spam> <span class="small"> ${formattedMonth}</span></legend> `
            shadowRoot.appendChild(fieldset)
        }
    }

    connectedCallback() {

    }
}

customElements.define("appointment-cal", Calendar)
