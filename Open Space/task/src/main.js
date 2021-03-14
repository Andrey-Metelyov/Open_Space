function setupElements(element) {
    element.disabled = true;
    element.onchange = checkLeversAndCheckboxes;
    console.log("setupElements for " + element)
}

function moveRocket(id) {
    let rocket = document.querySelector(".rocket");
    let left = Number(getComputedStyle(rocket).left.substr(0, getComputedStyle(rocket).left.length - 2));
    let top = Number(getComputedStyle(rocket).top.substr(0, getComputedStyle(rocket).top.length - 2));
    rocket.style.left = left + 10 + "px";
    rocket.style.top = top - 10 + "px";
}

function launch() {
    let id = setInterval(moveRocket, 100);
    setTimeout(() => clearInterval(id), 5000);
}

function checkLeversAndCheckboxes() {
    let checkboxes = Array.from(document.getElementById("check-buttons").querySelectorAll("input"));
    let levers = Array.from(document.getElementById("levers").querySelectorAll("input"));
    let checked = checkboxes.reduce((acc, cur) => cur.checked && acc, true);
    let leversUp = levers.reduce((acc, cur) => cur.value == 100 && acc, true);
    if (checked && leversUp) {
        document.getElementById("launch-button").disabled = false;
    } else {
        document.getElementById("launch-button").disabled = true;
    }
}

function setup() {
    document.getElementById("check-buttons").querySelectorAll("input").forEach(el => setupElements(el));
    document.getElementById("levers").querySelectorAll("input").forEach(el => setupElements(el));
    document.getElementById("launch-button").disabled = true;
    console.log("DisableButton");

    let okButton = document.getElementById("ok-button");
    okButton.addEventListener("click", function () {
        console.log("ok-button clicked");
        let passwordInput = document.getElementById("password");
        let password = passwordInput.value;
        if (password === "TrustNo1") {
            document.getElementById("check-buttons").querySelectorAll("input").forEach(el => el.disabled = false);
            document.getElementById("levers").querySelectorAll("input").forEach(el => el.disabled = false);
            passwordInput.disabled = true;
            document.getElementById("ok-button").disabled = true;
        }
    });

    let launchButton = document.getElementById("launch-button");
    launchButton.addEventListener("click", launch);
}

window.onload = setup;
