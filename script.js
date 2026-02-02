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


// تبديل حالة إكمال المهمة
function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        updateStats();
        
        // عرض رسالة
        const message = tasks[taskIndex].completed 
            ? 'تم تعيين المهمة كمكتملة' 
            : 'تم تعيين المهمة كقيد الانتظار';
        showAlert(message, 'success');
    }
}



// حذف المهمة
function deleteTask(taskId) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateStats();
        showAlert('تم حذف المهمة بنجاح', 'success');
    }
}

// تعديل المهمة
function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    
    if (!task) return;
    
    const newText = prompt('قم بتعديل نص المهمة:', task.text);
    
    if (newText !== null && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
        renderTasks();
        showAlert('تم تعديل المهمة بنجاح', 'success');
    }
}


// حذف جميع المهام المكتملة
function clearCompletedTasks() {
    if (!tasks.some(task => task.completed)) {
        showAlert('لا توجد مهام مكتملة للحذف', 'info');
        return;
    }
    
    if (confirm('هل أنت متأكد من حذف جميع المهام المكتملة؟')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
        showAlert('تم حذف جميع المهام المكتملة', 'success');
    }
}

bash
// حذف جميع المهام
function clearAllTasks() {
    if (tasks.length === 0) {
        showAlert('لا توجد مهام للحذف', 'info');
        return;
    }
    
    if (confirm('هل أنت متأكد من حذف جميع المهام؟ لا يمكن التراجع عن هذا الإجراء.')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
        showAlert('تم حذف جميع المهام', 'success');
    }
}
// تحديث الإحصائيات
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    totalTasksElement.textContent = total;
    completedTasksElement.textContent = completed;
    pendingTasksElement.textContent = pending;
}

// حفظ المهام في التخزين المحلي
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


// عرض رسائل التنبيه
function showAlert(message, type) {
    // إنشاء عنصر التنبيه
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    
    // إضافة أنماط CSS للتنبيه
    alertEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    // تحديد اللون حسب نوع التنبيه
    if (type === 'success') {
        alertEl.style.backgroundColor = '#00b894';
    } else if (type === 'error') {
        alertEl.style.backgroundColor = '#e74c3c';
    } else if (type === 'info') {
        alertEl.style.backgroundColor = '#3498db';
    }
    
    // إضافة التنبيه إلى الجسم
    document.body.appendChild(alertEl);
    
    // إزالة التنبيه بعد 3 ثوانٍ
    setTimeout(() => {
        alertEl.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(alertEl);
        }, 300);
    }, 3000);
    
    // إضافة أنماط الحركة
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { top: -100px; opacity: 0; }
            to { top: 20px; opacity: 1; }
        }
        @keyframes slideOut {
            from { top: 20px; opacity: 1; }
            to { top: -100px; opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}


// إضافة بعض المهام الافتراضية عند التشغيل الأول إذا لم يكن هناك مهام
if (tasks.length === 0) {
    tasks = [
        { id: 1, text: 'مراجعة مشروع HTML وCSS', completed: true, createdAt: new Date().toISOString() },
        { id: 2, text: 'تعلم JavaScript متقدم', completed: false, createdAt: new Date().toISOString() },
        { id: 3, text: 'تصميم واجهة مستخدم جديدة', completed: false, createdAt: new Date().toISOString() },
        { id: 4, text: 'رفع المشروع على GitHub', completed: false, createdAt: new Date().toISOString() }
    ];
    saveTasks();
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);


