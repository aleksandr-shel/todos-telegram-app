import {store} from '../common/store'
import {apiRequest} from '../common/api'
import { setupSideMenuCloseBtn} from '../common/functionality'

export async function initGroup(){
    async function loadOneGroup(id){
        try{
            const group = await apiRequest('groups/'+id)
            store.setSelectedGroup(group)
            console.log(store.selectedGroup)
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
        })
    }

    setupLeftSideBtn('leftSideBtn')
    setupSideMenuCloseBtn('sideMenu-closebtn')

    await loadOneGroup(getGroupIdFromPath())
}