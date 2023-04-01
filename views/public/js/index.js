// Menu show/hide

navMenu();

function navMenu() {
  const showMenu = document.querySelector(".show__menu");
  const closeMenu = document.querySelector(".close__menu");
  const listMenu = document.querySelector(".menu__list");
  const overlay = document.querySelector(".overlay");

  showMenu.addEventListener("click", () => {
    listMenu.classList.add("active");
    overlay.classList.add("active");
    document.body.style = "overflow: hidden; height: 100vh;";
  });
  
  closeMenu.addEventListener("click", () => {
    listMenu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style = "";
  });
}

// Change radion input color

radioInputEffect();

function radioInputEffect() {
  const radioInputs = document.querySelectorAll(".user__type input");

  radioInputs.forEach((radio) => {
    radio.addEventListener("click", () => {
      if(radio.checked) {
        radio.parentElement.classList.add("active");

        radioInputs.forEach((radio) => {
          if(!radio.checked  && radio.parentElement.classList.contains("active")) {
            radio.parentElement.classList.remove("active");
          }
        })
      }
    });
  })
}

// Print Button

printTable();

function printTable() {
  const printBtn = document.querySelector(".print__btn");

  printBtn.addEventListener("click", () => {
    window.print();
  })
}