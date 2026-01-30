import {store} from '../common/store'
import {apiRequest} from '../common/api'
import {sideMenu, setupSideMenuCloseBtn, renderList, renderTask, closeSideMenu, setupShowHideBtns, setupTextareaAutoResize} from '../common/functionality'


export async function initGroup(){
    const todoListDiv = document.getElementById('taskslist')
    const mainBox = document.getElementById('group-box')
    const groupListBox = document.getElementById('groupsList')
    
    
    function renderGroup(group){
        document.getElementById('groupName').textContent = `Группа: ${group.name}`
        document.getElementById('memberNumber').textContent = `${group.memberships.length}`
        
        store.setTasks(group.tasks)
        renderList(store.tasks, todoListDiv, mainBox, true)
        renderMembersList(group.memberships)
    }

    function renderMembersList(users){
        const membersList = document.getElementById('membersList')
        membersList.innerHTML=''
        if (Array.isArray(users)){
            users.forEach(item=>{
                const listItem = document.createElement('li')
                const username= item?.user != null ?  item?.user?.username : item?.username
                const avatar = document.createElement('div')
                avatar.classList.add('avatar')
                avatar.textContent = `${username[0].toUpperCase()}`
                const userDetails = document.createElement('div')
                userDetails.classList.add('member-details')
                const usernameSpan = document.createElement('span')
                usernameSpan.textContent = `${username}`
                userDetails.append(usernameSpan)

                listItem.append(avatar)
                listItem.append(userDetails)
                membersList.append(listItem)
            })
        }
    }

    function renderGroups(groups){
        groupListBox.innerHTML=''
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

    async function deleteGroup(id){
        try{
            await apiRequest('groups/'+id)
        }catch(error){
            console.log(error)
        }
    }

    async function searchGroups(params){
        try{
            let queryStr=''
            for (const k in params){
                queryStr+=`${k}=${params[k]}`
            }
            const groups = await apiRequest('groups/?'+queryStr)
            store.setSearchGroups(groups)
            renderGroups(store.searchGroups)
        }catch(error){
            console.log(error)
        }
    }
    
    function setupGroupSearchInput(id){
        const groupSearchForm = document.getElementById(id)
        
        if (groupSearchForm){
            // const inputs = groupSearchForm.querySelectorAll('input, select, textarea')
            // function isFormEmpty(){
            //     for (const input of inputs){
            //         if (input.value.trim() !== ''){
            //             return false
            //         }
            //     }
            //     return true
            // }
            groupSearchForm.addEventListener('submit', async(e)=>{
                e.preventDefault()

                const formData = new FormData(e.target)
                const params = Object.fromEntries(formData.entries())
                await searchGroups(params)

                e.target.reset()
            })
        }
    }
    setupGroupSearchInput('groupSearchForm')

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
            renderTask(data, todoListDiv, mainBox, true, false)
        }catch(err){
            console.error("Ошибка при создании задачи:", err)
        }
    }
    async function updateTodo(id, todo){
        try{
            const updatedTask = await apiRequest('todos/'+id, 'PATCH', todo)
            store.updateTask(id, updatedTask)
            renderList(store.tasks, todoListDiv, mainBox, true)
        }catch(err){
            console.error("Ошибка при обновлении задачи:", err.message)
        }
    }
    async function deleteTodo(id){
        try{
            await apiRequest('todos/'+id, 'DELETE')
            store.deleteTask(id)
            renderList(store.tasks, todoListDiv, mainBox, true)

        }catch(err){
            console.error("Ошибка:", err.message)
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

    async function searchUsers(params){
        try{
            let queryStr=''
            for (const k in params){
                queryStr+=`${k}=${params[k]}`
            }
            
            const response = await apiRequest(`users?${queryStr}`)
            renderMembersList(response.results)
        }catch(err){
            console.log(err)
        }
    }
    function isFormEmpty(inputs){
        for (const input of inputs){
            if (input.value.trim() !== ''){
                return false
            }
        }
        return true
    }
    function setupUsersSearchForm(id){
        const usersSearchForm = document.getElementById(id)
        if (usersSearchForm){
            usersSearchForm.addEventListener('submit', async(e)=>{
                e.preventDefault()
                const formData = new FormData(e.target)
                const params = Object.fromEntries(formData.entries())
                await searchUsers(params)
            })
            const inputs = usersSearchForm.querySelectorAll('input, select, textarea')
            usersSearchForm.addEventListener('input',(e)=>{
                if (isFormEmpty(inputs)){
                    renderMembersList(store?.selectedGroup?.memberships)
                }
            })
        }
    }

    setupUsersSearchForm('usersSearchForm')

    function setupShowMembersButton(id){
        const membersBtn = document.getElementById(id)
        if (membersBtn){
            membersBtn.addEventListener('click',(e)=>{
                document.querySelectorAll('.right-sidemenu-show').forEach(el =>{
                    el.classList.remove('right-sidemenu-show')
                })
                sideMenu.classList.remove('hidden')
                mainBox.classList.add('right-sidemenu-show')

                document.getElementById('selectedTaskFormWrapper').classList.add('hidden')
                document.getElementById('membersBox').classList.remove('hidden')
            })
        }
    }   

    setupShowHideBtns(['btn-show','btn-hide'])
    setupTextareaAutoResize('selectTaskDescription')
    setupTextareaAutoResize('addTaskDescription')
    setupAddTaskForm('add-task-form')
    setupSideMenuForm('selectedTaskForm')
    setupDeleteTaskBtn('deleteTaskBtn')
    setupShowMembersButton('memberBtn')
    await loadOneGroup(getGroupIdFromPath())
}