const menu = document.querySelector(".header__menu");
const menuItems = document.querySelectorAll(".menuItem");
const hamburger= document.querySelector(".header__burger");
const closeIcon= document.querySelector(".header__burger-close");
const menuIcon = document.querySelector(".header__burger-open");

function toggleMenu() {
  if (menu.classList.contains("showMenu")) {
    menu.classList.remove("showMenu");
    closeIcon.style.display = "none";
    menuIcon.style.display = "block";
    menu.style.borderRadius = "none";
    
  } else {
    menu.classList.add("showMenu");
    closeIcon.style.display = "block";
    menuIcon.style.display = "none";
    menu.style.borderRadius = "0px 0px 15px 15px";
  }
}

hamburger.addEventListener("click", toggleMenu);

menuItems.forEach( 
  function(menuItem) { 
    menuItem.addEventListener("click", toggleMenu);
  }
)
