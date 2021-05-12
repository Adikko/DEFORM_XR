// First let's check if xr functionality is availible
let xr_checker = null;
if ("xr" in navigator) {
    xr_checker = true;
} else {
    xr_checker = false;
}

// Let's edit the button to display the correct call to action
const init_button = document.getElementsByClassName("deform_button_container")[0];
const instructions_list = document.getElementById("instructions");
const welcome_message = document.getElementById("welcome");
welcome_message.innerText = "Witaj w rozszerzonej rzeczywistości";
if (xr_checker === true) {
    init_button.innerHTML = '<button class="deform_xr_button" onclick="activateXR()">Start!</button>'
} else {
    let explanation = document.createElement("li");
    instructions_list.appendChild(explanation);
    if (window.navigator.language === "pl-PL") {
        init_button.innerHTML = '<button class="deform_xr_button" disabled">Niewspierane</button>';
        explanation.innerHTML = '<h2 id="instruction_2">Wypróbuj przeglądarkę Google Chrome na smartfonie z Androidem</h2>'
    } else {
        init_button.innerHTML = '<button class="deform_xr_button" disabled">AR not supported</button>';
        explanation.innerHTML = '<h2 id="instruction_2">Try Google Chrome on an Android Smartphone</h2>';
    }
}