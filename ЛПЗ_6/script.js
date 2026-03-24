// ========== ПЛАНИРОВЩИК ЗАДАЧ 2026 ==========
// Лабораторная работа №5 - Расширенная версия

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

// Состояние приложения
let tasks = [];
let currentFilter = 'all'; // all, work, study, personal, home
let searchQuery = '';
let currentTheme = 'light';

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

        // Загрузка темы
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            currentTheme = savedTheme;
            applyTheme(currentTheme);
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

    // Обновление счетчиков категорий
    updateCategoryCounters();
};

// Обновление счетчиков категорий
const updateCategoryCounters = () => {
    const categories = ['work', 'study', 'personal', 'home'];
    categories.forEach(cat => {
        const count = tasks.filter(t => t.category === cat && !t.completed).length;
        const counterSpan = document.getElementById(`${cat}Count`);
        if (counterSpan) {
            counterSpan.textContent = count;
        }
    });
};

// Получение приоритета задачи для сортировки
const getPriorityWeight = (priority) => {
    const weights = { 'high': 3, 'medium': 2, 'low': 1 };
    return weights[priority] || 0;
};

// Получение статуса просрочки
const getTaskStatus = (task) => {
    if (!task.dueDate) return 'no-date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) return 'overdue';
    if (dueDate.getTime() === today.getTime()) return 'today';
    return 'future';
};

// Сортировка задач
const sortTasks = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
        // Сначала сортируем по статусу (просроченные, сегодня, остальные)
        const statusA = getTaskStatus(a);
        const statusB = getTaskStatus(b);
        const statusOrder = { 'overdue': 1, 'today': 2, 'future': 3, 'no-date': 4 };
        if (statusOrder[statusA] !== statusOrder[statusB]) {
            return statusOrder[statusA] - statusOrder[statusB];
        }

        // Затем по приоритету
        const priorityA = getPriorityWeight(a.priority);
        const priorityB = getPriorityWeight(b.priority);
        if (priorityA !== priorityB) {
            return priorityB - priorityA;
        }

        // Затем по дате создания
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
};

// Фильтрация и поиск задач
const getFilteredTasks = () => {
    let filtered = [...tasks];

    // Фильтр по категории
    if (currentFilter !== 'all') {
        filtered = filtered.filter(task => task.category === currentFilter);
    }

    // Поиск по тексту
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(task =>
            task.text.toLowerCase().includes(query)
        );
    }

    // Сортировка
    return sortTasks(filtered);
};

// Получение класса для приоритета
const getPriorityClass = (priority) => {
    const classes = {
        'high': 'task-priority-high',
        'medium': 'task-priority-medium',
        'low': 'task-priority-low'
    };
    return classes[priority] || '';
};

// Получение текста приоритета на русском
const getPriorityText = (priority) => {
    const texts = {
        'high': '🔴 Высокий',
        'medium': '🟡 Средний',
        'low': '🟢 Низкий'
    };
    return texts[priority] || '';
};

// Получение текста категории
const getCategoryText = (category) => {
    const texts = {
        'work': '💼 Работа',
        'study': '📚 Учеба',
        'personal': '👤 Личное',
        'home': '🏠 Дом'
    };
    return texts[category] || '📋 Без категории';
};

// Подсветка найденного текста
const highlightText = (text, query) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
};

// Создание элемента задачи
const createTaskElement = (task, index, filteredTasks) => {
    const li = document.createElement('li');
    li.className = `task-item priority-${task.priority || 'medium'}`;
    li.setAttribute('data-id', task.id);

    // Добавляем класс для просрочки
    const status = getTaskStatus(task);
    if (status === 'overdue') {
        li.classList.add('task-overdue');
    } else if (status === 'today') {
        li.classList.add('task-today');
    }

    li.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;

    // Чекбокс
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.completed;

    // Контейнер для информации о задаче
    const infoDiv = document.createElement('div');
    infoDiv.className = 'task-info';

    // Текст задачи
    const textSpan = document.createElement('span');
    textSpan.className = `task-text ${task.completed ? 'completed' : ''}`;
    if (searchQuery.trim()) {
        textSpan.innerHTML = highlightText(task.text, searchQuery);
    } else {
        textSpan.textContent = task.text;
    }
    textSpan.setAttribute('data-original-text', task.text);

    // Приоритет
    const prioritySpan = document.createElement('span');
    prioritySpan.className = `task-priority ${getPriorityClass(task.priority)}`;
    prioritySpan.textContent = getPriorityText(task.priority);

    // Категория
    const categorySpan = document.createElement('span');
    categorySpan.className = 'task-category';
    categorySpan.textContent = getCategoryText(task.category);

    // Дата выполнения
    let dueDateSpan = null;
    if (task.dueDate) {
        dueDateSpan = document.createElement('span');
        dueDateSpan.className = 'task-due-date';
        const dueDate = new Date(task.dueDate);
        dueDateSpan.textContent = `📅 ${dueDate.toLocaleDateString('ru-RU')}`;
    }

    // Дата создания
    const createdSpan = document.createElement('span');
    createdSpan.className = 'task-date';
    const createdDate = new Date(task.createdAt);
    createdSpan.textContent = `➕ ${createdDate.toLocaleDateString('ru-RU')}`;

    if (task.lastEdited) {
        const editedSpan = document.createElement('span');
        editedSpan.className = 'task-edited';
        const editedDate = new Date(task.lastEdited);
        editedSpan.textContent = `✏️ ${editedDate.toLocaleDateString('ru-RU')}`;
        infoDiv.appendChild(editedSpan);
    }

    infoDiv.appendChild(textSpan);
    infoDiv.appendChild(prioritySpan);
    infoDiv.appendChild(categorySpan);
    if (dueDateSpan) infoDiv.appendChild(dueDateSpan);
    infoDiv.appendChild(createdSpan);

    // Кнопка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.setAttribute('aria-label', 'Удалить задачу');

    li.appendChild(checkbox);
    li.appendChild(infoDiv);
    li.appendChild(deleteBtn);

    // Обработчик двойного клика для редактирования
    textSpan.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        startEditing(textSpan, task);
    });

    return li;
};

