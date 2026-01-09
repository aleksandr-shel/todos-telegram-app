import {store} from '../common/store'
import { apiRequest} from '../common/api'
import { sideMenu, closeSideMenu, setupSideMenuCloseBtn } from '../common/functionality'

export async function initTodos(){
    const todoListDiv = document.getElementById('todolist')
    const mainBox =  document.getElementById('main-box')
    const selectedTaskForm =  document.getElementById('selectedTaskForm')

    function renderTask(task, listDiv, end = true){
        const itemDiv = document.createElement('div')
        const viewDiv = document.createElement('div')
        itemDiv.classList.add('list-group-item')

        viewDiv.classList.add('list-group-item-view')
        //Описание задачи
        const spanTitle = document.createElement('span')
        spanTitle.classList.add('task-title')
        spanTitle.textContent = `${task.title}`


        const spanStatus = document.createElement('span')
        spanStatus.style.fontSize='0.6rem'
        spanStatus.textContent=`${task.status_display}`
        spanStatus.classList.add(`status-${task.status}`)

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
            document.querySelectorAll('.task-selected').forEach(el =>{
                el.classList.remove('task-selected')
            })
            itemDiv.classList.add('task-selected')
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

    function renderList(list, container){
        container.innerHTML = ""
        for (const item of list){
            renderTask(item, container)
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

    function setupShowHideBtns(ids){
        const btns = ids.map(id => {
            const btn = document.getElementById(id)
            return btn
        })
        btns.forEach(btn =>{
            btn.addEventListener('click', (e)=>{
                btns.forEach(bt=>{
                    bt.classList.toggle('hidden')
                })
                const disappearables = document.querySelectorAll('.disappearable')
                disappearables.forEach(dis=>{
                    dis.classList.toggle('hidden')
                })
            })
        })
    }
    setupShowHideBtns(['btn-show','btn-hide'])
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
            const data = await apiRequest('todos/')
            const tasks = Array.isArray(data) ? data : []
            store.setTasks(tasks)
            renderList(store.tasks, todoListDiv)
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
            renderTask(data, todoListDiv, false)
        }catch(err){
            console.error("Ошибка при создании задачи:", err)
        }
    }

    async function deleteTodo(id){
        try{
            await apiRequest('todos/'+id, 'DELETE')
            store.deleteTask(id)
            renderList(store.tasks, todoListDiv)

        }catch(err){
            console.error("Ошибка:", err.message)
        }
    }


    async function updateTodo(id, todo){
        try{
            const updatedTask = await apiRequest('todos/'+id, 'PATCH', todo)
            store.updateTask(id, updatedTask)
            renderList(store.tasks, todoListDiv)
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
    setupAddTaskForm('add-task-form')
    setupSideMenuForm('selectedTaskForm')
    setupSideMenuCloseBtn('sideMenu-closebtn')
    setupDeleteTaskBtn('deleteTaskBtn')
    await loadTodos()
}