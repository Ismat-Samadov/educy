'use client'

import { useState } from 'react'

interface AIStudentHelpProps {
  assignmentId: string
}

export default function AIStudentHelp({ assignmentId }: AIStudentHelpProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')

  const handleAskAI = async () => {
    if (question.trim().length < 10) {
      setError('Please ask a more detailed question (at least 10 characters)')
      return
    }

    setLoading(true)
    setError('')
    setResponse('')

    try {
      const res = await fetch('/api/ai/student-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          question: question.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get AI help')
      }

      setResponse(data.response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
      >
        <span className="mr-2">✨</span>
        Ask AI for Help
      </button>
    )
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center">
          <span className="mr-2">✨</span>
          AI Assignment Helper
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
        >
          ✕
        </button>
      </div>

      <p className="text-sm text-purple-700 dark:text-purple-300">
        Ask questions about the assignment and get hints and guidance. The AI won't give you
        direct answers, but will help you think through the problem.
      </p>

      <div>
        <label className="block text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
          What do you need help with?
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
          placeholder="E.g., I don't understand how to approach this problem..."
          disabled={loading}
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {response && (
        <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
            AI Response:
          </p>
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {response && (
          <button
            onClick={() => {
              setQuestion('')
              setResponse('')
              setError('')
            }}
            className="px-4 py-2 border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition text-sm"
          >
            Ask Another Question
          </button>
        )}
        <button
          onClick={handleAskAI}
          disabled={loading || question.trim().length < 10}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
        >
          {loading ? 'Thinking...' : 'Get AI Help'}
        </button>
      </div>
    </div>
  )
}
