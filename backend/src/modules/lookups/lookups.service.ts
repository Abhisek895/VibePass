import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { parseStringArray } from '../../common/utils/serialized-fields.util';

@Injectable()
export class LookupsService {
  constructor(private readonly prisma: PrismaService) {}

  private toDistinctValues(...sources: Array<string | null | undefined>) {
    const values = new Set<string>();

    sources.forEach(source => {
      parseStringArray(source ?? null)?.forEach(value => {
        const normalized = value.trim();
        if (normalized) {
          values.add(normalized);
        }
      });
    });

    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }

  private buildOptions(values: string[]) {
    return values.map(value => ({
      label: value
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
      value,
    }));
  }

  async getOnboardingLookups() {
    const [conversationIntents, users, profiles] = await this.prisma.$transaction([
      this.prisma.conversationIntent.findMany({
        orderBy: [{ isCasual: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.user.findMany({
        select: {
          interests: true,
          pronouns: true,
          voiceComfort: true,
        },
      }),
      this.prisma.profile.findMany({
        select: {
          interests: true,
          pronouns: true,
        },
      }),
    ]);

    const interests = this.toDistinctValues(
      ...users.map(user => user.interests),
      ...profiles.map(profile => profile.interests),
    );
    const pronouns = this.toDistinctValues(
      ...users.map(user => user.pronouns),
      ...profiles.map(profile => profile.pronouns),
    );
    const voiceLevels = Array.from(
      new Set(
        users
          .map(user => user.voiceComfort?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((left, right) => left.localeCompare(right));

    return {
      conversationIntents: conversationIntents.map(intent => ({
        description: intent.description,
        emoji: intent.icon,
        isCasual: intent.isCasual,
        label: intent.description,
        value: intent.name,
      })),
      interests: this.buildOptions(interests),
      pronouns: this.buildOptions(pronouns),
      voiceLevels: this.buildOptions(voiceLevels),
    };
  }

  async getMoods() {
    return this.prisma.mood.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }
}
