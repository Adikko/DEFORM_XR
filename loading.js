loadingCheck = () => {
    let loadingDiv = document.getElementsByClassName("deform_content_load")[0];
    loadingDiv.classList.toggle('deform_content_load_finished');
}

window.addEventListener('load', (event) => {
    loadingCheck();
});