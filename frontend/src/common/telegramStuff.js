


const telegramConBtn= document.getElementById('telegramConnectBtn')

function telegramConnect(){
    const userId= store.user.id
    console.log('userid',  userId)
    window.open(`https://t.me/tasks_shelukheev_bot?start=${userId}`, '_blank')
}

if (telegramConBtn){
    telegramConBtn.addEventListener('click',(e)=>{
        telegramConnect()
    })
}
