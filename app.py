from flask import Flask, render_template, request, make_response, abort
import json, os
from backend import database


app = Flask(__name__, template_folder='templates', static_folder='static')
#read the database from the config file (ignoring hashed out strings)
thisDB = None
with open(os.path.dirname(os.path.realpath(__file__))+'/cfg/config.txt') as config:
    for i in config:
        if i.startswith('#'): continue
        #if its the database config, get it
        if 'database' in i.lower():
            thisDB = i.split('=')[1]
            if thisDB.startswith('%data%'):
                thisDB = thisDB.replace('%data%', os.path.dirname(os.path.realpath(__file__))+'/data')
                print('database: {}'.format(thisDB))
                break
if not thisDB:
    thisDB = os.path.dirname(os.path.realpath(__file__))+'/data/test3.db'





db = database(thisDB)

@app.route('/')
@app.route('/index', methods=['GET'])
#this is the main page for creating and viewing notes
def index():
    return render_template('index.html', methods=['GET'])
#this returns the notes markup
@app.route('/notes')
def notes():
    return render_template('Set.html')

#this is the api for the database
@app.route('/api', methods=['POST'])
def api():
    command = request.json['cmd']
    #if the command is notes return all the names of all the notes in alphabetical order.
    if command == 'notes':
        db.open_connection()
        all_notes = db.read_all('Notes')
        db.close_database()
        all_notes = [list(i) for i in all_notes]
        return make_response(json.dumps({'notes':all_notes}))
    elif command == 'renameTitle':
        new_name = request.json['data']['newName']
        id = request.json['data']['id']

        db.open_connection()
        db.update_note(new_name, id)
        db.close_database()
        return make_response(json.dumps({'success':True}))
    elif command == 'delete':
        deletionType = request.json['data']['type']
        rID = request.json['data']['rID']
        #some kind of validation is needed here probably
        db.open_connection()
        if deletionType == 'n':
            db.delete_data('Notes', rID)
        elif deletionType == 'c':
            db.delete_data('Content', rID)
        else:
            db.close_database()
            return make_response(json.dumps({'success':False}))
        db.close_database()
        return make_response(json.dumps({'success':True}))
    elif command == 'newNote':
        note_title = request.json['data']['title']
        db.open_connection()
        db.insert_note(note_title)
        #get the notes from the database with the same name
        thistitle = db.read_all('Notes')
        #find the largest noteID of all the notes with that title and return it
        noteID = max([int(j[0]) for j in thistitle])

        db.close_database()
        return make_response(json.dumps({'success':True, 'noteID':noteID}))

    elif command == 'content':
        noteID = request.json['data']['noteID']
        db.open_connection()
        content_obj = db.content_by_noteID(noteID)
        db.close_database()
        return make_response(json.dumps(content_obj))

    elif command == 'addContent':

        noteID = request.json['data']['noteID']
        text = request.json['data']['text']
        #if the text is blank. save it as NULL
        if text == '':
            text = 'NULL'
        db.open_connection()
        #first insert the content
        db.insert_content(noteID, text)
        #get the contentIDs
        content_obj = db.content_by_noteID(noteID)
        newCID = max([i[0] for i in content_obj['content']])

        db.close_database()
        return make_response(json.dumps({'success': True, 'contentID': newCID}))
    elif command == 'updateContent':
        contentID = request.json['data']['contentID']
        text = request.json['data']['text']

        db.open_connection()
        db.update_content(contentID, text)
        db.close_database()
        return make_response(json.dumps({'success':True}))

    elif command == 'delContent':
        contentID = request.json['data']['contentID']
        db.open_connection()
        db.delete_data('Content', contentID)
        db.close_database()
        return make_response(json.dumps({'success':True}))

    elif command=='definitions':
        #gets all definitions with given noteID
        noteID = request.json['data']['noteID']
        db.open_connection()
        definitions_obj = db.definitions_by_noteID(noteID)
        db.close_database()
        # print('definitions object: ', definitions_obj)
        return make_response(json.dumps(definitions_obj))

    elif command=='addDefinition':
        noteID = request.json['data']['noteID']
        word = request.json['data']['word']
        definition = request.json['data']['definition']

        #insert the data into the database
        db.open_connection()
        db.insert_definition(noteID, word, definition )
        #get all the the definitionIDs and maximize PKs
        these_defs = db.definitions_by_noteID(noteID)
        defID = max([int(j[0]) for j in these_defs['definitions']])
        db.close_database()
        return make_response(json.dumps({'success':True, 'defID':defID}))

    elif command == 'updateDefinition':
        field = request.json['data']['type']
        definitionID = request.json['data']['defID']
        new_value = request.json['data']['value']
        db.open_connection()
        if field == 'word':
            db.update_definition(definitionID,'Word', new_value)
        elif field == 'definition':
            db.update_definition(definitionID, 'Definition', new_value)
        db.close_database()
        return make_response(json.dumps({'success':True}))

    elif command =='delDefinition':
        defID = request.json['data']['defID']
        # print('attempting to delete id {} from Definitions'.format(defID))

        db.open_connection()
        b = db.delete_data(table='Definitions', refID=defID)
        db.close_database()
        return make_response(json.dumps({'success': b}))



if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8080)
