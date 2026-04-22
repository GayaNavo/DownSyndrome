/**
 * Recommendation Service
 * 
 * Orchestrates AI-driven recommendation generation using Gemini AI.
 * Combines child data (age, growth, prediction, SDQ) to generate personalized recommendations.
 */

import { GeminiService } from './geminiService';
import {
  Recommendation,
  CreateRecommendationInput,
  RecommendationFilter,
  RecommendationModel,
  RecommendationPriority,
} from '../models/Recommendation';
import { Timestamp } from 'firebase/firestore';
import {
  createRecommendationDocument,
  getRecommendationsByChild,
  updateRecommendationDocument,
  RecommendationData,
} from '../lib/firebase/firestore';

export interface GenerateRecommendationsResult {
  success: boolean;
  recommendations?: Recommendation[];
  error?: string;
}

export interface RecommendationStats {
  total: number;
  byPriority: Record<RecommendationPriority, number>;
  byStatus: Record<string, number>;
  completedThisMonth: number;
}

export class RecommendationService {
  /**
   * Generates personalized recommendations using Gemini AI
   * based on child's comprehensive data
   */
  static async generateRecommendations(
    input: CreateRecommendationInput
  ): Promise<GenerateRecommendationsResult> {
    try {
      // Build comprehensive prompt for Gemini AI
      const prompt = this.buildAIPrompt(input);
      const systemInstruction = this.buildSystemInstruction();
      
      // Call Gemini AI with system instruction
      const aiResponse = await GeminiService.generateText(prompt, systemInstruction);
      
      if (!aiResponse.success || !aiResponse.response) {
        return {
          success: false,
          error: aiResponse.error || 'Failed to generate AI recommendations',
        };
      }

      // Parse AI response into structured recommendations
      const parsedRecommendations = RecommendationModel.parseAIResponse(aiResponse.response);
      
      // Determine priority based on analysis data
      const priority = RecommendationModel.determinePriority(
        input.sdqAnalysis,
        input.predictionAnalysis
      );
      
      // Enhance parsed recommendations with priority
      const enhancedRecommendations = parsedRecommendations.map(rec => ({
        ...rec,
        priority: rec.priority || priority,
      }));
      
      // Create full recommendation objects
      const recommendations = RecommendationModel.create(
        input,
        aiResponse.response,
        enhancedRecommendations
      );

      // Save recommendations to Firestore
      const savedRecommendations: Recommendation[] = [];
      for (const rec of recommendations) {
        try {
          const recId = await this.saveRecommendation(rec);
          savedRecommendations.push({ ...rec, id: recId });
        } catch (saveError) {
          console.error('Failed to save recommendation:', saveError);
          // Continue with other recommendations even if one fails
          savedRecommendations.push(rec);
        }
      }

      return {
        success: true,
        recommendations: savedRecommendations,
      };
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Builds the system instruction that sets Gemini's persona and clinical guidelines
   */
  private static buildSystemInstruction(): string {
    return `You are a Developmental Pediatric Specialist specializing in Trisomy 21 (Down syndrome). 

CORE DIRECTIVES:
1. ANALYZE GROWTH: Always evaluate Height and Weight using DS-specific growth charts (e.g., CDC/Zemel or UK-WHO DSMIG). Do not use typical growth standards. 
2. INTERPRET SDQ: Recognize that high "Prosocial" scores are common strengths in DS. For "Hyperactivity" or "Conduct," provide calming/focusing strategies rather than behavioral labels.
3. SLEEP VIGILANCE: If sleep is <11 hours or fragmented, prioritize checking for Obstructive Sleep Apnea (OSA) due to hypotonia.
4. CONFIDENTIAL LEVELS: Treat "Confidential Level 1-3" as support intensity (1=Mild/Consultative, 2=Moderate/Active Therapy, 3=High/Complex).
5. FORMATTING: Use clear Markdown with headers. Be empathetic but medically grounded.
6. MANDATORY DISCLAIMER: Include a note that this is educational and requires pediatrician validation.

CLINICAL GUIDELINES FOR DOWN SYNDROME:
- Hypotonia (low muscle tone) affects motor development and airway
- Higher risk of sleep apnea (50-100% prevalence)
- Speech delays are common due to oral-motor differences
- Visual learning strengths - use visual schedules and cues
- Social strengths - leverage prosocial behavior for teaching
- Growth should be tracked on DS-specific charts, not typical charts
- Early intervention is critical and highly effective

TONE: Professional, empathetic, evidence-based, actionable, and supportive.`;
  }

  /**
   * Builds a comprehensive prompt for Gemini AI based on child data
   */
  private static buildAIPrompt(input: CreateRecommendationInput): string {
    const { childAge, growthAnalysis, predictionAnalysis, sdqAnalysis } = input;

    // Build profile data section
    let profileData = `Generate a developmental recommendation report for the following child profile:

### PROFILE DATA:
- Age: ${childAge} years old`;

    // Add growth metrics
    if (growthAnalysis) {
      const heightStr = growthAnalysis.height ? `${growthAnalysis.height} cm` : 'N/A';
      const weightStr = growthAnalysis.weight ? `${growthAnalysis.weight} kg` : 'N/A';
      profileData += `\n- Current Growth: Height ${heightStr}, Weight ${weightStr}`;
      
      if (growthAnalysis.developmentalAge) {
        profileData += `\n- Developmental Age: ${growthAnalysis.developmentalAge} years`;
      }
      
      if (growthAnalysis.milestones && growthAnalysis.milestones.length > 0) {
        profileData += `\n- Achieved Milestones: ${growthAnalysis.milestones.join(', ')}`;
      }
    } else {
      profileData += `\n- Current Growth: Height N/A, Weight N/A`;
    }

    // Determine support level based on SDQ
    let supportLevel = 'Level 1 - Mild/Consultative';
    if (sdqAnalysis) {
      const totalScore = sdqAnalysis.totalDifficulty;
      if (totalScore >= 20) {
        supportLevel = 'Level 3 - High/Complex (intensive support needed)';
      } else if (totalScore >= 13) {
        supportLevel = 'Level 2 - Moderate/Active Therapy';
      }
    }

    // Add SDQ results
    if (sdqAnalysis) {
      profileData += `\n- SDQ Assessment:`;
      profileData += `\n  • Emotional Symptoms: ${sdqAnalysis.emotional}/10`;
      profileData += `\n  • Conduct Problems: ${sdqAnalysis.conduct}/10`;
      profileData += `\n  • Hyperactivity/Inattention: ${sdqAnalysis.hyperactivity}/10`;
      profileData += `\n  • Peer Relationship Issues: ${sdqAnalysis.peer}/10`;
      profileData += `\n  • Prosocial Behavior: ${sdqAnalysis.prosocial}/10`;
      profileData += `\n  • Total Difficulties: ${sdqAnalysis.totalDifficulty}/40`;
      profileData += `\n  • Clinical Interpretation: ${sdqAnalysis.interpretation}`;
    } else {
      profileData += `\n- SDQ Assessment: Not completed`;
    }

    // Add prediction confidence if available
    if (predictionAnalysis) {
      profileData += `\n- AI Screening Confidence: ${(predictionAnalysis.confidence * 100).toFixed(1)}%`;
    }

    profileData += `\n- Support/Confidential Level: ${supportLevel}`;

    // Add required output sections
    profileData += `

### REQUIRED OUTPUT SECTIONS:

1. **Physical Growth Analysis**: 
   - How they track on DS-specific growth charts (not typical charts)
   - Compare to DS growth percentiles (Zemel/CDC DS charts)
   - Note if height/weight are proportional
   - Provide nutritional guidance if needed

2. **Motor & Sensory Goals**: 
   - Provide exactly 3 specific exercises appropriate for their age
   - Address hypotonia considerations
   - Include both gross motor and fine motor activities
   - Specify duration, frequency, and progression markers

3. **Sleep & Respiratory Health**: 
   - Assess sleep adequacy for their age (DS children need 10-13 hours for ages 3-5)
   - If sleep <11 hours or fragmented: Address OSA risk due to hypotonia
   - Provide safe sleep positioning strategies
   - Recommend sleep study if red flags present
   - Include calming pre-sleep routine

4. **Social-Emotional Strategy**: 
   - Leverage SDQ strengths (especially if Prosocial is high)
   - Address areas of concern with specific strategies
   - If Hyperactivity/Conduct elevated: Provide calming/focusing exercises (not behavioral labels)
   - Include peer interaction activities
   - Suggest emotional regulation techniques

5. **Monthly Action Plan**: 
   - Provide exactly 3 actionable steps for parents
   - Include timeline and checkpoints
   - Specify when to reassess
   - List warning signs requiring immediate professional attention

### FORMATTING REQUIREMENTS:
- Use clear Markdown headers (## and ###)
- Use bullet points and numbered lists
- Bold key terms and warnings
- Keep paragraphs concise (2-3 sentences max)
- Use clinical but accessible language
- Include specific timelines and measurable goals

### IMPORTANT CLINICAL NOTES:
- Always reference DS-specific considerations
- Acknowledge the child's strengths before addressing challenges
- Provide evidence-based recommendations
- Include red flags that warrant immediate medical attention
- Be realistic but hopeful about developmental progress

Please generate the comprehensive developmental recommendation report now:`;

    return profileData;
  }

  /**
   * Saves a recommendation to Firestore
   */
  private static async saveRecommendation(recommendation: Recommendation): Promise<string> {
    const recData: Omit<RecommendationData, 'id'> = {
      childId: recommendation.childId,
      title: recommendation.title,
      description: recommendation.description,
      category: recommendation.category,
      priority: recommendation.priority,
      status: recommendation.status,
      sourceData: recommendation.sourceData,
      aiGeneratedContent: recommendation.aiGeneratedContent,
      generatedAt: Timestamp.fromDate(recommendation.generatedAt),
      expiresAt: recommendation.expiresAt ? Timestamp.fromDate(recommendation.expiresAt) : undefined,
      completedAt: recommendation.completedAt ? Timestamp.fromDate(recommendation.completedAt) : undefined,
      notes: recommendation.notes,
      parentFeedback: recommendation.parentFeedback,
    };

    return await createRecommendationDocument(recData);
  }

  /**
   * Retrieves recommendations for a child with optional filtering
   */
  static async getRecommendations(
    childId: string,
    filter?: RecommendationFilter
  ): Promise<Recommendation[]> {
    try {
      const recsData = await getRecommendationsByChild(childId);
      
      let recommendations = recsData.map(this.mapToRecommendation);
      
      // Apply filters
      if (filter) {
        if (filter.category) {
          recommendations = recommendations.filter((r: Recommendation) => r.category === filter.category);
        }
        if (filter.priority) {
          recommendations = recommendations.filter((r: Recommendation) => r.priority === filter.priority);
        }
        if (filter.status) {
          recommendations = recommendations.filter((r: Recommendation) => r.status === filter.status);
        }
        if (filter.fromDate) {
          recommendations = recommendations.filter((r: Recommendation) => r.createdAt >= filter.fromDate!);
        }
        if (filter.toDate) {
          recommendations = recommendations.filter((r: Recommendation) => r.createdAt <= filter.toDate!);
        }
      }
      
      // Sort by priority (high -> medium -> low) and then by date
      const priorityOrder: Record<RecommendationPriority, number> = { high: 0, medium: 1, low: 2 };
      recommendations.sort((a: Recommendation, b: Recommendation) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      return recommendations;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  /**
   * Marks a recommendation as completed
   */
  static async completeRecommendation(
    recommendationId: string,
    notes?: string
  ): Promise<boolean> {
    try {
      await updateRecommendationDocument(recommendationId, {
        status: 'completed',
        completedAt: Timestamp.now(),
        notes: notes,
      });
      return true;
    } catch (error) {
      console.error('Error completing recommendation:', error);
      return false;
    }
  }

  /**
   * Dismisses a recommendation
   */
  static async dismissRecommendation(
    recommendationId: string,
    reason?: string
  ): Promise<boolean> {
    try {
      await updateRecommendationDocument(recommendationId, {
        status: 'dismissed',
        notes: reason,
      });
      return true;
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      return false;
    }
  }

  /**
   * Adds parent feedback to a recommendation
   */
  static async addFeedback(
    recommendationId: string,
    feedback: string
  ): Promise<boolean> {
    try {
      await updateRecommendationDocument(recommendationId, {
        parentFeedback: feedback,
      });
      return true;
    } catch (error) {
      console.error('Error adding feedback:', error);
      return false;
    }
  }

  /**
   * Gets recommendation statistics for a child
   */
  static async getStats(childId: string): Promise<RecommendationStats> {
    const recommendations = await this.getRecommendations(childId);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return {
      total: recommendations.length,
      byPriority: {
        high: recommendations.filter(r => r.priority === 'high').length,
        medium: recommendations.filter(r => r.priority === 'medium').length,
        low: recommendations.filter(r => r.priority === 'low').length,
      },
      byStatus: {
        active: recommendations.filter(r => r.status === 'active').length,
        completed: recommendations.filter(r => r.status === 'completed').length,
        dismissed: recommendations.filter(r => r.status === 'dismissed').length,
      },
      completedThisMonth: recommendations.filter(
        r => r.status === 'completed' && r.completedAt && r.completedAt >= startOfMonth
      ).length,
    };
  }

  /**
   * Auto-generates recommendations if none exist or data has changed significantly
   */
  static async autoGenerateIfNeeded(
    input: CreateRecommendationInput,
    forceGenerate: boolean = false
  ): Promise<GenerateRecommendationsResult> {
    try {
      // Check existing recommendations
      const existingRecs = await this.getRecommendations(input.childId, {
        status: 'active',
      });
      
      // If no active recommendations or force generate, create new ones
      if (forceGenerate || existingRecs.length === 0) {
        return await this.generateRecommendations(input);
      }
      
      // Check if last recommendation is older than 7 days
      const mostRecent = existingRecs[0];
      const daysSinceLastRec = Math.floor(
        (Date.now() - mostRecent.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastRec > 7) {
        return await this.generateRecommendations(input);
      }
      
      return {
        success: true,
        recommendations: existingRecs,
      };
    } catch (error) {
      console.error('Auto-generate error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Maps Firestore data to Recommendation model
   */
  private static mapToRecommendation(data: RecommendationData): Recommendation {
    return {
      id: data.id!,
      childId: data.childId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      sourceData: data.sourceData,
      aiGeneratedContent: data.aiGeneratedContent,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      generatedAt: data.generatedAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate(),
      completedAt: data.completedAt?.toDate(),
      notes: data.notes,
      parentFeedback: data.parentFeedback,
    };
  }
}
