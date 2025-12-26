import {initAccount} from '../src/pages/account'

document.addEventListener('DOMContentLoaded', async()=>{
    initAccount()
    const page = document.body.dataset.page;
    console.log(page)
    
})