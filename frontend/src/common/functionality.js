import { store } from "./store"

const sideMenu =  document.getElementById('sideMenu')
const selectedTaskForm =  document.getElementById('selectedTaskForm')

function closeSideMenu(){
    document.querySelectorAll('.task-selected').forEach(el =>{
        el.classList.remove('task-selected')
    })
    sideMenu.classList.add('hidden')
}

function setupSideMenuCloseBtn(id){
    const sideMenuCloseBtn =  document.getElementById(id)
    if (sideMenuCloseBtn){
        sideMenuCloseBtn.addEventListener('click',(e)=>{
            closeSideMenu()
        })
    }
}

function renderTask(task, listDiv, mainBox, end = true){
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

function autoResize(){
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px'
}
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

function renderList(list, container, mainBox){
    container.innerHTML = ""
    for (const item of list){
        renderTask(item, container, mainBox)
    }
}


export {sideMenu, closeSideMenu, setupSideMenuCloseBtn, renderList, renderTask, autoResize}