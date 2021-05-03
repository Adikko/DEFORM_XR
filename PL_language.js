let languageCheck = window.navigator.language;

if (languageCheck === "pl-PL") {
    document.getElementById("welcome").innerText = "Witaj w rozszerzonej rzeczywistości!";
    document.getElementById("instruction_1").innerText = "Pamiętaj, by poruszać telefonem, by pomóc nam umieścić obiekty w Twoim otoczeniu.";
    document.getElementById("instruction_2").innerText = "Gdy zrozumiemy Twoje otoczenie, pokażemy Ci celownik";
    document.getElementById("instruction_3").innerText = "Tapnij ekran, by dodać obiekt do swojego pokoju!";
    document.getElementById("unsupported").innerText = "Przepraszamy!";
    document.getElementById("unsupported_explanation").innerText = "Rozszerzona rzeczywistość działa jedynie w przeglądarkach wspierających WebXR (np. Chrome Mobile)";
}