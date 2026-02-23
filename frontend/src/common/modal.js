

const modalWrapper = document.getElementById('modalWrapper')
const modalDiv = document.getElementById('modalDiv')

function closeModal(){
    modalWrapper.classList.add('hidden')
}

function showModal(element){
    // modalDiv
    modalWrapper.classList.remove('hidden')
}

function setupCloseModalBtn(id){
    const closeModalBtn = document.getElementById(id)
    if (closeModalBtn){
        closeModalBtn.addEventListener('click',(e)=>{
            closeModal()
        })
    }
}


export {
    showModal, closeModal, setupCloseModalBtn
}