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

// إضافة مهمة جديدة
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        showAlert('يرجى إدخال نص المهمة', 'error');
        return;
    }
    
    // إنشاء كائن المهمة الجديدة
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // إضافة المهمة إلى المصفوفة
    tasks.unshift(newTask);
    
    // حفظ في التخزين المحلي
    saveTasks();
    
    // إعادة عرض المهام
    renderTasks();
    
    // تحديث الإحصائيات
    updateStats();
    
    // مسح حقل الإدخال
    taskInput.value = '';
    
    // إعادة التركيز على حقل الإدخال
    taskInput.focus();
    
    // عرض رسالة نجاح
    showAlert('تمت إضافة المهمة بنجاح', 'success');
}

// عرض المهام في الواجهة
function renderTasks() {
    // تصفية المهام حسب التصفية الحالية
    let filteredTasks = tasks;
    
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // إذا لم تكن هناك مهام
    if (filteredTasks.length === 0) {
        let message = '';
        switch(currentFilter) {
            case 'pending': message = 'لا توجد مهام قيد الانتظار'; break;
            case 'completed': message = 'لا توجد مهام مكتملة'; break;
            default: message = 'لا توجد مهام حالياً. أضف مهمة جديدة لتبدأ!';
        }
        
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>${message}</p>
            </div>
        `;
        return;
    }
    
    // إنشاء HTML للمهام
    const tasksHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
            </div>
            <div class="task-actions">
                <button class="edit-btn" title="تعديل المهمة">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="حذف المهمة">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    tasksContainer.innerHTML = tasksHTML;
    
    // إضافة مستمعي الأحداث للمهام المعروضة
    addTaskEventListeners();
}


// إضافة مستمعي الأحداث للمهام
function addTaskEventListeners() {
    // مستمع حدث للتحقق من إكمال المهمة
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskId = parseInt(this.closest('.task-item').getAttribute('data-id'));
            toggleTaskCompletion(taskId);
        });
    });
    
    // مستمع حدث لحذف المهمة
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = parseInt(this.closest('.task-item').getAttribute('data-id'));
            deleteTask(taskId);
        });
    });
    
    // مستمع حدث لتعديل المهمة
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = parseInt(this.closest('.task-item').getAttribute('data-id'));
            editTask(taskId);
        });
    });
}


