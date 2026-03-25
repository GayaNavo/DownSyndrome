/**
 * Recommendation Model
 * 
 * Defines the structure for AI-generated recommendations based on child analysis data.
 * Recommendations are generated using Gemini AI based on:
 * - Child age
 * - Growth analysis
 * - Prediction analysis (facial AI)
 * - SDQ analysis scores
 */

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 
  | 'therapy' 
  | 'developmental' 
  | 'behavioral' 
  | 'medical' 
  | 'educational' 
  | 'social';

export type RecommendationStatus = 'active' | 'completed' | 'dismissed';

export interface Recommendation {
  id: string;
  childId: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  
  // Source data that generated this recommendation
  sourceData: {
    childAge: number;
    growthAnalysis?: {
      height?: number;
      weight?: number;
      developmentalAge?: string;
      milestones?: string[];
    };
    predictionAnalysis?: {
      confidence: number;
      prediction: 'healthy' | 'downsyndrome';
      features?: number[];
    };
    sdqAnalysis?: {
      emotional: number;
      conduct: number;
      hyperactivity: number;
      peer: number;
      prosocial: number;
      totalDifficulty: number;
      percentage: number;
      interpretation: string;
    };
  };
  
  // AI-generated content
  aiGeneratedContent: {
    fullResponse: string;
    keyPoints: string[];
    actionableItems: string[];
    resources?: string[];
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  generatedAt: Date;
  expiresAt?: Date; // Some recommendations may have expiration
  
  // User interaction
  completedAt?: Date;
  notes?: string;
  parentFeedback?: string;
}

export interface CreateRecommendationInput {
  childId: string;
  childAge: number;
  growthAnalysis?: Recommendation['sourceData']['growthAnalysis'];
  predictionAnalysis?: Recommendation['sourceData']['predictionAnalysis'];
  sdqAnalysis?: Recommendation['sourceData']['sdqAnalysis'];
}

export interface RecommendationFilter {
  childId?: string;
  category?: RecommendationCategory;
  priority?: RecommendationPriority;
  status?: RecommendationStatus;
  fromDate?: Date;
  toDate?: Date;
}

export class RecommendationModel {
  /**
   * Validates a recommendation object
   */
  static validate(recommendation: Recommendation): boolean {
    return (
      !!recommendation.id &&
      !!recommendation.childId &&
      !!recommendation.title &&
      !!recommendation.description &&
      !!recommendation.category &&
      !!recommendation.priority &&
      !!recommendation.sourceData &&
      recommendation.sourceData.childAge !== undefined &&
      !!recommendation.aiGeneratedContent &&
      recommendation.createdAt instanceof Date
    );
  }

  /**
   * Creates a new recommendation with default values
   */
  static create(
    input: CreateRecommendationInput,
    aiResponse: string,
    parsedRecommendations: Partial<Recommendation>[]
  ): Recommendation[] {
    const now = new Date();
    
    return parsedRecommendations.map((rec, index) => ({
      id: `rec_${Date.now()}_${index}`,
      childId: input.childId,
      title: rec.title || 'Untitled Recommendation',
      description: rec.description || '',
      category: rec.category || 'developmental',
      priority: rec.priority || 'medium',
      status: 'active',
      sourceData: {
        childAge: input.childAge,
        growthAnalysis: input.growthAnalysis,
        predictionAnalysis: input.predictionAnalysis,
        sdqAnalysis: input.sdqAnalysis,
      },
      aiGeneratedContent: {
        fullResponse: aiResponse,
        keyPoints: rec.aiGeneratedContent?.keyPoints || [],
        actionableItems: rec.aiGeneratedContent?.actionableItems || [],
        resources: rec.aiGeneratedContent?.resources || [],
      },
      createdAt: now,
      updatedAt: now,
      generatedAt: now,
    }));
  }

  /**
   * Determines priority based on SDQ scores and analysis data
   */
  static determinePriority(
    sdqAnalysis?: Recommendation['sourceData']['sdqAnalysis'],
    predictionAnalysis?: Recommendation['sourceData']['predictionAnalysis']
  ): RecommendationPriority {
    // High priority if SDQ is in clinical range
    if (sdqAnalysis && sdqAnalysis.percentage >= 20) {
      return 'high';
    }
    
    // High priority if AI prediction confidence is concerning
    if (predictionAnalysis && predictionAnalysis.confidence > 0.8) {
      return 'high';
    }
    
    // Medium priority if SDQ is in borderline range
    if (sdqAnalysis && sdqAnalysis.percentage >= 15) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Categorizes a recommendation based on content analysis
   */
  static categorize(content: string): RecommendationCategory {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('speech') || lowerContent.includes('therapy') || lowerContent.includes('occupational')) {
      return 'therapy';
    }
    if (lowerContent.includes('milestone') || lowerContent.includes('development') || lowerContent.includes('growth')) {
      return 'developmental';
    }
    if (lowerContent.includes('behavior') || lowerContent.includes('conduct') || lowerContent.includes('emotional')) {
      return 'behavioral';
    }
    if (lowerContent.includes('medical') || lowerContent.includes('doctor') || lowerContent.includes('health')) {
      return 'medical';
    }
    if (lowerContent.includes('school') || lowerContent.includes('education') || lowerContent.includes('learning')) {
      return 'educational';
    }
    if (lowerContent.includes('social') || lowerContent.includes('friend') || lowerContent.includes('peer')) {
      return 'social';
    }
    
    return 'developmental';
  }

  /**
   * Parses AI response into structured recommendations
   */
  static parseAIResponse(aiResponse: string): Partial<Recommendation>[] {
    const recommendations: Partial<Recommendation>[] = [];
    
    // Split response by numbered sections or headers
    const sections = aiResponse.split(/\n\n(?=\d+\.|#{1,3}\s|(?:Daily|Weekly|Monthly|Exercise|Activity|Therapy|Recommendation))/i);
    
    for (const section of sections) {
      const trimmed = section.trim();
      if (!trimmed || trimmed.length < 20) continue;
      
      // Extract title (first line or first sentence)
      const lines = trimmed.split('\n');
      const title = lines[0].replace(/^\d+\.\s*/, '').replace(/^#{1,3}\s*/, '').substring(0, 100);
      
      // Extract actionable items (bullet points)
      const actionableItems: string[] = [];
      const keyPoints: string[] = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d+\./.test(trimmedLine)) {
          const item = trimmedLine.replace(/^[-•\d.\s]+/, '').trim();
          if (item.length > 10) {
            actionableItems.push(item);
          }
        } else if (trimmedLine.length > 20 && !trimmedLine.includes(':')) {
          keyPoints.push(trimmedLine);
        }
      });
      
      if (title && (actionableItems.length > 0 || keyPoints.length > 0)) {
        recommendations.push({
          title,
          description: trimmed.substring(0, 500),
          category: this.categorize(trimmed),
          aiGeneratedContent: {
            fullResponse: aiResponse,
            keyPoints: keyPoints.slice(0, 5),
            actionableItems: actionableItems.slice(0, 5),
          },
        });
      }
    }
    
    // If no structured recommendations found, create one from the whole response
    if (recommendations.length === 0) {
      recommendations.push({
        title: 'AI-Generated Recommendations',
        description: aiResponse.substring(0, 500),
        category: 'developmental',
        aiGeneratedContent: {
          fullResponse: aiResponse,
          keyPoints: [aiResponse.substring(0, 200)],
          actionableItems: [],
        },
      });
    }
    
    return recommendations;
  }
}
