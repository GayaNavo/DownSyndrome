/**
 * Gemini AI Service Layer
 * 
 * Provides a clean interface for interacting with Gemini AI
 * through our server-side API routes.
 * 
 * Usage Examples:
 * 
 * // Simple text generation
 * const result = await GeminiService.generateText(
 *   'What are common early intervention strategies for Down Syndrome?'
 * );
 * 
 * // Image analysis
 * const analysis = await GeminiService.analyzeImage(
 *   imageBase64,
 *   'Describe the developmental activities shown in this image'
 * );
 * 
 * // Therapy recommendations
 * const recommendations = await GeminiService.generateTherapyRecommendations(
 *   5, // age
 *   'Down Syndrome',
 *   { speech: 7, motor: 6, social: 8 }
 * );
 */

interface GeminiResponse {
  success: boolean;
  response?: string;
  error?: string;
  details?: string;
}

export class GeminiService {
  private static readonly API_ENDPOINT = '/api/gemini';

  /**
   * Generate text response from Gemini AI
   * 
   * @param prompt - The text prompt or question to send to Gemini
   * @param systemInstruction - Optional system instruction for setting AI persona/rules
   * @returns Promise with generated text response or error
   */
  static async generateText(prompt: string, systemInstruction?: string): Promise<GeminiResponse> {
    try {
      const requestBody: any = { prompt };
      
      // Add system instruction if provided
      if (systemInstruction) {
        requestBody.systemInstruction = systemInstruction;
      }

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to get response`);
      }

      return data;
    } catch (error) {
      console.error('Gemini Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Analyze an image with text prompt using Gemini Vision
   * 
   * @param imageBase64 - Base64 encoded image (with or without data:image prefix)
   * @param prompt - Text prompt/question about the image
   * @returns Promise with image analysis response or error
   */
  static async analyzeImage(
    imageBase64: string,
    prompt: string = 'Describe this image in detail'
  ): Promise<GeminiResponse> {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, imageBase64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to analyze image`);
      }

