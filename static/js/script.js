
const baseUrl = '/api/'
const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');


// task management
const todoListDiv = document.getElementById('todolist')
const addTaskForm = document.getElementById('add-task-form')
const sideMenu =  document.getElementById('sideMenu')
const selectedTaskForm =  document.getElementById('selectedTaskForm')
const sideMenuCloseBtn =  document.getElementById('sideMenu-closebtn')
const mainBox =  document.getElementById('main-box')
const deleteTaskBtn = document.getElementById('deleteTaskBtn')

const store={
    user:{},
    selectedTask:null,
    tasks:[],
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

function renderTask(task, listDiv, end = true){
    const itemDiv = document.createElement('div')
    const viewDiv = document.createElement('div')
    itemDiv.classList.add('list-group-item')
    viewDiv.classList.add('d-flex', 'justify-content-between', 'gap-1')
    
    //Название задачи
    const spanTitle = document.createElement('span')
    spanTitle.classList.add('task-title')
    spanTitle.textContent = `${task.title}`

    viewDiv.append(spanTitle)

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

function fillSelectedTaskForm(){
    // function fillForm(form, obj) {
    //     Object.keys(obj).forEach(key => {
    //         const field = form.elements.namedItem(key);
    //         if (field) {
    //             field.value = obj[key];
    //         }
    //     });
    // }
//     The object keys must match the input names.

// For checkboxes and radios, you must handle them separately:

// if (field.type === "checkbox") {
//     field.checked = !!obj[key];
// }
    if (store.selectedTask){
        console.log(store.selectedTask)
        Object.keys(store.selectedTask).forEach(key=>{
            const field = selectedTaskForm.elements.namedItem(key)
            if (field){
                if (field.type === 'checkbox'){
                    field.checked = false
                }
                field.value = store.selectedTask[key]
            }
        })
    }
}

function closeSideMenu(){
    sideMenu.classList.add('hidden')
    mainBox.classList.remove('task-selected')
    store.setSelectedTask(null)
}

async function loadTodos(){
    try{
        const response = await fetch(baseUrl+'todos/')
        
        if (!response.ok){
            throw new Error(`${response.status} ${response.statusText}`)
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
            throw new Error(`${response.status} ${response.statusText}`)
        }

        const task = await response.json()
        console.log(task)
    }catch(err){
        console.error(err)
    }  
}

async function toggleTaskCompletion(id, todo_completed) {
    try{
        const response = await fetch(baseUrl+'todos/' + id,{
            method:'PATCH',
            headers: {
                'Content-type':'application/json'
            },
            body: JSON.stringify(todo_completed)
        })
        if (!response.ok){
            throw new Error(`${response.status} ${response.statusText}`)
        }
        const updatedTask = await response.json()
        tasks = tasks.map(task => task.id === id ? updatedTask : task)
        renderList(tasks, todoListDiv)
    }catch(err){
        console.error("Ошибка:", err.message)
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
            throw new Error(`${response.status} ${response.statusText}`)
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
            throw new Error(`${response.status} ${response.statusText}`)
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
            throw new Error(`${response.status} ${response.statusText}`)
        }
        const updatedTask = await response.json()
        store.updateTask(id, updatedTask)
    }catch(err){
        console.error("Ошибка:", err.message)
    }
}


if (addTaskForm){
    addTaskForm.addEventListener('submit', (e)=>{
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries())
        postTodo(data)
        e.target.reset()
    })
}

if (selectedTaskForm){
    selectedTaskForm.addEventListener('submit', (e)=>{
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries())
        console.log(data)
        
    })
}

if (sideMenuCloseBtn){
    sideMenuCloseBtn.addEventListener('click',(e)=>{
        closeSideMenu()
    })
}

const obj1=null

if (deleteTaskBtn){
    deleteTaskBtn.addEventListener('click',(e)=>{
        if (store.selectedTask){
            deleteTodo(store.selectedTask.id)
            closeSideMenu()
        }
    })
}

// login-register
const loginForm = document.getElementById('loginForm')
const registerForm = document.getElementById('registerForm')
const logoutBtn= document.getElementById('logoutBtn')
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
            const errorData = await response.json().catch(()=>null)
            let errorMessage = '';
            for (const [field, msgs] of Object.entries(errorData)){
                if (Array.isArray(msgs) && msgs.length){
                    errorMessage+=`${field}, ${msgs.join(' ')}`
                }
            }
            throw new Error(`${response.status} ${response.statusText}\n${errorMessage}`)
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
            const errorData = await response.json().catch(()=>null)
            let errorMessage = '';
            for (const [field, msgs] of Object.entries(errorData)){
                if (Array.isArray(msgs) && msgs.length){
                    errorMessage+=`${field}, ${msgs.join(' ')} `
                }
            }
            throw new Error(`${response.status} ${response.statusText}\n${errorMessage}`)
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
            throw new Error(`${response.status} ${response.statusText}`)
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
            throw new Error(`${response.status} ${response.statusText}`)
        }
        window.location.href='/'
    }catch(err){
        console.log(err)
    }
}

async function fetchShortcut(url, data, method='POST'){
    return await fetch(url,{
        method: method,
        headers:{
            'Content-type':'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(data)
    })
}

if (logoutBtn){
    logoutBtn.addEventListener('click', (e)=>{
        logout()
    })
}

if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries())
        login(data)
        e.target.reset()
    })
}

if(registerForm){
    registerForm.addEventListener('submit', (e)=>{
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries())
        register(data)
        e.target.reset()
    })
}

// telegram connect
const telegramConBtn= document.getElementById('telegramConnectBtn')

function telegramConnect(){
    const userId= store.user.id
    console.log('userid',  userId)
    // window.open(`https://t.me/tasks_shelukheev_bot?start=${userId}`, '_blank')
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
    store.user = await getUser()
})