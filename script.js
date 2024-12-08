const canvas = document.getElementById('skyCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let snowflakes = [];
let gifts = [];
let santa = {
    x: width, // Bắt đầu ngoài màn hình bên phải
    y: height * 0.1,
    width: 150,
    height: 80,
    image: new Image(),
    time: 0 // Để tạo chuyển động sóng sin
};

// Tải hình ảnh ông già Noel
santa.image.src = 'https://i.ibb.co/rbHJDQB/DALL-E-2024-12-02-23-37-removebg-preview.png';

// Các lời chúc ngẫu nhiên
const messages = [
    "🎄 Merry Christmas!",
    "🎁 Happy Holidays!",
    "❄️ Stay Warm and Cozy!",
    "✨ Wishing You Joy and Peace!",
    "🎅 Santa is Coming to Town!",
    "🌟 Shine Bright this Season!",
    "🎊 Cheers to a Magical Season!"
];

// Khởi tạo canvas và các phần tử
function init() {
    resize();
    createSnowflakes();
    createGifts();
    animate();
}

// Đặt kích thước canvas theo cửa sổ
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    santa.x = width;
    santa.y = height * 0.1;
}

window.addEventListener('resize', resize);

// Lớp Flocon de neige (Tuyết)
function Snowflake() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = Math.random() * 4 + 1;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = Math.random() * 3 + 1;
    this.opacity = Math.random() * 0.5 + 0.3;
    this.swing = Math.random() * 2;
    this.swingSpeed = Math.random() * 0.05 + 0.02;
    this.angle = Math.random() * Math.PI * 2;
}

Snowflake.prototype.update = function () {
    this.angle += this.swingSpeed;
    this.x += Math.cos(this.angle) * this.swing + this.speedX;
    this.y += this.speedY;

    // Nếu tuyết ra ngoài màn hình thì quay lại
    if (this.y > height) {
        this.y = 0;
        this.x = Math.random() * width;
    }
    if (this.x > width || this.x < 0) {
        this.x = Math.random() * width;
    }
};

Snowflake.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fill();
};

// Lớp Gift (Quà hoặc lời chúc)
function Gift() {
    this.x = Math.random() * width;
    this.y = Math.random() * -100;
    this.speedY = Math.random() * 1 + 0.5;
    this.opacity = Math.random() * 0.7 + 0.3;
    this.text = messages[Math.floor(Math.random() * messages.length)]; // Chọn ngẫu nhiên
    this.fontSize = Math.random() * 15 + 20;
    this.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${this.opacity})`;
}

Gift.prototype.update = function () {
    this.y += this.speedY;

    // Nếu quà/lời chúc ra khỏi màn hình thì đặt lại
    if (this.y > height) {
        this.y = Math.random() * -100;
        this.x = Math.random() * width;
        this.text = messages[Math.floor(Math.random() * messages.length)]; // Chọn lại ngẫu nhiên
    }
};

Gift.prototype.draw = function () {
    ctx.font = `${this.fontSize}px Arial`;
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x, this.y);
};

// Khởi tạo các đối tượng tuyết
function createSnowflakes() {
    let count = width / 8;
    snowflakes = [];
    for (let i = 0; i < count; i++) {
        snowflakes.push(new Snowflake());
    }
}

// Khởi tạo các đối tượng quà/lời chúc
function createGifts() {
    let count = Math.min(10, width / 100);
    gifts = [];
    for (let i = 0; i < count; i++) {
        gifts.push(new Gift());
    }
}

// Cập nhật vị trí ông già Noel
function updateSanta() {
    santa.time += 0.05;
    santa.x -= 3; // Tốc độ di chuyển ngang
    santa.y = height * 0.1 + Math.sin(santa.time) * 50; // Chuyển động sóng sin

    // Khi ông già Noel ra khỏi màn hình, đưa ông về bên phải
    if (santa.x + santa.width < 0) {
        santa.x = width;
    }
}

// Vẽ ông già Noel
function drawSanta() {
    ctx.drawImage(santa.image, santa.x, santa.y, santa.width, santa.height);
}

// Vòng lặp animation
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Vẽ tuyết
    snowflakes.forEach((flake) => {
        flake.update();
        flake.draw();
    });

    // Vẽ quà và lời chúc
    gifts.forEach((gift) => {
        gift.update();
        gift.draw();
    });

    // Vẽ ông già Noel
    updateSanta();
    drawSanta();

    requestAnimationFrame(animate);
}

// Bắt đầu
init();