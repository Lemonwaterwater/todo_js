let todolist = []

// 拿到数据 遍历数组 插入todo-main中
// 格式
//  <li>
// <input type="checkbox" />
// <input class="content" type="text" value="xxxxxx">
// <button class="btn btn-danger">删除</button>
// </li>

window.addEventListener("DOMContentLoaded", function() {
    // DataLoad()
    load()
    addData()
    deleteData()
    selectAll()
    finish()
    deleteFinish()


    //获取数据
    async function load() {
        await $.ajax({
            url: 'http://47.119.151.242:7788/all',
            type: 'GET', // 请求类型，常用的有 GET 和 POST
            data: {
                // 请求参数
            },
            // dataType: "jsonp",
            success: function(data) { // 接口调用成功回调函数
                // data 为服务器返回的数据
                todolist = data
                console.log(todolist)
            }
        });
        DataLoad()
    }
    //删除数据
    function dele(id) {
        id.forEach(item => {
            $.ajax({
                url: `http://47.119.151.242:7788/delete/${item}`,
                type: 'GET', // 请求类型，常用的有 GET 和 POST
                data: {
                    // 请求参数
                },
                // dataType: "jsonp",
                success: function(data) { // 接口调用成功回调函数
                }
            });
        })

    }
    //添加和修改数据
    function add(id, value, done = false, isUpdate = false) {
        let formData = new FormData();
        formData.append("id", id);
        formData.append("todoName", value);
        formData.append("done", done);
        console.log(done)
        console.log(formData)
            // 如果是更新数据 则进去update api
        let p = isUpdate ? "update" : "add"
        console.log(p)
        $.ajax({
            url: `http://47.119.151.242:7788/${p}`,
            type: 'POST', // 请求类型，常用的有 GET 和 POST
            data: formData,
            dataType: "json",
            processData: false, // 使用formData传参很重要的配置
            contentType: false, // 使用formData传参很重要的配置
            // dataType: "jsonp",
            success: function(data) { // 接口调用成功回调函数
                console.log(data)
            }
        });
    }



    function DataLoad() {
        // 创建一个数组 存放html结构
        var htmlArr = todolist.map(item => {
                return `
             <li>
                <input type="checkbox"${item.done ? "checked" : ""} />
                <input class="content ${item.done ? "done" : ""}" type="text" value="${item.todoName}">
                <button class="btn btn-danger" data-id="${item.id}">删除</button>
             </li>`
            })
            // 插入todo-main中
        var oTodo_main = document.getElementById('todo-main');
        oTodo_main.innerHTML = htmlArr.join("")
        finish()
    }
    // 添加数据
    // 获取todo-header里面input的值 然后添加到数组里面
    function addData() {
        var oHeaderInput = document.getElementById('headerInput');
        oHeaderInput.onkeyup = function(e) {
            //如果keyCode的是13 证明是按了回车
            if (e.keyCode === 13) {
                var inputVal = oHeaderInput.value.trim()
                if (!inputVal) return
                    // 插入数据
                let id = Date.now().toString(36)
                todolist.push({
                    id,
                    todoName: inputVal,
                    done: false,
                })

                add(id, inputVal)
                    //清空input
                oHeaderInput.value = ""
                    //渲染页面
                DataLoad()
                var oSelectAll = document.getElementById('selectAll');
                //取消全选
                oSelectAll.checked = false
                    //计算完成量
                    // finish()
            }
        }
    }

    // 删除数据 和 单选
    function deleteData() {
        //使用事件委托 这样可以对新添加的数据进行删除
        var oTodo_main = document.getElementById('todo-main');
        oTodo_main.onclick = function(e) {
            // 拿到id 然后通过id查找下标 
            // 拿到下标 删除数组对应的数据
            if (e.target.className === "btn btn-danger") {
                var id = e.target.dataset.id
                console.log(id)
                    //拿到下标
                var thisIndex = todolist.findIndex(item => {
                        return item.id == id
                    })
                    //删除数组数据
                todolist.splice(thisIndex, 1)
                    // console.log()
                    //渲染页面
                dele([id])

            }
            // 单选
            var oSelectAll = document.getElementById('selectAll');
            //使用事件委托 这样可以对新添加的数据进行选中

            if (e.target.type === "checkbox") {
                var oMainCheckBoxs = document.querySelectorAll('#todo-main input[type=checkbox]')
                var oSelect = document.querySelectorAll('#todo-main input:checked')
                if (oSelect.length === oMainCheckBoxs.length) {
                    oSelectAll.checked = true
                } else {
                    oSelectAll.checked = false
                }
                //拿到id
                let id = e.target.nextElementSibling.nextElementSibling.dataset.id
                    // 拿到对象

                //修改样式
                if (e.target.checked) {
                    console.log("添加", id)
                    e.target.nextElementSibling.classList.add("done")
                } else {
                    console.log("删除", id)
                    e.target.nextElementSibling.classList.remove("done")
                }



                var thisIndex = todolist.findIndex(item => {
                        return item.id == id
                    })
                    // 修改数据
                todolist[thisIndex].done = !todolist[thisIndex].done
                    // 修改服务器数据
                let { id: ids, todoName, done } = todolist.find((item) => {
                    return item.id === id
                })
                console.log({ ids, todoName, done })
                add(ids, todoName, done, true)

            }
            DataLoad()
                // finish()
        }

    }

    // 全选
    function selectAll() {
        // 当全选按钮被选中时 其他的checkbox也要被选中
        var oSelectAll = document.getElementById('selectAll');
        oSelectAll.onclick = function() {
            var oMainCheckBoxs = document.querySelectorAll('#todo-main input[type=checkbox]');
            console.log(oMainCheckBoxs)
            oMainCheckBoxs.forEach(item => {
                // 改变选中样式
                item.checked = oSelectAll.checked
                    //如果全选 则全部选中
                if (oSelectAll.checked) {
                    item.nextElementSibling.classList.add("done")
                        //修改数据
                    todolist.forEach(item => {
                        item.done = true
                    })
                } else {
                    item.nextElementSibling.classList.remove("done")
                        //修改数据
                    todolist.forEach(item => {
                        item.done = false
                    })

                }
            })
            finish()
        }
    }

    // 删除已完成任务
    function deleteFinish() {
        var oDelete = document.querySelector('.todo-footer button');
        oDelete.onclick = function() {
            // 拿到所有完成的对象
            let compList = todolist.filter(item => {
                    return item.done == true
                })
                //拿到所有完成对象的id
            let ids = compList.map((item) => {
                    return item.id
                })
                // 调用删除
            dele(ids)
                // 保留数组里面对象done为false的
            todolist = todolist.filter(item => {
                return item.done == false
            })

            DataLoad()
        }
    }


    // 完成量
    function finish() {
        var allNum = todolist.length
        var compNum = todolist.filter(item => {
            return item.done == true
        }).length
        var oAllNum = document.getElementById('allNum');
        var oCompNum = document.getElementById('compNum');
        oCompNum.textContent = `已完成${compNum}`
        oAllNum.textContent = `全部${allNum}`
            // console.log(allNum, compNum)
    }
})