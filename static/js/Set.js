let main = async ()=> {



	//if localstorage is undefined redirect back to the index
	if (localStorage.length === 0) {
		document.title = 'error: redirect';
		window.location = '/'
	}
	
	mode = localStorage.mode
	
	

	//function to write the title
	let writeTitle = ()=>{
		let title;
		//i want to start coding js like this more 
		localStorage.title===''?title='*untitled':title=localStorage.title;
		document.querySelector('#noteTitle').innerText = title; document.title = title;}
	
	
	//note title clickToEdit Callback Function 
	//inputEnabled switch (to prevent overlap of events)
	inputEnabled = false
	let tryUpdateContent = async (e)=>{
		rid = e.target.closest('tr').getAttribute('data-rid')
		let newContent = document.querySelector('textArea#UI').value
		try {
			if (currentValue) {}
		} catch {
			currentValue = ''
		}
		if (newContent !== currentValue) {
			await fetch('/api', {method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({'cmd':'updateContent', 'data':{'text':newContent, 'contentID':rid}})})
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
						if (newContent ==='') {
							newContent = '****'
						}  
						//if newContent is empty. write '****'
						e.target.closest('td').innerText = newContent
						
				})
		} else {
			if (newContent ==='') {
				newContent = '****'
			}	 
			thistd = document.querySelector('textArea#UI').closest('td')
			thistd.innerHTML = ''
			console.log('new content: ', newContent)
			thistd.innerText = newContent
		}
		window.onclick = null
		inputEnabled = false

	}
	







	//function to request content by ID
	let getContentByNoteID = async (noteID)=> {
		return await fetch('/api', {method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({'cmd':'content', 'data':{'noteID':noteID}})})
			.then(async (r)=>{return await r.json()
				.then((rr)=>{
					if (rr.success) {
						return rr.content
					} else {
						return ['error']
					}
				})
		
			})
	}	  

	let clearRows = ()=>{document.querySelector('#appendRows').innerHTML = ''}
	//writes no content dialogue
	let noContent = ()=>{
		//clears rows
		appendTo = document.querySelector('tbody#appendRows')
		row = document.createElement('tr')
		row.id = 'noContentDialogue'
		cell = document.createElement('td')
		cell.colSpan = '12'
		cell.innerText = '*No Content'
		//append children
		row.appendChild(cell)
		appendTo.appendChild(row)

	}
	//function to write the add note row/cell/button
	let writeButtonCell = ()=>{



		row = document.createElement('tr')
		cell = document.createElement('td')
		button = document.createElement('button')
		cell.colSpan = 12
		cell.id = 'addContent'
		button.style.width='100%'
		button.style.height='50px'
		button.innerHTML = '&plus;'
		button.classList.add('btn')
		button.id = 'addBtn'

		button.style.fontWeight = 'bold'
		cell.appendChild(button)
		row.appendChild(cell)
		//if the id already exists in the html. remove the element and place it at the bottom
		if (document.querySelector('button#addContent')) {
			document.querySelector('button#addContent').remove()
		}
		document.querySelector('#appendRows').appendChild(row)
		//add the listener to the button
		button.onclick = async (e)=>{
			//make the request to update the database, writing a new row/cell/textbox to the table upon success
			await fetch('/api', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({'cmd':'addContent', 'data':{'noteID':noteID, 'text':''}})})
				.then( async (r)=>{
					r = await r.json()
					if (r['success'] === true) {
						
						addNoteCell('', e.target, r.contentID)
					}
				
				})


		}

	}
   
	function detectspecialkeys(e, f){
		if (e.ctrlKey && e.key==='Enter'){
			//if ctrl enter is pressed during event e, execute function f
			f()
		}
	}
	//writes a cell with a note in it and adds a clickToEdit event listener 
	//define the markup variable
   

	let writeNoteCell = (text, rid)=>{
		

		//log the value
		//console.log(text)
		//get the HTML of the DOM object	
		appendTo = document.querySelector('tbody#appendRows')
		//create/style the elements
		let delBtn = document.createElement('button')
		delBtn.classList.add('btn')
		delBtn.style.height='100%'
		delBtn.style.minHeight='60px'
		delBtn.style.width='100%'
		delBtn.innerHTML='&times;'
		delBtn.style.backgroundColor = 'red'
		delBtn.style.color = '#fff'
		
		if (localStorage.mode!=='view') {
			//button click listener
			delBtn.onclick = async (ee)=>{
				if (!inputEnabled){
					rid = ee.target.closest('tr').getAttribute('data-rid')
					success = await fetch('/api', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({'cmd':'delContent', 'data':{'contentID':rid}})})
						.then(
							async (r)=>{
								r = await r.json()
								return r['success']
							}
						).catch(
							()=>{
								return false
							}
						)
					//if success, delete the associated row
					if (success) {
						ee.target.closest('tr').remove()
					} else {
						return 
					}
				}
			}
		}


		row = document.createElement('tr')
		row.setAttribute('data-rid', rid)
		if (localStorage.mode === 'view') {
			row.style.borderTop = 'solid #fff'
		}


		td = [document.createElement('td'), document.createElement('td'), document.createElement('td')]
		/*
			- the first cell is for dragToOrder functionality 
			- the second cell is for the content
			- the third is for the buttons
		*/
		//cell lengths
		if (localStorage.mode!=='view'){
			td[0].colSpan = '2'
			td[1].colSpan = '8'
			td[2].colSpan = '2'
		} else {
			td[0].colSpan = '1'
			td[1].colSpan = '10'
			td[2].colSpan = '1'
		}
		//if its edit or new mode, append the button
		if (localStorage.mode!=='view') {
			td[2].appendChild(delBtn)
		}
		td[1].classList.add('contentItem')
		//parse the markup and set the text
		
		//function to escape the html
		let escapeHtml = (unsafe) => {
			return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
		}
		symbolizeHtml = (safe) => {
			return safe.replaceAll('&amp;','&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll("&#309;", "'")	
		}
		



		//test the regular expression against the text only if the document is in view mode
		if (localStorage.mode==='view') {
			/*
				select an expression that:
					starts with an "!",
					proceeded by a word,
					proceeded by open bracket,
					proceeded by set of letters and spaces,
					proceeded by end bracket



			*/
			re = /!\w*\[[\w\sa-zA-Z0-9\s\n:=;/>,~\`\*<$#@!+&\.\-\{\}\(\)\\\|?\"\']*\]/
			if (re.test(text)) {
				//console.log('regex found')
				let translateMarkup = (command, text)=>{
					//this is not safe at all to do like this and i acknowledge that (xss) but its not gonna be deployed on the web so its ok
					s = '<span style="%">%</span>'
					switch(command) {
						case 'b':
							return `<b>${text}</b>`
						case 't':
							s = s.replace('%', 'font-size: 3rem') 
							return s.replace('%', text)
						case 'tt':
							s = s.replace('%', 'font-size:2.7rem')
							return s.replace('%', text)
						case 'ttt':
							s = s.replace('%', 'font-size:2.3rem')
							return s.replace('%', text)
						case 'sup':
							return `<sup>${text}</sup>`
						case 'sub':
							return `<sub>${text}</sub>`
						case 'c':
							return `<code>${text}</code>`
						case 'i':
							return `<em>${text}</em>`
						case 'u':
							return `<u>${text}</u>`
						case 'h':
							return `<mark>${text}</mark>`
					}
			
				}
				//short html escape function to 
							//escape all the original text characters and get the first match
				text = escapeHtml(text)
				while(true) {
					//get and replace each match using the regex
					matches = re.exec(text)
					//if its null break
					if (!matches) {
						break
					}
					matches = matches[0]
					//split it into its command and value
					z = matches.substr(1,matches.length-2).split('[')
					newHTML = translateMarkup(z[0], z[1])
					//console.log('replacing:', td[1].innerHTML, '.\ntransformation: ', matches, z, newHTML)
					//replace the original match with the new HTML
					text = text.replaceAll(matches, newHTML)
				}
				text = text.replaceAll('\n', '<br>')
				td[1].innerHTML = text
				
			} else {
				td[1].innerText = text
			}
			//define the next regular expression 
			//this is for writing the tables
			/*
				table syntax as such:
				!table(titleA, titleB, titleC, ...)[(valueA1, valueB1, valueC1, valueA2, valueB2, ...)]

				*/
			re = /!table\([a-zA-Z0-9\s\n:=;\/>%,~\`\*<$#@!+&\.\[\]\-\{\}\\\|?\"\'_]*\)\:\[[\w\d\ba-zA-Z0-9\s\n:=¸\;>,~\`\*\<$#@%!+&\(\)\-\\.\{\}\\\/\|?\"\'_]*\]/
			if (re.test(text)) {

				//this counter only iterates when values in buffer c are copied as a set and successfully written as a single table row
				ct = 0	
				console.log('creating table(s)')
				a = true
				while(a) {
					console.log('iter main: ',ct)
					
					
					//get and replace each match using the regex
					matches = re.exec(text)
					//if its null break
					if (!matches) {
						break
					}
					matches = matches[0]
					console.log('match = ', matches)
					//split it into its fields (titles) and values
					content = matches.split('):[')
					//check if len is valid
					if (content.length != 2) {break}
					titles = (content[0].substr(7, content[0].length-1)).split(/(?<!\\)\,/)
					values = (content[1].substr(0,content[1].length-1)).split(/(?<!\\)\,/)
					o = []
					titles.forEach((t)=>{o.push(t.replaceAll('<br>', ''))});
					titles = []
					o.forEach((i)=>{titles.push(symbolizeHtml(i))});
					o = []
					values.forEach((v)=>{o.push(v.replaceAll('<br>', '\n'))});
					values = []
					o.forEach((i)=>{values.push(symbolizeHtml(i))})
					o = undefined


					
					console.log('titles (escaped): ', titles)
					console.log('values (escaped):', values)
					//generate the new HTML for the table
					//where t=='titles' and v=='values' are of type arr, tableParent == 'parent element (as node) to the table', and match which can be of typ regex or str'
					
					/*if (ct===(values.length/titles.length)-1) {
						break
					};*/

					let writeTable = (tableParent,match,t,v)=> {
						/*
						 * CREATE the html for the table (wrapper) AS HTML
						 * create the nodes (and their sub elements) for the header/body
						 * build table in place, then return the node
						 */
							
						main = '<table id="current" style="border:none;"></table>'
						tableParent.innerHTML = tableParent.innerHTML.replace(symbolizeHtml(match), main)
						console.log(tableParent.innerHTML)
						innerTable = tableParent.querySelector('table#current')


						//create the header/body
						head = document.createElement('thead')
						head.style.backgroundColor='rgb(135,206,50,0.2)'
						head.borderBottom = 'dotted black 2px'
						body = document.createElement('tbody')
						//function to write a row out of array x
						let writeInnerRow = (x, istitle)=>{
							if (!x) {
								x = ['NULL']
							}
							//make a single cell using text y as data
							let writeInnerCell = (y, islast) => {
								let innerCell
								if (istitle) {
									innerCell = document.createElement('th')
								} else {
									innerCell = document.createElement('td')
									innerCell.style.borderBottom='none'
								}
								if (islast) {
									innerCell.style.borderRight = 'none'
								} else {
									innerCell.style.borderRight = 'groove black 2px'
								}
								innerCell.style.borderTop = 'none'
								innerCell.style.width = 'auto'
								innerCell.innerText = symbolizeHtml(y.replaceAll('\\,',','))
							
								return innerCell
							}
							//write all the x values to cells, appending to the row along with
							console.log('x len: ', x.length)
							innerRow = document.createElement('tr')
							for (i=0;i<x.length;i++) {
								//if its the last iteration, call with islast = 'true' 
								if (i!=x.length-1) {
									innerRow.appendChild(writeInnerCell(x[i],false))
								} else {
									innerRow.appendChild(writeInnerCell(x[i], true))
								}
							}
							return innerRow
						}
						/*replace the matched text
						 *get length of array t and save to l
						 *if l % v.length is not 0, append null values until full
						 *create a titles row using array t
						 *iterate through array v, saving into buffer c.
						 	*if the iteration is a multiple of l. create a row using array c then clear the buffer
						 *
						 * */
						l = t.length			
						console.log('IMPORTANT: THIS IS YOUR MOD VALUE:', l)
						if (v.length%l!=0) {
							while (v.length%l!=0) {
								v.push('-')
							}	
							console.log('v (filled): ',v)
						}
						titleRow = writeInnerRow(titles, true)
						// append to header
						head.appendChild(titleRow)
						c = []
						//function to split array into smaller arrays of size (l)
						let divideArr = (arr, l)=>{c=[];o=[];arr.forEach((d,i)=>{c.push(d);if(c.length===l){o.push(c);c=[]}});return o;}
						rowArrs = divideArr(v, l)
						// iterate through the set of arrays, writing each set as a row of <td> cell nodes	
						for (i of rowArrs) {
							body.appendChild(writeInnerRow(i,false))
						}
								
						//if its the first count, do this. 
						if (ct===0) {
							main = '<table id="current" style="border:none;"></table>'
							tableParent.innerHTML = tableParent.innerHTML.replace(match, main) 
							console.log(tableParent.innerHTML)
							innerTable = tableParent.querySelector('table#current')
						} else {
							console.log()
						}
						if (!innerTable) {
							innerTable = document.createElement('table')
						}

						// append to values to body
						innerTable.appendChild(head)
						innerTable.appendChild(body)
						innerTable.id=''
						console.log('Inner Table: ', innerTable)
						return innerTable.outerHTML
					}

					//
					//
					//replace the original match with the new HTML
					console.log('match found. replacing')
					newHTML = writeTable(td[1],matches, titles, values)
					text = text.replace(matches, newHTML)
					console.log('text:', matches,  text, '\nhtml: ', newHTML)
			
				}
			//	}
				
			}

		} else {
			td[1].innerText = text
		}

		//if the doc is in edit mode, add the event listener to the cell
		if (localStorage.mode!=='view') {
			td[1].addEventListener('click', async (e)=>{
				//get the noteID from localStorage (its a constant value on this page)
				rID = localStorage.noteID
				//if the firstChild is not already an input
				if (!inputEnabled&&e.target.localName!=='textArea' && e.target.firstChild!==(undefined||null) && e.target.firstChild.localName!=='textArea') {
					console.log('clicked')
					inputEnabled = true
					if (e.target.innerText!=='****') {currentValue = e.target.innerText} else {currentValue = ''}
					//set the inner text to ''
					currentTarget = e.target
					e.target.innerText=''
					//create and append the input with the current value
					input = document.createElement('textArea')
					//set the listener for the input
					input.id = 'UI'
					input.style.backgroundColor = '#fff'
					input.value = currentValue
					input.style.maxWidth = '80%'
					input.style.minWidth = '78%'
					input.style.fontSize = '1.31rem'
					input.style.padding = '2%'
					input.style.width = '79%'
					input.style.transform = 'ease-in 0.5s'
					input.style.height = '290px'
					input.style.textAlign = 'center'
					currentTarget.appendChild(input)
					input.focus()
					input.onkeydown= (eee)=>{detectspecialkeys(eee, ()=>{
						console.log('combination pressed')
						tryUpdateContent(e);
					})}
					document.querySelector('textArea#UI').onfocusout = (ee)=>{
						tryUpdateContent(e);
						//add event listener to the text area detect if the appropriate key combination has been applied
						
					}
					
					
					//event listener for if the user clicks outside of the input\
					if (!window.onclick) {
						let clickCount = 0
						window.onclick = (ee)=> {
							//ignore the first click since it will register the first one for no god damn reason
							if (clickCount>0) {
								
								//if the target isnt the input 
								console.log(ee.target)
								if (ee.target!==document.querySelector('textarea#UI')) {
									console.log('clicked out')
									tryUpdateContent(e);
								}
							}
							clickCount++;
						}
					}
				//
				}
			})
		}
		//callback to toggle show/hide the button

		//append everything together
		for (i of td) {
			row.appendChild(i)
		}
		appendTo.appendChild(row)
	}

	//function to append a dom object to a row in table
	let addNoteCell = (v, btn, rid)=>{
		//remove the button and the id from the table row
		row = btn.closest('tr')
		row.innerHTML = ''
		row.id=''
		row.remove()
		console.log(row)
		//create and style the button
		let delBtn = document.createElement('button')
		delBtn.classList.add('btn')
		delBtn.style.height='100%'
		delBtn.style.minHeight='60px'
		delBtn.style.width='100%'
		delBtn.innerHTML='&times;'
		delBtn.style.backgroundColor = 'red'
		delBtn.style.color = '#fff'
		//add the event to the button
		//this should also be a callback. 
		delBtn.onclick = async (ee)=>{
			if (!inputEnabled){
				rid = ee.target.closest('tr').getAttribute('data-rid')
				success = await fetch('/api', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({'cmd':'delContent', 'data':{'contentID':rid}})})
					.then(
						async (r)=>{
							r = await r.json()
							return r['success']
						}
					).catch(
						()=>{
							return false
						}
					)
				//if success, delete the associated row
				if (success) {
					ee.target.closest('tr').remove()
				} else {
					return 
				}
			}
		}

		appendTo = document.querySelector('tbody#appendRows')
		//create the elements
		row = document.createElement('tr')
		row.setAttribute('data-rid', rid)
		td = [document.createElement('td'), document.createElement('td'), document.createElement('td')]
		/*
			- the first cell is for dragToOrder functionality 
			- the second cell is for the content
			- the third is for the delete button
		*/
		td[0].colSpan = '2'
		td[1].colSpan = '8'
		td[2].colSpan = '2'
		///give the middle cell its class
		td[1].classList.add('contentItem')

		// set the text
		//input
		textArea = document.createElement('textarea')
		textArea.id = 'UI'
		textArea.style.backgroundColor = '#fff'
		textArea.style.maxWidth = '80%'
		textArea.style.minWidth = '78%'
		textArea.style.width = '79%'
		textArea.style.padding = '2%'
		textArea.style.fontSize = '1.31rem'
		textArea.style.transform = 'ease-in 0.5s'
		textArea.style.height = '290px'
		textArea.style.textAlign = 'center'

		textArea.value = v
		
		//add the event listener to the cell (no need to check for view mode since the button wont exist in view mode)
		//the anon function used should be a callback since it occurs multiple times but im feeling lazy today
		td[1].addEventListener('click', async (e)=>{
			//get the noteID from localStorage (its a constant value on this page)
			rID = localStorage.noteID
			//if the firstChild is not already an input
			if (!inputEnabled&&e.target.localName!=='textArea' && e.target.firstChild!==(undefined||null) && e.target.firstChild.localName!=='textArea') {
				console.log('clicked')
				inputEnabled = true
				if (e.target.innerText!=='****') {currentValue = e.target.innerText} else {currentValue = ''}
				//set the inner text to ''
				currentTarget = e.target
				e.target.innerText=''
				//create and append the input with the current value
				input = document.createElement('textArea')
				//set the listener for the input
				input.id = 'UI'
				input.style.backgroundColor = '#fff'
				input.value = currentValue
				input.style.maxWidth = '80%'
				input.style.minWidth = '78%'
				input.style.fontSize = '1.31rem'
				input.style.padding = '2%'
				input.style.width = '79%'
				input.style.transform = 'ease-in 0.5s'
				input.style.height = '290px'
				input.style.textAlign = 'center'
				currentTarget.appendChild(input)
				input.focus()
				input.onkeydown= (eee)=>{detectspecialkeys(eee, ()=>{
					console.log('combination pressed')
					tryUpdateContent(e);
				})}
				document.querySelector('textArea#UI').onfocusout = (ee)=>{
					tryUpdateContent(e);
					//add event listener to the text area detect if the appropriate key combination has been applied
					
				}
				
				
				//event listener for if the user clicks outside of the input\
				if (!window.onclick) {
					let clickCount = 0
					window.onclick = (ee)=> {
						//ignore the first click since it will register the first one for no god damn reason
						if (clickCount>0) {
							
							//if the target isnt the input 
							console.log(ee.target)
							if (ee.target!==document.querySelector('textarea#UI')) {
								console.log('clicked out')
								tryUpdateContent(e);
							}
						}
						clickCount++;
					}
				}
			//
			}
		})



		td[1].appendChild(textArea)
		td[2].appendChild(delBtn)
		//the 
		for (i of td) {
			row.appendChild(i)
		}
		appendTo.appendChild(row)
		//event listener for when special keys
		textArea.onkeydown = (e)=>{
			detectspecialkeys(e, ()=>{
				tryUpdateContent(e)
			})
		}

		//onfocus event listener for textArea
		
		textArea.onfocus = (e)=> {
			if (!window.onclick) {
				let clickCount = 0
				window.onclick = (ee)=> {
					//ignore the first click since it will register the first one for no god damn reason
					if (clickCount>0) {
						console.log('clicked out')
						//if the target isnt the input 
						console.log(ee.target)
						if (ee.target!==document.querySelector('textarea#UI')) {
							tryUpdateContent(e);
						}
					}
					clickCount++;
				}
				

			}
			
		}


		textArea.focus()
		writeButtonCell()
	}	

	writeTitle()
	let noteID = localStorage['noteID']
	//get the content from the server and write it to the table. if there is none call noContent()
	let content =  await getContentByNoteID(noteID)
	if (content.length===0) {
		if (localStorage.mode!=='view') {
			//parse the simple markup syntax
			//translate as such:
			/*
				*assert that there is a command in the block of text being analyzed*

				*element*.style[translateMarkup[command][0]] = translateMarkup[1]
			*/
			writeButtonCell()
		} else {
			noContent()
		}
	} else { //if there is content iterate through it and write it as a cell of content
		for (i of content) {
			//i[1] is the content, i[0] is its ID
			if (i[1]==='') {
				writeNoteCell('****', i[0])
			} else {
				writeNoteCell(i[1], i[0])
			}
		}
		if (localStorage.mode !== 'view') {
			writeButtonCell()
		};
	}
  
	//set the event for the "back" button
	document.querySelector('#backBtnDiv').onmouseup = ()=>{
		//clear localstorage and redirect
		localStorage.clear()
		window.location = '/'

	}
	//function to change the document mode 
	let chmod = ()=>{
		modes = ['view', 'edit']
		localStorage.mode===modes[0]?localStorage.mode = modes[1]:null;
		localStorage.mode===modes[1]?localStorage.mode = modes[0]:null;
		window.location = window.location
	}
	return chmod

}
Main = main().then(async (o)=>{return o})
 
//localStorage.mode==='view'?setTimeout(()=>{window.location = window.location}, 30000):null;
