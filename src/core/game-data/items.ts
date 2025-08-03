// --- START OF FILE VEconomic-main/src/core/game-data/items.ts ---

import { ItemDefinition, ItemId } from '../../types/game.types';

export const ITEM_DATABASE: Record<ItemId, ItemDefinition> = {
  // --- RECURSOS BASE (Nivel 0) ---
  base_iron_ore: { name: 'Mineral de Hierro', category: 'BASE', volume: 5, baseCost: 10, baseSellPrice: 12 },
  base_copper_ore: { name: 'Mineral de Cobre', category: 'BASE', volume: 5, baseCost: 15, baseSellPrice: 18 },
  base_bauxite: { name: 'Aluminio', category: 'BASE', volume: 5, baseCost: 12, baseSellPrice: 15 },
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

  // --- COMPONENTES (Nivel 1-5) ---
  comp_steel_plate: { name: 'Placa de Acero', category: 'COMPONENT', volume: 10, baseCost: 28, baseSellPrice: 39, recipe: [{id: 'base_iron_ore', amount: 2}, {id: 'base_coal', amount: 1}], requiredFactoryLevel: 1, productionTime: 1 },
  comp_copper_wire: { name: 'Cable de Cobre', category: 'COMPONENT', volume: 3, baseCost: 15, baseSellPrice: 21, recipe: [{id: 'base_copper_ore', amount: 1}], requiredFactoryLevel: 1, productionTime: 1 },
  comp_aluminum_frame: { name: 'Marco de Aluminio', category: 'COMPONENT', volume: 8, baseCost: 24, baseSellPrice: 34, recipe: [{id: 'base_bauxite', amount: 2}], requiredFactoryLevel: 1, productionTime: 1 },
  comp_plastic_casing: { name: 'Carcasa de Plástico', category: 'COMPONENT', volume: 4, baseCost: 20, baseSellPrice: 28, recipe: [{id: 'base_crude_oil', amount: 1}], requiredFactoryLevel: 1, productionTime: 1 },
  comp_glass_panel: { name: 'Panel de Vidrio', category: 'COMPONENT', volume: 5, baseCost: 10, baseSellPrice: 14, recipe: [{id: 'base_sand', amount: 2}], requiredFactoryLevel: 1, productionTime: 1 },

  comp_electric_motor: { name: 'Motor Eléctrico', category: 'COMPONENT', volume: 12, baseCost: 58, baseSellPrice: 87, recipe: [{id: 'comp_steel_plate', amount: 1}, {id: 'comp_copper_wire', amount: 2}], requiredFactoryLevel: 2, productionTime: 2 },
  comp_basic_circuit: { name: 'Circuito Básico', category: 'COMPONENT', volume: 2, baseCost: 60, baseSellPrice: 90, recipe: [{id: 'comp_copper_wire', amount: 1}, {id: 'comp_plastic_casing', amount: 1}, {id: 'base_silicon_raw', amount: 1}], requiredFactoryLevel: 2, productionTime: 2 },
  comp_reinforced_casing: { name: 'Carcasa Reforzada', category: 'COMPONENT', volume: 9, baseCost: 44, baseSellPrice: 66, recipe: [{id: 'comp_plastic_casing', amount: 1}, {id: 'comp_aluminum_frame', amount: 1}], requiredFactoryLevel: 2, productionTime: 2},

  comp_microchip: { name: 'Microchip', category: 'COMPONENT', volume: 1, baseCost: 550, baseSellPrice: 880, recipe: [{id: 'base_silicon_raw', amount: 2}, {id: 'base_gold_ore', amount: 1}], requiredFactoryLevel: 3, productionTime: 4 },
  comp_battery: { name: 'Batería de Iones de Litio', category: 'COMPONENT', volume: 6, baseCost: 198, baseSellPrice: 317, recipe: [{id: 'base_lithium', amount: 1}, {id: 'base_nickel', amount: 1}, {id: 'base_coal', amount: 1}], requiredFactoryLevel: 3, productionTime: 3 },
  comp_led_screen: { name: 'Pantalla LED', category: 'COMPONENT', volume: 7, baseCost: 106, baseSellPrice: 170, recipe: [{id: 'comp_glass_panel', amount: 1}, {id: 'comp_basic_circuit', amount: 1}, {id: 'base_quartz', amount: 2}], requiredFactoryLevel: 3, productionTime: 3 },
  comp_advanced_circuit: { name: 'Circuito Avanzado', category: 'COMPONENT', volume: 3, baseCost: 610, baseSellPrice: 1037, recipe: [{id: 'comp_basic_circuit', amount: 1}, {id: 'base_gold_ore', amount: 1}, {id: 'base_silicon_raw', amount: 2}], requiredFactoryLevel: 3, productionTime: 3 },

  comp_camera_module: { name: 'Módulo de Cámara', category: 'COMPONENT', volume: 3, baseCost: 170, baseSellPrice: 289, recipe: [{id: 'comp_glass_panel', amount: 1}, {id: 'comp_basic_circuit', amount: 1}, {id: 'base_silver_ore', amount: 1}], requiredFactoryLevel: 4, productionTime: 3 },
  comp_touch_screen: { name: 'Pantalla Táctil', category: 'COMPONENT', volume: 7, baseCost: 206, baseSellPrice: 371, recipe: [{id: 'comp_led_screen', amount: 1}, {id: 'base_silver_ore', amount: 1}], requiredFactoryLevel: 4, productionTime: 4 },
  comp_actuator: { name: 'Actuador de Precisión', category: 'COMPONENT', volume: 5, baseCost: 118, baseSellPrice: 195, recipe: [{id: 'comp_electric_motor', amount: 1}, {id: 'comp_basic_circuit', amount: 1}], requiredFactoryLevel: 4, productionTime: 3 },
  comp_audio_driver: { name: 'Controlador de Audio', category: 'COMPONENT', volume: 2, baseCost: 75, baseSellPrice: 120, recipe: [{id: 'comp_basic_circuit', amount: 1}, {id: 'comp_copper_wire', amount: 1}], requiredFactoryLevel: 4, productionTime: 2 },

  comp_cpu: { name: 'Unidad Central de Procesamiento (CPU)', category: 'COMPONENT', volume: 1, baseCost: 1160, baseSellPrice: 2320, recipe: [{id: 'comp_microchip', amount: 1}, {id: 'comp_advanced_circuit', amount: 1}], requiredFactoryLevel: 5, productionTime: 6 },
  comp_wifi_module: { name: 'Módulo Wi-Fi', category: 'COMPONENT', volume: 1, baseCost: 75, baseSellPrice: 120, recipe: [{id: 'comp_basic_circuit', amount: 1}, {id: 'base_copper_ore', amount: 1}], requiredFactoryLevel: 5, productionTime: 2 },

  // --- PRODUCTOS FINALES: ELECTRODOMÉSTICOS ---
  prod_toaster: { name: 'Tostadora', category: 'ELECTRODOMESTICO', volume: 15, baseCost: 91, baseSellPrice: 164, recipe: [{id: 'comp_steel_plate', amount: 2}, {id: 'comp_copper_wire', amount: 1}, {id: 'comp_plastic_casing', amount: 1}], requiredFactoryLevel: 1, productionTime: 2 },
  prod_kettle: { name: 'Hervidor Eléctrico', category: 'ELECTRODOMESTICO', volume: 14, baseCost: 83, baseSellPrice: 149, recipe: [{id: 'comp_steel_plate', amount: 1}, {id: 'comp_plastic_casing', amount: 2}, {id: 'comp_copper_wire', amount: 1}], requiredFactoryLevel: 1, productionTime: 2 },
  prod_blender: { name: 'Batidora', category: 'ELECTRODOMESTICO', volume: 16, baseCost: 126, baseSellPrice: 227, recipe: [{id: 'comp_plastic_casing', amount: 2}, {id: 'comp_steel_plate', amount: 1}, {id: 'comp_electric_motor', amount: 1}], requiredFactoryLevel: 2, productionTime: 3 },
  prod_microwave: { name: 'Microondas', category: 'ELECTRODOMESTICO', volume: 25, baseCost: 212, baseSellPrice: 360, recipe: [{id: 'comp_steel_plate', amount: 3}, {id: 'comp_glass_panel', amount: 1}, {id: 'comp_electric_motor', amount: 1}, {id: 'comp_basic_circuit', amount: 1}], requiredFactoryLevel: 2, productionTime: 3 },
  prod_vacuum_cleaner: { name: 'Aspiradora', category: 'ELECTRODOMESTICO', volume: 28, baseCost: 146, baseSellPrice: 263, recipe: [{id: 'comp_plastic_casing', amount: 3}, {id: 'comp_electric_motor', amount: 1}, {id: 'comp_steel_plate', amount: 1}], requiredFactoryLevel: 3, productionTime: 4 },
  prod_fridge: { name: 'Refrigerador', category: 'ELECTRODOMESTICO', volume: 50, baseCost: 316, baseSellPrice: 537, recipe: [{id: 'comp_steel_plate', amount: 5}, {id: 'comp_plastic_casing', amount: 3}, {id: 'comp_electric_motor', amount: 2}], requiredFactoryLevel: 3, productionTime: 4 },
  prod_coffee_maker: { name: 'Cafetera', category: 'ELECTRODOMESTICO', volume: 18, baseCost: 110, baseSellPrice: 198, recipe: [{id: 'comp_plastic_casing', amount: 2}, {id: 'comp_glass_panel', amount: 1}, {id: 'comp_basic_circuit', amount: 1}], requiredFactoryLevel: 3, productionTime: 3},
  prod_washing_machine: { name: 'Lavadora', category: 'ELECTRODOMESTICO', volume: 60, baseCost: 950, baseSellPrice: 1710, recipe: [{id: 'comp_steel_plate', amount: 8}, {id: 'comp_electric_motor', amount: 2}, {id: 'comp_advanced_circuit', amount: 1}], requiredFactoryLevel: 4, productionTime: 6},
  prod_dishwasher: { name: 'Lavavajillas', category: 'ELECTRODOMESTICO', volume: 55, baseCost: 376, baseSellPrice: 677, recipe: [{id: 'comp_steel_plate', amount: 7}, {id: 'comp_electric_motor', amount: 1}, {id: 'comp_basic_circuit', amount: 2}, {id: 'comp_plastic_casing', amount: 3}], requiredFactoryLevel: 4, productionTime: 5},
  prod_air_conditioner: { name: 'Aire Acondicionado', category: 'ELECTRODOMESTICO', volume: 45, baseCost: 813, baseSellPrice: 1545, recipe: [{id: 'comp_steel_plate', amount: 4}, {id: 'comp_copper_wire', amount: 5}, {id: 'comp_electric_motor', amount: 2}, {id: 'comp_advanced_circuit', amount: 1}], requiredFactoryLevel: 5, productionTime: 7},

  // --- PRODUCTOS FINALES: ELECTRÓNICOS ---
  prod_smartphone: { name: 'Smartphone', category: 'ELECTRONICO', volume: 5, baseCost: 874, baseSellPrice: 1925, recipe: [{id: 'comp_microchip', amount: 1}, {id: 'comp_battery', amount: 1}, {id: 'comp_led_screen', amount: 1}, {id: 'comp_plastic_casing', amount: 1}], requiredFactoryLevel: 3, productionTime: 5 },
  prod_smartwatch: { name: 'Smartwatch', category: 'ELECTRONICO', volume: 2, baseCost: 384, baseSellPrice: 845, recipe: [{id: 'comp_led_screen', amount: 1}, {id: 'comp_basic_circuit', amount: 1}, {id: 'comp_battery', amount: 1}, {id: 'comp_plastic_casing', amount: 1}], requiredFactoryLevel: 4, productionTime: 4 },
  prod_digital_camera: { name: 'Cámara Digital', category: 'ELECTRONICO', volume: 8, baseCost: 760, baseSellPrice: 1672, recipe: [{id: 'comp_camera_module', amount: 1}, {id: 'comp_microchip', amount: 1}, {id: 'comp_led_screen', amount: 1}, {id: 'comp_plastic_casing', amount: 2}], requiredFactoryLevel: 4, productionTime: 6 },
  prod_smart_tv: { name: 'Smart TV 55"', category: 'ELECTRONICO', volume: 35, baseCost: 476, baseSellPrice: 950, recipe: [{id: 'comp_led_screen', amount: 2}, {id: 'comp_basic_circuit', amount: 3}, {id: 'comp_plastic_casing', amount: 4}, {id: 'comp_aluminum_frame', amount: 1}], requiredFactoryLevel: 4, productionTime: 5 },
  prod_tablet: { name: 'Tableta', category: 'ELECTRONICO', volume: 10, baseCost: 1588, baseSellPrice: 3811, recipe: [{id: 'comp_touch_screen', amount: 1}, {id: 'comp_cpu', amount: 1}, {id: 'comp_battery', amount: 1}, {id: 'comp_aluminum_frame', amount: 1}], requiredFactoryLevel: 5, productionTime: 7 },
  prod_laptop: { name: 'Laptop', category: 'ELECTRONICO', volume: 20, baseCost: 1452, baseSellPrice: 3340, recipe: [{id: 'comp_microchip', amount: 2}, {id: 'comp_battery', amount: 1}, {id: 'comp_led_screen', amount: 1}, {id: 'comp_aluminum_frame', amount: 2}, {id: 'comp_plastic_casing', amount: 2}], requiredFactoryLevel: 5, productionTime: 6 },
  prod_gaming_console: { name: 'Consola de Videojuegos', category: 'ELECTRONICO', volume: 22, baseCost: 2504, baseSellPrice: 6010, recipe: [{id: 'comp_cpu', amount: 1}, {id: 'comp_advanced_circuit', amount: 2}, {id: 'comp_reinforced_casing', amount: 1}, {id: 'comp_wifi_module', amount: 1}], requiredFactoryLevel: 5, productionTime: 8},
  prod_drone: { name: 'Dron de Consumo', category: 'ELECTRONICO', volume: 18, baseCost: 1846, baseSellPrice: 4615, recipe: [{id: 'comp_reinforced_casing', amount: 1}, {id: 'comp_actuator', amount: 4}, {id: 'comp_cpu', amount: 1}, {id: 'comp_camera_module', amount: 1}], requiredFactoryLevel: 5, productionTime: 9},
  prod_vr_headset: { name: 'Casco de Realidad Virtual', category: 'ELECTRONICO', volume: 15, baseCost: 1701, baseSellPrice: 4252, recipe: [{id: 'comp_touch_screen', amount: 2}, {id: 'comp_cpu', amount: 1}, {id: 'comp_audio_driver', amount: 1}, {id: 'comp_reinforced_casing', amount: 1}], requiredFactoryLevel: 5, productionTime: 9},
  prod_home_security_system: { name: 'Sistema de Seguridad', category: 'ELECTRONICO', volume: 30, baseCost: 1239, baseSellPrice: 2850, recipe: [{id: 'comp_camera_module', amount: 3}, {id: 'comp_advanced_circuit', amount: 1}, {id: 'comp_wifi_module', amount: 1}, {id: 'comp_reinforced_casing', amount: 1}], requiredFactoryLevel: 5, productionTime: 8},
};