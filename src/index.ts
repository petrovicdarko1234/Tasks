let _txtarea = ""
let _taskID = 0
const _URL = "http://192.168.1.251:3000"
//const _URL = "http://localhost:4000"
//const _URL = "http://192.168.1.13:8080"
function onLoad() {
    loadData()
}

type Task = {
    Id: number
    Description: string
    Completed: boolean
}

async function loadData() {

    let response = await fetch(_URL + "/api/task/0")

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
                await fetch(_URL + "/api/undoTask/0/" + tasks[i].Id, {
                    method: 'PUT',
                })
                li.classList.remove("checked")
            } else {
                await fetch(_URL + "/api/doTask/0/" + tasks[i].Id, {
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
        await fetch(_URL + "/api/task/0", {
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
    await fetch(_URL + "/api/deleteAllTask/0", {
        method: 'DELETE',
    })
    onLoad()
}

async function deleteOne(id: number) {
    try {
        const url = _URL + "/api/task/0/" + id
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
    await fetch(_URL + "/api/task/0/" + id, {
        method: 'PUT',
        body: JSON.stringify({ Description: _txtarea })
        ,
        headers: {
            'Content-Type': 'application/json'
        },
        //body: "{\"Description\":\"" + _txtarea + "\"}"
    })
}
