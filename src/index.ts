let _txtarea = ""
let _taskID = 0
//const _URL = "http://192.168.1.251:4000"
const _URL = "http://localhost:4000"
//const _URL = "http://192.168.1.13:8080"

type Task = {
    Id: number
    Description: string
    Completed: boolean
}
type User = {
    Username: string
    Password: string
    Id: number
}
let _userID: number
//login
async function createAcc() {
    let user = <HTMLInputElement>document.getElementById("username")
    let username = user.value
    let pass = <HTMLInputElement>document.getElementById("password")
    let password = pass.value

    let response = await fetch(_URL + "/api/create", {
        method: 'POST',
        body: JSON.stringify({ Username: username, Password: password }),
        headers: {
            'Content-Type': 'application/json'
        },
    })
    let json = await response.json()
    if (json.Id == -1) {
        let msg = <HTMLDivElement>document.getElementById("msg")
        msg.innerHTML = "User with that username already exists"
        return
    }


    setCookie("_userID", json.Id + "")
    window.location.href = "tasks.html"

}
function logout() {
    deleteCookie("_userID")
    window.location.href = "http://localhost:4000/"
}
function checkCookie() {
    let cookie = getCookie("_userID")
    if (cookie != "") {
        window.location.href = "tasks.html"
    }
}
async function login() {

    let user = <HTMLInputElement>document.getElementById("username")
    let username = user.value
    let pass = <HTMLInputElement>document.getElementById("password")
    let password = pass.value
    console.log(username, password)
    console.log("_URL", _URL)
    let response = await fetch(_URL + "/api/login", {
        method: 'POST',
        body: JSON.stringify({ Username: username, Password: password }),
        headers: {
            'Content-Type': 'application/json'
        },
    })
    let json = await response.json()

    if (json.Id == -1) {
        let msg = <HTMLDivElement>document.getElementById("msg")
        msg.innerHTML = "Wrong username or password"
        return
    }

    setCookie("_userID", json.Id + "")

    window.location.href = "tasks.html"
}
function onLoad() {
    let userId = getCookie("_userID")
    if (userId != "") {
        _userID = parseInt(userId)
    }

    loadData()
}
//app
async function loadData() {

    console.log(_userID)

    let response = await fetch(_URL + "/api/task/" + _userID, {
        method: 'GET',
    })

    let json = await response.json()
    let tasks = json as Task[]

    let cont = document.getElementById("lista")
    if (cont == null) {
        return
    }

    cont.innerHTML = ""
    for (let i = 0; i < tasks.length; i++) {

        let li = document.createElement("li")

        li.innerHTML = tasks[i].Description

        if (tasks[i].Completed) {
            li.classList.add("checked")
        }
        li.onclick = async function (event) {
            if (tasks[i].Completed) {
                await fetch(_URL + "/api/undoTask/" + _userID + "/" + tasks[i].Id, {
                    method: 'PUT',
                })
                li.classList.remove("checked")
            } else {
                await fetch(_URL + "/api/doTask/" + _userID + "/" + tasks[i].Id, {
                    method: 'PUT',
                })
                li.classList.add("checked")
            }
            //instead of reload, sync with server
            tasks[i].Completed = !tasks[i].Completed
        }
        let span = <HTMLSpanElement>document.createElement("span")
        span.innerHTML = "\u00d7"
        span.id = "" + tasks[i].Id
        span.onclick = function (event) {
            event.stopPropagation()
            deleteOne(tasks[i].Id)
        }
        let btn = <HTMLButtonElement>document.createElement("button")
        btn.innerHTML = "Update"
        btn.classList.add("updateBtn")
        btn.onclick = function (event) {
            event.stopPropagation()

            let txt = <HTMLTextAreaElement>document.getElementById("textBox")
            if (txt != null) {
                txt.value = tasks[i].Description
            }

            let addBtn = document.getElementById("addBtn")
            if (addBtn != null) {
                addBtn.innerHTML = "Update"
            }
            _taskID = tasks[i].Id
        }
        li.appendChild(btn)
        li.appendChild(span)
        cont.appendChild(li)
    }
}
async function newTask() {
    let btn = document.getElementById("addBtn")
    if (btn == null) {
        return
    }
    if (btn.innerHTML == "Add") {
        await fetch(_URL + "/api/task/" + _userID, {
            method: 'POST',
            body: JSON.stringify({ Description: _txtarea }),
            headers: {
                'Content-Type': 'application/json'
            },
        })

    } else {
        await updateTask(_taskID)
        btn.innerHTML = "Add"
    }
    let text = <HTMLTextAreaElement>document.getElementById("textBox")
    if (text != null) {
        text.value = ""
    }
    onLoad()
}

function updateTextarea(str: string) {
    _txtarea = str
}

async function deleteAll() {
    await fetch(_URL + "/api/deleteAllTask/" + _userID, {
        method: 'DELETE',
    })
    onLoad()
}

async function deleteOne(id: number) {
    try {
        const url = _URL + "/api/task/" + _userID + "/" + id
        console.log("DELETE:", url)
        await fetch(url, {
            method: 'DELETE',
        })

        //if above throws, bellow doesn't happen...
        //when exception is throwed code stops
        onLoad()
    } catch (err) {
        console.log(err)
    }
}
async function updateTask(id: number) {
    await fetch(_URL + "/api/task/" + _userID + "/" + id, {
        method: 'PUT',
        body: JSON.stringify({ Description: _txtarea })
        ,
        headers: {
            'Content-Type': 'application/json'
        },
        //body: "{\"Description\":\"" + _txtarea + "\"}"
    })
}

/*
 * General utils for managing cookies in Typescript.
 */
function setCookie(name: string, val: string) {
    const date = new Date();
    const value = val;

    // Set it expire in 7 days
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));

    // Set it name = val in string
    document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";

    console.log("document.cookie", document.cookie)
}

function getCookie(name: string): string {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");

    if (parts.length == 2) {
        return parts[1];
    }

    return ""
}

function deleteCookie(name: string) {
    const date = new Date();

    // Set it expire in -1 days
    date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

    // Set it
    document.cookie = name + "=; expires=" + date.toUTCString() + "; path=/";
}