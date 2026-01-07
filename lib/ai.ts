import { GoogleGenAI } from '@google/genai'

let ai: GoogleGenAI | null = null

function getAI() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables')
    }
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  }
  return ai
}

export interface StudentHelpRequest {
  assignmentTitle: string
  assignmentDescription: string
  studentQuestion: string
}

export interface GradingAssistRequest {
  assignmentTitle: string
  assignmentDescription: string
  submissionText: string
  maxGrade?: number
}

export interface ExplainConceptRequest {
  courseName: string
  topic: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * Helps students with assignments without giving direct answers
 * Provides hints, explanations, and guidance
 */
export async function getStudentHelp(request: StudentHelpRequest): Promise<string> {
  const prompt = `You are a helpful educational assistant for a student working on an assignment.

Assignment: ${request.assignmentTitle}
Description: ${request.assignmentDescription}

Student's Question: ${request.studentQuestion}

IMPORTANT RULES:
1. DO NOT provide direct answers or complete solutions
2. DO provide hints, guidance, and explanations of concepts
3. Help the student think critically and solve problems independently
4. Ask guiding questions to help them discover the answer
5. Explain relevant concepts they might need to understand
6. Be encouraging and supportive

Provide your response:`

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })

  return response.text || ''
}

/**
 * Assists instructors with grading by analyzing submissions
 * Suggests grades and provides feedback points
 */
export async function getGradingAssistance(request: GradingAssistRequest): Promise<{
  suggestedGrade: number
  feedback: string
  strengths: string[]
  improvements: string[]
}> {
  const maxGrade = request.maxGrade || 100

  const prompt = `You are an educational grading assistant helping an instructor evaluate student work.

Assignment: ${request.assignmentTitle}
Description: ${request.assignmentDescription}

Student Submission:
${request.submissionText}

Please analyze this submission and provide:
1. A suggested grade (0-${maxGrade})
2. Overall feedback for the student
3. Specific strengths in the submission
4. Areas for improvement

Format your response as JSON with this structure:
{
  "suggestedGrade": number,
  "feedback": "overall feedback paragraph",
  "strengths": ["strength 1", "strength 2", ...],
  "improvements": ["improvement 1", "improvement 2", ...]
}

Provide your analysis:`

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })

  const text = response.text || ''

  // Parse JSON from response
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', e)
  }

  // Fallback if JSON parsing fails
  return {
    suggestedGrade: Math.floor(maxGrade * 0.75),
    feedback: text,
    strengths: ['Review the AI response above for details'],
    improvements: ['Review the AI response above for details'],
  }
}

/**
 * Explains concepts to students in an easy-to-understand way
 */
export async function explainConcept(request: ExplainConceptRequest): Promise<string> {
  const difficultyContext = {
    beginner: 'Explain using simple terms and everyday examples. Assume no prior knowledge.',
    intermediate: 'Provide a balanced explanation with some technical details and examples.',
    advanced: 'Provide an in-depth explanation with technical details and advanced concepts.',
  }

  const prompt = `You are an expert educator explaining concepts to students.

Course: ${request.courseName}
Topic: ${request.topic}
Level: ${request.difficulty || 'intermediate'}

${difficultyContext[request.difficulty || 'intermediate']}

Please provide:
1. A clear explanation of the concept
2. Real-world examples or analogies
3. Why this concept is important
4. Common misconceptions to avoid

Make it engaging and easy to understand:`

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })

  return response.text || ''
}

/**
 * Generates study questions based on course content
 */
export async function generateStudyQuestions(
  courseName: string,
  topic: string,
  count: number = 5
): Promise<string[]> {
  const prompt = `Generate ${count} study questions for students learning about "${topic}" in the course "${courseName}".

The questions should:
1. Test understanding of key concepts
2. Range from basic recall to application
3. Be clear and specific
4. Help students prepare for assessments

Format: Return only a JSON array of question strings, like: ["Question 1?", "Question 2?", ...]`

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })

  const text = response.text || ''

  // Parse JSON array from response
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse study questions:', e)
  }

  // Fallback
  return [
    'What are the key concepts related to this topic?',
    'How would you apply this concept in practice?',
    'What are the main challenges in understanding this topic?',
  ]
}

/**
 * Provides feedback suggestions for instructors
 */
export async function generateFeedbackSuggestions(
  assignmentDescription: string,
  studentWork: string,
  currentGrade: number
): Promise<string> {
  const prompt = `You are helping an instructor write constructive feedback for a student.

Assignment: ${assignmentDescription}
Student's Work: ${studentWork}
Grade Given: ${currentGrade}/100

Generate helpful, constructive feedback that:
1. Acknowledges what the student did well
2. Explains areas for improvement
3. Provides specific suggestions for future work
4. Is encouraging and supportive
5. Is professional and clear

Write the feedback:`

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })

  return response.text || ''
}
