// --- START OF FILE VEconomic-main/src/core/game-data/hr.ts ---

import { EmployeeSpecialty, BuildingType } from "../../types/game.types";
import { IconName } from "../../icons/Icon";

export const SPECIALTY_DATA: Record<EmployeeSpecialty, { name: string; icon: IconName }> = {
    FACTORY_MANAGER: { name: 'Gerente de Fábrica', icon: 'factory' },
    LOGISTICS_COORDINATOR: { name: 'Coordinador Logístico', icon: 'logistics' },
    SALES_EXECUTIVE: { name: 'Ejecutivo de Ventas', icon: 'chart-bar' },
    RESEARCH_LEAD: { name: 'Líder de I+D', icon: 'lab' },
};

export const SPECIALTY_ASSIGNMENT_MAP: Record<EmployeeSpecialty, BuildingType[]> = {
    FACTORY_MANAGER: ['FABRICA'],
    LOGISTICS_COORDINATOR: ['CENTRO_LOGISTICA'],
    SALES_EXECUTIVE: ['OFICINA_MARKETING'],
    RESEARCH_LEAD: ['LABORATORIO_ID'],
};

export const SPECIALTY_BONUS_MAP: Record<EmployeeSpecialty, (skillLevel: number) => string> = {
    FACTORY_MANAGER: (skillLevel) => `+${(skillLevel / 2).toFixed(1)}% de eficiencia de producción.`,
    LOGISTICS_COORDINATOR: (skillLevel) => `-${(skillLevel / 10).toFixed(1)}% en costes de envío de contratos. (No implementado)`,
    SALES_EXECUTIVE: (skillLevel) => `+${(skillLevel / 5).toFixed(1)}% de bonus en recompensas de contratos. (No implementado)`,
    RESEARCH_LEAD: (skillLevel) => `+${(skillLevel / 4).toFixed(1)} puntos de investigación por día. (No implementado)`,
};