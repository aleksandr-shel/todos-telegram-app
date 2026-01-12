import {store} from '../common/store'
import { apiRequest} from '../common/api'
import { closeSideMenu, setupSideMenuCloseBtn, renderList, 
    renderTask, setupShowHideBtns, setupTextareaAutoResize} from '../common/functionality'

export async function initTodos(){
    const todoListDiv = document.getElementById('todolist')
    const mainBox = document.getElementById('main-box')

    async function loadTodos(){
        try{
            const data = await apiRequest('todos/')
            const tasks = Array.isArray(data) ? data : []
            store.setTasks(tasks)
            renderList(store.tasks, todoListDiv, mainBox)
        }catch(err){
            console.log('Ошибка при загрузке задач', err)
        }
    }
    async function loadTodo(id){
        try{
            const task = await apiRequest('todos/'+id)
            console.log(task)
        }catch(err){
            console.error(err)
        }  
    }

    async function postTodo(todo){
        try{
            const data = await apiRequest('todos/', 'POST', todo)
            store.addTask(data)
            renderTask(data, todoListDiv, mainBox, false, false)
        }catch(err){
            console.error("Ошибка при создании задачи:", err)
        }
    }

    async function deleteTodo(id){
        try{
            await apiRequest('todos/'+id, 'DELETE')
            store.deleteTask(id)
            renderList(store.tasks, todoListDiv, mainBox)

        }catch(err){
            console.error("Ошибка:", err.message)
        }
    }


    async function updateTodo(id, todo){
        try{
            const updatedTask = await apiRequest('todos/'+id, 'PATCH', todo)
            store.updateTask(id, updatedTask)
            renderList(store.tasks, todoListDiv, mainBox)
        }catch(err){
            console.error("Ошибка при обновлении задачи:", err.message)
        }
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
                console.log('creating todo:\n',data)
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
                    store.setSelectedTask(null)
                }
            })
        }
    }


    function setupDeleteTaskBtn(id){
        const deleteTaskBtn = document.getElementById(id)
        if (deleteTaskBtn){
            deleteTaskBtn.addEventListener('click',async(e)=>{
                if (store.selectedTask){
                    await deleteTodo(store.selectedTask.id)
                    closeSideMenu()
                    store.setSelectedTask(null)
                }
            })
        }
    }
    setupShowHideBtns(['btn-show','btn-hide'])
    setupTextareaAutoResize('selectTaskDescription')
    setupTextareaAutoResize('addTaskDescription')
    
    setupAddTaskForm('add-task-form')
    setupSideMenuForm('selectedTaskForm')
    setupSideMenuCloseBtn('sideMenu-closebtn')
    setupDeleteTaskBtn('deleteTaskBtn')
    await loadTodos()
}