      return data;
    } catch (error) {
      console.error('Gemini Image Analysis Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate personalized therapy recommendations based on child profile
   * 
   * @param childAge - Age of the child in years
   * @param condition - Medical condition (e.g., 'Down Syndrome')
   * @param assessmentScores - Optional assessment scores object
   * @returns Promise with structured therapy recommendations
   */
  static async generateTherapyRecommendations(
    childAge: number,
    condition: string,
    assessmentScores?: Record<string, number>
  ): Promise<GeminiResponse> {
    let prompt = `You are an EXPERT pediatric therapist specializing in ${condition} early intervention. 
Provide HIGHLY PERSONALIZED, detailed therapy recommendations for a ${childAge}-year-old child.

CRITICAL: Do NOT give generic advice. Tailor EVERY recommendation to the specific child profile below.`;
    
    if (assessmentScores && Object.keys(assessmentScores).length > 0) {
      const scoresText = Object.entries(assessmentScores)
        .map(([area, score]) => {
          const level = score >= 7 ? 'HIGH CONCERN' : score >= 5 ? 'MODERATE CONCERN' : 'STRENGTH AREA';
          return `- ${area}: ${score}/10 [${level}]`;
        })
        .join('\n');
      
      prompt += `\n\n## CURRENT ASSESSMENT PROFILE:\n${scoresText}\n\n`;
      
      // Identify areas of concern and strengths
      const concerns = Object.entries(assessmentScores)
        .filter(([_, score]) => score >= 5)
        .map(([area]) => area);
      
      const strengths = Object.entries(assessmentScores)
        .filter(([_, score]) => score < 5)
        .map(([area]) => area);
      
      if (concerns.length > 0) {
        prompt += `**AREAS NEEDING FOCUS:** ${concerns.join(', ')}\n`;
        prompt += `These areas show moderate to high concern and require targeted intervention.\n\n`;
      }
      
      if (strengths.length > 0) {
        prompt += `**EXISTING STRENGTHS:** ${strengths.join(', ')}\n`;
        prompt += `Build upon these areas while addressing concerns.\n\n`;
      }
      
      prompt += `For each area of concern:\n`;
      prompt += `- Explain WHY this area needs attention based on the score\n`;
      prompt += `- Provide 3-5 SPECIFIC activities with step-by-step instructions\n`;
      prompt += `- Include duration, frequency, and best timing\n`;
      prompt += `- List materials needed (prefer household items)\n`;
      prompt += `- Describe what progress looks like\n`;
      prompt += `- Give warning signs that indicate need for professional help\n\n`;
    } else {
      prompt += `\n\nProvide comprehensive therapy guidance covering:\n`;
      prompt += `- Speech & language development\n`;
      prompt += `- Fine and gross motor skills\n`;
      prompt += `- Social-emotional development\n`;
      prompt += `- Cognitive development\n`;
      prompt += `- Daily living skills\n\n`;
    }
    
    prompt += `## FORMAT REQUIREMENTS:

For each recommendation, provide:

1. **Title**: Specific and actionable
2. **Why This Matters**: Connect to child's profile and developmental science
3. **Step-by-Step Activities**: 3-5 concrete exercises parents can do TODAY
4. **Implementation Guide**: When, where, how long, what materials
5. **Progress Tracking**: What to look for, timeline, milestones
6. **Red Flags**: When to seek professional support

Make recommendations:
✅ Age-appropriate for a ${childAge}-year-old
✅ Evidence-based and research-backed
✅ Practical for daily home implementation
✅ Specific with exact activities (not vague suggestions)
✅ Encouraging but realistic

Avoid generic phrases like "work on speech" - instead provide exact techniques like:
"Practice 'b' and 'p' sounds for 10 minutes, 3x daily using mirror play. Have child watch your mouth, then their own, making the sounds together. Use words like 'ball,' 'pop,' 'baby.' Celebrate each attempt."`;

    return this.generateText(prompt);
  }

  /**
   * Generate comprehensive progress summary from historical data
   * 
   * @param childData - Child's basic information
   * @param progressHistory - Array of historical progress records
   * @returns Promise with detailed progress analysis
   */
  static async generateProgressSummary(
    childData: { name: string; age: number; diagnosis: string },
    progressHistory: any[]
  ): Promise<GeminiResponse> {
    const prompt = `Analyze the developmental progress of a child and provide a comprehensive summary.

**Child Information:**
- Name: ${childData.name}
- Age: ${childData.age} years old
- Diagnosis: ${childData.diagnosis}

**Progress History:**
${JSON.stringify(progressHistory, null, 2)}

Please provide a detailed analysis including:

1. **Key Improvements**: Highlight the most significant areas of progress
2. **Areas Needing Attention**: Identify skills or domains that need more focus
3. **Pattern Recognition**: Note any trends (positive plateaus, rapid gains, etc.)
4. **Next Steps**: Recommend specific goals for the next 3-6 months
5. **Celebration Points**: Positive observations to encourage the family

Write in a supportive, professional tone suitable for sharing with parents.`;

    return this.generateText(prompt);
  }

  /**
   * Answer questions about child development and care
   * 
   * @param question - Parent/caregiver question
   * @param context - Optional context about the specific child
   * @returns Promise with informative answer
   */
  static async answerParentQuestion(
    question: string,
    context?: { childAge?: number; specificConcerns?: string }
  ): Promise<GeminiResponse> {
    let prompt = `Answer this question from a parent/caregiver in a clear, supportive, and informative way:

"${question}"

`;

    if (context) {
      if (context.childAge) {
        prompt += `Context: This question is about a ${context.childAge}-year-old child. `;
      }
      if (context.specificConcerns) {
        prompt += `Specific concerns: ${context.specificConcerns}. `;
      }
    }

    prompt += `Provide practical advice backed by current best practices in child development. Include:
- Clear explanation of the issue/concept
- Practical strategies parents can try at home
- When to seek professional help (if applicable)
- Reassurance and encouragement

Keep the tone warm, supportive, and non-judgmental.`;

    return this.generateText(prompt);
  }

  /**
   * Interpret SDQ (Strengths and Difficulties Questionnaire) results
   * 
   * @param sdqScores - SDQ assessment scores
   * @param childAge - Child's age for age-appropriate interpretation
   * @returns Promise with SDQ interpretation and recommendations
   */
  static async interpretSDQResults(
    sdqScores: {
      emotionalSymptoms?: number;
      conductProblems?: number;
      hyperactivity?: number;
      peerProblems?: number;
      prosocialBehavior?: number;
      totalDifficulties?: number;
    },
    childAge: number
  ): Promise<GeminiResponse> {
    const prompt = `Interpret these SDQ (Strengths and Difficulties Questionnaire) results for a ${childAge}-year-old child:

**SDQ Scores:**
${Object.entries(sdqScores)
  .map(([domain, score]) => `- ${domain.replace(/([A-Z])/g, ' $1').trim()}: ${score}`)
  .join('\n')}

Please provide:
1. **Overall Interpretation**: What do these scores suggest?
2. **Strengths**: Areas where the child is doing well
3. **Areas of Concern**: Domains that may need additional support
4. **Practical Strategies**: Evidence-based interventions parents can use
5. **Professional Support**: When and what type of professional help to consider
6. **Follow-up**: Suggested timeline for reassessment

Important: Emphasize that this is screening information, not a diagnosis, and should be discussed with healthcare providers.`;

    return this.generateText(prompt);
  }
}