// Редактирование задачи
const startEditing = (textSpan, task) => {
    const originalText = task.text;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.className = 'edit-input';

    textSpan.style.display = 'none';
    textSpan.parentNode.insertBefore(input, textSpan);
    input.focus();

    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText && newText !== originalText) {
            task.text = newText;
            task.lastEdited = new Date().toISOString();
            saveToStorage();
            renderTasks();
            console.log(`✏️ Задача отредактирована: "${originalText}" -> "${newText}"`);
        } else if (!newText) {
            alert('Текст задачи не может быть пустым!');
        }
        input.remove();
        textSpan.style.display = '';
    };

    const cancelEdit = () => {
        input.remove();
        textSpan.style.display = '';
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
};

// Отрисовка задач
const renderTasks = () => {
    console.log('🔄 Рендеринг задач:', tasks.length);

    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        if (tasks.length === 0) {
            tasksList.innerHTML = '<li class="empty-message">✨ Добавьте свою первую задачу</li>';
        } else if (searchQuery) {
            tasksList.innerHTML = '<li class="empty-message">🔍 Ничего не найдено</li>';
        } else {
            tasksList.innerHTML = '<li class="empty-message">📂 Нет задач в этой категории</li>';
        }
        return;
    }

    tasksList.innerHTML = '';

    filteredTasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index, filteredTasks);
        tasksList.appendChild(taskElement);
    });
};

// Создание новой задачи
const createTask = (text) => {
    const priority = document.getElementById('taskPriority')?.value || 'medium';
    const category = document.getElementById('taskCategory')?.value || 'personal';
    const dueDate = document.getElementById('taskDueDate')?.value || '';

    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        priority: priority,
        category: category,
        dueDate: dueDate,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    renderTasks();
    updateStats();
    saveToStorage();
    console.log('✅ Задача добавлена:', newTask);
};

// Применение темы
const applyTheme = (theme) => {
    const container = document.querySelector('.container');
    const stats = document.querySelector('.stats');
    const taskItems = document.querySelectorAll('.task-item');

    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        container.classList.add('dark-container');
        if (stats) stats.classList.add('dark-stats');
        taskItems.forEach(item => item.classList.add('dark-task-item'));
    } else {
        document.body.classList.remove('dark-theme');
        container.classList.remove('dark-container');
        if (stats) stats.classList.remove('dark-stats');
        taskItems.forEach(item => item.classList.remove('dark-task-item'));
    }

    localStorage.setItem('theme', theme);
};

// Переключение темы
const toggleTheme = () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
};

// ===== СОЗДАНИЕ ДОПОЛНИТЕЛЬНЫХ ЭЛЕМЕНТОВ =====

