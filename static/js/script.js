
const baseUrl = '/api/'
const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');





// task management
const todoListDiv = document.getElementById('todolist')
const sideMenu =  document.getElementById('sideMenu')
const mainBox =  document.getElementById('main-box')
const selectedTaskForm =  document.getElementById('selectedTaskForm')

const store={
    user:{},
    selectedTask:null,
    tasks:[],
    groups:[],
    selectedGroup:null,
    setTasks: function(tasks){
        this.tasks = tasks
        renderList(this.tasks, todoListDiv)
    },
    deleteTask: function(id){
        this.tasks = this.tasks.filter(task => task.id !== id)
        renderList(this.tasks, todoListDiv)
    },
    addTask: function(task){
        this.tasks.unshift(task)
        renderTask(task, todoListDiv, false)
    },
    updateTask: function(id, updTask){
        this.tasks = this.tasks.map(task => task.id === id ? updTask : task)
        renderList(this.tasks, todoListDiv)
    },
    setSelectedTask: function(task){
        this.selectedTask=task
    }
}

async function apiFetch(path, {method='GET', data=null} = {}){
    // do later
}

function renderTask(task, listDiv, end = true){
    const itemDiv = document.createElement('div')
    const viewDiv = document.createElement('div')
    itemDiv.classList.add('list-group-item')
    viewDiv.classList.add('d-flex','flex-column', 'justify-content-between', 'gap-1')
    
    //Описание задачи
    const spanTitle = document.createElement('span')
    spanTitle.classList.add('task-title')
    spanTitle.textContent = `${task.title}`


    const spanStatus = document.createElement('span')
    spanStatus.style.fontSize='0.6rem'
    spanStatus.textContent=`${task.status_display}`

    const spanDueDate = document.createElement('span')
    spanDueDate.style.fontSize='0.6rem'
    if (task.due_date){
        spanDueDate.textContent=`${new Date(task.due_date).toLocaleDateString()}`
    }

    

    viewDiv.append(spanTitle)
    viewDiv.append(spanStatus)
    viewDiv.append(spanDueDate)

    itemDiv.append(viewDiv)
    itemDiv.addEventListener('click',(e)=>{
        store.setSelectedTask(task)
        sideMenu.classList.remove('hidden')
        mainBox.classList.add('task-selected')
        fillSelectedTaskForm()
    })

    //добавлять в конце или начале листа
    if (end){
        listDiv.append(itemDiv)
    } else{
        listDiv.prepend(itemDiv)
    }
}

function renderList(list, listDiv){
    listDiv.innerHTML = ""
    for (const item of list){
        renderTask(item, listDiv)
    }
}

function autoResize(){
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px'
}

function setupTextareaAutoResize(id){
    const ta = document.getElementById(id)
    if (ta){
        ta.style.maxHeight='500px'
        ta.addEventListener('input',(e)=>{
            autoResize.call(e.target)
        })
    }
}

setupTextareaAutoResize('selectTaskDescription')
setupTextareaAutoResize('addTaskDescription')

function fillSelectedTaskForm(){
    if (store.selectedTask){
        Object.keys(store.selectedTask).forEach(key=>{
            const fields = selectedTaskForm.elements.namedItem(key)

            if (!fields) return;

            if (fields instanceof RadioNodeList){
                const checkbox = [...fields].find(f => f.type==='checkbox');
                checkbox.checked = store.selectedTask[key] == 3;
                return
            }

            const field = fields;

            if (field.type === 'checkbox'){
                field.checked = store.selectedTask[key] == 3 
            } else if (field.type==='date' && store.selectedTask[key]){
                field.value = store.selectedTask[key].slice(0,10)
            } else if (field.type ==='textarea'){
                field.value = store.selectedTask[key]
                autoResize.call(field)
            }else {
                field.value = store.selectedTask[key]
            }
        })
    }
}


async function loadTodos(){
    try{
        const response = await fetch(baseUrl+'todos/')
        
        if (!response.ok){
            await handleBadResponse(response)
        }

        const data = await response.json()
        
        const tasks = Array.isArray(data) ? data : []
        store.setTasks(tasks)
    }catch(err){
        console.error(err)
    }    
}
async function loadTodo(id){
    try{
        const response = await fetch(baseUrl+'todos/' + id)
        
        if (!response.ok){
            await handleBadResponse(response)
        }

        const task = await response.json()
        console.log(task)
    }catch(err){
        console.error(err)
    }  
}

async function postTodo(todo){
    try{
        const response = await fetch(baseUrl+'todos/', {
            method: 'POST',
            headers: {
                'Content-type':'application/json'
            },
            body: JSON.stringify(todo)
        })
        if (!response.ok){
            await handleBadResponse(response)
        }
        
        const data = await response.json()
        store.addTask(data)
    }catch(err){
        console.error("Ошибка при создании задачи:", err)
    }
}

async function deleteTodo(id){
    try{
        const response = await fetch(baseUrl+'todos/' + id,{
            method:'DELETE'
        })
        if (!response.ok){
            await handleBadResponse(response)
        }
        store.deleteTask(id)
    }catch(err){
        console.error("Ошибка:", err.message)
    }
}


async function updateTodo(id, todo){
    try{
        const response = await fetch(baseUrl+'todos/' + id,{
            method:'PATCH',
            headers: {
                'Content-type':'application/json'
            },
            body: JSON.stringify(todo)
        })
        if (!response.ok){
            await handleBadResponse(response)
        }
        const updatedTask = await response.json()
        store.updateTask(id, updatedTask)
    }catch(err){
        console.error("Ошибка:", err.message)
    }
}


function closeSideMenu(){
    sideMenu.classList.add('hidden')
    mainBox.classList.remove('task-selected')
    store.setSelectedTask(null)
}

