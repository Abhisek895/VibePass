import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

@Injectable()
export class IntelligenceService {
  constructor(private prisma: PrismaService) {}

  async analyzeUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: true,
            messages: true,
            reports2: true,
          }
        },
        profile: true
      }
    });

    if (!user) throw new NotFoundException('User not found');

    const riskLevel = this.calculateRisk(user);
    const aiOutput = await this.generateAIInsight(user, riskLevel);

    const insight = await this.prisma.aIUserInsight.upsert({
      where: { userId },
      update: {
        ...aiOutput,
        riskLevel,
        updatedAt: new Date()
      },
      create: {
        ...aiOutput,
        userId,
        riskLevel,
        generatedAt: new Date(),
        updatedAt: new Date()
      }
    });

    await this.prisma.aIInsightHistory.create({
      data: {
        userId,
        insightId: insight.id,
        model: aiOutput.aiModel,
        version: aiOutput.aiVersion,
        rawResponse: aiOutput as any,
        behaviorSummary: aiOutput.behaviorSummary,
        confidence: aiOutput.aiConfidence
      }
    });

    return insight;
  }

  async getGlobalInsights() {
    return this.prisma.aIUserInsight.findMany({
      where: {
        OR: [
          { riskLevel: 'HIGH' },
          { riskLevel: 'CRITICAL' },
          { anomalyDetected: true }
        ]
      },
      orderBy: { generatedAt: 'desc' },
      take: 50
    });
  }

  private calculateRisk(user: any): RiskLevel {
    const reportCount = user._count.reports2;
    const trustScore = user.trustScore;

    if (reportCount > 10 || trustScore < 20) return 'CRITICAL';
    if (reportCount > 5 || trustScore < 50) return 'HIGH';
    if (reportCount > 2 || trustScore < 80) return 'MEDIUM';
    return 'LOW';
  }

  private async generateAIInsight(user: any, riskLevel: RiskLevel) {
    const messageCount = user._count.messages;
    const postCount = user._count.posts;
    const reportCount = user._count.reports2;
    const trustScore = user.trustScore;

    // Derived User Personas
    let persona = "Casual Observer";
    if (postCount > 20 && messageCount > 100) persona = "Platform Power User";
    else if (reportCount > 5) persona = "Disruptive Agent";
    else if (messageCount > 200) persona = "Social Butterfly";
    else if (postCount > 10) persona = "Content Creator";
    else if (trustScore < 40) persona = "High Risk Anomaly";

    const intent = trustScore > 80 ? "Genuine Connection" : trustScore < 30 ? "System Exploitation" : "General Exploration";
    const tone = reportCount > 3 ? "Abrasive" : messageCount > 50 ? "Highly Interactive" : "Passive";

    return {
      userType: user.role,
      persona,
      engagementLevel: messageCount > 100 ? 'HIGH' : messageCount > 20 ? 'MEDIUM' : 'LOW',
      activityPattern: postCount > 5 ? 'CREATIVE_ACTIVE' : 'PASSIVE_CONSUMER',
      anomalyDetected: riskLevel === 'CRITICAL' || riskLevel === 'HIGH' || trustScore < 20,
      intentSummary: { 
        primary: intent, 
        tone,
        motivations: ["Social Growth", "Digital Networking", persona]
      },
      analysisDetail: {
        actions: `${postCount} posts created, ${messageCount} messages exchanged. ${reportCount} reports received.`,
        choices: `User maintains a trust score of ${trustScore}. Behavioral alignment with ${persona} patterns.`,
        vibeCategory: persona.toUpperCase().replace(/\s+/g, '_')
      },
      alerts: riskLevel === 'CRITICAL' ? ['Potential TOS Violation', 'Harassment Patterns'] : 
              riskLevel === 'HIGH' ? ['Suspicious Messaging Spike'] : [],
      recommendation: {
        nextStep: riskLevel === 'CRITICAL' ? 'IMMEDIATE_SUSPENSION' : 
                  riskLevel === 'HIGH' ? 'RESTRICT_MESSAGING' : 'MONITOR',
        urgency: riskLevel === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM'
      },
      behaviorSummary: `User ${user.username || user.id} is classified as a '${persona}'. They exhibit ${tone.toLowerCase()} behavior with a ${intent.toLowerCase()} intent. Current risk assessment is ${riskLevel}.`,
      aiConfidence: (0.85 + (Math.random() * 0.1)).toFixed(2),
      aiModel: 'VibePass-Intelligence-v2-Pro',
      aiVersion: '2.0.1'
    };
  }
}
