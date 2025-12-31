import { apiRequest } from "../common/api"
import { store } from "../common/store"

export async function initGroupCreate(){
    async function postGroup(groupData){
        try{
            const group = await apiRequest('groups/', 'POST', groupData)
            // store.addGroup(group)
        }catch(err){
            console.log('Ошибка при создании групп',err)
        }
    }

    function setupAddGroupForm(id){
        const addTaskForm = document.getElementById(id)
        if (addTaskForm){
            addTaskForm.addEventListener('submit', async (e)=>{
                e.preventDefault()
                const formData = new FormData(e.target)
                const data = Object.fromEntries(formData.entries())
                await postGroup(data)
                e.target.reset()
                window.location.href='/groups'
            })
        }
    }

    setupAddGroupForm('addGroupForm')
}