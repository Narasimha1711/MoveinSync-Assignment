import { useEffect, useState } from 'react';

export default function RulesViewer() {
  const [rules, setRules] = useState({});

  useEffect(() => {
    fetch('http://localhost:5001/rules.config.json')
      .then(r => r.json())
      .then(setRules);
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-purple-400">Active Rule Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(rules).map(([type, rule]) => (
          <div key={type} className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold text-yellow-300 capitalize">{type.replace('_', ' ')}</h3>
            <pre className="text-sm text-gray-300 mt-2 font-mono">
              {JSON.stringify(rule, null, 2)}
            </pre>
          </div>
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-4">
        Rules are loaded from <code className="bg-gray-700 px-2 py-1 rounded">rules.config.json</code> — decoupled from code
      </p>
    </div>
  );
}