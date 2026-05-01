import { Prisma } from '@prisma/client';

export interface CrudModelDefinition {
  aliases: string[];
  delegateName: string;
  modelName: Prisma.ModelName;
  routeName: string;
  singularRouteName: string;
}

function toDelegateName(modelName: string) {
  return `${modelName.charAt(0).toLowerCase()}${modelName.slice(1)}`;
}

function toKebabCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function pluralize(value: string) {
  return value.endsWith('s') ? value : `${value}s`;
}

function createCrudModelDefinition(
  modelName: Prisma.ModelName,
): CrudModelDefinition {
  const singularRouteName = toKebabCase(modelName);
  const routeName = pluralize(singularRouteName);
  const delegateName = toDelegateName(modelName);
  const snakeCase = singularRouteName.replace(/-/g, '_');

  return {
    aliases: [
      modelName,
      modelName.toLowerCase(),
      delegateName,
      delegateName.toLowerCase(),
      singularRouteName,
      routeName,
      snakeCase,
      pluralize(snakeCase),
    ],
    delegateName,
    modelName,
    routeName,
    singularRouteName,
  };
}

export const CRUD_MODELS = Object.values(Prisma.ModelName).map(
  createCrudModelDefinition,
);

export function buildCrudModelLookup() {
  const lookup = new Map<string, CrudModelDefinition>();

  for (const model of CRUD_MODELS) {
    for (const alias of model.aliases) {
      lookup.set(alias.toLowerCase(), model);
    }
  }

  return lookup;
}
