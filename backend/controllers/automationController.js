const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// This function starts the automation as a detached process
// so the frontend gets an immediate response.
exports.generateAutomatedReport = (req, res) => {
    const { projectId } = req.body;
    
    if (!projectId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Project ID is required' 
        });
    }
    
    console.log(`[Server] Received request to launch automation for Project #${projectId}`);
    
    const scriptPath = path.join(__dirname, '..', 'automation', 'run-playwright.js');
    
    const child = spawn('node', [scriptPath, projectId], {
        detached: true,
        stdio: 'ignore'
    });
    child.unref();

    res.status(202).json({ 
        success: true, 
        message: 'Automation process has been launched successfully.' 
    });
};

// This is the missing function that allows the frontend to poll for the result.
exports.getReportStatus = async (req, res) => {
    const { projectId } = req.params;
    const reportFilePath = path.join(__dirname, '..', 'reports', `${projectId}.json`);

    try {
        // Check if the report file exists
        await fs.access(reportFilePath);

        // If it exists, read it
        const reportData = await fs.readFile(reportFilePath, 'utf-8');

        // Delete the file after reading to clean up
        await fs.unlink(reportFilePath);

        // Send the report data to the frontend
        res.status(200).json(JSON.parse(reportData));

    } catch (error) {
        // If the file doesn't exist, it means the job is still pending
        res.status(202).json({ status: 'pending' });
    }
};
