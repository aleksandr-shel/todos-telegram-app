
const baseUrl = '/api/'
const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');


// task management
const todoListDiv = document.getElementById('todolist')
const addTaskForm = document.getElementById('add-task-form')
const store={
    user:{}
}
let tasks = []

function renderTask(task, listDiv, end = true){
    const itemDiv = document.createElement('div')
    const viewDiv = document.createElement('div')
    const editForm = document.createElement('form')
    itemDiv.classList.add('list-group-item')
    viewDiv.classList.add('d-flex', 'justify-content-between', 'gap-1')
    editForm.classList.add('d-flex', 'justify-content-between', 'hidden')
    

    //название
    const spanTitle = document.createElement('span')
    spanTitle.classList.add('task-title')
    spanTitle.textContent = `${task.title}`

    //boolean завершения задачи, checkbox
    const completeCheckbox = document.createElement('input')
    completeCheckbox.type='checkbox'
    completeCheckbox.checked=task.completed
    completeCheckbox.addEventListener('change', (e)=>{
        const todo_completed={
            completed: e.target.checked
        }
        // toggleTaskCompletion(task.id, todo_completed)
    })

    //редактирование
    const spanUpdate = document.createElement('span')
    spanUpdate.addEventListener('click', (e)=>{
        viewDiv.classList.add('hidden')
        editForm.classList.remove('hidden')
    })
    spanUpdate.classList.add('text-decoration-underline', 'text-primary', 'cursor-pointer')
    spanUpdate.textContent = 'редактировать'
    //мод редактирования
    const input = document.createElement('input')
    input.name ='title'
    input.classList.add('form-control')
    input.value = task.title
    const editBtn = document.createElement('button')
    editBtn.classList.add('btn', 'btn-secondary', 'ms-1')
    editBtn.type='submit'
    editBtn.textContent='Редактировать'
    const cancelBtn = document.createElement('button')
    cancelBtn.type='button'
    cancelBtn.classList.add('btn', 'btn-light', 'ms-1')
    cancelBtn.textContent='Отмена'
    cancelBtn.addEventListener('click', (e)=>{
        viewDiv.classList.remove('hidden')
        editForm.classList.add('hidden')
    })

    editForm.addEventListener('submit',(e)=>{
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries())
        updateTodo(task.id, data)
    })
    editForm.append(input)
    editForm.append(editBtn)
    editForm.append(cancelBtn)

    //удаление 
    const spanDelete = document.createElement('span')
    spanDelete.addEventListener('click', (e)=>{
        deleteTodo(task.id)
    })
    spanDelete.classList.add('text-decoration-underline', 'text-secondary', 'cursor-pointer')
    spanDelete.textContent = 'удалить'
    

    //собираем все компоненты
    const actions = document.createElement('div')
    actions.classList.add('d-flex', 'gap-2')
    actions.append(spanUpdate, spanDelete)
    viewDiv.append(completeCheckbox, spanTitle, actions)

    itemDiv.append(viewDiv)
    itemDiv.append(editForm)

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

async function loadTodos(){
    try{
        const response = await fetch(baseUrl+'todos/')
        
        if (!response.ok){
            throw new Error(`${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        tasks = Array.isArray(data) ? data : []
    
        renderList(tasks, todoListDiv)

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
        renderTask(data, todoListDiv, false)
        tasks.unshift(data)
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
        tasks = tasks.filter(task => task.id !== id)
        renderList(tasks, todoListDiv)
    }catch(err){
        console.error("Ошибка:", err.message)
    }
}


async function updateTodo(id, todo){
    try{
        const response = await fetch(baseUrl+'todos/' + id,{
            method:'PUT',
            headers: {
                'Content-type':'application/json'
            },
            body: JSON.stringify(todo)
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


if (addTaskForm){
    addTaskForm.addEventListener('submit', (e)=>{
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries())
        postTodo(data)
        e.target.reset()
    })
}

// login/register
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
        console.log(await response.json())
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
    const userId=1
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


document.addEventListener('DOMContentLoaded',()=>{
    if (todoListDiv){
        loadTodos()
    }
    getUser()
    // console.log(responseMessageSpan)
})