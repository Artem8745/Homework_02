// ✅ Правильная обработка загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM полностью загружен');
    initExperiments();
});

function initExperiments() {
    // Эксперимент 1: Инспектор стилей (функции для кнопок)
    window.changeBackground = () => {
        document.body.style.backgroundColor = 'lightblue';
    };

    window.resizeImages = () => {
        // ✅ Правильно: используем querySelectorAll для всех изображений
        document.querySelectorAll('img').forEach(img => {
            img.style.width = '200px';
            img.style.height = 'auto';
        });
    };

    window.changeTitle = () => {
        const h1 = document.querySelector('h1');
        if (h1) {
            h1.textContent = 'Я изменил это через консоль!';
        }
    };

    // Эксперимент 2: Живой список
    let intervalId = null;
    let counter = 1;

    window.startLiveList = () => {
        // Проверяем, не запущен ли уже список
        if (intervalId) {
            console.log('Список уже запущен');
            return;
        }

        // Создаем контейнер для списка
        let container = document.getElementById('liveListContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'liveListContainer';
            document.body.appendChild(container);
        }

        // Создаем или получаем существующий список
        let list = container.querySelector('ul');
        if (!list) {
            list = document.createElement('ul');
            container.appendChild(list);
        }

        // Запускаем интервал
        intervalId = setInterval(() => {
            const item = document.createElement('li');
            // ✅ Используем textContent для безопасности
            item.textContent = `Элемент ${counter++}`;
            list.appendChild(item);

            // Автоскролл к новому элементу
            item.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 1000);
    };

    window.stopLiveList = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            console.log('Список остановлен');
        }
    };

    // Демонстрация исправления ошибок
    demonstrateErrorFixes();
}

function demonstrateErrorFixes() {
    // ❌ Ошибка 1: работа с несколькими элементами
    // Неправильно:
    // const cards = document.querySelector('.card');
    // cards.style.backgroundColor = 'red'; // покрасит только первый

    // ✅ Правильно:
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.backgroundColor = index === 0 ? '#e3f2fd' : '#f5f5f5';
    });

    // Демонстрация разницы между textContent и innerHTML
    const demoDiv = document.createElement('div');
    demoDiv.style.marginTop = '20px';
    demoDiv.style.padding = '10px';
    demoDiv.style.backgroundColor = '#f0f0f0';
    demoDiv.style.borderRadius = '5px';

    // ✅ textContent - безопасно
    const textContentDemo = document.createElement('div');
    textContentDemo.innerHTML = '<strong>textContent пример:</strong> ';
    const textSpan = document.createElement('span');
    textSpan.textContent = '<script>alert("XSS")</script>'; // Безопасно
    textContentDemo.appendChild(textSpan);

    // innerHTML - потенциально опасно
    const innerHTMLDemo = document.createElement('div');
    innerHTMLDemo.innerHTML = '<strong>innerHTML пример:</strong> <em>покажет HTML-теги</em>';

    demoDiv.appendChild(textContentDemo);
    demoDiv.appendChild(innerHTMLDemo);
    document.body.appendChild(demoDiv);

    console.log('✅ Демонстрация исправления ошибок завершена');
}

// Дополнительно: пример правильной работы с динамическими элементами
class StyleInspector {
    static changeAllCards(color) {
        document.querySelectorAll('.card').forEach(card => {
            card.style.backgroundColor = color;
        });
    }

    static resetStyles() {
        document.querySelectorAll('.card, img').forEach(el => {
            if (el.tagName === 'IMG') {
                el.style.width = '';
                el.style.height = '';
            } else {
                el.style.backgroundColor = '';
            }
        });
        document.body.style.backgroundColor = '';
    }
}

// Экспорт для использования в консоли
window.StyleInspector = StyleInspector;

console.log('Скрипт загружен! Доступные функции:');
console.log('- changeBackground()');
console.log('- resizeImages()');
console.log('- changeTitle()');
console.log('- startLiveList()');
console.log('- stopLiveList()');
console.log('- StyleInspector.changeAllCards(color)');