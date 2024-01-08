const taskList = document.getElementById('task-list');
const newTaskInput = document.getElementById('new-task');
const addButton = document.getElementById('add-button');

const api_List="https://prod-63.westus.logic.azure.com:443/workflows/abf378a87aab42199e09446c9e7c504c/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=F--nz6URoCwz0L2lOYT26qDrGqrFC0gmXGWXP4gSO0U"
const api_create="https://prod-96.westus.logic.azure.com:443/workflows/68357cf644e24c2787e1aace0f643e05/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=s5Vuj-E8fZKtlUbUWulRwKhiEwur7aW6S3YcEMinIYw"
const api_delete="https://prod-178.westus.logic.azure.com:443/workflows/47f240db2a4947aab242cc6b17bbaae4/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=OKhhGv5j0MjKaZIvAQUMTzgyDfRJUSUuifuscfJpeX4";
const api_update_text="https://prod-08.westus.logic.azure.com:443/workflows/590ed1c1a7684b028fcc9b31689079ef/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZD4pnhNjt7tAoxSaM4EWI-FlTfwXLdsW0V8EIuO6cSg";
const api_update_status="https://prod-118.westus.logic.azure.com:443/workflows/65cb78b15f584457bb4bc81931fb4149/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ceYo8t7WycPLse9UKUBqq5NurxVepksDFLgO-QjvHAc";

var flag=0;
var prevId;
var myJson;



async function getApi(){
    const response=await fetch(api_List);
    myJson=await response.json();

    // console.log(myJson);
    show(myJson);
}
getApi();

function show(records){
    let tab=`<tr style="color:#d8b8fc;">
    <th>Status</th>
    <th>Description</th>
    <th></th>
    </tr>`;

    
    for(var i=0;i<records.payload.length;i++){
        let item=records.payload[i];
        // console.log(item);

        if(item.crdeb_status==="Incomplete"){ // Incomplete Tasks
            tab+=`<tr class="dataRow" id=${item.crdeb_taskList}>
              <th><input type="checkbox" name="active${i+1}" id="active${i+1}" class="stat"></th>
              <th id="description${item.crdeb_taskList}">${item.crdeb_name}</th>
              <th><button type="button" class="upd" id="upd${item.crdeb_taskList}"> Edit </button> </th>
              <th><button type="button" class="del" id="del${item.crdeb_taskList}"> Delete </button> </th>
              </tr>`;
        }else{ // Complete Tasks
            tab+=`<tr class="dataRow" id=${item.crdeb_taskList}>
            <th><input type="checkbox" name="active${i+1}" class="stat" id="active${i+1}" checked="true"></th>
            <th id="description${item.crdeb_taskList}" style="text-decoration:line-through; color:#888;">${item.crdeb_name}</th>
            <th><button type="button" class="upd" id="upd${item.crdeb_taskList}">Edit</button> </th>
            <th><button type="button" class="del" id="upd${item.crdeb_taskList}">Delete</button> </th>
            </tr>`;
        }

    }
        
    taskList.innerHTML=tab;

    let updateBtn=document.querySelectorAll('.upd');

    updateBtn.forEach((item)=>{
        item.addEventListener('click',(event)=>{
            let id=event.target.closest('.dataRow').id;
            // console.log(id);
            setFlag(id);

        })
    });

    let deleteBtn=document.querySelectorAll('.del');
    deleteBtn.forEach((item)=>{
        item.addEventListener('click',(event)=>{
            let id=event.target.closest('.dataRow').id;
            showPopup(id);
            // console.log(id);
            
        })
    });

    let statusBtn=document.querySelectorAll('.stat');
    statusBtn.forEach((item)=>{
        item.addEventListener('click',(event)=>{
            let id=event.target.closest('.dataRow').id;
            setStatus(id);
        })
    })
}


// Add a new task
addButton.addEventListener('click', function (){
    const taskText = newTaskInput.value.trim();
    if (taskText === '') return;
    
    
    showLoadingOverlay();
    var myHeaders=new Headers();
    myHeaders.append("Content-Type","application/json");
    
    let stat="Incomplete";
    var record=JSON.stringify({
        taskStatus:stat,
        taskContent:taskText
    });
    
    const options={
        method:'POST',
        headers:myHeaders,
        body:record,
        redirect:'follow'
    }
    
    fetch(api_create,options)
    .then((response) => response.json())
    .then((result) => {
        // console.log(result);
        hideLoadingOverlay();
           
        if (result.status === 200){
            newTaskInput.value='';
            getApi();
        }else{
            alert("Record could not be created");
        }
    })
    .catch((error) => console.log("Error: ", error));
    
});

const popupOverlay = document.getElementById("popup-overlay");

function confirmButtonClickHandler(id){
    dataDelete(id);
    popupOverlay.style.display="none";
}

function cancelButtonClickHandler(){
    popupOverlay.style.display="none";
}

