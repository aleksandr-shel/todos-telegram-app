import {initAccount} from '../src/pages/account'
import { initNotifications } from './common/notifications';
import { initRealTime } from './common/realTime';
import { initTelegramStuff } from './common/telegramStuff';
import { initGroup } from './pages/group';
import { initGroupCreate } from './pages/group-create';
import { initGroups } from './pages/groups';
import { initTodos } from './pages/todos';

document.addEventListener('DOMContentLoaded', async()=>{
    
    initNotifications()
    initAccount()
    initTelegramStuff()
    initRealTime()
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