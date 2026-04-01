import { egresadoQuestionnaireConfig } from "@/config/egresado-questionnaire";
import { questionnaireConfig } from "@/config/questionnaire";
import { Module, RelationConfig, RelationKey } from "@/lib/types";

export function getRelationConfig(relation: RelationKey): RelationConfig {
  if (relation === "egresado") {
    return egresadoQuestionnaireConfig;
  }

  return questionnaireConfig.relations[relation];
}

export function getModulesForRelation(relation: RelationKey): Module[] {
  const relationConfig = getRelationConfig(relation);

  return relationConfig.usesSharedCharacterization === false
    ? relationConfig.modules
    : [questionnaireConfig.characterizationModule, ...relationConfig.modules];
}
