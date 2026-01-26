'use client';

import React, { useState, useEffect } from 'react';
import { getAnalysisResultsByChild } from '@/services/analysisResultService';
import { AnalysisResult } from '@/models/AnalysisResult';
import { useAuth } from '@/contexts/AuthContext';
import { getChildrenByParent } from '@/lib/firebase/firestore';

interface AnalysisResultsHistoryProps {
  childId?: string; // Optional prop to specify a child, if not provided, uses current user's child
}

const AnalysisResultsHistory: React.FC<AnalysisResultsHistoryProps> = ({ childId }) => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(childId);
  const { currentUser: user } = useAuth();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // If no childId is provided, get the current user's child
        let finalChildId = childId;
        if (!finalChildId && user) {
          const children = await getChildrenByParent(user.uid);
          if (children.length > 0) {
            finalChildId = children[0].id;
            setSelectedChildId(finalChildId);
          }
        }
        
        if (finalChildId) {
          const fetchedResults = await getAnalysisResultsByChild(finalChildId);
          setResults(fetchedResults);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error fetching analysis results:', err);
        setError('Failed to load analysis results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [childId, user]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getInterpretationColor = (interpretation: string) => {
    if (interpretation.includes('Normal')) return 'text-green-600 bg-green-50';
    if (interpretation.includes('Borderline')) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Analysis History</h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analysis history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Analysis History</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Analysis History</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No analysis results found.</p>
          <p className="text-sm mt-2">Complete an analysis to see results here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Analysis History</h3>
      
      <div className="space-y-4">
        {results.map((result) => (
          <div 
            key={result.id} 
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-800">
                  {result.analysisType.charAt(0).toUpperCase() + result.analysisType.slice(1)} Analysis
                </h4>
                <p className="text-sm text-gray-500">{formatDate(result.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getInterpretationColor(result.interpretation)}`}>
                {result.interpretation}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
              <div className="bg-blue-50 rounded p-2">
                <p className="text-xs text-blue-600 font-medium">Emotional</p>
                <p className="text-lg font-bold text-blue-800">{result.sdqScores.emotional}/10</p>
              </div>
              <div className="bg-orange-50 rounded p-2">
                <p className="text-xs text-orange-600 font-medium">Conduct</p>
                <p className="text-lg font-bold text-orange-800">{result.sdqScores.conduct}/10</p>
              </div>
              <div className="bg-yellow-50 rounded p-2">
                <p className="text-xs text-yellow-600 font-medium">Hyperactivity</p>
                <p className="text-lg font-bold text-yellow-800">{result.sdqScores.hyperactivity}/10</p>
              </div>
              <div className="bg-purple-50 rounded p-2">
                <p className="text-xs text-purple-600 font-medium">Peer</p>
                <p className="text-lg font-bold text-purple-800">{result.sdqScores.peer}/10</p>
              </div>
              <div className="bg-green-50 rounded p-2">
                <p className="text-xs text-green-600 font-medium">Prosocial</p>
                <p className="text-lg font-bold text-green-800">{result.sdqScores.prosocial}/10</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Difficulty Score</p>
                  <p className="text-xl font-bold text-gray-800">{result.totalDifficulty}/40</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className="text-xl font-bold text-gray-800">{result.percentage.toFixed(1)}%</p>
                </div>
              </div>
              
              {result.notes && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">Notes:</p>
                  <p className="text-gray-800">{result.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisResultsHistory;