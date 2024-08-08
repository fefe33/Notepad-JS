//this is the script to handle the dictionary functionality
//it should be the last one loaded of the scripts for this page
let dictManager = async ()=>{
    create = (el)=>{return document.createElement(el)} 
    //get the button and modal
    button = document.querySelector('#dictBtnDiv')
    modal = document.querySelector('div#popover')
    formEnabled = false
    //detects when a ctrl enter is pressed then executes the provided function
    let detectspecialkeys = (e, f)=> {
        if (e.ctrlKey && e.key==='Enter'){
            //if ctrl enter is pressed during event e, execute function f
            f()
        }
    }
    //creates an input (either text area or input where type=text)
    let createInput = (isTA)=>{
        if (isTA) {
            //if the switch for the text area is true create a text area 
            inp = create('textarea')
            st = inp.style
            st.maxWidth = '90%'
            st.minWidth = '88%'
        } else {
            inp= create('input')
            st = inp.style
        }
        inp.id = 'dictUI'
        //input styles
        st.fontSize='1.1rem'
        st.width = '89%'
        st.padding = '2%'
        console.log('input:', inp)
        return inp
    }
    //callback for click to edit cells
    let cellListenerCallback = (eee)=>{
        //check that the form isnt already enabled
        if (formEnabled||localStorage.mode==='view') {
            return
        } else {
            // if its not enabled, enable it
            formEnabled = true
        }



        if(!inputRow){var inputRow=eee.target.closest('tr')}
        //get the definitionID and field (cell type) from the row
        let defID = inputRow.getAttribute('data-did')
        let cellType = eee.target.getAttribute('data-cell')


        inputFocusoutCallback = async (ev)=>{
            //request the server to update 
            j = {'cmd': 'updateDefinition','data':{'defID':defID, 'type':cellType, 'value':ev.target.value}}
            success = await fetch('/api', {method:'POST',headers:{"Content-Type":'application/json'}, body:JSON.stringify(j)})
                .then(
                    async (r)=>{
                        r = await r.json()
                        //if successful write the new value back as text
                        if (r['success']) {
                            val = ev.target.value
                            val===''?val='*undefined':null
                            cell = ev.target.closest('td')
                            cell.innerHtml = ''
                            cell.innerText = val
                            cell.onclick = cellListenerCallback
                            formEnabled = false
                        }
                        return true
                    }
                ).catch(
                    ()=>{return false}
                )
            if (!success) return
        }

        //callback for when the user presses enter or tab in the input
        inputKeyDownCallback = async (ev, isdef)=>{
            if (isdef) {
                //wait for the correct key combination
                detectspecialkeys( ev,async ()=>{
                j = {'cmd': 'updateDefinition','data':{'defID':defID, 'type':cellType, 'value':ev.target.value}}
                //make the request to the server to update a definition
                success = await fetch('/api', {method:'POST',headers:{"Content-Type":'application/json'}, body:JSON.stringify(j)})
                    .then(
                        async (r)=>{
                            r = await r.json()
                            return r['success']
                        }
                    ).catch(
                        ()=>{return false}
                    )
                if (!success){return}
                val = ev.target.value
                val===''?val='*undefined':null
                cell = eee.target.closest('td')
                cell.innerHtml = ''
                cell.innerText = val
                cell.onclick = cellListenerCallback
                formEnabled = false
            })
            } else if (!isdef) {
                if (ev.key==='Enter'||ev.key==='Tab') {
                
                    j = {'cmd': 'updateDefinition','data':{'defID':defID, 'type':cellType, 'value':ev.target.value}}
                    success =await fetch('/api', {method:'POST',headers:{"Content-Type":'application/json'}, body:JSON.stringify(j)})
                        .then(
                            async (r)=>{
                                r = await r.json()
                                return r['success']
                            }
                        ).catch(
                            ()=>{return false}
                        )
                    //the update attempt is unsucessful return
                    if (!success){return}
                    
                    val = ev.target.value
                    //return if there are illegal characters, maybe call an alert warning that the string contains illegal characters
                    if (val.includes('<')||val.includes('>')||val.includes('&')||val.includes(';')) {return}
                    val===''?val='*undefined':null
                    cell = ev.target.closest('td')
                    cell.innerHtml = ''
                    cell.innerText = val
                    cell.onclick = cellListenerCallback
                    formEnabled = false

                }
            }
        }

        //event listeners differ depending cell type
        var isdef;
        if (cellType === 'definition') {
            isdef= true
        } else if (cellType==='word') {
            ///create and style the input
            isdef = false
        }
        input=createInput(isdef)
        input.onkeydown = (evt)=>{
            inputKeyDownCallback(evt, isdef)
        }
        input.onfocusout = inputFocusoutCallback
        vv = eee.target.innerText
        vv==='*undefined'?vv='':null
        input.value=vv
        eee.target.innerHTML = ''
        eee.target.appendChild(input)
        input.focus()
        //focusout event
        //callback
       
       
        
    }

    
    //function to quickly pull dictionary from cache
    pullDict = ()=>{
        if (localStorage.dictionary) {
            console.log(localStorage.dictionary, 'flag')
            return JSON.parse(localStorage.dictionary)
        }
    }
    //removes a definition from the cache
    let removeDefinitionFromCache = ()=> {
        dict = pullDict()
        dict['pairs'] = dict['']
    }

    let deletionEvent = async (ee)=>{
        //terminate if input is enabled
        if (formEnabled) {
            return
        }
        defid = ee.target.closest('tr').getAttribute('data-did')
        //... send signal to server for deletion ...
        await fetch('/api', {method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify({'cmd':'delDefinition', 'data':{'defID':defid}})})
            .then(
                async (r)=>{
                    r = await r.json()
                    if (r['success']){
                        ee.target.closest('tr').remove();
                        removeDefinitionFromCache();
                    } else { return }
                }
            ) .catch(()=>{return})
        
    }






    let writeTable = ()=>{
        //write the table
        table = create('table')
        table.id='dictionary'

        //create and stitch together the head
        thead = create('thead')
        rowHead = create('tr')
        rowHead.id='dictFields'
        cellsHead = [create('td'), create('td')]
        ems = [create('b'), create('b')]
        ems[0].innerText = 'word'
        ems[1].innerText = 'definition'
        //append ems to cells and cells to rows
        for (i=0;i<2;i++) {
            cellsHead[i].colSpan = 5
            cellsHead[i].appendChild(ems[i])
        }
        c = [create('td'),cellsHead[0], create('td'),cellsHead[1],create('td')]
        for (i of c) {
            thead.appendChild(i)
        }
        thead.appendChild(rowHead)

        //create and put together the table body
        tbody = create('tbody')
        tbody.id='appendDict'
        rowAdd = create('tr')
        rowAdd.id='addBtnDict'
        cellBtn = create('td')
        cellBtn.colSpan = 13
        button = create('button')
        button.classList.add('btn')
        //button styles
        button.style.backgroundColor = 'orange'
        button.innerText = 'new definition'
        button.style.fontStyle = 'italic'
        button.style.color = '#fff'

        //event listener for the button {yes i hate myself alot to write this a second time from scratch}
        /* 
            when the button is clicked the following occurs: 
                the node containing the row that holds the button is cloned
                the button is removed 
                the button's parent row's ID is set to blank
                the column span of the cell is set to 1
                a new cell is created and appended to the row
                an input is created and styled (adding the respective event listeners) 
                each input is appended to a cell
                the cloned node is appended back to the body

        */
        btnCallback = async (e)=>{

            

            //if the form is already enabled, just return
            if (formEnabled) {
                return
            }

            ///when this is called, the form is officially enabled
            formEnabled = true

            tbody=document.querySelector('tbody#appendDict')
            clonedRow = e.target.closest('tr').cloneNode(true)
            inputRow = e.target.closest('tr')
        
            

            inputRow.innerHTML = ''
            //this is for later reference in the event listeners
            inputRow.id = 'CurrentForm'
            td = [create('td'), create('td')]
            //row styles
            inputRow.style.height='70px'
            inputRow.appendChild(td[0])
            inputRow.appendChild(td[1])
            delBtn = create('button')
            //style the button
            delBtn.classList.add('delBtnDict')
            delBtn.style.color = '#fff'
            delBtn.style.height='100%'
            delBtn.style.minWidth='2em'
            delBtn.style.minHeight = '2em'
            delBtn.innerHTML='&times;'
            delBtn.style.fontSize = '1.8rem'
            delBtn.style.backgroundColor = '#DC143C'

            //listener for the delete button
            delBtn.onclick = deletionEvent
            
            input = createInput(false)  
            
            //initialize the object in the database with empty strings for values
            defID = await fetch('/api', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({'cmd':'addDefinition', 'data':{'noteID':localStorage.noteID, 'word':'','definition':''}})})
            .then(
                async (r)=>{
                    r_obj = await r.json()
                    if (r_obj['success']) {
                        ///return the definitionID
                        return r_obj['defID']
                    }
                }
            )
            //set row attr data-did to the recieved definition ID
            inputRow.setAttribute('data-did', defID)
         


            //set row colSpan/styles
            for (i of td) {
                i.colSpan = 5
            }
            td[0].appendChild(input)
            td[0].setAttribute('data-cell', 'word')
            td[1].setAttribute('data-cell', 'definition')
            td[1].innerText='*undefined'
            td[1].id = 'nextUI'

            //callback to submit a new definition pair to the database
            let addDefinition = async (event)=>{
                if (event.key==='Enter'||event.key==='Tab') {
                    j = {'cmd':'updateDefinition', 'data':{'type':event.target.closest('td').getAttribute('data-cell'), 'defID':event.target.closest('tr').getAttribute('data-did'), 'value':event.target.value}}
                    await fetch('/api', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(j)})
                    .then(
                        async (r)=>{
                            b = await r.json()
                            if (b['success']) {
                                //do something
                            }
                        }
                    )
                    






                    ///take the value and write it to the parent td, removing the input
                    let v = event.target.value, cell = event.target.closest('td')
                    event.target.remove()
                    //if its empty set it to the string '*undefined'
                    !v?cell.innerText = '*undefined':cell.innerText = v

                    
                    //take the value of the second cell and replace it with input containing an equivalent value
                    cell = document.querySelector('#nextUI')
                    input = createInput(true)
                    v = cell.innerText
                    cell.innerHTML = ''
                    //this makes the value blank 
                    v==='*undefined'?v='':null
                    cell.id = ''
                    //3 "e"s in this one because its 3 event deep
                    input.onkeydown = (eee)=>{
                        //since this is the last cell, when enter is pressed, just replace the text with the current value
                        detectspecialkeys(eee, async ()=>{
                            //savve to server
                            j = {'cmd':'updateDefinition', 'data':{'type':eee.target.closest('td').getAttribute('data-cell'), 'defID':eee.target.closest('tr').getAttribute('data-did'), 'value':eee.target.value}}
                            await fetch('/api', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(j)})
                                .then(async (r)=>{
                                    r = await r.json()
                                    if (r['success']){
                                        v = eee.target.value 
                                        !v?cell.innerText = '*undefined':cell.innerText = v
                                        formEnabled=false
                                    }
                                })
                            
                        })
                    }
                    cell.appendChild(input)
                    
                    document.querySelector('textArea#dictUI').focus()
                    
                    
                }
            }

            //set the row holding the definition's data-did to the contents defID 
            
            //set the event listener for the input
            input.onkeydown = addDefinition



    
            td.forEach((v)=>{
                //idk how many events deep i am at this point. im gonna say 3 -- (so 3 "e"s)
                //set the event listener for each cell
                
                v.onclick = cellListenerCallback
            })
            //add the extra cells to fill the gaps and the delete button
            td = [create('td'), td[0], create('td'), td[1], create('td')]
            td[2].innerHTML = '&rarr;'
            td[2].style.fontSize = '2.5rem'
            //append it together
            td[0].appendChild(delBtn)
            td.forEach(t=>inputRow.append(t))
            console.log(inputRow.children)
            

            //add this listener to the cloned row
            clonedRow.firstChild.firstChild.onclick = btnCallback
            tbody.appendChild(clonedRow)

            

            //focus on the input
            input.focus()

            
        }   
        button.onclick = btnCallback
        cellBtn.appendChild(button)
        rowAdd.appendChild(cellBtn)
        //write the values from localstorage each to their own row
        dictObj = pullDict()
        console.log(dictObj)
        let createRow=(id, word, definition)=>{
            //if the word or definition is blank set its text to "*undefined"
            !word?word='*untitled':null
            !definition?definition='*untitled':null
            //create the row object 
            let dlb = create('button')
            //style the button
            dlb.classList.add('delBtnDict')
            dlb.style.color = '#fff'
            dlb.style.height='100%'
            dlb.style.minWidth='2em'
            dlb.style.minHeight = '2em'
            dlb.innerHTML='&times;'
            dlb.style.fontSize = '1.8rem'
            dlb.style.backgroundColor = '#DC143C'
            //add the event listener to the button
            dlb.onclick = (eev)=>{deletionEvent(eev, )}


            let rw = create('tr')
            rw.setAttribute('data-did', id)
            //create the cells
            let cls = [create('td'),create('td'),create('td'),create('td'),create('td')] 
            cls[1].innerText = word
            cls[1].setAttribute('data-cell', 'word')
            cls[1].colSpan = 5

            cls[2].innerHTML = '&rarr;'
            cls[2].style.fontSize = '2.5rem'
            cls[3].innerText = definition
            cls[3].setAttribute('data-cell', 'definition')
            cls[3].colSpan = 5
            //add the events
            if (localStorage.mode!=='view'){
                cls[1].onclick=cellListenerCallback
                cls[3].onclick = cellListenerCallback
            }
            ///append button and cells to row
            cls[0].appendChild(dlb)
            cls.forEach((c)=>{rw.appendChild(c)})
            return rw
        }
        console.log(dictObj)
        dictObj['pairs'].forEach((item)=>{
            //construct a row for the item
            thisRow = createRow(item[0],item[1],item[2]) 
            tbody.appendChild(thisRow)
        })




        tbody.appendChild(rowAdd)
        //add them to the table
        table.appendChild(thead)
        table.appendChild(tbody)
        //return the table
        document.querySelector('#appendDict').appendChild(table)
    }
    
    //function to create the dictionary table
    let makeDict = ()=> {
        if (localStorage.mode === 'new'||localStorage.mode === 'edit') {
            //try to set the condition 
            if (!document.querySelector('#dictionary')) {
                writeTable()
            }
        
        } 
        
    }
    
    let writeStaticTable = ()=>{
        let create = (el)=>{return document.createElement(el)} 
        table = create('table')
        table.id='dictionary'
        //create and stitch together the head
        thead = create('thead')
        rowHead = create('tr')
        rowHead.id='dictFields'
        cellsHead = [create('td'), create('td')]
        ems = [create('b'), create('b')]
        ems[0].innerText = 'word'
        ems[1].innerText = 'definition'
        //append ems to cells and cells to rows
        for (i=0;i<2;i++) {
            cellsHead[i].colSpan = 5
            cellsHead[i].appendChild(ems[i])
        }
        c = [create('td'),cellsHead[0], create('td'),cellsHead[1],create('td')]
        for (i of c) {
            thead.appendChild(i)
        }
        thead.appendChild(rowHead)
        table.appendChild(thead)
        document.querySelector('#appendDict').appendChild(table)
    }
    //function to display the modal with the given dictionary
    let displayDictModal = ()=>{
        //get the close button and show the modal
        var span = document.querySelector("span#closeDict");
        modal.style.display = 'block'
        // 
        // when usr clicks x or out of the modal, close it
        span.onclick = function() {
          modal.style.display = "none";
        }
        window.onclick = function(event) {
            if (event.target == popover) {
                modal.style.display = "none";
            }
        }
    }
    //call the display modal function
    document.querySelector('#dictBtnDiv').onclick = ()=>{
        console.log('clicked')
        makeDict()
        displayDictModal()
    }
    //if the mode is view, highlight all vocab words and write a static table containing the words and write in their respective definitions as tooltips
    if (localStorage.mode==='view') {
        dict = pullDict()
        //write the static table
        writeStaticTable()
        //create and put together the table body
        table = document.querySelector('table#dictionary')
        table.style.height = '100%'
        tbody = create('tbody')
        let createRow = (word, def)=>{
            row = create('tr')
            td = [create('td'),create('td'),create('td'),create('td'),create('td'),]
            td[1].colSpan = 5
            td[1].innerText = word
            td[1].style.fontStyle='italic'
            td[3].innerText = def
            td[3].colSpan = 5
            td.forEach((t)=>{
                //append the event
                t.onclick = cellListenerCallback
                row.appendChild(t)
            })
            console.log(row)
            return row
        } 
        dict.pairs.forEach((p)=>{
            if(p[1]!==''&&p[2]!=='') {
                r = createRow(p[1], p[2])
                console.log(p[1], p[2])
                tbody.appendChild(r)
            }
        })
        table.appendChild(tbody)
        
        //handle the dictionary highlighting
        //required steps:
        /* 
            get the node containing all of the content 
            iterate through

            inner.substr(inner.search('coulomb') - outerSub.length,outer.length)
            **
            where inner == innerHTML of CELL
            outer == outerHTML of given span
            outerSub == outerHTML of given span up to index of word (if its not -1)

        */
        
        
        
        content = document.querySelectorAll('.contentItem')
        console.log(content)
        //get indices of all occurances of a substring (courtesy of stackoverflow)
        let locations = (substring,string) => {
            var a=[],i=-1;
            while((i=string.indexOf(substring,i+1)) >= 0) a.push(i);
            return a;
        } 
        cc = 0
        // ... dictionary highlight v1
        dict['pairs'].forEach((d)=>{
            if (cc>0) {return}
            if (d[1]!=='') {
                //get the query value
                q = d[1]
                //...and the respective definition
                def = d[2]
                //escape html
                let escapeHTML = (unsafe) => {
                    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
                }
                q = escapeHTML(q)
                def = escapeHTML(def)
                //if the definition is longer than 24 characters, truncate it with ...
                def.length>64?def=`${def.substr(0,64)}...`: null
                c = 0

                
                
                // /\bpi\b/g 
                let tooltipsExist;
                oh = []
                for (i of content) {
                    //get all the existing tooltips' outerHTML (if there are any)
                    //
                    tooltips = i.querySelectorAll(".tooltiptext")
                    bannedIndices = [] //array to hold banned indices
                    if (tooltips) {
                        let validateOnce = (vi, n)=>{
                            if (n[0]<vi<n[1]) {
                                return True
                            } else return false
                        }
                        tooltips.forEach((tt)=>{
                            if validateOnce(i.innerHTML.search(q), [i.innerHTML.search((tt.outerHTML)),i.innerHTML.search((tt.outerHTML))+tt.outerHTML.length])
                            
                        })
                        console.log('banned indices: ', bannedIndices)
                        tooltipsExist = true
                        
                        
                    }
                    re = new RegExp(q)
                    re.ignoreCase = true
                    if (re.test(i.innerHTML)&&c<1) {






                        //doing this is bad but i need to finish this 
                        console.log(re.exec(i.innerHTML))
                        i.innerHTML = i.innerHTML.replace(re.exec(i.innerHTML), `<div class='tooltip'>${q}<span class='tooltiptext'>${def}</span></div>`)
                        c++
                    } else {
                        continue
                    }
                    
                }
            }
            cc++
        })
        //end handling of dictionary highlighting


    }
    
}
//make sure this executes after the second script (will fix)
setTimeout(dictManager,300)

