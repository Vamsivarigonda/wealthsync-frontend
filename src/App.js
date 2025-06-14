import React, { useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [email, setEmail] = useState('');
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestWithRetry = async (requestFn, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await requestWithRetry(() =>
        axios.post('https://wealthsync-backend.onrender.com/api/budget', {
          email,
          income,
          expenses,
          savings_goal: savingsGoal
        })
      );
      setResult(response.data);
      fetchHistory();
    } catch (error) {
      alert('Error calculating budget. The backend might be waking up—please try again in a few seconds.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await requestWithRetry(() =>
        axios.post('https://wealthsync-backend.onrender.com/api/budget/history', {
          email
        })
      );
      setHistory(response.data);
    } catch (error) {
      alert('Error fetching budget history. The backend might be waking up—please try again in a few seconds.');
    }
  };

  const chartData = result ? {
    labels: ['Expenses', 'Savings', 'Recommended Savings'],
    datasets: [
      {
        label: 'Budget Breakdown',
        data: [
          expenses || 0,
          result?.savings || 0,
          result?.recommended_savings || 0
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className="App">
      <h2>WealthSync Budget Planner</h2>
      <div className="form-container">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email"
        />
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="Monthly Income (₹)"
        />
        <input
          type="number"
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
          placeholder="Monthly Expenses (₹)"
        />
        <input
          type="number"
          value={savingsGoal}
          onChange={(e) => setSavingsGoal(e.target.value)}
          placeholder="Savings Goal (₹)"
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Plan My Budget'}
        </button>
      </div>
      {result && (
        <div className="result-container">
          <p>Your Savings: ₹{result.savings}</p>
          <p>Recommended Savings: ₹{result.recommended_savings}</p>
          <p>Inflation Rate in India: {result.inflation}%</p>
          <p>{result.message}</p>
          <div className="recommendations">
            <h3>Personalized Tips</h3>
            <ul>
              {result.recommendations.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          {chartData && (
            <div className="chart-container">
              <h3>Budget Breakdown</h3>
              <Pie data={chartData} />
            </div>
          )}
        </div>
      )}
      <div className="history-container">
        <h3>Your Budget History</h3>
        {email ? (
          <button onClick={fetchHistory} disabled={loading}>
            {loading ? 'Loading...' : 'View Budget History'}
          </button>
        ) : (
          <p>Please enter your email to view history.</p>
        )}
        {history.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Income (₹)</th>
                <th>Expenses (₹)</th>
                <th>Savings (₹)</th>
                <th>Recommended Savings (₹)</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td>{entry.income}</td>
                  <td>{entry.expenses}</td>
                  <td>{entry.savings}</td>
                  <td>{entry.recommended_savings}</td>
                  <td>{entry.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          email && <p>No budget history found for this email.</p>
        )}
      </div>
    </div>
  );
}
const requestWithRetry = async (requestFn, retries = 3, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
export default App;
