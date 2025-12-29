import {apiRequest} from '../common/api'
import {store} from '../common/store'

export async function initGroups(){

    const groupListBox = document.getElementById('groupListBox')
    const leftSideBurger = document.getElementById('leftSideBurger')
    function renderGroups(groups){
        groups.forEach(group=>{
            const box = document.createElement('li')
            const contentBox= document.createElement('div')
            // box.classList.add('d-flex', 'align-items-center')
            box.classList.add('groups-item')
            box.append(createSVGIcon())
            box.append(contentBox)
            contentBox.classList.add('ms-1')
            const spanName = document.createElement('span')
            contentBox.append(spanName)
            
            spanName.textContent = `${group.name}`
            box.addEventListener('click', (e)=>{
                window.location.href=`/groups/${group.id}`
                // alert(`clicked group id: ${group.id}`)
            })
            groupListBox.append(box)
        })
    }

    function createSVGIcon(){
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', 16)
        svg.setAttribute('height', 16)
        svg.setAttribute('viewBox', `0 0 16 16`)

        // svg.classList.add("bi", "bi-collection");

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", "M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5z");

        svg.appendChild(path);
        return svg
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