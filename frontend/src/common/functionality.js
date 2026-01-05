

const sideMenu =  document.getElementById('sideMenu')

function closeSideMenu(){
    document.querySelectorAll('.task-selected').forEach(el =>{
        el.classList.remove('task-selected')
    })
    sideMenu.classList.add('hidden')
    // mainBox.classList.remove('task-selected')
    store.setSelectedTask(null)
}

function setupSideMenuCloseBtn(id){
    const sideMenuCloseBtn =  document.getElementById(id)
    if (sideMenuCloseBtn){
        sideMenuCloseBtn.addEventListener('click',(e)=>{
            closeSideMenu()
        })
    }
}

export {sideMenu, closeSideMenu, setupSideMenuCloseBtn}