const fs = require('fs');
const path = require('path');

const dataFiles = [
    'data/config.json',
    'data/tasks.json',
    'data/users.json',
    'data/tribute-history.json'
];

function validateJSON(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        console.log(`✅ ${filePath} - Valid JSON`);
        return true;
    } catch (error) {
        console.error(`❌ ${filePath} - Invalid JSON:`, error.message);
        return false;
    }
}

function validateDataStructure(filePath, data) {
    const fileName = path.basename(filePath);
    
    switch (fileName) {
        case 'config.json':
            return validateConfig(data);
        case 'tasks.json':
            return validateTasks(data);
        case 'users.json':
            return validateUsers(data);
        case 'tribute-history.json':
            return validateTribute(data);
        default:
            return true;
    }
}

function validateConfig(data) {
    const required = ['version', 'lastUpdate', 'extension', 'api', 'auth'];
    for (const field of required) {
        if (!data[field]) {
            console.error(`❌ config.json - Missing required field: ${field}`);
            return false;
        }
    }
    console.log('✅ config.json - Valid structure');
    return true;
}

function validateTasks(data) {
    if (!data.tasks || !Array.isArray(data.tasks)) {
        console.error('❌ tasks.json - Missing or invalid tasks array');
        return false;
    }
    
    if (!data.metadata) {
        console.error('❌ tasks.json - Missing metadata');
        return false;
    }
    
    for (const task of data.tasks) {
        const required = ['id', 'title', 'description', 'tribute', 'xp', 'difficulty', 'status'];
        for (const field of required) {
            if (task[field] === undefined) {
                console.error(`❌ tasks.json - Task ${task.id} missing field: ${field}`);
                return false;
            }
        }
    }
    
    console.log('✅ tasks.json - Valid structure');
    return true;
}

function validateUsers(data) {
    if (!data.users || !Array.isArray(data.users)) {
        console.error('❌ users.json - Missing or invalid users array');
        return false;
    }
    
    if (!data.metadata) {
        console.error('❌ users.json - Missing metadata');
        return false;
    }
    
    for (const user of data.users) {
        const required = ['id', 'name', 'email', 'level', 'xp', 'rank'];
        for (const field of required) {
            if (user[field] === undefined) {
                console.error(`❌ users.json - User ${user.id} missing field: ${field}`);
                return false;
            }
        }
    }
    
    console.log('✅ users.json - Valid structure');
    return true;
}

function validateTribute(data) {
    if (!data.transactions || !Array.isArray(data.transactions)) {
        console.error('❌ tribute-history.json - Missing or invalid transactions array');
        return false;
    }
    
    if (!data.summary || !data.metadata) {
        console.error('❌ tribute-history.json - Missing summary or metadata');
        return false;
    }
    
    for (const transaction of data.transactions) {
        const required = ['id', 'userId', 'userName', 'amount', 'date', 'status'];
        for (const field of required) {
            if (transaction[field] === undefined) {
                console.error(`❌ tribute-history.json - Transaction ${transaction.id} missing field: ${field}`);
                return false;
            }
        }
    }
    
    console.log('✅ tribute-history.json - Valid structure');
    return true;
}

// Main validation function
function validateAllFiles() {
    console.log('🔍 Validating JSON files...\n');
    
    let allValid = true;
    
    for (const filePath of dataFiles) {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ ${filePath} - File not found`);
            allValid = false;
            continue;
        }
        
        if (!validateJSON(filePath)) {
            allValid = false;
            continue;
        }
        
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (!validateDataStructure(filePath, data)) {
                allValid = false;
            }
        } catch (error) {
            console.error(`❌ ${filePath} - Structure validation failed:`, error.message);
            allValid = false;
        }
    }
    
    console.log('\n' + '='.repeat(50));
    if (allValid) {
        console.log('🎉 All files are valid!');
        process.exit(0);
    } else {
        console.log('💥 Some files have issues. Please fix them before proceeding.');
        process.exit(1);
    }
}

// Run validation
validateAllFiles();
