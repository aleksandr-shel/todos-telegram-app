export const baseUrl = '/api/'
export const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

export async function apiRequest(path, method='GET', body=null, customHeaders={}){
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...customHeaders
        }
    }
    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    try{
        const response = await fetch(baseUrl + path, options)

        if (!response.ok){
            await handleBadResponse(response)
        }

        return await response.json()

    }catch(error){
        throw error
    }
}

export async function handleBadResponse(response){
    const errorData = await response.json().catch(()=>null)
    let errorMessage = '';
    if (errorData && typeof errorData === 'object'){
        for (const [field, msgs] of Object.entries(errorData)){
            if (Array.isArray(msgs) && msgs.length){
                errorMessage+=`${field}, ${msgs.join(' ')}`
            }
        }
    }
    throw new Error(`${response.status} ${response.statusText}\n${errorMessage.trim()}`)
}