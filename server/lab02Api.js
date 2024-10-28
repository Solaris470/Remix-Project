import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import admin from "firebase-admin";

import serviceAccount from "./config/firebase-config.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const port = 3004;

app.use(bodyParser.json());
app.use(cors());
app.listen(port, ()=>{
    console.log(`Web application listening on port ${port}.`);
});


async function addToDo(tmpToDoData){
    const toDoRef = db.collection('to_do').doc();
    const docRef = db.collection('to_do').doc(toDoRef.id);
    let tmpObj = { ...tmpToDoData, toDoId: toDoRef.id };
    await docRef.set(tmpObj);
    console.log('ToDo added.');
}

app.post('/api/addToDo', (req, res) => {
    const { taskName, desc, status, priority, due_date ,assigned_by ,assigned_to ,category } = req.body;
    const tmpData = { taskName, desc, status, priority, due_date ,assigned_by ,assigned_to ,category };
    addToDo(tmpData);
    res.status(200).json({ message: '[INFO] Add new ToDo successfully.' });
})

async function deletePet(petId){
    const docRef = db.collection("Pets").doc(petId);
    await docRef.delete();
    console.log('Pet deleted.');
}

app.delete('/api/deletePet/:petId', (req, res) => {
    const { petId } = req.params;
    deletePet(petId);
    res.status(200).json({ message: '[INFO] Deleted pet successfully.' });
});

async function fetchToDos(){
    const result = [];
    const todoRef = db.collection('to_do');
    const docRef = await todoRef.get();
    docRef.forEach(doc => {
       result.push({
        id: doc.id,
        ...doc.data()
       });
    });
    
    return JSON.stringify(result);
}

app.get('/api/getToDoData', (req, res) => {
    res.set('Content-type', 'application/json');    
    fetchToDos().then((jsonData) => {
        res.send(jsonData);
    }).catch((error) => {
        res.send(error);
    });
});

async function fetchToDoById(toDoId){
    const result = [];
    const toDoRef = db.collection('to_do')
                     .where('toDoId', '==', toDoId);
    const docRef = await toDoRef.get();
    docRef.forEach(doc => {
       result.push({
        id: doc.id,
        ...doc.data()
       });
    });
    
    return result;
}

app.get('/api/getToDoById/:toDoId', (req, res) => {
    const { toDoId } = req.params;
    res.set('Content-type', 'application/json');
    fetchToDoById(toDoId).then((jsonData) => {
        res.send(jsonData[0]);
    }).catch((error) => {
        res.send(error);
    });
});

async function updatePet(toDoId, toDoData){
    const docRef = db.collection('to_do').doc(toDoId);
    await docRef.update(toDoData);
    console.log('toFo updated!');
}

app.post('/api/editToDo/:toDoId', (req, res) => {
    const { toDoId ,taskName, desc, status, priority, due_date ,assigned_by ,assigned_to ,category } = req.body;
    updatePet(toDoId, { taskName, desc, status, priority, due_date ,assigned_by ,assigned_to ,category });
    res.status(200).json({ message: '[INFO] Task updated successfully.'});
});