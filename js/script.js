const COLORS = [
    '#2980b9', '#27ae60', '#8e44ad', '#e67e22', '#1abc9c',
    '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#16a085',
    '#2471a3', '#1e8449', '#7d3c98', '#d4ac0d', '#148f77',
    '#5dade2', '#58d68d', '#af7ac5', '#f7dc6f', '#48c9b0'
];

const DEFAULT_OPTIONS = ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'];

let options = [...DEFAULT_OPTIONS];
let currentRotation = 0;
let isSpinning = false;

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const optionInput = document.getElementById('option-input');
const addBtn = document.getElementById('add-btn');
const optionsList = document.getElementById('options-list');
const resultText = document.getElementById('result-text');
const resultBanner = document.getElementById('result-banner');
const resetBtn = document.getElementById('reset-btn');

const cx = canvas.width / 2;
const cy = canvas.height / 2;
const radius = canvas.width / 2 - 4;

function getColor(index) {
    return COLORS[index % COLORS.length];
}

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (options.length === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#222';
        ctx.fill();
        ctx.fillStyle = '#555';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Добавьте варианты', cx, cy);
        return;
    }

    const sliceAngle = (Math.PI * 2) / options.length;

    options.forEach((option, i) => {
        const startAngle = i * sliceAngle - Math.PI / 2;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = getColor(i);
        ctx.fill();

        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + sliceAngle / 2);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 17px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textRadius = radius * 0.65;
        const displayText = option.length > 16 ? option.slice(0, 14) + '...' : option;
        ctx.fillText(displayText, textRadius, 0);

        ctx.restore();
    });
}

function renderOptionsList() {
    optionsList.innerHTML = '';
    options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option-item';

        div.innerHTML = `
            <span class="option-color" style="background:${getColor(i)}"></span>
            <span class="option-label">${opt}</span>
            <button class="option-delete" data-index="${i}">&times;</button>
        `;

        optionsList.appendChild(div);
    });

    optionsList.querySelectorAll('.option-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            options.splice(idx, 1);
            renderOptionsList();
            drawWheel();
        });
    });
}

function addOption() {
    const value = optionInput.value.trim();
    if (!value) return;
    if (options.length >= 20) {
        resultText.textContent = 'Максимум 20 вариантов!';
        return;
    }
    options.push(value);
    optionInput.value = '';
    renderOptionsList();
    drawWheel();
    optionInput.focus();
}

function getWinningIndex(finalAngle) {
    const sliceAngle = (Math.PI * 2) / options.length;
    const norm = ((finalAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const idx = Math.floor((Math.PI * 2 - norm) / sliceAngle) % options.length;
    return idx;
}

function spin() {
    if (isSpinning || options.length < 2) {
        if (options.length < 2) {
            resultText.textContent = 'Нужно минимум 2 варианта!';
        }
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    resultBanner.classList.remove('won');

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const targetAngle = Math.random() * Math.PI * 2;
    const totalRotation = extraSpins * Math.PI * 2 + targetAngle;
    const duration = 4000 + Math.random() * 1500;

    const startRotation = currentRotation;
    const startTime = performance.now();

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        currentRotation = startRotation + totalRotation * eased;
        canvas.style.transform = `rotate(${currentRotation}rad)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            const winningIndex = getWinningIndex(currentRotation);
            const winner = options[winningIndex];

            resultText.textContent = ` ${winner}`;
            resultBanner.classList.add('won');
            isSpinning = false;
            spinBtn.disabled = false;
        }
    }

    requestAnimationFrame(animate);
}

addBtn.addEventListener('click', addOption);
optionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addOption();
});
spinBtn.addEventListener('click', spin);
canvas.addEventListener('click', spin);

resetBtn.addEventListener('click', () => {
    options = [...DEFAULT_OPTIONS];
    currentRotation = 0;
    canvas.style.transform = 'rotate(0rad)';
    resultText.textContent = 'Добавьте варианты и крутите!';
    resultBanner.classList.remove('won');
    renderOptionsList();
    drawWheel();
});

renderOptionsList();
drawWheel();
