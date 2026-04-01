const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8080/api';

async function test() {
    console.log('--- FETCHING ALL USERS ---');
    const usersRes = await fetch(`${API_BASE}/users`);
    const users = await usersRes.json();
    console.log(`Total users: ${users.length}`);

    const aman = users.find(u => u.username === 'aman' || u.name.toLowerCase().includes('aman'));
    if (!aman) {
        console.log('User "aman" not found. Using demostudent instead.');
    }
    const student = aman || users.find(u => u.role === 'STUDENT');
    
    if (!student) {
        console.error('No student found to test!');
        return;
    }

    console.log(`Testing with student: ${student.username} (ID: ${student.id})`);

    // 1. Test Skip Assessment
    console.log('\n--- TESTING SKIP ASSESSMENT ---');
    const skipRes = await fetch(`${API_BASE}/users/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentSkipped: true })
    });
    const skipData = await skipRes.json();
    console.log('Skip Update Result:', skipData.success ? 'SUCCESS' : 'FAILED');
    console.log('assessmentSkipped value:', skipData.data.assessmentSkipped);

    // 2. Test Admin Update
    console.log('\n--- TESTING ADMIN UPDATE ---');
    const updateRes = await fetch(`${API_BASE}/users/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college: 'Test University Updated' })
    });
    const updateData = await updateRes.json();
    console.log('Admin Update Result:', updateData.success ? 'SUCCESS' : 'FAILED');
    console.log('College value:', updateData.data.college);

    // 3. Test Assign Counsellor
    console.log('\n--- TESTING ASSIGN COUNSELLOR ---');
    const mentor = users.find(u => u.role === 'COUNSELLOR');
    if (!mentor) {
        console.log('No mentor found to assign.');
    } else {
        console.log(`Assigning Mentor: ${mentor.username} (ID: ${mentor.id})`);
        const assignRes = await fetch(`${API_BASE}/users/${student.id}/assign-counsellor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ counsellorId: mentor.id })
        });
        const assignData = await assignRes.json();
        console.log('Assign Result:', assignData.success ? 'SUCCESS' : 'FAILED');
        console.log('Assigned Counsellor ID:', assignData.data.assignedCounsellor);
    }
}

test().catch(console.error);
