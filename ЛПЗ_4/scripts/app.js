const buildingContainer = document.querySelector('#buildingContainer');

const buildingName = prompt("Какое будет название жилого комплекса?", 'Небоскрёбище');
const floors = Number(prompt("Сколько этажей будет в вашем небоскрёбе?", 10));
const countApartments = Number(prompt("Какое количество квартир на этаже?", 10));
const constructionYear = Number(prompt("Какой год окончания строительства?", '2026'));
const availabilityFitnesCenter = prompt("Будет ли фитнес центр? да/нет", 'нет');

// Добавляем стили для анимации
const style = document.createElement('style');
style.textContent = `
    .floor {
        animation: grow 0.3s ease-out forwards;
        opacity: 0;
        transform-origin: bottom;
    }
    
    .foundation {
        animation: fadeIn 0.5s ease-out forwards;
    }
    
    .roof {
        animation: fadeIn 0.5s ease-out forwards;
    }
    
    @keyframes grow {
        from { 
            opacity: 0; 
            transform: scaleY(0); 
        }
        to { 
            opacity: 1; 
            transform: scaleY(1); 
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

function getSkyscraperFoundation() {
    return `<div class="foundation"></div>`;
}

let global_delay 

function getSkyscraperRoof() {
    return `<div class="roof" style="opacity: 0; animation-delay: ${global_delay}s"></div>`;
}

function buildVisualization() {
    buildingContainer.innerHTML = '';

    // Сначала добавляем фундамент
    buildingContainer.insertAdjacentHTML('beforeend', getSkyscraperFoundation());

    // Строим этажи снизу вверх (от 1 до floors)
    for (let i = 1; i <= floors; i++) {
        const delay = i * 0.15; // Увеличиваем задержку для более плавной анимации
        const icon = i % 2 === 0 ? '🚪' : '🪟';

        buildingContainer.insertAdjacentHTML('beforeend', `
            <div class="floor" style="animation-delay: ${delay}s">
                ${icon} Этаж: ${i}
            </div>
        `);

        if (i == floors) {
            global_delay = delay
        }
    }

    // Добавляем крышу сверху
    buildingContainer.insertAdjacentHTML('beforeend', getSkyscraperRoof());

    const buildingDescription = `
        🏢 ${buildingName.toUpperCase()}
        ━━━━━━━━━━━━━━━━━━
        🏗 Этажей: ${floors}
        🏘 Квартир на этаже: ${countApartments}
        📅 Год постройки: ${constructionYear}
        💪 Фитнес центр: ${availabilityFitnesCenter === 'да' ? '✅ Есть' : '❌ Нет'}
    `;

    buildingContainer.insertAdjacentHTML('beforeend', `
        <div class="building-description" style="animation: fadeIn 1s ease-out forwards; animation-delay: ${(floors + 1) * 0.15}s; opacity: 0;">${buildingDescription}</div>
    `);
}

buildVisualization();