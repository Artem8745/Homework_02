// --- Получение элементов DOM ---
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const submitBtn = document.getElementById('submitBtn');
const loginForm = document.getElementById('loginForm');
const togglePasswordBtn = document.getElementById('togglePassword');
const emailGroup = document.getElementById('emailGroup');
const passwordGroup = document.getElementById('passwordGroup');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const registerLink = document.getElementById('registerLink');

// --- Константы для валидации ---
const EMAIL_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 20;

// --- Состояние ошибок ---
let errors = {
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' }
};

// --- 1. Функция валидации email ---
const validateEmail = (email) => {
    const trimmedEmail = email.trim();

    // Проверка на пустое поле
    if (!trimmedEmail) {
        return { isValid: false, error: 'Email обязателен для заполнения' };
    }

    // Проверка максимальной длины
    if (trimmedEmail.length > EMAIL_MAX_LENGTH) {
        return { isValid: false, error: `Email не должен превышать ${EMAIL_MAX_LENGTH} символов` };
    }

    // Проверка на наличие @
    if (!trimmedEmail.includes('@')) {
        return { isValid: false, error: 'Email должен содержать символ @' };
    }

    // Разделяем email на локальную часть и домен
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) {
        return { isValid: false, error: 'Некорректный формат email' };
    }

    const [localPart, domain] = parts;

    // Проверка длины локальной части
    if (localPart.length < 3) {
        return { isValid: false, error: 'Минимум 3 символа до @' };
    }

    // Проверка на наличие точки в домене
    if (!domain.includes('.')) {
        return { isValid: false, error: 'Домен должен содержать точку (например, .com, .ru)' };
    }

    // Дополнительная проверка, что точка не первая и не последняя в домене
    if (domain.startsWith('.') || domain.endsWith('.')) {
        return { isValid: false, error: 'Некорректный формат домена' };
    }

    return { isValid: true, error: '' };
};

// --- 2. Функция валидации пароля (с расширенными требованиями) ---
const validatePassword = (password) => {
    // Проверка на пустое поле
    if (!password) {
        return { isValid: false, error: 'Пароль обязателен для заполнения' };
    }

    // Проверка длины
    if (password.length < PASSWORD_MIN_LENGTH) {
        return { isValid: false, error: `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов` };
    }
    if (password.length > PASSWORD_MAX_LENGTH) {
        return { isValid: false, error: `Пароль не должен превышать ${PASSWORD_MAX_LENGTH} символов` };
    }

    // Проверка на наличие хотя бы одной цифры
    const hasDigit = /\d/.test(password);
    if (!hasDigit) {
        return { isValid: false, error: 'Пароль должен содержать хотя бы одну цифру' };
    }

    // Проверка на наличие хотя бы одной буквы (латиница)
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasLetter) {
        return { isValid: false, error: 'Пароль должен содержать хотя бы одну букву (латиница)' };
    }

    // *** Дополнительные проверки (для 5 звездочек) ***
    // Хотя бы одна заглавная буква
    const hasUpperCase = /[A-Z]/.test(password);
    // Хотя бы один спецсимвол
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    // Мы не делаем их обязательными для базовой валидации, 
    // но используем для подсчета надежности.

    return {
        isValid: true,
        error: '',
        checks: { hasDigit, hasLetter, hasUpperCase, hasSpecialChar }
    };
};

// --- Функция для расчета надежности пароля (для счетчика) ---
const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, text: 'Введите пароль', color: '#f0f0f0' };

    let score = 0;
    const checks = {
        length: password.length >= 8, // За длину +1 балл
        hasDigit: /\d/.test(password),
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasSpecial: /[!@#$%^&*]/.test(password)
    };

    // Подсчет баллов
    if (password.length >= PASSWORD_MIN_LENGTH) score += 1;
    if (checks.length) score += 1;
    if (checks.hasDigit) score += 1;
    if (checks.hasLower) score += 1;
    if (checks.hasUpper) score += 1;
    if (checks.hasSpecial) score += 2; // Спецсимволы дают больше баллов

    // Нормализация до 5 баллов
    const normalizedScore = Math.min(5, Math.floor(score / 2));

    const strengthMap = {
        0: { text: 'Очень слабый', color: '#e74c3c' },
        1: { text: 'Слабый', color: '#e67e22' },
        2: { text: 'Средний', color: '#f1c40f' },
        3: { text: 'Хороший', color: '#3498db' },
        4: { text: 'Надёжный', color: '#2ecc71' },
        5: { text: 'Отличный', color: '#27ae60' }
    };

    return {
        score: normalizedScore,
        text: strengthMap[normalizedScore].text,
        color: strengthMap[normalizedScore].color,
        width: `${(normalizedScore / 5) * 100}%`
    };
};

// --- 3. Функция обновления UI ---
const updateUI = () => {
    // Валидация email
    const emailValidation = validateEmail(emailInput.value);
    errors.email = { isValid: emailValidation.isValid, message: emailValidation.error };

    // Валидация пароля
    const passwordValidation = validatePassword(passwordInput.value);
    errors.password = { isValid: passwordValidation.isValid, message: passwordValidation.error };

    // Обновление классов и сообщений для email
    if (!errors.email.isValid) {
        emailInput.classList.add('error');
        emailError.textContent = errors.email.message;
    } else {
        emailInput.classList.remove('error');
        emailError.textContent = '';
    }

    // Обновление классов и сообщений для пароля
    if (!errors.password.isValid) {
        passwordInput.classList.add('error');
        passwordError.textContent = errors.password.message;
    } else {
        passwordInput.classList.remove('error');
        passwordError.textContent = '';
    }

    // Блокировка/разблокировка кнопки
    submitBtn.disabled = !(errors.email.isValid && errors.password.isValid);

    // *** Дополнительно: обновление счетчика надежности пароля ***
    const strength = calculatePasswordStrength(passwordInput.value);
    strengthBar.style.width = strength.width;
    strengthBar.style.backgroundColor = strength.color;
    strengthText.textContent = strength.text;
    strengthText.style.color = strength.color;
};

// --- 4. Обработчик отправки формы ---
const handleSubmit = (event) => {
    event.preventDefault(); // Предотвращаем перезагрузку

    // Финальная проверка перед отправкой
    updateUI();

    if (errors.email.isValid && errors.password.isValid) {
        // *** Сохранение email в localStorage ***
        localStorage.setItem('lastEmail', emailInput.value.trim());

        // Показываем alert об успехе
        alert('✅ Успешный вход!');

        // Можно очистить форму или оставить как есть
        // passwordInput.value = ''; // Опционально
    }
};

// --- 5. Слушатели событий ---

// Слушатели ввода на полях (для мгновенной валидации)
emailInput.addEventListener('input', updateUI);
passwordInput.addEventListener('input', updateUI);

// Слушатель отправки формы
loginForm.addEventListener('submit', handleSubmit);

// *** Дополнительно: "глазик" для показа/скрытия пароля ***
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
});

// *** Дополнительно: загрузка последнего email из localStorage ***
const loadLastEmail = () => {
    const savedEmail = localStorage.getItem('lastEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
    }
};

// *** Дополнительно: обработка ссылки регистрации ***
registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('🔗 Переход на страницу регистрации (демо)');
});

// *** Дополнительно: анимация при фокусе на поле ***
[emailInput, passwordInput].forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transition = 'transform 0.2s';
    });
});

// --- Инициализация при загрузке страницы ---
loadLastEmail();
updateUI(); // Проверяем начальное состояние (поля пустые -> ошибки, кнопка заблокирована)