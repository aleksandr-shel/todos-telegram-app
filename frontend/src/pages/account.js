import {baseUrl, csrftoken, handleBadResponse} from '../common/api'
import { store } from '../common/store'
export async function initAccount(){
    const responseMessageSpan = document.getElementById('response-message')

    async function login(data){
        try{
            const response = await fetch(baseUrl+'account/login',{
                method: 'POST',
                headers:{
                    'Content-type':'application/json'
                },
                body: JSON.stringify(data),
            })
            if (!response.ok){
                await handleBadResponse(response)
            }
            window.location.href='/'
        }catch(err){
            responseMessageSpan.textContent=err.message
            console.log(err)
        }
    }
    async function register(data){
        try{
            const response = await fetch(baseUrl+'account/register',{
                method: 'POST',
                headers:{
                    'Content-type':'application/json'
                },
                body: JSON.stringify(data)
            })

            if (!response.ok){
                await handleBadResponse(response)
            }
            window.location.href='/login'
        }catch(err){
            responseMessageSpan.textContent=err
            console.log(err)
        }
    }

    async function getUser() {
        try{
            const response = await fetch(baseUrl+'account/getuser',{
                method: 'GET'
            })

            if (!response.ok){
                await handleBadResponse(response)
            }
            const data = await response.json()
            return data;
        }catch(err){
            console.log(err)
        }
    }

    async function logout(){
        try{
            const response = await fetch(baseUrl+'account/logout',{
                method: 'POST',
                headers:{
                    'Content-type':'application/json',
                    'X-CSRFToken': csrftoken
                },
                credentials:'include'
            })

            if (!response.ok){
                await handleBadResponse(response)
            }
            window.location.href='/'
        }catch(err){
            console.log(err)
        }
    }

    function setupLogoutBtn(id){
        const logoutBtn= document.getElementById(id)
        if (logoutBtn){
            logoutBtn.addEventListener('click', (e)=>{
                logout()
            })
        }
    }

    function setupLoginForm(id){
        const loginForm = document.getElementById(id)
        if(loginForm){
            loginForm.addEventListener('submit', (e)=>{
                e.preventDefault()
                const formData = new FormData(e.target)
                const data = Object.fromEntries(formData.entries())
                login(data)
                e.target.reset()
            })
        }
    }
    function setupRegisterForm(id){
        const registerForm = document.getElementById(id)
        if(registerForm){
            registerForm.addEventListener('submit', (e)=>{
                e.preventDefault()
                const formData = new FormData(e.target)
                const data = Object.fromEntries(formData.entries())
                register(data)
                e.target.reset()
            })
        }

    }
    setupLogoutBtn('logoutBtn')
    setupLoginForm('loginForm')
    setupRegisterForm('registerForm')

    try{
        const user = await getUser()
        store.setUser(user)
    }catch(err){
        console.log(err)
    }

}