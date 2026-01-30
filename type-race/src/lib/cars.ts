import { EngineType } from './sounds';

export interface CarModel {
  id: string;
  name: string;
  type: 'starter' | 'speedster' | 'muscle' | 'cyber' | 'hyper' | 'legend';
  requiredWpm: number;
  color: string;
  pathData: string;
  engineType: EngineType;
  isPremium?: boolean;
}

// More detailed SVG paths for distinct car silhouettes
const CAR_SHAPES = {
  // Compact hatchback - rounded, simple
  hatchback: `
    M 5,28 
    Q 5,22 10,20 L 15,20 L 20,12 L 40,12 L 45,20 L 55,20 
    Q 60,22 60,28 
    L 55,28 Q 52,25 48,28 L 17,28 Q 14,25 10,28 Z
    M 22,12 L 25,8 L 38,8 L 40,12
  `,
  // Classic sedan - longer, elegant
  sedan: `
    M 0,28 
    Q 0,24 5,22 L 12,22 L 18,10 L 52,10 L 58,22 L 70,22 
    Q 75,24 75,28 
    L 65,28 Q 62,24 58,28 L 17,28 Q 14,24 10,28 Z
    M 20,10 L 24,4 L 48,4 L 52,10
    M 25,10 L 45,10 L 45,8 L 25,8 Z
  `,
  // Sporty coupe - low, aggressive
  coupe: `
    M 0,28 
    L 5,25 L 15,25 L 25,8 L 55,8 L 70,25 L 80,25 L 80,28 
    L 70,28 Q 67,23 63,28 L 17,28 Q 14,23 10,28 Z
    M 28,8 L 32,3 L 52,3 L 55,8
    M 58,12 L 75,20 L 75,25 L 70,25 L 58,15 Z
  `,
  // Boxy SUV - tall, rugged
  suv: `
    M 0,30 
    L 5,30 L 5,18 L 10,8 L 55,8 L 60,18 L 60,30 L 75,30 
    L 75,32 L 0,32 Z
    M 10,8 L 12,4 L 53,4 L 55,8
    M 15,8 L 15,18 L 50,18 L 50,8
    M 65,28 Q 68,24 72,28 M 8,28 Q 11,24 14,28
  `,
  // American muscle - wide, powerful rear
  muscle: `
    M 0,28 
    L 8,28 L 8,22 L 15,22 L 22,10 L 50,10 L 58,18 L 75,18 L 78,22 L 78,28 
    L 85,28 L 85,30 L 0,30 Z
    M 24,10 L 28,5 L 48,5 L 50,10
    M 60,18 L 60,14 L 72,14 L 75,18
    M 75,26 Q 78,22 82,26 M 8,26 Q 11,22 14,26
  `,
  // Modern sports car - aerodynamic curves
  sport: `
    M 5,28 
    Q 5,24 10,22 L 20,22 L 35,5 L 60,5 L 78,22 L 88,22 
    Q 93,24 93,28 
    L 82,28 Q 79,23 75,28 L 18,28 Q 15,23 11,28 Z
    M 38,5 L 42,1 L 58,1 L 60,5
    M 65,8 L 85,20 L 88,22 L 78,22 L 62,12 Z
    M 25,18 L 55,18 L 58,22 L 22,22 Z
  `,
  // Supercar - very low, dramatic wedge
  super: `
    M 10,28 
    L 15,26 L 25,26 L 40,3 L 70,3 L 90,26 L 100,26 L 105,28 
    L 95,28 Q 92,22 88,28 L 22,28 Q 19,22 15,28 Z
    M 42,3 L 48,0 L 68,0 L 70,3
    M 75,6 L 98,24 L 100,26 L 90,26 L 72,10 Z
    M 48,10 L 48,18 L 70,18 L 75,10 Z
    M 35,20 L 45,20 L 45,24 L 35,24 Z
  `,
  // Hypercar - extreme angles, futuristic
  hyper: `
    M 15,28 
    L 20,25 L 30,25 L 50,0 L 80,0 L 105,25 L 115,25 L 120,28 
    L 108,28 Q 105,20 100,28 L 30,28 Q 27,20 22,28 Z
    M 52,0 L 60,-5 L 78,-5 L 80,0
    M 85,3 L 112,23 L 115,25 L 105,25 L 82,8 Z
    M 55,8 L 55,18 L 85,18 L 92,8 Z
    M 40,18 L 52,18 L 52,23 L 40,23 Z
    M 90,12 L 100,12 L 105,18 L 88,18 Z
  `,
  // Cybertruck - angular, geometric
  cyber: `
    M 0,30 
    L 10,30 L 15,8 L 75,8 L 65,30 L 95,5 L 95,30 L 100,30 
    L 100,32 L 0,32 Z
    M 18,8 L 20,4 L 70,4 L 75,8
    M 20,12 L 60,12 L 58,25 L 22,25 Z
    M 85,28 Q 88,24 92,28 M 8,28 Q 11,24 14,28
  `,
  // Formula 1 - open wheel, extreme aero
  f1: `
    M 0,22 L 5,22 L 5,18 L 20,18 L 25,10 L 70,10 L 75,18 L 95,18 L 95,22 L 100,22 
    L 100,25 L 95,25 L 95,28 L 80,28 L 80,22 L 20,22 L 20,28 L 5,28 L 5,25 L 0,25 Z
    M 30,10 L 35,2 L 65,2 L 70,10
    M 40,2 L 40,0 L 60,0 L 60,2
    M 78,12 L 92,12 L 95,18 L 75,18 Z
    M 5,12 L 22,12 L 25,18 L 5,18 Z
    M 3,20 Q 6,16 9,20 M 90,20 Q 93,16 96,20
  `,
  // Pickup truck - utility style
  pickup: `
    M 0,30 
    L 5,30 L 5,18 L 12,8 L 35,8 L 40,18 L 70,18 L 70,30 L 80,30 
    L 80,32 L 0,32 Z
    M 14,8 L 16,4 L 33,4 L 35,8
    M 15,8 L 15,16 L 32,16 L 32,8
    M 42,18 L 68,18 L 68,28 L 42,28 Z
    M 70,28 Q 73,24 76,28 M 8,28 Q 11,24 14,28
  `,
  // Classic roadster - vintage style
  roadster: `
    M 5,28 
    L 10,25 L 20,25 L 25,15 L 50,15 L 55,25 L 65,25 L 70,28 
    L 60,28 Q 57,24 53,28 L 17,28 Q 14,24 10,28 Z
    M 27,15 L 30,10 L 47,10 L 50,15
    M 30,15 L 30,22 L 45,22 L 45,15 Z
  `,
  // Monster truck - huge wheels
  monster: `
    M 0,35 
    L 5,35 L 8,20 L 15,15 L 55,15 L 62,20 L 65,35 L 70,35 
    L 70,38 L 0,38 Z
    M 17,15 L 20,10 L 50,10 L 53,15
    M 5,32 Q 12,22 19,32 M 51,32 Q 58,22 65,32
    M 20,15 L 20,25 L 50,25 L 50,15 Z
  `
};

