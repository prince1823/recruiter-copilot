const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json({ limit: '10mb' }));
app.use(cors());

const DB_PATH = './db.json';

// --- DB Helper Functions ---
const readDb = () => JSON.parse(fs.readFileSync(DB_PATH));
const writeDb = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
const syncListCounts = (db) => {
    db.jobLists.forEach(list => {
        const candidatesInList = db.applicants.filter(a => a.lists.includes(list.id));
        list.candidateCount = candidatesInList.length;
        list.completedConversations = candidatesInList.filter(a => a.hasCompletedConversation).length;
    });
    return db;
};


// --- AUTOMATIC MESSAGE QUEUE PROCESSOR ---

/**
 * This function reads the database, processes pending messages, and updates the database.
 * It's designed to be called by setInterval.
 */
const processMessageQueue = () => {
    try {
        const db = readDb();
        const { messageTemplates, applicants, messageQueue } = db;
        
        const tasksToProcess = messageQueue.filter(task => task.status === 'pending');

        // If there are no pending tasks, do nothing.
        if (tasksToProcess.length === 0) {
            return;
        }

        let processedCount = 0;
        console.log(`\n--- [${new Date().toLocaleTimeString()}] Found ${tasksToProcess.length} pending messages. Starting processing... ---`);

        tasksToProcess.forEach(task => {
            const applicant = applicants.find(a => a.id === task.candidateId);
            const template = messageTemplates[task.action];

            if (applicant && template) {
                let message = template.replace('{name}', applicant.name);
                
                console.log(`✅ TO: ${applicant.phone} (${applicant.name}) | ACTION: ${task.action}`);
                console.log(`   MESSAGE: "${message}"`);

                // Find the original task in the main queue to update its status
                const originalTask = messageQueue.find(t => t.queueId === task.queueId);
                if (originalTask) {
                    originalTask.status = 'processed';
                    originalTask.processedAt = new Date().toISOString();
                    processedCount++;
                }
            } else {
                console.log(`❌ SKIPPING task ${task.queueId}: Could not find applicant or template for action '${task.action}'.`);
                const originalTask = messageQueue.find(t => t.queueId === task.queueId);
                if (originalTask) originalTask.status = 'failed';
            }
        });
        
        if (processedCount > 0) {
            console.log(`--- Processing Complete. ${processedCount} messages processed. ---\n`);
            writeDb(db);
        } else {
            console.log(`--- Processing Complete. No new messages were processed this cycle. ---\n`);
        }

    } catch (error) {
        console.error("[ERROR] Could not process message queue:", error);
    }
};


// --- API Endpoints ---
app.get('/api/data', (req, res) => res.json(readDb()));

