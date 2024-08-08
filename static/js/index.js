let main = async ()=>{
    // clear localStorage if its defined
    if (localStorage) {
        localStorage.clear()
    }
    let inputEnabled = false
    let formExists = false 
    let newNoteForm = ()=>{
        formExists = true
        //create the form
        form = document.createElement('div')
        form.style.textAlign = 'center'
        // ... input ...
        input = document.createElement('input')
        input.style.textAlign = 'center'
        input.name = 'Title'
        input.style.width = '16%'
        input.style.height = '30px'
        input.style.borderRadius = '7px'
        input.type = 'text'
        input.style.fontSize = '1.2rem'
        input.id = 'noteName'
        //event listener for the input
        
        input.onfocus = async (e)=>{
            input.onkeydown = async (ee)=>{
                if (ee.key === 'Enter') {
                    //store the value to localstorage and relocate to /notes
                    localStorage.setItem('mode', 'edit')

                    //make the request to upload the new title to the database
                    title = e.target.value
                    r = await fetch('/api', {method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({'cmd':'newNote', 'data':{'title': title}})}).then(async (r)=>{return await r.json()}) 
                    if (r['success'] === true) {
                        //set value in localstorage
                        localStorage.setItem('mode', 'edit')
                        localStorage.setItem('title', title)
                        localStorage.setItem('noteID', r['noteID'])
                        console.log(`note ${title} added to database`)
                    } 
                    //redir
                    window.location = '/notes'
                }
            }
        }
        input.onfocusout = (e)=>{
            input.onkeydown = undefined
        }

        // ... label ...
        label = document.createElement('label')
        label.setAttribute('for', 'noteName')
        label.style.fontSize = '1.9rem'
        label.style.padding = '14px'
        label.innerText = 'Title: '

        for (i of [label, input]) {
            form.appendChild(i)
        }
        return [form, input]
    } 
    //creates and writes the confirm delete prompt
    let deletionForm = (title)=>{
        //create form
        form = document.createElement('div')
        form.style.textAlign = 'center'
        //create the btn
        btn = document.createElement('input')
        btn.style.textAlign = 'center'
        btn.innerText = 'confirm?'
        btn.style.width = '16%'
        btn.style.height = '30px'
        btn.style.borderRadius = '7px'
        btn.style.fontSize = '1.2rem'
        btn.id = 'deleteBtn'

        label = document.createElement('label')
        label.setAttribute('for', 'deleteBtn')
        label.style.fontSize = '1.9rem'
        label.style.padding = '14px'
        label.innerText = `Are you sure you wish to delete note "${title}"? `

    }

    let displayModal = (btn, mode)=>{
        let form
        let isNew = mode==='new'
        let isDeletion = mode==='delete'

        if (isNew) {
            document.querySelector('div#appendContent').innerHTML = ''
            form = newNoteForm()
            input = form[1]
            form = form[0]     
        } else if (isDeletion) {
            form = deletionForm()
        }       
        document.querySelector('div#appendContent').appendChild(form)
        
        //get the content
        var popover = document.querySelector("#popover");
        var span = document.getElementsByClassName("close")[0];
        // 
        btn.onclick = ()=> {
          popover.style.display = "block";
        }
        //focus on the input and set the value to undef
        


        // when usr clicks x or out of the modal, close it
        span.onclick = function() {
          popover.style.display = "none";
        }
        window.onclick = function(event) {
            if (event.target == popover) {
                popover.style.display = "none";
                //REMOVE THE TEXT IN THE INPUT if the mode is new
                if (isNew&&input) {
                    input.value = ''
                }
                
            }
        }
    }
    //attach this func as a callback for the 'new' btn click event
    document.querySelector('#newNotes').onclick = (e)=>{displayModal(e.target, 'new', {})}

    let writeButton = async (name, id)=> {
        if (name === (null||'')) {
            name = '*untitled'
        }
        appendTo = document.querySelector('#append_titles')
        row = document.createElement('tr')
        row.classList.add('btnRow')
        row.classList.add('fItem')
        titleCell = document.createElement('td')
        titleCell.innerText = name
        titleCell.style.fontSize = '2.3rem'
        titleCell.colSpan = '3'
        //function to try and update the values in the database and in the 
        let tryUpdate = async (e)=>{
            newName = document.querySelector('input#UI').value
            

            if (newName != currentValue) {
                await fetch('/api', {method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({'cmd':'renameTitle', 'data':{'newName':newName, 'id':id}})})
                //upon success, safely replace the html for the inputbox with the text contained in its value 
                    .then(async (r)=>{
                        success = await r.json()
                            //upon failure, replace the html for the input with the original title
                            try {
                                success = success['success']
                            } catch {
                                e.target.innerHTML = ''
                                e.target.innerText=currentValue
                                // make the text flash red twice
                                e.target.style.color = 'red'
                                setTimeout(()=>{
                                    e.target.style.color = '#fff'
                                },1500)

                            }
                            e.target.innerHTML = ''
                            //if newName is empty. write it as a space
                            e.target.innerText = newName
                            if (e.target.innerText ===('' || null)) {
                                e.target.innerText = '*untitled'
                            }
                    })
            } else {
                e.target.innerHTML = ''
                e.target.innerText = newName
            }
            window.onclick = null
            inputEnabled = false

        }


        //add the event listener to the title Cell
        titleCell.addEventListener('click', async (e)=>{
            //get the target rID from the HTML
            rID = e.target.closest('tr').getAttribute('data-rid')
            //if the firstChild is not already an input
            if (!inputEnabled&&e.target.localName!=='input' && e.target.firstChild!==(undefined||null) && e.target.firstChild.localName!=='input') {
                console.log('clicked')
                inputEnabled = true
                currentValue = e.target.innerText

                //if the currentValue is '*untitled' set it to ''
                if (currentValue === '*untitled') {
                    currentValue = ''
                }
                
                //set the inner text to ''
                currentTarget = e.target
                e.target.innerText=''
                //create and append the input with the current value
                input = document.createElement('input')
                //set the listener for the input
                input.id = 'UI'
                input.style.backgroundColor = '#fff'
                input.style.fontSize = '2rem'
                input.value = currentValue
                currentTarget.appendChild(input)
                input.focus()
                //track key presses for enter key
                
                document.querySelector('input#UI').addEventListener('keypress', (ee)=>{
                    if (ee.key == 'Enter') {
                        tryUpdate(e);
                    }
                })
                
                
                //event listener for if the user clicks outside of the input\
                if (!window.onclick) {
                    let clickCount = 0
                    window.onclick = (ee)=> {
                        //ignore the first click since it will register the first one for no god damn reason
                        if (clickCount>0) {
                            console.log('clicked out')
                            //if the target isnt the input 
                            console.log(ee.target)
                            if (ee.target!==document.querySelector('input#UI')) {
                                tryUpdate(e);
                            }
                        }
                        clickCount++;
                    }
                }
            //
            } 
            
            //else {
            //     if (e.target.localName === 'input'||(e.target.localName ==='td'&&e.target.firstChild.localName==='input')) {
            //     //try to update the name in the database
            //         tryUpdate(e)
            //     }
                

            // }
        })



        viewCell = document.createElement('td')
        viewCell.colSpan = '1'
        updateCell = document.createElement('td')
        updateCell.colSpan = '1'
        deleteCell = document.createElement('td')
        deleteCell.colSpan = '1'
        updateBtn = document.createElement('button')
        deleteBtn = document.createElement('button')
        viewBtn = document.createElement('button')
        //cache to local server function
        let cacheToLS = async ()=>{
            r = await fetch('/api', {method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify({'cmd':'definitions', 'data':{'noteID':noteID}})}).then(async (r)=>{return await r.json()})
            try {
                if (r['success']) {
                    r = r['definitions']                    
                }
            } catch {console.log('something is going wrong around line 289')}
            return JSON.stringify({'pairs':r})
        }
        
        //edit button event
        updateBtn.onclick = async (e)=>{
            row = e.target.closest('tr')
            title = row.firstChild.innerText
            noteID = row.getAttribute('data-rid')
            localStorage.setItem('noteID',noteID)
            localStorage.setItem('mode', 'edit')
            localStorage.setItem('title', title)
            dict = await cacheToLS()
            localStorage.setItem('dictionary', dict)


            window.location = '/notes'
        }

        //view button event
        viewBtn.onclick = async (e)=>{
            row = e.target.closest('tr')
            title = row.firstChild.innerText
            noteID = row.getAttribute('data-rid')
            localStorage.setItem('noteID',noteID)
            localStorage.setItem('mode', 'view')
            localStorage.setItem('title', title)
            //cache the dictionary to localStorage
            dict = await cacheToLS()
            console.log(dict)
            localStorage.setItem('dictionary', dict)
            window.location = '/notes'
        }
       
        //delete button event
        deleteBtn.onclick = async (e)=>{

            //confirm that the user wants to delete the button with popover

            rID = e.target.closest('tr').getAttribute('data-rID')
            success = await fetch('/api', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({'cmd':'delete', 'data':{'type':'n', 'rID':rID}})})
                .then(async (r)=>{
                    r = await r.json()
                    return r['success']
                }).catch(
                    ()=>{return 'error'}
                )
            if (success !== 'error') {
                e.target.closest('tr').remove()
            }

        }


        //style the buttons manually/using inline css/ predef classes
        viewBtn.style.color = '#fff'
        viewBtn.style.backgroundColor = 'DarkGoldenrod'
        viewBtn.classList.add('noteButton')
        viewBtn.innerHTML = '&#128065;'
        deleteBtn.style.backgroundColor = 'red'
        deleteBtn.style.color = '#fff'
        deleteBtn.innerHTML = '&times;'
        deleteBtn.classList.add('noteButton')
        updateBtn.style.backgroundColor = 'green'
        updateBtn.style.color = '#fff'
        updateBtn.innerHTML = '&plus;'
        h3 = [document.createElement('h3'), document.createElement('h3')]
        viewBtn.appendChild(h3[0])
        updateBtn.appendChild(h3[1])

        updateBtn.classList.add('noteButton')
        //set the data-rID attributes for each btn         
        row.setAttribute('data-rID', id) 
        
        viewCell.appendChild(viewBtn)
        updateCell.appendChild(updateBtn)
        deleteCell.appendChild(deleteBtn)
        for (i of [titleCell, viewCell, updateCell, deleteCell]) {
            row.appendChild(i)
        }
        appendTo.appendChild(row)

        
        
    }

    let writeButtons = async ()=> {
        titles = await fetch('/api', {method: 'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({'cmd':'notes'})})
        .then(async (r)=>{return await r.json()})
        .then((j)=>{ return j['notes']}) 
        
        titles.forEach((i)=>{writeButton(i[1].substr(1,i[1].length-2), i[0])})
    }

    //filter functionality

    let showAll = ()=>{
        document.querySelectorAll('tr.fItem').forEach((d)=>{
            d.hidden = undefined ;
        })
    }
    document.querySelector('#fsearch').onkeydown = (e)=>{
        if (e.key==='Enter'){
        //show all items. select all fItems (filter items) and check against e.target.value
            showAll()
            document.querySelectorAll('tr.fItem').forEach((d)=>{
                lowerCaseTitle = d.firstChild.innerText.toLowerCase()
                if (!lowerCaseTitle.includes(e.target.value.toLowerCase())) {
                d.hidden = true;
                }
            })
        }
    }
    //add the default values when title is blank (focus events)
    document.querySelector('input#fsearch').onfocusout = (e)=>{
        console.log('clicked out')
        if (e.target.value==='') {
            e.target.value ='Search/Filter'
        }
    }
    writeButtons()
}

main()


