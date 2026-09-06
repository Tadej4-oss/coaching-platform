let refreshPromise: Promise<Response> | null = null

export async function refreshToken() {
    //if refreshpromise is not null dont run it (the "BLOCKING" part)
    if(refreshPromise){
        return refreshPromise
    }

    //else run it (why no await?)
    refreshPromise = fetch("http://localhost:5000/utils/refresh", {
        credentials: "include"
    })

    //kdr funkcija konca setas await, drgac je pending zto ga blkoca
    try{
        return await refreshPromise
    } finally{
        refreshPromise = null
    }
}
