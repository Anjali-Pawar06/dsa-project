import React, { useState } from "react";
import { AlgoPage } from "../components/AlgoPage/AlgoPage";

type Job = { id: string; deadline: number; profit: number };

export const JobSequencing: React.FC = () => {
  const [jobsText, setJobsText] = useState<string>("\nA,2,100\nB,1,19\nC,2,27\nD,1,25\nE,3,15");
  const [sequence, setSequence] = useState<Job[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);

  const parseJobs = (): Job[] => {
    return jobsText
      .trim()
      .split(/\n/)
      .map((line) => line.split(",").map((x) => x.trim()))
      .filter((arr) => arr.length === 3)
      .map(([id, d, p]) => ({ id, deadline: Number(d), profit: Number(p) }));
  };

  const runGreedy = () => {
    const jobs = parseJobs();
    // Sort by descending profit
    const sorted = [...jobs].sort((a, b) => b.profit - a.profit);
    const maxDeadline = Math.max(...sorted.map((j) => j.deadline));
    const slots: (Job | null)[] = Array(maxDeadline).fill(null);
    let profit = 0;
    const scheduled: Job[] = [];
    for (const job of sorted) {
      // find a free slot before its deadline (1‑based index)
      for (let s = Math.min(job.deadline, maxDeadline) - 1; s >= 0; s--) {
        if (!slots[s]) {
          slots[s] = job;
          profit += job.profit;
          scheduled.push(job);
          break;
        }
      }
    }
    setSequence(scheduled);
    setTotalProfit(profit);
  };

  return (
    <AlgoPage title="Job Sequencing with Deadlines (Greedy)" description="Schedule jobs to maximize profit given deadlines. Uses the classic greedy algorithm (sort by profit, then assign latest possible free slot).">
      <div>
        <label>Jobs (ID,deadline,profit per line):</label>
        <br />
        <textarea rows={6} cols={30} value={jobsText} onChange={(e) => setJobsText(e.target.value)} />
      </div>
      <button onClick={runGreedy} style={{ marginTop: 8 }}>
        Run Greedy Scheduler
      </button>
      {sequence.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Scheduled Order (by slot):</strong>
          <ul>
            {sequence.map((j, idx) => (
              <li key={idx}>
                Job {j.id} – deadline {j.deadline}, profit {j.profit}
              </li>
            ))}
          </ul>
          <p><strong>Total Profit:</strong> {totalProfit}</p>
        </div>
      )}
    </AlgoPage>
  );
};
