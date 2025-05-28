import express from 'express';
import { exec } from 'child_process';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());

/**
 * GET /vms
 * Returns static VM configuration info
 */
app.get('/vms', (req, res) => {
  const configCmd = `Get-VM | Select-Object Name, State, ProcessorCount, MemoryStartup, Generation, AutomaticStartAction, AutomaticStopAction | ConvertTo-Json`;

  exec(`powershell -Command "${configCmd}"`, (err, stdout, stderr) => {
    if (err) {
      console.error('VM Config Error:', stderr);
      return res.status(500).send('Failed to get VM config.');
    }

    try {
      const data = JSON.parse(stdout);
      res.json(Array.isArray(data) ? data : [data]);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      res.status(500).send('Error parsing PowerShell output.');
    }
  });
});

/**
 * GET /vms/health
 * Returns live runtime info (CPU usage, assigned memory)
 */
app.get('/vms/health', (req, res) => {
  const runtimeCmd = `Get-VM | Select-Object Name, CPUUsage, MemoryAssigned | ConvertTo-Json`;

  exec(`powershell -Command "${runtimeCmd}"`, (err, stdout, stderr) => {
    if (err) {
      console.error('VM Health Error:', stderr);
      return res.status(500).send('Failed to get VM health info.');
    }

    try {
      const data = JSON.parse(stdout);
      res.json(Array.isArray(data) ? data : [data]);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      res.status(500).send('Error parsing PowerShell output.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`API listening at http://localhost:${PORT}`);
});
