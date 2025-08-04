// --- START OF FILE VEconomic-main/src/core/game-data/names.ts ---

const FIRST_NAMES: string[] = [
    "Carlos", "Sofía", "Juan", "Valentina", "Luis", "Camila", "Javier", "Isabella",
    "Miguel", "Mariana", "Andrés", "Valeria", "Diego", "Daniela", "Fernando", "Luciana",
    "Alejandro", "Gabriela", "Ricardo", "Jimena", "Mateo", "Renata", "Adrián", "Victoria"
];
  
const LAST_NAMES: string[] = [
    "González", "Rodríguez", "Pérez", "Sánchez", "López", "Martínez", "García",
    "Fernández", "Gómez", "Díaz", "Hernández", "Vázquez", "Moreno", "Romero",
    "Torres", "Ruiz", "Flores", "Ramírez", "Castillo", "Mendoza", "Rojas"
];
  
export function generateRandomName(): string {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${firstName} ${lastName}`;
}