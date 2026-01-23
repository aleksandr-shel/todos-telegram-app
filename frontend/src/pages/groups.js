import {apiRequest} from '../common/api'
import {store} from '../common/store'

export async function initGroups(){

    const groupListBox = document.getElementById('groupListBox')
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
        const inputs = groupSearchForm.querySelectorAll('input, select, textarea')
        function isFormEmpty(){
            for (const input of inputs){
                if (input.value.trim() !== ''){
                    return false
                }
            }
            return true
        }
        if (groupSearchForm){
            groupSearchForm.addEventListener('submit',(e)=>{
                e.preventDefault()

                const formData = new FormData(e.target)
                const params = Object.fromEntries(formData.entries())
                searchGroups(params)

                e.target.reset()
            })

        }

    }

    setupGroupSearchInput('groupSearchForm')

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
    await loadUserGroups()
}