import sqlite3
class database:
    """
        DatabasePath=path/to/name.db
    """
    def __init__(self, DatabasePath):
        self.database = DatabasePath
        self.tables = ['Notes', 'Content', 'Definitions']
        self.Cx = None
        self.c = None
        self.connected = lambda: self.c != None and self.Cx != None

    #opens connection to database
    def open_connection(self):
        #open the connection storing cursor and connection ref objs to self
        if not self.connected():
            self.Cx = sqlite3.connect(self.database)
            self.c = self.Cx.cursor()
            # print('opened database')
        #else:
            # print('database already open.')

        #check if the tables exist, creating the tables if they dont exist
        self.c.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="Notes"')
        hasNotes = len(self.c.fetchall()) != 0
        self.c.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="Content"')
        hasContent = len(self.c.fetchall()) != 0
        self.c.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="Definitions"')
        hasDefinitions = len(self.c.fetchall()) != 0
        # print('Notes Table Exists:', hasNotes, '\nContent Table Exists: ', hasContent, '\nDefinitions Table Exists: ', hasDefinitions)


        # this is where the tables gets created
        if not hasNotes:
            self.c.execute('CREATE TABLE Notes (NoteID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT)')
            self.Cx.commit()
            print('Notes table created')
        if not hasContent:
            self.c.execute('CREATE TABLE Content (ContentID INTEGER PRIMARY KEY AUTOINCREMENT, NoteID INTEGER, data TEXT)')
            self.Cx.commit()
            print('Content table created')
        if not hasDefinitions:
            self.c.execute('CREATE TABLE Definitions (DefID INTEGER PRIMARY KEY AUTOINCREMENT, NoteID INTEGER, Word TEXT, Definition TEXT)')
            self.Cx.commit()
            print('Definitions table created')
    #closes connection to database
    def close_database(self):
        if self.c != None or self.Cx != None:
            self.c.close()
            self.Cx = None
            self.c = None
            # print('database closed')
        # else:
            # print('database already closed')
    #inserts a note to the notes table
    def insert_note(self, name):
        if self.connected():
            #the logic for the insertion starts here -- ID left as Null (autoincrement)
            self.c.execute('INSERT INTO Notes VALUES (NULL, ?)', (repr(name),))
            self.Cx.commit()
            # print('note added')
            return True
        else:
            # print('not connected to database. failed to add new note')
            return False
    #updates a note in the Notes table
    def update_note(self, newName, id):
        if self.connected():
            # the logic for the UPDATE query starts here
            self.c.execute('UPDATE Notes SET Name=? where NoteID=?', (repr(newName), id))
            self.Cx.commit()
            # print('updated note')
            return True
        else:
            # print('not connected to database. failed to update note')
            return False

    #inserts content into the Content table
    def insert_content(self, noteID, data):
        #assert that the NoteID Exists in the the Notes Table
        self.c.execute('SELECT NoteID FROM Notes WHERE NoteID=?', (noteID,))
        try:
            assert len(self.c.fetchall())!=0
        except:
            print('invalid noteID')
            return False
        if self.connected():
            #the logic for the insertion starts here -- ID left as Null (autoincrement)
            self.c.execute('INSERT INTO Content VALUES (NULL, ?, ?)', (noteID, repr(data)))
            self.Cx.commit()
            # print('success content added to table')
            return True
        else:
            # print('not connected to database.')
            return False


    #updates content in the Content table
    def update_content(self, contentID, text):
        # assert that the NoteID Exists in the the Notes Table
        self.c.execute('SELECT ContentID FROM Content WHERE ContentID=?', (contentID,))
        try:
            assert len(self.c.fetchall()) != 0
        except:
            print('invalid contentID')
            return False

        if self.connected():
            # the logic for the insertion starts here -- ID left as Null (autoincrement)
            self.c.execute(' UPDATE Content SET data=? WHERE ContentID=?', (repr(text), contentID))
            self.Cx.commit()
            # print('success content updated')
            return True
        else:
            # print('not connected to database.')
            return False

    #reads all values
    def read_all(self, table):
        if table not in self.tables:
            print('table doesnt exist')
            return
        else:
            if table == 'Notes':
                self.c.execute('SELECT * FROM {} ORDER BY NoteID'.format(repr(table)))
            elif table == 'Content':
                self.c.execute('SELECT * FROM {}'.format(repr(table)))
            elif table == 'Definitions':
                self.c.execute('SELECT * FROM {} ORDER BY Word'.format(repr(table)))
            return self.c.fetchall()

    def content_by_noteID(self, noteID):
        s = 'SELECT * FROM Content WHERE NoteID=?'
        self.c.execute(s, (noteID,))
        content_unparsed = self.c.fetchall()
        data = [[i[0], i[2]] for i in content_unparsed]
        # print(data)
        for i in data:
            # print(i)
            if 'NULL' in i[1]:
                i[1] = ''
            else:
                i[1] = eval(i[1])
        return {'success':True, 'content':data}

    def definitions_by_noteID(self, noteID):
        s = 'SELECT * FROM Definitions WHERE NoteID=?'
        self.c.execute(s, (noteID,))
        content_unparsed = self.c.fetchall()
        data = [[i[0],i[2], i[3]] for i in content_unparsed]
        # print(data)
        for i in data:
            i[1] = eval(i[1])
            i[2] = eval(i[2])
        # print(data)
        return {'success': True, 'definitions': data}


    def insert_definition(self, noteID, word, definition):
        # assert that the NoteID Exists in the the Notes Table
        self.c.execute('SELECT NoteID FROM Notes WHERE NoteID=?', (noteID,))
        try:
            assert len(self.c.fetchall()) != 0
        except:
            print('invalid noteID')
            return False
        if self.connected():
            # the logic for the insertion starts here -- ID left as Null (autoincrement)
            self.c.execute('INSERT INTO Definitions VALUES (NULL, ?, ?, ?)', (noteID, repr(word), repr(definition)))
            self.Cx.commit()
            # print('success definition added to table')
            return True
        else:
            # print('not connected to database.')
            return False

    def update_definition(self, defID, field, new_value):
        self.c.execute('SELECT NoteID FROM Definitions WHERE DefID=?', (defID,))
        try:
            assert len(self.c.fetchall()) != 0
        except:
            print('invalid noteID')
            return False
        if self.connected():
            if field == 'Word':
                self.c.execute('UPDATE Definitions SET Word=? WHERE DefID=?', (repr(new_value), defID))
            elif field == 'Definition':
                self.c.execute('UPDATE Definitions SET Definition=? WHERE DefID=?', (repr(new_value), defID))
            self.Cx.commit()
            # print('success Definition updated')
            return True
        else:
            # print('not connected to database.')
            return False



    #deletes records based on a table and an ID
    #recursively deletes related records Content Table when Note from Notes Table is removed
    def delete_data(self, table, refID):
        #validate
        if table not in self.tables:
            print('table doesnt exist')
            return False
        #if its the notes table
        if table=='Notes':
            # print('deleting NoteID: {} from "Notes" table and related records in "Content" and "Definitions" tables.'.format(refID))
            self.c.execute('DELETE FROM Notes WHERE NoteID=?', (refID,))
            self.c.execute('DELETE FROM Content WHERE NoteID=?', (refID,))
            self.c.execute('DELETE FROM Definitions WHERE NoteID=?', (refID,))
            self.Cx.commit()
            return True
        #if its the content table delete only the content with that contentID
        elif table=='Content':
            # print('deleting from Content')
            self.c.execute('DELETE FROM Content WHERE ContentID=?', (refID,))
            self.Cx.commit()
            return True

        elif table=='Definitions':

            # print('deleting from Definitions')
            self.c.execute('DELETE FROM Definitions WHERE defID=?', (refID,))
            # print('deletion success')
            self.Cx.commit()
            return True




    #this is a dev function
    def definition_by_id(self, dID):
        s = 'SELECT * FROM Definitions WHERE defID={}'.format(dID)
        self.c.execute(s)
        return self.c.fetchall()