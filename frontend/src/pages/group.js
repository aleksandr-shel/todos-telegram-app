import {store} from '../common/store'
import {apiRequest} from '../common/api'
import { setupSideMenuCloseBtn, renderList, renderTask} from '../common/functionality'


export async function initGroup(){
    const todoListDiv = document.getElementById('taskslist')
    const mainBox = document.getElementById('group-box')
    const groupListBox = document.getElementById('groupsBox')

    function renderGroup(group){
        console.log(group)
        document.getElementById('groupName').textContent = `${group.name}`
        renderList(group.tasks, todoListDiv, mainBox)
    }
    function renderGroups(groups){
        groups.forEach(group=>{
            const box = document.createElement('li')
            box.classList.add('groups-item')


            const contentBox= document.createElement('div')
            contentBox.classList.add('ms-1')
            box.append(contentBox)

            const icon = document.createElement('i')
            icon.classList.add('bi', 'bi-collection', 'me-1')
            icon.style.fontSize='x-large'
            contentBox.append(icon)

            const spanName = document.createElement('span')
            spanName.textContent = `${group.name}`
            contentBox.append(spanName)

            const divOwner = document.createElement('div')
            divOwner.textContent = `Владелец: ${group.owner.username}`
            divOwner.style.fontSize='x-small'
            box.append(divOwner)

            box.addEventListener('click', (e)=>{
                window.location.href=`/groups/${group.id}`
            })
            groupListBox.append(box)
        })
    }
    async function loadOneGroup(id){
        try{
            const group = await apiRequest('groups/'+id)
            store.setSelectedGroup(group)
            renderGroup(store.selectedGroup)
        }catch(err){
            console.log(err)
        }
    }
    async function loadUserGroups(){
        try{
            const data = await apiRequest('groups')
            const groups = Array.isArray(data) ? data : []
            store.setGroups(groups)
            renderGroups(store.groups)
        }catch(err){
            console.log(err)
        }
    }
    async function loadGroupTasks(id){
        try{
            const tasks = await apiRequest('groups/'+id+'/tasks')
            console.log(tasks)
        }catch(err){
            console.log(err)
        }
    }
    function getGroupIdFromPath(){
        const parts = window.location.pathname.split('/').filter(Boolean)
        if (parts[0] !== 'groups' || !parts[1]) return null
        const id = Number(parts[1])
        return Number.isFinite(id) ? id : null
    }

    function setupLeftSideBtn(id){
        const leftSideBurger = document.getElementById(id)
        leftSideBurger.addEventListener('click',(e)=>{
            const groupBox = document.getElementById('groupsBox')
            groupBox.classList.toggle('hidden')
            const icons = Array.from(leftSideBurger.children)
            icons.forEach(icon =>{
                icon.classList.toggle('hidden')
            })
            loadUserGroups()
        })
    }

    setupLeftSideBtn('leftSideBtn')
    setupSideMenuCloseBtn('sideMenu-closebtn')

    async function postTodo(todo){
        try{
            const data = await apiRequest('todos/', 'POST', todo)
            store.addTask(data)
            renderTask(data, todoListDiv, mainBox, false)
        }catch(err){
            console.error("Ошибка при создании задачи:", err)
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
                data.group_id = store.selectedGroup.id
                console.log('creating todo:\n',data)
                postTodo(data)
                e.target.reset()
            })
        }
    }

    setupAddTaskForm('add-task-form')

    

    await loadOneGroup(getGroupIdFromPath())
}