// ... (All your other LISTS CRUD and APPLICANT ACTIONS endpoints remain exactly the same)
app.get('/api/lists', (req, res) => res.json(readDb().jobLists));
app.post('/api/lists', (req, res) => { const { listName } = req.body; if (!listName) return res.status(400).json({ message: 'List name is required' }); const db = readDb(); const newList = { id: uuidv4(), listName, creationDate: new Date().toISOString().split('T')[0], candidateCount: 0, completedConversations: 0, }; db.jobLists.push(newList); writeDb(db); res.status(201).json(newList); });
app.post('/api/lists/upload', (req, res) => { const { listName, candidates } = req.body; if (!listName || !candidates) { return res.status(400).json({ message: 'List name and candidates array are required.' }); } let db = readDb(); let newApplicantsCount = 0; let updatedApplicantsCount = 0; const newList = { id: uuidv4(), listName, creationDate: new Date().toISOString().split('T')[0], candidateCount: 0, completedConversations: 0, }; db.jobLists.push(newList); candidates.forEach(candidateData => { if (!candidateData.phone) return; const existingApplicant = db.applicants.find(a => a.phone === candidateData.phone); if (existingApplicant) { Object.assign(existingApplicant, { ...candidateData, id: existingApplicant.id, lists: [...new Set([...existingApplicant.lists, newList.id])] }); updatedApplicantsCount++; } else { const newApplicant = { id: uuidv4(), name: candidateData.name || 'N/A', phone: candidateData.phone, lastMessage: '', lastMessageTime: new Date().toLocaleDateString(), location: candidateData.location || '', pincode: candidateData.pincode || '', experience: parseInt(candidateData.experience, 10) || 0, hasTwoWheeler: ['true', 'yes', '1'].includes(String(candidateData.hasTwoWheeler).toLowerCase()), status: 'active', tags: [], lists: [newList.id], hasCompletedConversation: false, }; db.applicants.push(newApplicant); newApplicantsCount++; } }); db = syncListCounts(db); writeDb(db); res.status(201).json({ message: `List '${listName}' created. Added ${newApplicantsCount} new and updated ${updatedApplicantsCount} existing applicants.`, newList: newList }); });
app.put('/api/lists/:id', (req, res) => { const { id } = req.params; const { listName } = req.body; if (!listName) return res.status(400).json({ message: 'List name is required' }); const db = readDb(); const list = db.jobLists.find(l => l.id === id); if (!list) return res.status(404).json({ message: 'List not found' }); list.listName = listName; writeDb(db); res.json(list); });
app.delete('/api/lists/:id', (req, res) => { const { id } = req.params; let db = readDb(); db.applicants.forEach(applicant => { applicant.lists = applicant.lists.filter(listId => listId !== id); }); db.jobLists = db.jobLists.filter(list => list.id !== id); db = syncListCounts(db); writeDb(db); res.status(204).send(); });
app.get('/api/applicants', (req, res) => res.json(readDb().applicants));
app.post('/api/lists/:listId/candidates', (req, res) => { const { listId } = req.params; const { candidateIds, action } = req.body; if (!candidateIds || !action) return res.status(400).json({ message: 'candidateIds and action are required' }); let db = readDb(); if (!db.jobLists.find(l => l.id === listId)) return res.status(404).json({ message: 'List not found' }); db.applicants.forEach(applicant => { if (candidateIds.includes(applicant.id)) { if (action === 'add' && !applicant.lists.includes(listId)) { applicant.lists.push(listId); } else if (action === 'remove') { applicant.lists = applicant.lists.filter(id => id !== listId); } } }); db = syncListCounts(db); writeDb(db); res.json({ message: `Candidates ${action}ed successfully.` }); });
app.delete('/api/applicants/:id/lists', (req, res) => { const { id } = req.params; let db = readDb(); const applicant = db.applicants.find(a => a.id === id); if (!applicant) return res.status(404).json({ message: "Applicant not found" }); applicant.lists = []; db = syncListCounts(db); writeDb(db); res.json(applicant); });
app.put('/api/applicants/status', (req, res) => { const { candidateIds, status } = req.body; if (!candidateIds || !status) return res.status(400).json({ message: 'candidateIds and status are required' }); const db = readDb(); db.applicants.forEach(applicant => { if (candidateIds.includes(applicant.id)) applicant.status = status; }); writeDb(db); res.json({ message: 'Status updated' }); });


// MESSAGE QUEUE Endpoints
app.post('/api/queue/bulk-send', (req, res) => {
    const { candidateIds, action } = req.body;
    if (!candidateIds || !action) return res.status(400).json({ message: 'candidateIds and action are required' });
    const db = readDb();
    candidateIds.forEach(id => {
        const queueItem = { queueId: uuidv4(), candidateId: id, action, status: 'pending', addedAt: new Date().toISOString() };
        db.messageQueue.push(queueItem);
    });
    writeDb(db);
    res.status(202).json({ message: `${candidateIds.length} candidates queued for '${action}' action.` });
});

app.post('/api/queue/cancel-by-list', (req, res) => {
    const { listId } = req.body;
    if (!listId) return res.status(400).json({ message: 'listId is required.' });
    let db = readDb();
    const candidateIdsInList = db.applicants.filter(a => a.lists.includes(listId)).map(a => a.id);
    if (candidateIdsInList.length === 0) {
        return res.status(200).json({ message: "No candidates in this list. Nothing to cancel." });
    }
    const initialQueueSize = db.messageQueue.length;
    db.messageQueue = db.messageQueue.filter(task => !(task.status === 'pending' && candidateIdsInList.includes(task.candidateId)));
    const finalQueueSize = db.messageQueue.length;
    const canceledCount = initialQueueSize - finalQueueSize;
    writeDb(db);
    console.log(`[Queue] Canceled ${canceledCount} pending sends for list ID: ${listId}`);
    res.status(200).json({ message: `Canceled ${canceledCount} pending message(s) for candidates in this list.` });
});


// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
    console.log('Health check endpoint available at /health');
    
    // ** START THE AUTOMATIC PROCESSOR **
    setInterval(processMessageQueue, 15000); // 15000 milliseconds = 15 seconds
    console.log('Message queue processor started. Will check for pending messages every 15 seconds.');
});