// Добавление панели управления
const addControlPanel = () => {
    const container = document.querySelector('.container');
    const addTaskDiv = document.querySelector('.add-task');

    // Панель приоритетов и даты
    const taskControls = document.createElement('div');
    taskControls.className = 'task-controls';
    taskControls.innerHTML = `
        <div class="control-group">
            <label>Приоритет:</label>
            <select id="taskPriority">
                <option value="high">🔴 Высокий</option>
                <option value="medium" selected>🟡 Средний</option>
                <option value="low">🟢 Низкий</option>
            </select>
        </div>
        <div class="control-group">
            <label>Категория:</label>
            <select id="taskCategory">
                <option value="work">💼 Работа</option>
                <option value="study">📚 Учеба</option>
                <option value="personal">👤 Личное</option>
                <option value="home">🏠 Дом</option>
            </select>
        </div>
        <div class="control-group">
            <label>Срок:</label>
            <input type="date" id="taskDueDate">
        </div>
    `;

    container.insertBefore(taskControls, addTaskDiv.nextSibling);

    // Панель фильтров категорий
    const filterPanel = document.createElement('div');
    filterPanel.className = 'filter-panel';
    filterPanel.innerHTML = `
        <button class="filter-btn active" data-filter="all">📋 Все</button>
        <button class="filter-btn" data-filter="work">💼 Работа (<span id="workCount">0</span>)</button>
        <button class="filter-btn" data-filter="study">📚 Учеба (<span id="studyCount">0</span>)</button>
        <button class="filter-btn" data-filter="personal">👤 Личное (<span id="personalCount">0</span>)</button>
        <button class="filter-btn" data-filter="home">🏠 Дом (<span id="homeCount">0</span>)</button>
    `;

    container.insertBefore(filterPanel, document.querySelector('.stats'));

    // Строка поиска
    const searchDiv = document.createElement('div');
    searchDiv.className = 'search-container';
    searchDiv.innerHTML = `
        <input type="text" id="searchInput" placeholder="🔍 Поиск по задачам..." class="search-input">
    `;

    container.insertBefore(searchDiv, filterPanel.nextSibling);

    // Кнопка темы
    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle';
    themeBtn.innerHTML = '🌙';
    themeBtn.id = 'themeToggle';
    container.appendChild(themeBtn);

    // Обработчики событий
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderTasks();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
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

// Добавляем CSS-стили
const addStyles = () => {
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
        
        /* Панели управления */
        .task-controls {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            flex-wrap: wrap;
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
            flex: 1;
            min-width: 120px;
        }
        
        .control-group label {
            font-size: 12px;
            color: #666;
            font-weight: 500;
        }
        
        .control-group select,
        .control-group input {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }
        
        /* Фильтры */
        .filter-panel {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 8px 15px;
            background: #f0f0f0;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
        }
        
        .filter-btn:hover {
            background: #e0e0e0;
            transform: translateY(-2px);
        }
        
        .filter-btn.active {
            background: #c00b3b;
            color: white;
        }
        
        /* Поиск */
        .search-container {
            margin-bottom: 20px;
        }
        
        .search-input {
            width: 100%;
            padding: 10px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .search-input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .search-highlight {
            background: #ffeb3b;
            padding: 0 2px;
            border-radius: 3px;
        }
        
        /* Задачи */
        .task-info {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
        }
        
        .task-text {
            font-size: 16px;
            color: #333;
            flex: 1;
            min-width: 150px;
        }
        
        .task-priority {
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 500;
        }
        
        .task-priority-high {
            background: #fee;
            color: #c00;
            border: 1px solid #fcc;
        }
        
        .task-priority-medium {
            background: #ffeaa7;
            color: #d63031;
            border: 1px solid #ffeaa7;
        }
        
        .task-priority-low {
            background: #e8f5e9;
            color: #27ae60;
            border: 1px solid #c8e6c9;
        }
        
        .task-category {
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 12px;
            background: #e3f2fd;
            color: #1976d2;
        }
        
        .task-due-date,
        .task-date,
        .task-edited {
            font-size: 11px;
            color: #999;
        }
        
        .task-item.priority-high {
            border-left: 4px solid #e74c3c;
        }
        
        .task-item.priority-medium {
            border-left: 4px solid #f39c12;
        }
        
        .task-item.priority-low {
            border-left: 4px solid #27ae60;
        }
        
        .task-overdue {
            background: #ffebee !important;
            border-left: 4px solid #e74c3c;
        }
        
        .task-today {
            background: #fff3e0 !important;
            border-left: 4px solid #ff9800;
        }
        
        .task-text.completed {
            text-decoration: line-through;
            color: #999;
        }
        
        /* Редактирование */
        .edit-input {
            flex: 1;
            padding: 5px 10px;
            border: 2px solid #667eea;
            border-radius: 6px;
            font-size: 14px;
        }
        
        /* Кнопка темы */
        .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: all 0.3s;
            z-index: 1000;
        }
        
        .theme-toggle:hover {
            transform: scale(1.1);
        }
        
        /* Тёмная тема */
        body.dark-theme {
            background: linear-gradient(135deg, #1e1e2f, #2d2d44);
        }
        
        .dark-container {
            background: #2d2d44;
            color: #e0e0e0;
        }
        
        .dark-container h1,
        .dark-container .subtitle {
            color: #e0e0e0;
        }
        
        .dark-stats {
            background: #3d3d5c;
            color: #e0e0e0;
        }
        
        .dark-task-item {
            background: #3d3d5c;
            color: #e0e0e0;
        }
        
        .dark-task-item .task-text {
            color: #e0e0e0;
        }
        
        .task-controls.dark,
        .filter-panel.dark {
            background: #3d3d5c;
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .task-controls {
                flex-direction: column;
            }
            
            .control-group {
                width: 100%;
            }
            
            .task-info {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .theme-toggle {
                top: 10px;
                right: 10px;
                width: 35px;
                height: 35px;
                font-size: 18px;
            }
        }
    `;
    document.head.appendChild(style);
};

// Инициализация
addStyles();
addControlPanel();
loadFromStorage();
console.log('%c✅ Планировщик готов к работе!', 'color: #10b981; font-size: 16px; font-weight: bold;');