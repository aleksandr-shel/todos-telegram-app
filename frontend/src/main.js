import {initAccount} from '../src/pages/account'
import { initTelegramStuff } from './common/telegramStuff';
import { initGroup } from './pages/group';
import { initGroupCreate } from './pages/group-create';
import { initGroups } from './pages/groups';
import { initTodos } from './pages/todos';

document.addEventListener('DOMContentLoaded', async()=>{
    initAccount()
    initTelegramStuff()
    const page = document.body.dataset.page;
    
    
    switch (page){
        case "todos":
            initTodos()
            break;
        case "groups":
            initGroups()
            break;
        case "group":
            initGroup()
            break;
        case "group-create":
            initGroupCreate()
            break;
    }
    
})