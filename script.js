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