// Delete Task : Popup & Deleting Fn
function showPopup(id) {

    // Rendering each time via JS instead of putting in HTML bcz otherwise multiple eventListeners will be added to same confirm & cancel button(causes errors) 
    
    document.getElementById('popup').innerHTML=`
        <p>Are you sure you want to delete?</p>
        <div id="popup-buttons">
            <button id="confirm-button">Confirm</button>
            <button id="cancel-button">Cancel</button>
        </div>
    `;
    
    popupOverlay.style.display = "flex";
    
    const confirmButton = document.getElementById("confirm-button");
    confirmButton.addEventListener("click", function() {
        dataDelete(id);
        popupOverlay.style.display = "none";
    });
    
    const cancelButton = document.getElementById("cancel-button");
    cancelButton.addEventListener("click", function() {
        popupOverlay.style.display = "none";
    });
    
}


function dataDelete(id){    
    // console.log(id);

    showLoadingOverlay();

    var myHeaders=new Headers();
    myHeaders.append("Content-Type","application/json");
    
    var record=JSON.stringify({
        id:id
    });
    
    const options={
        method:'POST',
        headers:myHeaders,
        body:record,
        redirect:'follow'
    }
    
    fetch(api_delete,options)
    .then((response) => response.json())
    .then((result) => {
        hideLoadingOverlay();
        if (result.status === 200){
            getApi();
        }else{
            alert("Record could not be deleted");
        }
    })
    .catch((error) => console.log("Error: ", error));

}


// Update Task : Toggle Write Area/Update Call & Set Write Area & Update Fn
function setFlag(id){
    if(flag===0){
        dataUpdate(id);
        flag=1;
        prevId=id;
    }else{
        if(prevId===id){
            updateRecord(id);
            flag=0;
        }else{
            alert("Please update the previous record");
        }
    }
}


function dataUpdate(id){
    let taskText="";
    
    for(let i=0;i<myJson.payload.length;i++){
        if(myJson.payload[i].crdeb_taskList==id){
            taskText=myJson.payload[i].crdeb_name;
        }
    }
    
    console.log(taskText);

    // console.log(document.getElementById('upd'+id).innerText);
    document.getElementById('upd'+id).innerText="Update";

    document.getElementById('description'+id).innerHTML=`<input type="text" id="fname" value="${taskText}"></input>`;
    
    
}

function updateRecord(id){
    
    let tasktext = document.getElementById('fname').value;
    // console.log(tasktext);
    

    showLoadingOverlay();
    
    var myHeaders=new Headers();
    myHeaders.append("Content-Type","application/json");
    
    var record=JSON.stringify({
        text:tasktext,
        id:id
    });

    const options={
        method:'POST',
        headers:myHeaders,
        body:record,
        redirect:'follow'
    }
    
    fetch(api_update_text,options)
    .then((response) => response.json())
    .then((result) => {
        // console.log(result);
        hideLoadingOverlay();
        if (result.status === 200){
            getApi();
        }else{
            alert("Record could not be updated");
        }
    })
    .catch((error) => console.log("Error: ", error));
}

// Update Status

function setStatus(id){
    
    let status="";
    for(let i=0;i<myJson.payload.length;i++){
        if(myJson.payload[i].crdeb_taskList== id){
            status=myJson.payload[i].crdeb_status;
        }
    }

    let newstate="";
    if(status==="Incomplete"){
        newstate="Complete"
    }else{
        newstate="Incomplete"
    }

    showLoadingOverlay();

    var myHeaders=new Headers();
    myHeaders.append("Content-Type","application/json");
    
    var record=JSON.stringify({
        id:id,
        status:newstate
    });

    const options={
        method:'POST',
        headers:myHeaders,
        body:record,
        redirect:'follow'
    }
    
    fetch(api_update_status,options)
    .then((response) => response.json())
    .then((result) => {
        // console.log(result);
        hideLoadingOverlay();
        if (result.status === 200){
            getApi();
        }else{
            alert("Record could not be updated");
        }
    })
    .catch((error) => console.log("Error: ", error));

}

// Sorting & Filtering
var sortbit=0;
var filterbit=0;
function setDisplay(code){
    
    if(code[0]=="s"){ // Choose sorting order [Asc:1  Desc:2]
        sortbit=parseInt(code[1]);
    }else{ // Choose filter order [None:0 Complete:1 Incomplete:2]
        filterbit=parseInt(code[1]);
    }
    getRecords(sortbit,filterbit);
    
}

function getRecords(){
    let newArr={...myJson}; //creates shallow copy of myJson (no affect on myJson)

    if(filterbit===1){
        newArr.payload=newArr.payload.filter(obj=>obj.crdeb_status!=="Incomplete");
    }
    if(filterbit===2){
        newArr.payload=newArr.payload.filter(obj=>obj.crdeb_status!=="Complete");
    }


    if(sortbit===1){
        newArr.payload=newArr.payload.sort((a,b)=> a.crdeb_name.localeCompare(b.crdeb_name));
    }
    if(sortbit===2){
        newArr.payload=newArr.payload.sort((a,b)=> b.crdeb_name.localeCompare(a.crdeb_name));
    }
    
    // Send this new Filtered & Sorted array to be printed ( All rows will be printed with DB_id, performing any crud operation retakes back to Original list )
    show(newArr);

}

// Loading screen
function showLoadingOverlay() {
    let loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.style.display = "block";
}

function hideLoadingOverlay() {
    let loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.style.display = "none";
}

// Add better styling