function setupAddTaskForm(id){
    const addTaskForm = document.getElementById(id)
    if (addTaskForm){
    addTaskForm.addEventListener('submit', (e)=>{
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries())
        if (data.due_date===''){
            data.due_date=null
        }
        postTodo(data)
        e.target.reset()
    })
}
}

function setupSideMenuForm(id){
    const selectedTaskForm =  document.getElementById(id)
    if (selectedTaskForm){
        selectedTaskForm.addEventListener('submit', (e)=>{
            e.preventDefault()
            if (store.selectedTask){
                const formData = new FormData(e.target)
                const data = Object.fromEntries(formData.entries())
                if (data.due_date===''){
                    data.due_date=null
                }
                updateTodo(store.selectedTask.id, data)
                closeSideMenu()
            }
        })
    }
}

function setupSideMenuCloseBtn(id){
    const sideMenuCloseBtn =  document.getElementById(id)
    if (sideMenuCloseBtn){
        sideMenuCloseBtn.addEventListener('click',(e)=>{
            closeSideMenu()
        })
    }
}

function setupDeleteTaskBtn(id){
    const deleteTaskBtn = document.getElementById(id)
    if (deleteTaskBtn){
        deleteTaskBtn.addEventListener('click',(e)=>{
            if (store.selectedTask){
                deleteTodo(store.selectedTask.id)
                closeSideMenu()
            }
        })
    }
}
setupAddTaskForm('add-task-form')
setupSideMenuForm('selectedTaskForm')
setupSideMenuCloseBtn('sideMenu-closebtn')
setupDeleteTaskBtn('deleteTaskBtn')

// login-register

const responseMessageSpan = document.getElementById('response-message')

async function login(data){
    try{
        const response = await fetch(baseUrl+'account/login',{
            method: 'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify(data),
        })
        if (!response.ok){
            await handleBadResponse(response)
        }
        window.location.href='/'
    }catch(err){
        responseMessageSpan.textContent=err.message
        console.log(err)
    }
}
async function register(data){
    try{
        const response = await fetch(baseUrl+'account/register',{
            method: 'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!response.ok){
            await handleBadResponse(response)
        }
        window.location.href='/login'
    }catch(err){
        responseMessageSpan.textContent=err
        console.log(err)
    }
}

async function getUser() {
    try{
        const response = await fetch(baseUrl+'account/getuser',{
            method: 'GET'
        })

        if (!response.ok){
            await handleBadResponse(response)
        }
        const data = await response.json()
        return data;
    }catch(err){
        console.log(err)
    }
}

async function logout(){
    try{
        const response = await fetch(baseUrl+'account/logout',{
            method: 'POST',
            headers:{
                'Content-type':'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials:'include'
        })

        if (!response.ok){
            await handleBadResponse(response)
        }
        window.location.href='/'
    }catch(err){
        console.log(err)
    }
}

// async function fetchShortcut(url, data, method='POST'){
//     return await fetch(url,{
//         method: method,
//         headers:{
//             'Content-type':'application/json',
//             'X-CSRFToken': csrftoken
//         },
//         body: JSON.stringify(data)
//     })
// }

async function handleBadResponse(response){
    const errorData = await response.json().catch(()=>null)
    let errorMessage = '';
    if (errorData && typeof errorData === 'object'){
        for (const [field, msgs] of Object.entries(errorData)){
            if (Array.isArray(msgs) && msgs.length){
                errorMessage+=`${field}, ${msgs.join(' ')}`
            }
        }
    }
    throw new Error(`${response.status} ${response.statusText}\n${errorMessage.trim()}`)
}

function setupLogoutBtn(id){
    const logoutBtn= document.getElementById(id)
    if (logoutBtn){
        logoutBtn.addEventListener('click', (e)=>{
            logout()
        })
    }
}

function setupLoginForm(id){
    const loginForm = document.getElementById(id)
    if(loginForm){
        loginForm.addEventListener('submit', (e)=>{
            e.preventDefault()
            const formData = new FormData(e.target)
            const data = Object.fromEntries(formData.entries())
            login(data)
            e.target.reset()
        })
    }
}
function setupRegisterForm(id){
    const registerForm = document.getElementById(id)
    if(registerForm){
        registerForm.addEventListener('submit', (e)=>{
            e.preventDefault()
            const formData = new FormData(e.target)
            const data = Object.fromEntries(formData.entries())
            register(data)
            e.target.reset()
        })
    }

}
setupLogoutBtn('logoutBtn')
setupLoginForm('loginForm')
setupRegisterForm('registerForm')

// groups management

const groupListDiv = document.getElementById('')
async function loadUserGroups(){
    
}

// telegram connect
const telegramConBtn= document.getElementById('telegramConnectBtn')

function telegramConnect(){
    const userId= store.user.id
    console.log('userid',  userId)
    window.open(`https://t.me/tasks_shelukheev_bot?start=${userId}`, '_blank')
}

if (telegramConBtn){
    telegramConBtn.addEventListener('click',(e)=>{
        telegramConnect()
    })
}



// notifications handler
// const notificationDiv = document.getElementById('notificationDiv')

// if (notificationDiv){
//     const toast = document.createElement('div')
//     toast.classList.add('toast-box')
//     toast.textContent='toast test'

//     const closeToastBtn = document.createElement('div')
//     closeToastBtn.classList.add('close-toast')

//     toast.append(closeToastBtn)
//     notificationDiv.append(toast)
// }


document.addEventListener('DOMContentLoaded', async()=>{
    if (todoListDiv){
        loadTodos()
    }

    const page = document.body.dataset.page;
    if (page === 'todos') console.log('todos')
    if (page === 'groups') console.log('groups')
    store.user = await getUser()
})