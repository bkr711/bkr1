const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksContainer = document.getElementById('tasksContainer');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

// عناصر الإحصائيات
const totalTasksElement = document.getElementById('totalTasks');
const pendingTasksElement = document.getElementById('pendingTasks');
const completedTasksElement = document.getElementById('completedTasks');

// حالة التصفية الحالية
let currentFilter = 'all';

// المهام
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function initApp() {
    renderTasks();
    updateStats();
    
    // إضافة مستمعي الأحداث
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    clearAllBtn.addEventListener('click', clearAllTasks);
    
    // إضافة مستمعي الأحداث لأزرار التصفية
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });
}

