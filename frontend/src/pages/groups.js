import {apiRequest} from '../common/api'
import {store} from '../common/store'

export async function initGroups(){

    const groupListBox = document.getElementById('groupListBox')
    function renderGroups(groups){
        groups.forEach(group=>{
            const box = document.createElement('li')
            box.classList.add('groups-item')

            const icon = document.createElement('i')
            icon.classList.add('bi', 'bi-collection')
            icon.style.fontSize='x-large'
            box.append(icon)

            const contentBox= document.createElement('div')
            box.append(contentBox)
            contentBox.classList.add('ms-1')

            const spanName = document.createElement('span')
            contentBox.append(spanName)
            
            spanName.textContent = `${group.name}`
            box.addEventListener('click', (e)=>{
                window.location.href=`/groups/${group.id}`
            })
            groupListBox.append(box)
        })
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

    await loadUserGroups()
}