export const ALL_CARS: CarModel[] = [
  // STARTER (0 WPM) - Basic engines - 6 cars
  { id: 'c1', name: 'Neon Hatch', type: 'starter', requiredWpm: 0, color: '#05d9e8', pathData: CAR_SHAPES.hatchback, engineType: 'electric' },
  { id: 'c2', name: 'Basic Sedan', type: 'starter', requiredWpm: 0, color: '#ff2a6d', pathData: CAR_SHAPES.sedan, engineType: 'v8' },
  { id: 'c3', name: 'City Cruiser', type: 'starter', requiredWpm: 0, color: '#00ff9f', pathData: CAR_SHAPES.coupe, engineType: 'turbo' },
  { id: 'c4', name: 'Boxy SUV', type: 'starter', requiredWpm: 0, color: '#f7ff00', pathData: CAR_SHAPES.suv, engineType: 'v8' },
  { id: 'c5', name: 'Retro Runner', type: 'starter', requiredWpm: 0, color: '#e0e0e0', pathData: CAR_SHAPES.muscle, engineType: 'v8' },
  { id: 'c6', name: 'First Pickup', type: 'starter', requiredWpm: 0, color: '#8b4513', pathData: CAR_SHAPES.pickup, engineType: 'v8' },

  // AMATEUR (20-50 WPM) - V8s and Turbos - 6 cars
  { id: 'c7', name: 'Street King', type: 'muscle', requiredWpm: 20, color: '#ff5722', pathData: CAR_SHAPES.muscle, engineType: 'v8' },
  { id: 'c8', name: 'Drifter', type: 'muscle', requiredWpm: 25, color: '#9c27b0', pathData: CAR_SHAPES.coupe, engineType: 'turbo' },
  { id: 'c9', name: 'Hot Rod', type: 'muscle', requiredWpm: 30, color: '#ffc107', pathData: CAR_SHAPES.muscle, engineType: 'v8' },
  { id: 'c10', name: 'Interceptor', type: 'muscle', requiredWpm: 35, color: '#2196f3', pathData: CAR_SHAPES.sedan, engineType: 'v8' },
  { id: 'c11', name: 'Rally Beast', type: 'muscle', requiredWpm: 40, color: '#4caf50', pathData: CAR_SHAPES.hatchback, engineType: 'turbo' },
  { id: 'c12', name: 'Desert Storm', type: 'muscle', requiredWpm: 50, color: '#d2691e', pathData: CAR_SHAPES.pickup, engineType: 'turbo' },

  // INTERMEDIATE (55-75 WPM) - Mixed engines - 6 cars
  { id: 'c13', name: 'Classic Roadster', type: 'speedster', requiredWpm: 55, color: '#dc143c', pathData: CAR_SHAPES.roadster, engineType: 'v8' },
  { id: 'c14', name: 'Aero Sport', type: 'speedster', requiredWpm: 60, color: '#00bcd4', pathData: CAR_SHAPES.sport, engineType: 'turbo' },
  { id: 'c15', name: 'Midnight Blue', type: 'speedster', requiredWpm: 65, color: '#191970', pathData: CAR_SHAPES.coupe, engineType: 'v12' },
  { id: 'c16', name: 'GT Racer', type: 'speedster', requiredWpm: 70, color: '#e91e63', pathData: CAR_SHAPES.sport, engineType: 'v12' },
  { id: 'c17', name: 'Chrome Beast', type: 'speedster', requiredWpm: 73, color: '#c0c0c0', pathData: CAR_SHAPES.monster, engineType: 'v8' },
  { id: 'c18', name: 'Sunset Orange', type: 'speedster', requiredWpm: 75, color: '#ff8c00', pathData: CAR_SHAPES.sport, engineType: 'turbo' },

  // PRO (80-100 WPM) - V12s and Electrics - 6 cars
  { id: 'c19', name: 'Prototype X', type: 'cyber', requiredWpm: 80, color: '#673ab7', pathData: CAR_SHAPES.super, engineType: 'v12' },
  { id: 'c20', name: 'Sonic Boom', type: 'cyber', requiredWpm: 85, color: '#3f51b5', pathData: CAR_SHAPES.super, engineType: 'turbo' },
  { id: 'c21', name: 'Vapor Wave', type: 'cyber', requiredWpm: 90, color: '#ff00ff', pathData: CAR_SHAPES.sport, engineType: 'electric' },
  { id: 'c22', name: 'Cyber Truck', type: 'cyber', requiredWpm: 95, color: '#808080', pathData: CAR_SHAPES.cyber, engineType: 'electric' },
  { id: 'c23', name: 'Neon Demon', type: 'cyber', requiredWpm: 98, color: '#39ff14', pathData: CAR_SHAPES.super, engineType: 'electric' },
  { id: 'c24', name: 'Carbon King', type: 'cyber', requiredWpm: 100, color: '#1c1c1c', pathData: CAR_SHAPES.f1, engineType: 'v12' },

  // ELITE (110-150 WPM) - High-end V12s - 6 cars
  { id: 'c25', name: 'Lambo V12', type: 'hyper', requiredWpm: 110, color: '#f7ff00', pathData: CAR_SHAPES.super, engineType: 'v12' },
  { id: 'c26', name: 'Ferrari Red', type: 'hyper', requiredWpm: 120, color: '#ff0000', pathData: CAR_SHAPES.super, engineType: 'v12' },
  { id: 'c27', name: 'McLaren P1', type: 'hyper', requiredWpm: 130, color: '#ff6600', pathData: CAR_SHAPES.hyper, engineType: 'v12' },
  { id: 'c28', name: 'Rose Gold', type: 'hyper', requiredWpm: 135, color: '#b76e79', pathData: CAR_SHAPES.hyper, engineType: 'electric' },
  { id: 'c29', name: 'Formula Zero', type: 'hyper', requiredWpm: 140, color: '#f44336', pathData: CAR_SHAPES.f1, engineType: 'v12' },
  { id: 'c30', name: 'Emerald Flash', type: 'hyper', requiredWpm: 150, color: '#50c878', pathData: CAR_SHAPES.hyper, engineType: 'electric' },

  // LEGENDARY (175-300+ WPM) - Ultimate machines - 6 cars
  { id: 'c31', name: 'Bugatti Speed', type: 'legend', requiredWpm: 175, color: '#1a237e', pathData: CAR_SHAPES.hyper, engineType: 'v12' },
  { id: 'c32', name: 'Koenigsegg', type: 'legend', requiredWpm: 200, color: '#ffd700', pathData: CAR_SHAPES.hyper, engineType: 'v12' },
  { id: 'c33', name: 'Ghost Rider', type: 'legend', requiredWpm: 225, color: '#4a0080', pathData: CAR_SHAPES.hyper, engineType: 'electric' },
  { id: 'c34', name: 'Diamond Edge', type: 'legend', requiredWpm: 250, color: '#b9f2ff', pathData: CAR_SHAPES.f1, engineType: 'v12', isPremium: true },
  { id: 'c35', name: 'Warp Drive', type: 'legend', requiredWpm: 275, color: '#000000', pathData: CAR_SHAPES.hyper, engineType: 'v12', isPremium: true },
  { id: 'c36', name: 'Quantum X', type: 'legend', requiredWpm: 300, color: '#ffffff', pathData: CAR_SHAPES.hyper, engineType: 'electric', isPremium: true },
];

export function getCarById(id: string): CarModel {
  return ALL_CARS.find(c => c.id === id) || ALL_CARS[0];
}
