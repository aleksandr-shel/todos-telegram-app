

export async function initGroup(){
    async function loadOneGroup(id){
        try{
            const group = await apiRequest('groups/'+id)
            console.log(group)
        }catch(err){
            console.log(err)
        }
    }
    async function loadGroupTasks(id){
        try{
            const tasks = await apiRequest('groups/'+id+'/tasks')
            console.log(tasks)
        }catch(err){
            console.log(err)
        }
    }
    console.log(window.location.pathname.split('/'))
}