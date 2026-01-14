

export function initNotifications(){
    const notificationDiv = document.getElementById('notificationDiv')

    if (notificationDiv){
        const toast = document.createElement('div')
        toast.classList.add('toast-box')
    
        const closeToastBtn = document.createElement('div')
        closeToastBtn.classList.add('close-btn')
        toast.append(closeToastBtn)
        const contentSpan = document.createElement('span')
        contentSpan.textContent='toast test'
        toast.append(contentSpan)

        notificationDiv.append(toast)
    }
}