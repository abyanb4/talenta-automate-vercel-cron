import { execFile } from 'child_process';
import path from 'path';
import util from 'util';

// Promisify execFile so we can use async/await
const execFileAsync = util.promisify(execFile);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Locate the 'talenta-attendance' binary inside a 'bin' folder
    const binaryPath = path.join(process.cwd(), 'bin', 'talenta-attendance');
    
    // Execute the binary and pass the arguments as an array
    const { stdout, stderr } = await execFileAsync(binaryPath, ['-clockIn=true']);
    
    if (stderr) {
      console.warn('Binary stderr:', stderr);
    }

    return res.status(200).json({ 
      success: true, 
      output: stdout 
    });
  } catch (error) {
    console.error('Execution failed:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}