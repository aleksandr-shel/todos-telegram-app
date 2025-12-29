import { apiRequest } from "../common/api"

export async function initGroupCreate(){
    console.log('group-create')
    async function postGroup(){
        try{
            const group = await apiRequest('groups')
        }catch(err){
            console.log(err)
        }
    }
}