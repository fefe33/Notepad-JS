const CALC_VALUE = {'a':0, 'b':0, 'op':null}; //where v is the value and d is the string displayed to the user

//this file manages the calculator
//im trying to be more strategic in writing this one. we will see how this goes....
calcManager = ()=>{
    let isA;
    //get the input display
    inputDisplay = document.querySelector('td#display').firstChild
    //write in the default value
    inputDisplay.value = ''
    //if the mode is view, return immediately. otherwise make the button div display
    document.querySelector('#calcBtnDiv').hidden = false
    openBtn = document.querySelector('#calcBtnDiv')
    //function to display the calculator popover (callback for button)
    let displayCalcModal = ()=>{
        console.log('clicked calcbtn')
        //get the calculator popover modal box and show it
        calcmodal = document.querySelector('div.calc-modal')
        calcmodal.style.display = 'block'
    
        //get the close button 
        let calcspan = document.querySelector("#closeCalc");
        
        // 
        // when usr clicks x , close it
        calcspan.onclick = function() {
          calcmodal.style.display = "none";
        }
        // do the same thing if clicked out of modal
        // window.onclick = function(event) {
        //     if (event.target !== document.querySelector('')) {
        //         calcmodal.style.display = "none";
        //     }
        // }
    }
    basicOpsValid = ['exp', '*', '/', '+', '-']
    //function to add (or replace an existing) operation on the CALC_VALUE.op buffer
    let addOperation = (op)=>{
        CALC_VALUE.op = op;
    }

    //performs the operation stored in the buffer writing the results to the value
    let doBasicOperation = ()=>{
        //perform the operation based on
        var output;
        CALC_VALUE.op==='exp'?output=CALC_VALUE.a**CALC_VALUE.b:null;
        CALC_VALUE.op==='*'?output=CALC_VALUE.a*CALC_VALUE.b:null;
        CALC_VALUE.op==='/'?output=CALC_VALUE.a/CALC_VALUE.b:null;
        CALC_VALUE.op==='+'?output=CALC_VALUE.a+CALC_VALUE.b:null;
        CALC_VALUE.op==='-'?output=CALC_VALUE.a-CALC_VALUE.b:null;
        //set the values to zero and the operation to null
        CALC_VALUE.a = output
        CALC_VALUE.b = 0
        CALC_VALUE.op = null
        output = output.toString()
        return output
    }
    //the "view calculator" button click event
    openBtn = document.querySelector('#calcBtnDiv')
    openBtn.onclick = displayCalcModal    


    //boolean switch for which value in the buffer to fill. if its A, the values entered are saved to the first buffer, if not A, their saved to the second 
    isA = true
    //get all the numbers and apply the event listener to them
    let addBtnEvents = ()=>{
        let numberElements = document.querySelectorAll('td.number')
        numberElements.forEach((n)=>{
            //for each element add the event listener
            n.onclick = (e)=>{
                console.log(e.target)
                //take the inner text of the target and write it the inputs value
                n = e.target.innerText 
                if ((n === '.'&&(inputDisplay.value.includes('.')||inputDisplay.value===''))) {
                    v = '0.'
                } else {
                    v = inputDisplay.value + n
                }
                    //take the value from the input and interpret it as an integer, saving it to the calculator constant
                inputDisplay.value = v
                if (isA) {                    
                    CALC_VALUE.a = parseFloat(v)
                } else if (!isA) {
                    CALC_VALUE.b = parseFloat(v)
                }
            

            }
        })
        // add the pi button event
        document.querySelector('td[data-ctl="pi"]').onclick = ()=>{
            v = '3.14159265359';
            //always overwrite the current value when 
            inputDisplay.value = v
            if (isA) {
                CALC_VALUE.a = v
            } else {
                CALC_VALUE.b = v
            }

        }
        //add the clear screen event
        //callback
        resetDisplayCallback = ()=>{
            inputDisplay.value = ''
            CALC_VALUE.a = 0.0
            CALC_VALUE.b = CALC_VALUE.a
            CALC_VALUE.op = null
            b = false
            isA = true
        }
        //var b to ensure its 2 clicks to clear
        document.querySelector('td.cls').onclick = resetDisplayCallback
        //get the basic control buttons (and the exponent button)
        basicOps = document.querySelectorAll('.basicOp')
        basicOps.forEach((b)=>{
            b.onclick = (e)=>{
                //if it includes a superscript tag, its the exponent button  (in this specific context)
                if (e.target.innerHTML.includes('<sup>')) {
                    CALC_VALUE.op = 'exp'
                }
                cc = e.target.innerText.charCodeAt(0)
                //switch to convert unicode characters to symbols easier to reference before writing to calc value
                switch (cc) {
                    case (215):
                        addOperation('*')
                        break;
                    case (247):
                        addOperation('/')
                        break
                    case (43):
                        addOperation('+')
                        break;
                    case(8722):
                        addOperation('-')
                        break;
                }
                isA = false
                inputDisplay.value = ''
            }


        })
        //listeners for operators that are performed immediatedly upon the current value in place (such as sin(), log(), etc)
        immediateOps = document.querySelectorAll('.iOps')
        //validates and executes the specified immidiate operation
        let validIops = ['log', 'sin', 'cos', 'tan','ln', 'sq', 'sqrt', 'inv']

        //executes the given operation on the A value in the buffer and returns the output (to be displayed to user)
        let executeImmediateOp = (op)=> {
            //if the 
            //validate
            if (!validIops.includes(op)) {return} else {
                var output;
                console.log(`executing operation ${op}`)
                switch(op) {
                    case('log'):
                        CALC_VALUE.a = Math.log10(CALC_VALUE.a)
                        break;
                    case('sin'):
                        CALC_VALUE.a = Math.sin(CALC_VALUE.a)
                        break;
                    case('cos'):
                        CALC_VALUE.a = Math.cos(CALC_VALUE.a)
                        break;
                    case('tan'):
                        CALC_VALUE.a = Math.tan(CALC_VALUE.a)
                        break;    
                    case('ln'):
                        CALC_VALUE.a = Math.log(CALC_VALUE.a)
                        break;
                    case('sq'):
                        CALC_VALUE.a = CALC_VALUE.a**2
                        break;
                    case('sqrt'):
                        CALC_VALUE.a = Math.sqrt(CALC_VALUE.a)
                        break;
                    case('inv'):
                        CALC_VALUE.a = (1 / CALC_VALUE.a)
                        break;
                }
                output = CALC_VALUE.a
                return output
            }
        }
        immediateOps.forEach((o)=>{
            let executeAndDisplay = (text)=>{
                console.log(`executing immediate operation on value ${CALC_VALUE.a}`)
                v = executeImmediateOp(text)
                console.log(`output ${v}`)
                
                document.querySelector('#display').firstChild.value = v
            }
            //add an event listener to each button that isnt the square or square root button
            o.onclick = (e)=>{
                //if the second value is filled and a basic operation is queued, do the operation
                if (CALC_VALUE.op&&CALC_VALUE.b) {
                    console.log('performing queued operation')
                    v = doBasicOperation()
                    console.log(`output ${v}`)
                }
                if (!e.target.getAttribute('data-ctl')) {
                    //if the attribute doesnt exist, reference using inner text
                    executeAndDisplay(e.target.innerText)
                } else if (e.target.getAttribute('data-ctl')==='sroot') {
                    executeAndDisplay('sqrt')
                } else if (e.target.getAttribute('data-ctl')==='sq') {
                    executeAndDisplay('sq')
                } else if (e.target.getAttribute('data-ctl')==='inv'||e.target.innerText.includes('/')) {
                    executeAndDisplay('inv')
                }
            }
        })
        //listener for the evaluate button
        document.querySelector('.EQ').onclick = (e)=>{
            if(!CALC_VALUE.op) return;
            document.querySelector('#display').firstChild.value = doBasicOperation()
        }
        //add the copy event
        document.querySelector('#copyResult').onclick = ()=>{
           
            navigator.clipboard.writeText(document.querySelector('#display').firstChild.value)
           
        }

    }
    addBtnEvents()





}
calcManager()