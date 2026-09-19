document.addEventListener("DOMContentLoaded", function () {

    alert("UniMind JavaScript يعمل ✅");

    const buttons = document.querySelectorAll("a");

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            alert("تم الضغط على: " + button.textContent.trim());

        });

    });

});
