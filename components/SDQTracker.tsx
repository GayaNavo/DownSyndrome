'use client';

import React, { useState } from 'react';

const questions = [
  { id: 1, text: "My child is generally considerate of other people's feelings", category: "prosocial" },
  { id: 2, text: "My child is often restless and finds it hard to sit still for long", category: "hyperactivity" },
  { id: 3, text: "My child frequently mentions headaches, stomach aches or feeling sick", category: "emotional" },
  { id: 4, text: "My child likes to share with others (toys, snacks, etc.)", category: "prosocial" },
  { id: 5, text: "My child tends to lose their temper easily", category: "conduct" },
  { id: 6, text: "My child often prefers to play alone or keep to themselves", category: "peer" },
  { id: 7, text: "My child usually follows instructions and does what is requested", category: "conduct", reverse: true },
  { id: 8, text: "My child seems to have many worries or often appears anxious", category: "emotional" },
  { id: 9, text: "My child is quick to help if someone else is hurt or upset", category: "prosocial" },
  { id: 10, text: "My child is constantly fidgeting or squirming", category: "hyperactivity" },
  { id: 11, text: "My child has at least one good friend they connect with", category: "peer", reverse: true },
  { id: 12, text: "My child often gets into arguments or fights with other children", category: "conduct" },
  { id: 13, text: "My child often seems unhappy, downhearted, or tearful", category: "emotional" },
  { id: 14, text: "Other children generally like and enjoy being with my child", category: "peer", reverse: true },
  { id: 15, text: "My child is easily distracted and finds it hard to stay focused", category: "hyperactivity" },
  { id: 16, text: "My child is nervous in new situations or easily loses confidence", category: "emotional" },
  { id: 17, text: "My child is kind and gentle with younger children", category: "prosocial" },
  { id: 18, text: "My child sometimes struggles with being honest or tries to cheat", category: "conduct" },
  { id: 19, text: "My child is sometimes picked on or treated unkindly by others", category: "peer" },
  { id: 20, text: "My child frequently offers to help out at home or school", category: "prosocial" },
  { id: 21, text: "My child usually thinks things through before acting", category: "hyperactivity", reverse: true },
  { id: 22, text: "My child sometimes takes things that don't belong to them", category: "conduct" },
  { id: 23, text: "My child gets along better with adults than with other children", category: "peer" },
  { id: 24, text: "My child has many fears and is easily frightened", category: "emotional" },
  { id: 25, text: "My child finishes what they start and has a good attention span", category: "hyperactivity", reverse: true },
];

// Group questions by category for better organization
const questionGroups = [
  {
    category: "Emotional Symptoms",
    icon: "😢",
    questions: questions.filter(q => q.category === "emotional")
  },
  {
    category: "Conduct Problems",
    icon: "😠",
    questions: questions.filter(q => q.category === "conduct")
  },
  {
    category: "Hyperactivity/Inattention",
    icon: "⚡",
    questions: questions.filter(q => q.category === "hyperactivity")
  },
  {
    category: "Peer Relationship Issues",
    icon: "👥",
    questions: questions.filter(q => q.category === "peer")
  },
  {
    category: "Prosocial Behavior",
    icon: "😊",
    questions: questions.filter(q => q.category === "prosocial")
  }
];

interface Answers {
  [key: number]: number;
}

interface Scores {
  emotional: number;
  conduct: number;
  hyperactivity: number;
  peer: number;
  prosocial: number;
  [key: string]: number;
}

interface Results {
  scores: Scores;
  totalDifficulty: number;
  percentage: number;
}

