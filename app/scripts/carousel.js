const slider = document.querySelector(".carousel__items");
const slides = document.querySelectorAll(".carousel__item");
const button = document.querySelectorAll(".carousel__button");

let current = 0;
let prev = 4;
let next = 1;

for (let i = 0; i < button.length; i++) {
	button[i].addEventListener("click", () => i == 0 ? gotoPrev() : gotoNext());
}

const gotoPrev = () => current > 0 ? gotoNum(current - 1) : gotoNum(slides.length - 1);
const gotoNext = () => current < 4 ? gotoNum(current + 1) : gotoNum(0);
const gotoNum = number => {
	current = number;
	prev = current - 1;
	next = current + 1;

	for (let i = 0; i < slides.length; i++) {
		slides[i].classList.remove("carousel__active");
		slides[i].classList.remove("carousel__prev");
		slides[i].classList.remove("carousel__next");
	}

	if (next == 5) {
		next = 0;
	}

	if (prev == -1) {
		prev = 4;
	}

	slides[current].classList.add("carousel__active");
	slides[prev].classList.add("carousel__prev");
	slides[next].classList.add("carousel__next");
}