const cards = [
  {
    title: "甜美法式复古风",
    label: "约会晚宴",
    text: "蓝白条纹针织开衫轻盈活泼，内搭波点吊带增添俏皮，红贝雷帽搭配利落黑裙与小巧圆包，红玛丽珍…",
    art: [{ src: "./assets/outfit-base.png", className: "base" }],
  },
  {
    title: "甜美法式复古风",
    label: "约会晚宴",
    text: "蓝白条纹针织开衫轻盈活泼，内搭波点吊带增添俏皮，红贝雷帽搭配利落黑裙与小巧圆包，红玛丽珍…",
    art: [
      { src: "./assets/outfit-base.png", className: "base" },
      { src: "./assets/outfit-overlay-02.png", className: "overlay style-02" },
    ],
  },
  {
    title: "甜美法式复古风",
    label: "约会晚宴",
    text: "蓝白条纹针织开衫轻盈活泼，内搭波点吊带增添俏皮，红贝雷帽搭配利落黑裙与小巧圆包，红玛丽珍…",
    art: [
      { src: "./assets/outfit-base.png", className: "base" },
      { src: "./assets/outfit-overlay-03.png", className: "overlay style-03" },
    ],
  },
];

const products = [
  { src: "./assets/item-dress.png", price: "¥288.88" },
  { src: "./assets/item-shoes.png", price: "¥99" },
  { src: "./assets/item-bag.png", price: "¥1499" },
  { src: "./assets/item-skirt.png", price: "¥1499" },
];

const slots = ["slot-front", "slot-mid", "slot-back"];
const stage = document.querySelector("#cards");
let activeIndex = 0;
let startX = 0;
let dragX = 0;
let dragging = false;
let locked = false;

function relationFor(index) {
  return (index - activeIndex + cards.length) % cards.length;
}

function relationForActive(index, baseIndex) {
  return (index - baseIndex + cards.length) % cards.length;
}

function buildCards() {
  stage.innerHTML = "";

  cards.forEach((data, cardIndex) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.cardIndex = cardIndex;
    card.setAttribute("aria-roledescription", "slide");
    card.setAttribute("aria-label", `搭配卡片 ${cardIndex + 1} / ${cards.length}`);

    const art = document.createElement("div");
    art.className = "art";
    data.art.forEach((asset) => {
      const image = document.createElement("img");
      image.src = asset.src;
      image.alt = "";
      image.className = asset.className;
      art.appendChild(image);
    });

    const copy = document.createElement("div");
    copy.className = "copy";
    copy.innerHTML = `
      <div class="title-row">
        <h2>${data.title}</h2>
        <span class="label">${data.label}</span>
      </div>
      <p class="description">${data.text}</p>
    `;

    const productRow = document.createElement("div");
    productRow.className = "products";
    productRow.innerHTML = `
      <div class="product-track">
        ${products
          .map(
            (product) => `
              <div class="product">
                <span class="thumb"><img src="${product.src}" alt="" /></span>
                <span class="price">${product.price}</span>
              </div>
            `,
          )
          .join("")}
      </div>
      <button class="next-hit" type="button" aria-label="下一张搭配"></button>
    `;

    card.append(art, copy, productRow);
    stage.appendChild(card);
  });

  updateSlots(false);
}

function updateSlots(animated = true, baseIndex = activeIndex, exitingCard = null) {
  if (!animated) stage.classList.add("no-transition");

  stage.querySelectorAll(".card").forEach((card) => {
    if (card === exitingCard) return;
    const relation = relationForActive(Number(card.dataset.cardIndex), baseIndex);
    card.className = `card ${slots[relation]}`;
    card.tabIndex = relation === 0 ? 0 : -1;
    card.setAttribute("aria-hidden", relation === 0 ? "false" : "true");
  });

  if (!animated) {
    requestAnimationFrame(() => stage.classList.remove("no-transition"));
  }
}

function advance(direction) {
  if (locked) return;
  locked = true;
  const nextIndex = (activeIndex + direction + cards.length) % cards.length;
  const exitingCard = stage.querySelector(`.card[data-card-index="${activeIndex}"]`);

  updateSlots(true, nextIndex, exitingCard);
  exitingCard.className = `card slot-front ${direction > 0 ? "is-exiting-left" : "is-exiting-right"}`;
  exitingCard.setAttribute("aria-hidden", "true");
  exitingCard.tabIndex = -1;

  window.setTimeout(() => {
    activeIndex = nextIndex;
    updateSlots(false);
    locked = false;
  }, 370);
}

function onPointerDown(event) {
  if (locked) return;
  dragging = true;
  startX = event.clientX;
  dragX = 0;
  stage.classList.add("is-dragging");
  stage.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (!dragging) return;
  dragX = event.clientX - startX;
  const front = stage.querySelector(".slot-front");
  const mid = stage.querySelector(".slot-mid");
  const distance = Math.max(-56, Math.min(56, dragX));
  front.style.transform = `translateX(${distance}px)`;
  mid.style.transform = `translateX(${distance * 0.24}px)`;
}

function onPointerUp(event) {
  if (!dragging) return;
  dragging = false;
  stage.classList.remove("is-dragging");
  stage.releasePointerCapture(event.pointerId);
  stage.querySelectorAll(".card").forEach((card) => {
    card.style.transform = "";
  });

  if (Math.abs(dragX) > 48) {
    advance(dragX < 0 ? 1 : -1);
  }
}

stage.addEventListener("click", (event) => {
  const hit = event.target.closest(".next-hit, .slot-mid, .slot-back");
  if (!hit || !stage.contains(hit)) return;
  advance(1);
});
stage.addEventListener("pointerdown", onPointerDown);
stage.addEventListener("pointermove", onPointerMove);
stage.addEventListener("pointerup", onPointerUp);
stage.addEventListener("pointercancel", onPointerUp);

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") advance(-1);
  if (event.key === "ArrowRight") advance(1);
});

buildCards();
