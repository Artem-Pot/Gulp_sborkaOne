// скрипт для раздела - Дети любят уроки потому что
const favoriteRadioOne = document.querySelector("#favorite__radio_one");
const favoriteRadioOne2 = document.querySelector("#favorite__radio_two");
const favoriteRadioOne3 = document.querySelector("#favorite__radio_three");
const favoriteBox1 = document.querySelector(".favorite__box_1");
const favoriteBox2 = document.querySelector(".favorite__box_2");
const favoriteBox3 = document.querySelector(".favorite__box_3");
const favoriteImg1 = document.querySelector(".favorite__img_1");
const favoriteImg2 = document.querySelector(".favorite__img_2");
const favoriteImg3 = document.querySelector(".favorite__img_3");

favoriteRadioOne.onclick = function() {
    favoriteImg1.style.display = "block";
    favoriteImg2.style.display = "none";
    favoriteImg3.style.display = "none";
    favoriteBox1.classList.add('favorite__box_activ');
    favoriteBox2.classList.remove('favorite__box_activ');
    favoriteBox3.classList.remove('favorite__box_activ');
  };

favoriteRadioOne2.onclick = function() {
    favoriteImg1.style.display = "none";
    favoriteImg2.style.display = "block";
    favoriteImg3.style.display = "none";
    favoriteBox1.classList.remove('favorite__box_activ');
    favoriteBox2.classList.add('favorite__box_activ');
    favoriteBox3.classList.remove('favorite__box_activ');
  };

favoriteRadioOne3.onclick = function() {
    favoriteImg1.style.display = "none";
    favoriteImg2.style.display = "none";
    favoriteImg3.style.display = "block";
    favoriteBox1.classList.remove('favorite__box_activ');
    favoriteBox2.classList.remove('favorite__box_activ');
    favoriteBox3.classList.add('favorite__box_activ');
  };