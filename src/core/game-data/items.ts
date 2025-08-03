// --- START OF FILE VEconomic-main/src/core/game-data/items.ts ---

import { ItemDefinition, ItemId } from '../../types/game.types';

export const ITEM_DATABASE: Record<ItemId, ItemDefinition> = {
  // --- RECURSOS BASE (Nivel 0) ---
  base_iron_ore: { name: 'Mineral de Hierro', category: 'BASE', volume: 5, baseCost: 10, baseSellPrice: 12 },
  base_copper_ore: { name: 'Mineral de Cobre', category: 'BASE', volume: 5, baseCost: 15, baseSellPrice: 18 },
  base_bauxite: { name: 'Alumnio', category: 'BASE', volume: 5, baseCost: 12, baseSellPrice: 15 },
  base_coal: { name: 'Carbón', category: 'BASE', volume: 3, baseCost: 8, baseSellPrice: 10 },
  base_crude_oil: { name: 'Petróleo Crudo', category: 'BASE', volume: 8, baseCost: 20, baseSellPrice: 25 },
  base_sand: { name: 'Arena', category: 'BASE', volume: 2, baseCost: 5, baseSellPrice: 6 },
  base_limestone: { name: 'Piedra Caliza', category: 'BASE', volume: 4, baseCost: 7, baseSellPrice: 9 },
  base_gold_ore: { name: 'Mineral de Oro', category: 'BASE', volume: 10, baseCost: 500, baseSellPrice: 550 },
  base_silver_ore: { name: 'Mineral de Plata', category: 'BASE', volume: 8, baseCost: 100, baseSellPrice: 110 },
  base_nickel: { name: 'Níquel', category: 'BASE', volume: 6, baseCost: 40, baseSellPrice: 45 },
  base_zinc: { name: 'Zinc', category: 'BASE', volume: 6, baseCost: 25, baseSellPrice: 30 },
  base_lead: { name: 'Plomo', category: 'BASE', volume: 7, baseCost: 22, baseSellPrice: 26 },
  base_tin: { name: 'Estaño', category: 'BASE', volume: 7, baseCost: 30, baseSellPrice: 35 },
  base_quartz: { name: 'Cuarzo', category: 'BASE', volume: 4, baseCost: 18, baseSellPrice: 22 },
  base_sulfur: { name: 'Azufre', category: 'BASE', volume: 3, baseCost: 15, baseSellPrice: 19 },
  base_wood: { name: 'Madera', category: 'BASE', volume: 6, baseCost: 10, baseSellPrice: 12 },
  base_cotton: { name: 'Algodón', category: 'BASE', volume: 2, baseCost: 9, baseSellPrice: 11 },
  base_rubber: { name: 'Caucho Natural', category: 'BASE', volume: 4, baseCost: 14, baseSellPrice: 17 },
  base_water: { name: 'Agua', category: 'BASE', volume: 1, baseCost: 2, baseSellPrice: 3 },
  base_lithium: { name: 'Litio', category: 'BASE', volume: 8, baseCost: 150, baseSellPrice: 170 },
  base_silicon_raw: { name: 'Silicio en Bruto', category: 'BASE', volume: 4, baseCost: 25, baseSellPrice: 30 },

  // --- COMPONENTES (Procesados) ---
  comp_steel_plate: { name: 'Placa de Acero', category: 'COMPONENT', volume: 10, baseCost: 30, baseSellPrice: 40, recipe: [{id: 'base_iron_ore', amount: 2}, {id: 'base_coal', amount: 1}], requiredFactoryLevel: 1, productionTime: 1 },
  comp_copper_wire: { name: 'Cable de Cobre', category: 'COMPONENT', volume: 3, baseCost: 20, baseSellPrice: 28, recipe: [{id: 'base_copper_ore', amount: 1}], requiredFactoryLevel: 1, productionTime: 1 },
  comp_aluminum_frame: { name: 'Marco de Aluminio', category: 'COMPONENT', volume: 8, baseCost: 35, baseSellPrice: 48, recipe: [{id: 'base_bauxite', amount: 2}], requiredFactoryLevel: 1, productionTime: 1 },
  comp_plastic_casing: { name: 'Carcasa de Plástico', category: 'COMPONENT', volume: 4, baseCost: 30, baseSellPrice: 42, recipe: [{id: 'base_crude_oil', amount: 1}], requiredFactoryLevel: 1, productionTime: 1 },
  comp_glass_panel: { name: 'Panel de Vidrio', category: 'COMPONENT', volume: 5, baseCost: 15, baseSellPrice: 22, recipe: [{id: 'base_sand', amount: 2}], requiredFactoryLevel: 1, productionTime: 1 },
  comp_electric_motor: { name: 'Motor Eléctrico', category: 'COMPONENT', volume: 12, baseCost: 65, baseSellPrice: 90, recipe: [{id: 'comp_steel_plate', amount: 1}, {id: 'comp_copper_wire', amount: 2}], requiredFactoryLevel: 2, productionTime: 2 },
  comp_basic_circuit: { name: 'Circuito Básico', category: 'COMPONENT', volume: 2, baseCost: 80, baseSellPrice: 110, recipe: [{id: 'comp_copper_wire', amount: 1}, {id: 'comp_plastic_casing', amount: 1}, {id: 'base_silicon_raw', amount: 1}], requiredFactoryLevel: 2, productionTime: 2 },
  comp_microchip: { name: 'Microchip', category: 'COMPONENT', volume: 1, baseCost: 650, baseSellPrice: 900, recipe: [{id: 'base_silicon_raw', amount: 2}, {id: 'base_gold_ore', amount: 1}], requiredFactoryLevel: 3, productionTime: 4 },
  comp_battery: { name: 'Batería de Iones de Litio', category: 'COMPONENT', volume: 6, baseCost: 250, baseSellPrice: 350, recipe: [{id: 'base_lithium', amount: 1}, {id: 'base_nickel', amount: 1}, {id: 'base_coal', amount: 1}], requiredFactoryLevel: 3, productionTime: 3 },
  comp_led_screen: { name: 'Pantalla LED', category: 'COMPONENT', volume: 7, baseCost: 150, baseSellPrice: 220, recipe: [{id: 'comp_glass_panel', amount: 1}, {id: 'comp_basic_circuit', amount: 1}, {id: 'base_quartz', amount: 2}], requiredFactoryLevel: 3, productionTime: 3 },

  // --- PRODUCTOS FINALES: ELECTRODOMÉSTICOS ---
  prod_toaster: { name: 'Tostadora', category: 'ELECTRODOMESTICO', volume: 15, baseCost: 100, baseSellPrice: 180, recipe: [{id: 'comp_steel_plate', amount: 2}, {id: 'comp_copper_wire', amount: 1}, {id: 'comp_plastic_casing', amount: 1}], requiredFactoryLevel: 1, productionTime: 2 },
  prod_kettle: { name: 'Hervidor Eléctrico', category: 'ELECTRODOMESTICO', volume: 14, baseCost: 85, baseSellPrice: 150, recipe: [{id: 'comp_steel_plate', amount: 1}, {id: 'comp_plastic_casing', amount: 2}, {id: 'comp_copper_wire', amount: 1}], requiredFactoryLevel: 1, productionTime: 2 },
  prod_microwave: { name: 'Microondas', category: 'ELECTRODOMESTICO', volume: 25, baseCost: 250, baseSellPrice: 450, recipe: [{id: 'comp_steel_plate', amount: 3}, {id: 'comp_glass_panel', amount: 1}, {id: 'comp_electric_motor', amount: 1}, {id: 'comp_basic_circuit', amount: 1}], requiredFactoryLevel: 2, productionTime: 3 },
  prod_fridge: { name: 'Refrigerador', category: 'ELECTRODOMESTICO', volume: 50, baseCost: 500, baseSellPrice: 900, recipe: [{id: 'comp_steel_plate', amount: 5}, {id: 'comp_plastic_casing', amount: 3}, {id: 'comp_electric_motor', amount: 2}], requiredFactoryLevel: 2, productionTime: 4 },

  // --- PRODUCTOS FINALES: ELECTRÓNICOS ---
  prod_smartphone: { name: 'Smartphone', category: 'ELECTRONICO', volume: 5, baseCost: 1100, baseSellPrice: 2000, recipe: [{id: 'comp_microchip', amount: 1}, {id: 'comp_battery', amount: 1}, {id: 'comp_led_screen', amount: 1}, {id: 'comp_plastic_casing', amount: 1}], requiredFactoryLevel: 3, productionTime: 5 },
  prod_laptop: { name: 'Laptop', category: 'ELECTRONICO', volume: 20, baseCost: 1500, baseSellPrice: 2700, recipe: [{id: 'comp_microchip', amount: 2}, {id: 'comp_battery', amount: 1}, {id: 'comp_led_screen', amount: 1}, {id: 'comp_aluminum_frame', amount: 2}, {id: 'comp_plastic_casing', amount: 2}], requiredFactoryLevel: 4, productionTime: 6 },
  prod_smart_tv: { name: 'Smart TV 55"', category: 'ELECTRONICO', volume: 35, baseCost: 800, baseSellPrice: 1450, recipe: [{id: 'comp_led_screen', amount: 2}, {id: 'comp_basic_circuit', amount: 3}, {id: 'comp_plastic_casing', amount: 4}, {id: 'comp_aluminum_frame', amount: 1}], requiredFactoryLevel: 4, productionTime: 5 },
};