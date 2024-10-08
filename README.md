# notepad
<p>a notepad application. designed and written by Mo A. (aka fefe33)</p>
<br>
<p>the application is designed to run on a local flask server which uses an sqlite3 database to store notes. IT SHOULD NEVER BE DEPLOYED IN A WEB ENVIRONMENT. the front end is written in CSS, HTML, and vanilla JS.</p>
<br>

# features
<p>it has several features, including but not limited to:</p>
<ul>
  <li>the ability to create, edit, update, and delete notes</li>
  <li>a read-only mode feature</li>
  <li>a simple way to style sections of text</li>
  <li>a basic calculator</li>
  <li>a simple syntax for representing data in pre-styled HTML tables</li>
</ul>

# config/installation
<ol>
  <li><p>install python3-venv by running <code>sudo apt update&&sudo apt install python3-venv</code></p></li>
  <li><p>create your virtual environment by running <code> python3 -m venv Notepad-JS</code>.</p></li>
  <li><p>cd into the newly created directory and enter the virtual environment by running: <code>cd Notepad-JS&&source bin/activate</code>.</p></li>
  <li><p>make sure the dependancy is installed by running <code>pip install flask</code></p></li>
  <li><p>run <code>git clone https://github.com/fefe33/Notepad-JS</code></p></li>
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
<h2><b>viewing/editing the document</b></h2>

<p>when editing the document, new notes can be added by clicking the big green plus button</p>
<p>existing sections can be updated by clicking the section and editing via the text box</p>
<p>the dictionary is invoked via the clipboard button in the top right of the screen</p>
<p>the calculator is invoked via the +/- symbol on the right of the screen below clipboard button</p>
<hr>

<h2><b>using the dictionary</b></h2>
<h4>not currently implimented</h4>
<!--
<p>to use the dictionary, click the clipboard and use the popup dialogue to add new words and definitions. you must be in edit mode to update words and definitions. while in edit mode, click the word or definition you wish to update and edit via the text box or input</p>
<p>(work in progress) while in read only mode, the first occurance within the entire note of each word should be underlined -- its definition [truncated to 64 chars] appearing above on hover.</p>
<p>the dictionary is also read only when viewing it in read only mode</p>
<hr>
-->
<h2><b>using the calculator</b></h2>
<p>the calculator is opened via the +/- symbol on the right of the screen when in edit or view mode. it supports some basic 1 and 2 input operations</p>
<hr>
<h2><b>basic styling</b></h2>
<p>the basic syntax for styling block of text is as follows: <code>!cmd[block_of_text]</code></p>
<p>**due to regular expression related issues, punctuation and newlines arent supported for styled content (but will be in the future)</p>
<p>here is a table of commands and their corrisponding styles:</p>
<table>
  <thead>
    <tr>
      <th>command</th>
      <th>style</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>!b</td>
      <td>bold</td>
    </tr>
    <tr>
      <td>!i</td>
      <td>italic</td>
    </tr>
    <tr>
      <td>!t</td>
      <td>big title (3rem)</td>
    </tr>
    <tr>
      <td>!tt</td>
      <td>smaller title (2.7rem)</td>
    </tr>
    <tr>
      <td>!u</td>
      <td>underline</td>
    </tr>
    <tr>
      <td>!h</td>
      <td>highlight</td>
    </tr><tr>
      <td>!c</td>
      <td>equiv to &lt;code&gt;</td>
    </tr>
  </tbody>
</table>
<p>syntax for tables are as folows:</p>
<code>!table(title 1, title 2):[item 1, item 1 description, item 2, item 2 description, ...]</code>
<p>commas are escaped with <code>\,</code>. styles currently do not work within tables and will be printed as raw html.</p>
<p>titles should be put between the parentheses, the array provided after should provide values as they would fall into the array of titles.</p>
<p>if the number of items provided in the array following titles in the set of parantheses mod (%) the number of titles is greater than zero, a dashes ('-') are appended to the remaining empty cells at the end of the table </p>





