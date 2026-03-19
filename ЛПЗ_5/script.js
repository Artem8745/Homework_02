// ========== ПЛАНИРОВЩИК ЗАДАЧ 2026 ==========
// Лабораторная работа №2 по JavaScript

console.log("%c🚀 Планировщик задач запущен!", "color: green; font-size: 16px; font-weight: bold;");

// Константы
const STORAGE_KEY = 'todo_app_tasks';

// Элементы DOM
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const totalSpan = document.getElementById('totalTasks');
const completedSpan = document.getElementById('completedTasks');
const pendingSpan = document.getElementById('pendingTasks');
const clearBtn = document.getElementById('clearBtn');

// Проверка элементов
console.log('✅ Элементы найдены:', {
    taskInput: !!taskInput,
    addBtn: !!addBtn,
    tasksList: !!tasksList,
    totalSpan: !!totalSpan,
    completedSpan: !!completedSpan,
    pendingSpan: !!pendingSpan,
    clearBtn: !!clearBtn
});

// Состояние приложения
let tasks = [];

// ===== ФУНКЦИИ =====

// Загрузка из localStorage
const loadFromStorage = () => {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (json) {
            tasks = JSON.parse(json);
            console.log('📂 Загружено задач из localStorage:', tasks.length);
        } else {
            console.log('📂 В localStorage нет сохранённых задач');
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        tasks = [];
    }
    renderTasks();
    updateStats();
};

// Сохранение в localStorage
const saveToStorage = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        console.log('💾 Задачи сохранены в localStorage. Всего:', tasks.length);
    } catch (error) {
        console.error('Ошибка сохранения:', error);
    }
};

// Обновление статистики
const updateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalSpan.textContent = total;
    completedSpan.textContent = completed;
    pendingSpan.textContent = pending;
};

// Отрисовка задач
const renderTasks = () => {
    console.log('🔄 Рендеринг задач:', tasks.length);

    if (tasks.length === 0) {
        tasksList.innerHTML = '<li class="empty-message">✨ Добавьте свою первую задачу</li>';
        return;
    }

    tasksList.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.setAttribute('data-id', task.id);
        li.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;

        // Чекбокс
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-check';
        checkbox.checked = task.completed;

        // Текст задачи
        const textSpan = document.createElement('span');
        textSpan.className = `task-text ${task.completed ? 'completed' : ''}`;
        textSpan.textContent = task.text;

        // Дата
        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        dateSpan.textContent = task.date || new Date().toLocaleDateString('ru-RU');

        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.setAttribute('aria-label', 'Удалить задачу');

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(dateSpan);
        li.appendChild(deleteBtn);

        tasksList.appendChild(li);
    });
};

// Создание новой задачи
const createTask = (text) => {
    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        date: new Date().toLocaleDateString('ru-RU'),
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    renderTasks();
    updateStats();
    saveToStorage();
    console.log('✅ Задача добавлена:', newTask);
};

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====

// Добавление задачи по кнопке
addBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Пожалуйста, введите текст задачи!');
        return;
    }

    createTask(taskText);
    taskInput.value = '';
    taskInput.focus();
});

// Добавление задачи по Enter
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

// Делегирование событий для списка задач
tasksList.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.getAttribute('data-id');
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Обработка чекбокса
    if (e.target.classList.contains('task-check')) {
        task.completed = e.target.checked;

        const textSpan = taskItem.querySelector('.task-text');
        if (textSpan) {
            textSpan.classList.toggle('completed', task.completed);
        }

        updateStats();
        saveToStorage();
        console.log(`📌 Задача "${task.text}" отмечена как ${task.completed ? 'выполненная' : 'невыполненная'}`);
    }

    // Обработка кнопки удаления
    if (e.target.classList.contains('delete-btn')) {
        if (confirm(`Удалить задачу "${task.text}"?`)) {
            tasks = tasks.filter(t => t.id !== taskId);
            renderTasks();
            updateStats();
            saveToStorage();
            console.log('🗑️ Задача удалена:', task);
        }
    }
});

// Очистка всех задач
clearBtn.addEventListener('click', () => {
    if (tasks.length === 0) {
        alert('Список задач уже пуст!');
        return;
    }

    if (confirm('Вы уверены, что хотите удалить все задачи?')) {
        tasks = [];
        renderTasks();
        updateStats();
        saveToStorage();
        console.log('🧹 Все задачи удалены');
    }
});

// Добавляем CSS-анимацию
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

// Загружаем задачи при старте
loadFromStorage();
console.log('%c✅ Планировщик готов к работе!', 'color: #10b981; font-size: 16px; font-weight: bold;');