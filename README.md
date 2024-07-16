# notepad
<p>a simple notepad application. designed and written by fefe33</p>
<br>
<p>the application is designed to run on a local flask server (IT SHOULD NEVER BE DEPLOYED ON THE WEB) which uses an sqlite3 database to store notes. the front end is written in CSS, HTML, and JS.</p>
<br>

# features
<p>it has several features, including but not limited to:</p>
<ul>
  <li>the ability to create, edit, update, and delete notes</li>
  <li>a read-only mode feature</li>
  <li>a simple way to style sections of text *(does not support punctuation)</li>
  <li>a basic calculator</li>
  <li>a means to define/highlight words</li>
</ul>

# config/installation
<ol>
  <li><p>make sure the prerequisites are installed by running <code>pip install flask</code></p></li>
  <li><p>run <code>git clone https://github.com/fefe33/notepad</code></p></li>
  <li><p>(optional) using the editor of your choice, go into the /cfg directory (in the program's root directory) and edit the config.txt file. change the value of database to the name of your choice (ending in .db). the default is the example database which just contains a sample note showcasing some of the applications features</p></li>
  <li><p><code>cd</code> into the program's root folder and run <code>python3 app.py</code>, then navigate to http://127.0.0.1/ in your browser.</p></li>
</ol><br>
<p></p>

# usage 
<p>the app opens to the index page which (in the case that there are notes to be listed) lists previously created notes.</p>
<p>click the big purple 'new' button to make a new note</p>
<p>to edit existing notes, click the big green plus button</p>
<p>to view an existing note in read-only mode, click the yellow eye button</p>
<p>to update a notes name, click its name and press enter to commit the change. (async update)</p>
<p>to delete an existing note click the red X button</p>
<hr>
<b>viewing/editing the document</b><br>
<p>when editing the document, new notes can be added by clicking the big green plus button</p>
<p>existing sections can be updated by clicking the section and editing via the text box</p>
<p>the dictionary is invoked via the clipboard button in the top right of the screen</p>
<p>the calculator is invoked via the +/- symbol on the right of the screen below clipboard button</p>
<hr>
<b>using the dictionary</b>
<p>to use the dictionary, click the clipboard and use the popup dialogue to add new words and definitions. to update words and definitions, click the word or definition you wish to update and edit via the text box or input</p>
<p>(work in progress) while in read only mode, the first occurance of each word should be underlined (and its truncated definition should appear above on hover)</p>

