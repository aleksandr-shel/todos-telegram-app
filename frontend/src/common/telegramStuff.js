import { store } from "./store"
export function initTelegramStuff(){
    const telegramConBtn= document.getElementById('telegramConnectBtn')

    function telegramConnect(){
        const userId= store.user.id
        console.log('userid',  userId)
        if (userId){
            window.open(`https://t.me/tasks_shelukheev_bot?start=connect_${userId}`, '_blank')
        }
    }

    if (telegramConBtn){
        telegramConBtn.addEventListener('click',(e)=>{
            telegramConnect()
        })
    }

}