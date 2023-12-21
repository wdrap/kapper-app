import { Calendar } from "./components/Calendar.js";
import Login from "./components/Login.js";

const navigateTo = url => {
    console.log(url)
    history.pushState(null, null, url)
    router()
}

function inject(component) {
    const outlet = document.querySelector('#app');
    while (outlet.firstChild) {
        outlet.removeChild(outlet.firstChild);
    }
    console.log(component)
    outlet.appendChild(component);
}

const router = async  () => {
    const routes = [
        { path: "/kapper/", view: Calendar },
        { path: "/login", view: Login },
        { path: "/about", view: () => console.log("about") },
    ]

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        }
    })
    console.log(potentialMatches)
    let match = potentialMatches
        .find(potentialMatch => potentialMatch.isMatch)

    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        }
    }

    // inject(new Calendar)
    // const view = new match.route.view()
    // document.querySelector("#app").innerHTML = await view.getHtml()
}

// window.addEventListener("hashchange", function (event) {
//     console.log("urls changed")
//     router()
// })
window.onpopstate = router()

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[route-link]")) {
            e.preventDefault()
            navigateTo(e.target.getAttribute("route-link"))
        }
    })

    router();
})