export default function SDQTracker() {
  const [answers, setAnswers] = useState<Answers>({});
  const [results, setResults] = useState<Results | null>(null);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

  const handleOptionChange = (qId: number, value: number) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const toggleGroup = (groupIndex: number) => {
    if (expandedGroups.includes(groupIndex)) {
      setExpandedGroups(expandedGroups.filter(index => index !== groupIndex));
    } else {
      setExpandedGroups([...expandedGroups, groupIndex]);
    }
  };

  const getTotalAnswered = () => {
    return Object.keys(answers).length;
  };

  const isGroupCompleted = (groupIndex: number) => {
    const group = questionGroups[groupIndex];
    return group.questions.every(q => answers[q.id] !== undefined);
  };

  const calculateScore = () => {
    let scores: Scores = { emotional: 0, conduct: 0, hyperactivity: 0, peer: 0, prosocial: 0 };

    questions.forEach((q) => {
      let val = answers[q.id] || 0;
      if (q.reverse) {
        // Reverse scoring logic: 0 becomes 2, 2 becomes 0, 1 stays 1
        val = val === 2 ? 0 : val === 0 ? 2 : 1;
      }
      scores[q.category] += val;
    });

    const totalDifficulty = scores.emotional + scores.conduct + scores.hyperactivity + scores.peer;
    const percentage = (totalDifficulty / 40) * 100;

    setResults({ scores, totalDifficulty, percentage });
  };

  return (
    <div className="bg-white">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .question-card {
          transition: all 0.3s ease;
        }
        .question-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <div className="py-4">
        <header className="mb-6 text-center">
          <h1 className="text-xl font-bold text-blue-800">Child Wellness Check-in</h1>
          <p className="text-sm text-gray-600 mt-1">How your child has been doing over the last 6 months.</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Progress: {getTotalAnswered()} / {questions.length} questions answered</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(getTotalAnswered() / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </header>

        {/* Collapsible Groups View */}
        <div className="space-y-4 mb-8">
          {questionGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleGroup(groupIndex)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                  expandedGroups.includes(groupIndex) 
                    ? 'bg-blue-50 border-b border-gray-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{group.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.category}</h3>
                    <p className="text-sm text-gray-500">{group.questions.length} questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isGroupCompleted(groupIndex) && (
                    <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                  )}
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedGroups.includes(groupIndex) ? 'rotate-180' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {expandedGroups.includes(groupIndex) && (
                <div className="p-4 space-y-3">
                  {group.questions.map((q) => (
                    <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 question-card">
                      <p className="text-gray-800 mb-3 font-semibold text-sm">{q.text}</p>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 2].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleOptionChange(q.id, val)}
                            className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg border text-xs font-bold transition-all duration-200 ${
                              answers[q.id] === val 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            {val === 0 ? "Not True" : val === 1 ? "Somewhat True" : "Certainly True"}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-6">
          <button 
            onClick={calculateScore}
            disabled={getTotalAnswered() < questions.length}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {getTotalAnswered() < questions.length 
              ? `Answer all ${questions.length} questions to see results` 
              : 'Show My Results'}
          </button>
          
          {getTotalAnswered() > 0 && getTotalAnswered() < questions.length && (
            <div className="mt-2 text-center text-xs text-gray-600">
              {questions.length - getTotalAnswered()} questions remaining
            </div>
          )}
        </div>

        {results && (
          <div className="mt-6 p-6 bg-white border-2 border-blue-100 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Your Child's Wellness Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 text-center">
                <div className="text-blue-600 font-semibold uppercase text-xs mb-1">Overall Difficulty Level</div>
                <div className="text-3xl font-black text-blue-800 mb-1">{results.percentage.toFixed(1)}%</div>
                <div className="text-blue-700 font-medium text-sm">Score: {results.totalDifficulty} / 40</div>
                <div className="mt-3 text-sm text-blue-600">
                  {results.percentage < 15 ? 'Within Normal Range' : 
                   results.percentage < 20 ? 'Borderline Range' : 'Clinical Range'}
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 text-center">
                <div className="text-green-600 font-semibold uppercase text-xs mb-1">Prosocial Strengths</div>
                <div className="text-3xl font-black text-green-800 mb-1">{(results.scores.prosocial / 10 * 100).toFixed(0)}%</div>
                <div className="text-green-700 font-medium text-sm">Score: {results.scores.prosocial} / 10</div>
                <div className="mt-3 text-sm text-green-600">Social & Emotional Skills</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-3 text-center text-sm">Detailed Category Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { cat: 'emotional', label: 'Emotional Symptoms', color: 'text-red-600', bg: 'bg-red-50', icon: '😢' },
                  { cat: 'conduct', label: 'Conduct Problems', color: 'text-orange-600', bg: 'bg-orange-50', icon: '😠' },
                  { cat: 'hyperactivity', label: 'Hyperactivity/Inattention', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⚡' },
                  { cat: 'peer', label: 'Peer Relationship Issues', color: 'text-purple-600', bg: 'bg-purple-50', icon: '👥' }
                ].map(({ cat, label, color, bg, icon }) => (
                  <div key={cat} className={`${bg} rounded-md p-3 border border-gray-200`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-base">{icon}</span>
                        <span className={`font-semibold text-xs ${color}`}>{label}</span>
                      </div>
                      <span className="font-mono font-bold text-gray-800 text-xs">{results.scores[cat]} / 10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${color.replace('text-', 'bg-')}`}
                        style={{ width: `${(results.scores[cat] / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {results.scores[cat] <= 2 ? 'Low concern' : 
                       results.scores[cat] <= 5 ? 'Moderate concern' : 'High concern'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-1 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Understanding Your Results
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• <strong>0-15%:</strong> Within normal developmental range</li>
                <li>• <strong>16-20%:</strong> Borderline range - monitor and consider support</li>
                <li>• <strong>21%+:</strong> Clinical range - professional consultation recommended</li>
                <li>• <strong>Prosocial scores:</strong> Higher scores indicate stronger social-emotional skills</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}