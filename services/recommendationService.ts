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
      
      // Call Gemini AI
      const aiResponse = await GeminiService.generateText(prompt);
      
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
   * Builds a comprehensive prompt for Gemini AI based on child data
   */
  private static buildAIPrompt(input: CreateRecommendationInput): string {
    const { childAge, growthAnalysis, predictionAnalysis, sdqAnalysis } = input;
    
    let prompt = `You are an expert pediatric developmental specialist focusing on Down Syndrome care. 
Generate personalized, evidence-based recommendations for a ${childAge}-year-old child with Down Syndrome.

`;

    // Add growth analysis context
    if (growthAnalysis) {
      prompt += `## GROWTH & DEVELOPMENT PROFILE\n`;
      if (growthAnalysis.height) prompt += `- Height: ${growthAnalysis.height} cm\n`;
      if (growthAnalysis.weight) prompt += `- Weight: ${growthAnalysis.weight} kg\n`;
      if (growthAnalysis.developmentalAge) prompt += `- Developmental Age: ${growthAnalysis.developmentalAge}\n`;
      if (growthAnalysis.milestones && growthAnalysis.milestones.length > 0) {
        prompt += `- Recent Milestones: ${growthAnalysis.milestones.join(', ')}\n`;
      }
      prompt += `\n`;
    }

    // Add prediction analysis context
    if (predictionAnalysis) {
      prompt += `## AI PREDICTION ANALYSIS\n`;
      prompt += `- Prediction: ${predictionAnalysis.prediction}\n`;
      prompt += `- Confidence: ${(predictionAnalysis.confidence * 100).toFixed(1)}%\n`;
      prompt += `\n`;
    }

    // Add SDQ analysis context
    if (sdqAnalysis) {
      prompt += `## SDQ (STRENGTHS & DIFFICULTIES QUESTIONNAIRE) RESULTS\n`;
      prompt += `- Emotional Symptoms: ${sdqAnalysis.emotional}/10\n`;
      prompt += `- Conduct Problems: ${sdqAnalysis.conduct}/10\n`;
      prompt += `- Hyperactivity/Inattention: ${sdqAnalysis.hyperactivity}/10\n`;
      prompt += `- Peer Relationship Issues: ${sdqAnalysis.peer}/10\n`;
      prompt += `- Prosocial Behavior: ${sdqAnalysis.prosocial}/10 (higher is better)\n`;
      prompt += `- Total Difficulties Score: ${sdqAnalysis.totalDifficulty}/40\n`;
      prompt += `- Overall Percentage: ${sdqAnalysis.percentage.toFixed(1)}%\n`;
      prompt += `- Interpretation: ${sdqAnalysis.interpretation}\n\n`;
    }

    prompt += `## INSTRUCTIONS
Please provide 3-5 specific, actionable recommendations that address:

1. **Immediate priorities** based on the SDQ results and any concerning areas
2. **Developmental activities** appropriate for a ${childAge}-year-old with Down Syndrome
3. **Therapy suggestions** (speech, occupational, physical) if relevant
4. **Home-based strategies** parents can implement
5. **When to seek professional help** - specific warning signs

For each recommendation:
- Give it a clear, specific title
- Provide detailed explanation
- List 2-3 concrete action steps
- Indicate priority level (High/Medium/Low)
- Suggest frequency (daily/weekly/monthly)

Format your response with clear headings and bullet points for easy reading by parents.`;

    return prompt;
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
