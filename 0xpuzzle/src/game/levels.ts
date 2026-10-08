import { PuzzleLevel, PuzzleSwitchData, PuzzleDialData } from './types';

export const PUZZLE_LEVELS: PuzzleLevel[] = [
  // ==========================================
  // LEVEL 1: 4-BIT BINARY BASICS
  // ==========================================
  {
    id: 1,
    title: 'Level 1: Nibble Genesis',
    subtitle: '4-Bit Binary Representation',
    category: 'binary',
    difficulty: 'Intro',
    targetDescription: 'Configure the 4-bit switches to equal decimal 11 (0b1011).',
    hintTitle: 'Understanding 4-Bit Binary',
    hintExplanation: 'Binary is base-2. Each position from right to left represents a power of 2: 1, 2, 4, 8. When a switch is ON (1), add its weight. When OFF (0), its weight is 0.',
    hintRules: [
      'Bit 3 = 8',
      'Bit 2 = 4',
      'Bit 1 = 2',
      'Bit 0 = 1',
      'Formula: 8×b3 + 4×b2 + 2×b1 + 1×b0',
      'Target: 8 + 2 + 1 = 11 (0b1011)'
    ],
    hintTable: [
      { key: 'Bit 3 (Weight 8)', val: '1 (Active: +8)' },
      { key: 'Bit 2 (Weight 4)', val: '0 (Inactive: +0)' },
      { key: 'Bit 1 (Weight 2)', val: '1 (Active: +2)' },
      { key: 'Bit 0 (Weight 1)', val: '1 (Active: +1)' },
      { key: 'Total Sum', val: '8 + 0 + 2 + 1 = 11' }
    ],
    parMoves: 4,
    parTime: 25,
    playerSpawn: { x: 80, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 960, height: 60, type: 'solid', color: '#1e293b' },
      { x: 220, y: 410, width: 140, height: 16, type: 'solid', label: 'Tier 1' },
      { x: 440, y: 340, width: 140, height: 16, type: 'solid', label: 'Tier 2' },
      { x: 640, y: 410, width: 140, height: 16, type: 'solid', label: 'Tier 1' }
    ],
    switches: [
      { id: 'l1-b3', label: 'Bit 3', subLabel: 'val: 8', weight: 8, value: 0, x: 250, y: 350, width: 64, height: 56, color: '#38bdf8' },
      { id: 'l1-b2', label: 'Bit 2', subLabel: 'val: 4', weight: 4, value: 0, x: 470, y: 280, width: 64, height: 56, color: '#38bdf8' },
      { id: 'l1-b1', label: 'Bit 1', subLabel: 'val: 2', weight: 2, value: 0, x: 670, y: 350, width: 64, height: 56, color: '#38bdf8' },
      { id: 'l1-b0', label: 'Bit 0', subLabel: 'val: 1', weight: 1, value: 0, x: 380, y: 460, width: 64, height: 56, color: '#38bdf8' }
    ],
    dials: [],
    exitGate: { x: 870, y: 410, width: 64, height: 110 },
    laserBarrier: { x: 835, y: 350, width: 14, height: 170 },
    evaluate: (switches: PuzzleSwitchData[]) => {
      const b3 = switches.find(s => s.id === 'l1-b3')?.value || 0;
      const b2 = switches.find(s => s.id === 'l1-b2')?.value || 0;
      const b1 = switches.find(s => s.id === 'l1-b1')?.value || 0;
      const b0 = switches.find(s => s.id === 'l1-b0')?.value || 0;
      const currentVal = b3 * 8 + b2 * 4 + b1 * 2 + b0 * 1;
      const targetVal = 11;
      const isSolved = currentVal === targetVal;
      const binStr = `0b${b3}${b2}${b1}${b0}`;

      return {
        isSolved,
        currentValueText: `${binStr} (${currentVal})`,
        targetValueText: `0b1011 (11)`,
        matchDetails: isSolved ? 'Perfect match! Laser barrier deactivated.' : `Sum is ${currentVal}. Need 11 (${b3 * 8} + ${b2 * 4} + ${b1 * 2} + ${b0 * 1})`,
        percentMatch: isSolved ? 100 : Math.max(0, Math.min(90, Math.round((1 - Math.abs(currentVal - targetVal) / targetVal) * 100)))
      };
    }
  },

  // ==========================================
  // LEVEL 2: 8-BIT BYTE EXPANSION
  // ==========================================
  {
    id: 2,
    title: 'Level 2: The Byte Chamber',
    subtitle: '8-Bit Byte Protocol (0 to 255)',
    category: 'binary',
    difficulty: 'Apprentice',
    targetDescription: 'Configure 8-bit switches to match decimal 165 (0b10100101).',
    hintTitle: '8-Bit Byte Architecture',
    hintExplanation: 'A byte consists of 8 bits. The positional weights are: 128, 64, 32, 16, 8, 4, 2, 1. To reach 165: find the largest powers of 2 that fit.',
    hintRules: [
      '165 - 128 = 37 (Turn on bit 128)',
      '37 - 32 = 5 (Turn on bit 32)',
      '5 - 4 = 1 (Turn on bit 4)',
      '1 - 1 = 0 (Turn on bit 1)',
      'Active bits: 128 + 32 + 4 + 1 = 165',
      'Binary: 0b10100101'
    ],
    hintTable: [
      { key: 'Bit 7 (128)', val: '1 (Active)' },
      { key: 'Bit 6 (64)', val: '0' },
      { key: 'Bit 5 (32)', val: '1 (Active)' },
      { key: 'Bit 4 (16)', val: '0' },
      { key: 'Bit 3 (8)', val: '0' },
      { key: 'Bit 2 (4)', val: '1 (Active)' },
      { key: 'Bit 1 (2)', val: '0' },
      { key: 'Bit 0 (1)', val: '1 (Active)' }
    ],
    parMoves: 6,
    parTime: 40,
    playerSpawn: { x: 70, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 960, height: 60, type: 'solid', color: '#1e293b' },
      { x: 160, y: 390, width: 300, height: 16, type: 'solid', label: 'High Nibble Tier' },
      { x: 500, y: 390, width: 300, height: 16, type: 'solid', label: 'Low Nibble Tier' }
    ],
    switches: [
      // High tier (Bits 7..4)
      { id: 'l2-b7', label: 'Bit 7', subLabel: '128', weight: 128, value: 0, x: 170, y: 330, width: 56, height: 56, color: '#818cf8' },
      { id: 'l2-b6', label: 'Bit 6', subLabel: '64', weight: 64, value: 0, x: 245, y: 330, width: 56, height: 56, color: '#818cf8' },
      { id: 'l2-b5', label: 'Bit 5', subLabel: '32', weight: 32, value: 0, x: 320, y: 330, width: 56, height: 56, color: '#818cf8' },
      { id: 'l2-b4', label: 'Bit 4', subLabel: '16', weight: 16, value: 0, x: 395, y: 330, width: 56, height: 56, color: '#818cf8' },
      // Low tier (Bits 3..0)
      { id: 'l2-b3', label: 'Bit 3', subLabel: '8', weight: 8, value: 0, x: 510, y: 330, width: 56, height: 56, color: '#38bdf8' },
      { id: 'l2-b2', label: 'Bit 2', subLabel: '4', weight: 4, value: 0, x: 585, y: 330, width: 56, height: 56, color: '#38bdf8' },
      { id: 'l2-b1', label: 'Bit 1', subLabel: '2', weight: 2, value: 0, x: 660, y: 330, width: 56, height: 56, color: '#38bdf8' },
      { id: 'l2-b0', label: 'Bit 0', subLabel: '1', weight: 1, value: 0, x: 735, y: 330, width: 56, height: 56, color: '#38bdf8' }
    ],
    dials: [],
    exitGate: { x: 870, y: 410, width: 64, height: 110 },
    laserBarrier: { x: 835, y: 350, width: 14, height: 170 },
    evaluate: (switches: PuzzleSwitchData[]) => {
      let sum = 0;
      let binStr = '';
      for (let i = 7; i >= 0; i--) {
        const sw = switches.find(s => s.id === `l2-b${i}`);
        const v = sw?.value || 0;
        sum += v * (sw?.weight || 0);
        binStr += v;
      }
      const targetVal = 165;
      const isSolved = sum === targetVal;

      return {
        isSolved,
        currentValueText: `0b${binStr} (${sum})`,
        targetValueText: `0b10100101 (165)`,
        matchDetails: isSolved ? 'Byte verified! Laser barrier dissolved.' : `Current byte sum: ${sum}. Target: 165 (Diff: ${Math.abs(sum - targetVal)})`,
        percentMatch: isSolved ? 100 : Math.max(0, Math.min(95, Math.round((1 - Math.abs(sum - targetVal) / 255) * 100)))
      };
    }
  },

  // ==========================================
  // LEVEL 3: HEXADECIMAL DIAL (0x0 to 0xF)
  // ==========================================
  {
    id: 3,
    title: 'Level 3: Hexadecimal Genesis',
    subtitle: 'Base-16 Symbols (0..9, A..F)',
    category: 'hex',
    difficulty: 'Apprentice',
    targetDescription: 'Dial Pedestal Alpha to decimal 13 (0xD) and Pedestal Beta to decimal 15 (0xF).',
    hintTitle: 'Hexadecimal Digits (0 to F)',
    hintExplanation: 'Hexadecimal uses 16 symbols. Digits 0 through 9 are normal numbers. For 10 through 15, we use letters: A=10, B=11, C=12, D=13, E=14, F=15.',
    hintRules: [
      'A = 10',
      'B = 11',
      'C = 12',
      'D = 13 (Pedestal Alpha)',
      'E = 14',
      'F = 15 (Pedestal Beta)'
    ],
    hintTable: [
      { key: '0x0 to 0x9', val: 'Dec 0 to 9' },
      { key: '0xA', val: 'Dec 10' },
      { key: '0xB', val: 'Dec 11' },
      { key: '0xC', val: 'Dec 12' },
      { key: '0xD', val: 'Dec 13 (Target Alpha)' },
      { key: '0xE', val: 'Dec 14' },
      { key: '0xF', val: 'Dec 15 (Target Beta)' }
    ],
    parMoves: 6,
    parTime: 30,
    playerSpawn: { x: 70, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 960, height: 60, type: 'solid', color: '#1e293b' },
      { x: 260, y: 400, width: 170, height: 16, type: 'solid', label: 'Pedestal Alpha Base' },
      { x: 550, y: 400, width: 170, height: 16, type: 'solid', label: 'Pedestal Beta Base' }
    ],
    switches: [],
    dials: [
      { id: 'l3-d1', label: 'Dial Alpha', subLabel: 'Target: 13', min: 0, max: 15, step: 1, value: 0, format: 'hex', x: 295, y: 330, width: 90, height: 64, color: '#c084fc' },
      { id: 'l3-d2', label: 'Dial Beta', subLabel: 'Target: 15', min: 0, max: 15, step: 1, value: 0, format: 'hex', x: 585, y: 330, width: 90, height: 64, color: '#f43f5e' }
    ],
    exitGate: { x: 870, y: 410, width: 64, height: 110 },
    laserBarrier: { x: 835, y: 350, width: 14, height: 170 },
    evaluate: (_switches: PuzzleSwitchData[], dials: PuzzleDialData[]) => {
      const d1 = dials.find(d => d.id === 'l3-d1')?.value ?? 0;
      const d2 = dials.find(d => d.id === 'l3-d2')?.value ?? 0;
      const hex1 = d1.toString(16).toUpperCase();
      const hex2 = d2.toString(16).toUpperCase();
      const isSolved = d1 === 13 && d2 === 15;

      return {
        isSolved,
        currentValueText: `Alpha: 0x${hex1} (${d1}) · Beta: 0x${hex2} (${d2})`,
        targetValueText: `Alpha: 0xD (13) · Beta: 0xF (15)`,
        matchDetails: isSolved ? 'Both dials calibrated! Gate unlocked.' : `Dial Alpha: 0x${hex1} (need 0xD/13), Beta: 0x${hex2} (need 0xF/15)`,
        percentMatch: (d1 === 13 ? 50 : 0) + (d2 === 15 ? 50 : 0)
      };
    }
  },

  // ==========================================
  // LEVEL 4: HEX BYTE TRANSCEIVER (Two Nibbles)
  // ==========================================
  {
    id: 4,
    title: 'Level 4: Hex Byte Transceiver',
    subtitle: 'Dual Nibble Composition (16×High + Low)',
    category: 'hex',
    difficulty: 'Operator',
    targetDescription: 'Dial the High and Low nibbles to produce decimal 186 (Hex 0xBA).',
    hintTitle: 'Two-Digit Hexadecimal Formula',
    hintExplanation: 'A two-digit hex number 0xXY equals: (X × 16) + Y. Here, 186 divided by 16 is 11 with remainder 10. Since 11 is B and 10 is A, 186 = 0xBA.',
    hintRules: [
      'High Digit (16s weight): B = 11 (11 × 16 = 176)',
      'Low Digit (1s weight): A = 10 (10 × 1 = 10)',
      'Formula: (High × 16) + Low = 176 + 10 = 186',
      'Target: 0xBA'
    ],
    hintTable: [
      { key: 'Decimal Target', val: '186' },
      { key: '186 / 16 (Quotient)', val: '11 = B (High Nibble)' },
      { key: '186 % 16 (Remainder)', val: '10 = A (Low Nibble)' },
      { key: 'Hex Result', val: '0xBA' }
    ],
    parMoves: 8,
    parTime: 40,
    playerSpawn: { x: 70, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 960, height: 60, type: 'solid', color: '#1e293b' },
      { x: 220, y: 390, width: 220, height: 16, type: 'solid', label: 'High Nibble (×16)' },
      { x: 520, y: 390, width: 220, height: 16, type: 'solid', label: 'Low Nibble (×1)' }
    ],
    switches: [],
    dials: [
      { id: 'l4-high', label: 'High Nibble', subLabel: 'Weight: ×16', min: 0, max: 15, step: 1, value: 0, format: 'hex', x: 275, y: 320, width: 100, height: 64, color: '#f59e0b' },
      { id: 'l4-low', label: 'Low Nibble', subLabel: 'Weight: ×1', min: 0, max: 15, step: 1, value: 0, format: 'hex', x: 575, y: 320, width: 100, height: 64, color: '#38bdf8' }
    ],
    exitGate: { x: 870, y: 410, width: 64, height: 110 },
    laserBarrier: { x: 835, y: 350, width: 14, height: 170 },
    evaluate: (_switches: PuzzleSwitchData[], dials: PuzzleDialData[]) => {
      const high = dials.find(d => d.id === 'l4-high')?.value ?? 0;
      const low = dials.find(d => d.id === 'l4-low')?.value ?? 0;
      const total = high * 16 + low;
      const highHex = high.toString(16).toUpperCase();
      const lowHex = low.toString(16).toUpperCase();
      const isSolved = high === 11 && low === 10;

      return {
        isSolved,
        currentValueText: `0x${highHex}${lowHex} (${total})`,
        targetValueText: `0xBA (186)`,
        matchDetails: isSolved ? 'Transceiver locked on 0xBA! Barrier offline.' : `Current: 0x${highHex}${lowHex} = ${total}. High: ${highHex} (${high * 16}), Low: ${lowHex} (${low})`,
        percentMatch: isSolved ? 100 : Math.max(0, Math.min(95, Math.round((1 - Math.abs(total - 186) / 255) * 100)))
      };
    }
  },

  // ==========================================
  // LEVEL 5: LOGIC GATE MATRIX (AND & OR)
  // ==========================================
  {
    id: 5,
    title: 'Level 5: Logic Gate Matrix',
    subtitle: 'Boolean Logic & Circuit Routing',
    category: 'logic',
    difficulty: 'Operator',
    targetDescription: 'Route power so AND Gate outputs 1 and OR Gate outputs 0.',
    hintTitle: 'Boolean Truth Tables',
    hintExplanation: 'AND gate outputs 1 only when BOTH inputs are 1. OR gate outputs 1 if ANY input is 1 (so to output 0, BOTH inputs must be 0).',
    hintRules: [
      'Circuit 1 (AND): Needs Input A = 1 AND Input B = 1 -> Output = 1',
      'Circuit 2 (OR): Needs Input C = 0 AND Input D = 0 -> Output = 0',
      'Both gate requirements must be fulfilled to deactivate dual magnetic latches.'
    ],
    hintTable: [
      { key: 'AND Gate (A & B)', val: '1 & 1 = 1 (Goal: 1)' },
      { key: 'OR Gate (C | D)', val: '0 | 0 = 0 (Goal: 0)' }
    ],
    parMoves: 4,
    parTime: 35,
    playerSpawn: { x: 70, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 960, height: 60, type: 'solid', color: '#1e293b' },
      { x: 160, y: 390, width: 280, height: 16, type: 'solid', label: 'AND Gate Circuit' },
      { x: 480, y: 390, width: 280, height: 16, type: 'solid', label: 'OR Gate Circuit' }
    ],
    switches: [
      { id: 'l5-a', label: 'In A', subLabel: 'AND in 1', weight: 1, value: 0, x: 190, y: 330, width: 60, height: 56, color: '#10b981' },
      { id: 'l5-b', label: 'In B', subLabel: 'AND in 2', weight: 1, value: 0, x: 290, y: 330, width: 60, height: 56, color: '#10b981' },
      { id: 'l5-c', label: 'In C', subLabel: 'OR in 1', weight: 1, value: 1, x: 510, y: 330, width: 60, height: 56, color: '#f43f5e' },
      { id: 'l5-d', label: 'In D', subLabel: 'OR in 2', weight: 1, value: 1, x: 610, y: 330, width: 60, height: 56, color: '#f43f5e' }
    ],
    dials: [],
    exitGate: { x: 870, y: 410, width: 64, height: 110 },
    laserBarrier: { x: 835, y: 350, width: 14, height: 170 },
    evaluate: (switches: PuzzleSwitchData[]) => {
      const a = switches.find(s => s.id === 'l5-a')?.value || 0;
      const b = switches.find(s => s.id === 'l5-b')?.value || 0;
      const c = switches.find(s => s.id === 'l5-c')?.value || 0;
      const d = switches.find(s => s.id === 'l5-d')?.value || 0;

      const andOut = (a === 1 && b === 1) ? 1 : 0;
      const orOut = (c === 1 || d === 1) ? 1 : 0;
      const isSolved = andOut === 1 && orOut === 0;

      return {
        isSolved,
        currentValueText: `AND: ${andOut} (need 1) · OR: ${orOut} (need 0)`,
        targetValueText: `AND = 1 · OR = 0`,
        matchDetails: isSolved ? 'All logic paths energized! Laser barrier lifted.' : `AND Gate is ${andOut} (A=${a}, B=${b}). OR Gate is ${orOut} (C=${c}, D=${d}).`,
        percentMatch: (andOut === 1 ? 50 : 0) + (orOut === 0 ? 50 : 0)
      };
    }
  },

  // ==========================================
  // LEVEL 6: THE XOR CIPHER
  // ==========================================
  {
    id: 6,
    title: 'Level 6: The XOR Cipher',
    subtitle: 'Bitwise Exclusive-OR Operator',
    category: 'logic',
    difficulty: 'Specialist',
    targetDescription: 'Solve Key (0b1100) ⊕ Input = Target (0b1001). Set input switches.',
    hintTitle: 'Bitwise XOR Mechanics',
    hintExplanation: 'Exclusive-OR (XOR) outputs 1 if the bits differ, and 0 if they are identical. Crucial property: If Key ⊕ Input = Target, then Input = Key ⊕ Target!',
    hintRules: [
      '1 ⊕ 0 = 1',
      '0 ⊕ 1 = 1',
      '1 ⊕ 1 = 0',
      '0 ⊕ 0 = 0',
      'Bit 3: 1 ⊕ X = 1 -> X = 0',
      'Bit 2: 1 ⊕ X = 0 -> X = 1',
      'Bit 1: 0 ⊕ X = 0 -> X = 0',
      'Bit 0: 0 ⊕ X = 1 -> X = 1',
      'Solution Input: 0b0101 (Decimal 5)'
    ],
    hintTable: [
      { key: 'Key', val: '1 1 0 0' },
      { key: 'Target Output', val: '1 0 0 1' },
      { key: 'Required Input', val: '0 1 0 1' }
    ],
    parMoves: 4,
    parTime: 40,
    playerSpawn: { x: 70, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 960, height: 60, type: 'solid', color: '#1e293b' },
      { x: 200, y: 400, width: 440, height: 16, type: 'solid', label: 'XOR Input Register [X3 X2 X1 X0]' }
    ],
    switches: [
      { id: 'l6-x3', label: 'X3', subLabel: 'Weight: 8', weight: 8, value: 0, x: 230, y: 340, width: 64, height: 56, color: '#a855f7' },
      { id: 'l6-x2', label: 'X2', subLabel: 'Weight: 4', weight: 4, value: 0, x: 330, y: 340, width: 64, height: 56, color: '#a855f7' },
      { id: 'l6-x1', label: 'X1', subLabel: 'Weight: 2', weight: 2, value: 0, x: 430, y: 340, width: 64, height: 56, color: '#a855f7' },
      { id: 'l6-x0', label: 'X0', subLabel: 'Weight: 1', weight: 1, value: 0, x: 530, y: 340, width: 64, height: 56, color: '#a855f7' }
    ],
    dials: [],
    exitGate: { x: 870, y: 410, width: 64, height: 110 },
    laserBarrier: { x: 835, y: 350, width: 14, height: 170 },
    evaluate: (switches: PuzzleSwitchData[]) => {
      const x3 = switches.find(s => s.id === 'l6-x3')?.value || 0;
      const x2 = switches.find(s => s.id === 'l6-x2')?.value || 0;
      const x1 = switches.find(s => s.id === 'l6-x1')?.value || 0;
      const x0 = switches.find(s => s.id === 'l6-x0')?.value || 0;

      // Key = 1 1 0 0
      const r3 = 1 ^ x3;
      const r2 = 1 ^ x2;
      const r1 = 0 ^ x1;
      const r0 = 0 ^ x0;

      // Target = 1 0 0 1
      const isSolved = r3 === 1 && r2 === 0 && r1 === 0 && r0 === 1;

      return {
        isSolved,
        currentValueText: `Result: 0b${r3}${r2}${r1}${r0} (Input: ${x3}${x2}${x1}${x0})`,
        targetValueText: `Target: 0b1001 (from Key 0b1100)`,
        matchDetails: isSolved ? 'Cipher deciphered! XOR parity validated.' : `Current output: 0b${r3}${r2}${r1}${r0}. Expected: 0b1001.`,
        percentMatch: ((r3 === 1 ? 25 : 0) + (r2 === 0 ? 25 : 0) + (r1 === 0 ? 25 : 0) + (r0 === 1 ? 25 : 0))
      };
    }
  },

  // ==========================================
  // LEVEL 7: HEX RGB COLOR SYNTHESIZER
  // ==========================================
  {
    id: 7,
    title: 'Level 7: Hex RGB Color Synthesizer',
    subtitle: 'Color Byte Encoding (#RRGGBB)',
    category: 'color',
    difficulty: 'Specialist',
    targetDescription: 'Dial the color bytes to synthesize Cyber Violet #8000FF (R: 0x80, G: 0x00, B: 0xFF).',
    hintTitle: 'Hex Color Codes (#RRGGBB)',
    hintExplanation: 'Web colors use 6 hex digits: two for Red, two for Green, two for Blue. 0x00 is minimum (0), 0x80 is midpoint (128), and 0xFF is maximum (255).',
    hintRules: [
      'Red (R) Dial: 0x80 (Decimal 128)',
      'Green (G) Dial: 0x00 (Decimal 0)',
      'Blue (B) Dial: 0xFF (Decimal 255)',
      'Combined color: #8000FF (Rich Cyber Violet)'
    ],
    hintTable: [
      { key: 'Red Byte', val: '0x80 (128)' },
      { key: 'Green Byte', val: '0x00 (0)' },
      { key: 'Blue Byte', val: '0xFF (255)' },
      { key: 'Hex String', val: '#8000FF' }
    ],
    parMoves: 8,
    parTime: 45,
    playerSpawn: { x: 70, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 960, height: 60, type: 'solid', color: '#1e293b' },
      { x: 180, y: 400, width: 140, height: 16, type: 'solid', label: 'Red Channel' },
      { x: 380, y: 400, width: 140, height: 16, type: 'solid', label: 'Green Channel' },
      { x: 580, y: 400, width: 140, height: 16, type: 'solid', label: 'Blue Channel' }
    ],
    switches: [],
    dials: [
      { id: 'l7-r', label: 'Red (R)', subLabel: 'Target: 0x80', min: 0, max: 255, step: 32, value: 0, format: 'byte-hex', x: 205, y: 330, width: 90, height: 64, color: '#ef4444' },
      { id: 'l7-g', label: 'Green (G)', subLabel: 'Target: 0x00', min: 0, max: 255, step: 32, value: 128, format: 'byte-hex', x: 405, y: 330, width: 90, height: 64, color: '#10b981' },
      { id: 'l7-b', label: 'Blue (B)', subLabel: 'Target: 0xFF', min: 0, max: 255, step: 32, value: 0, format: 'byte-hex', x: 605, y: 330, width: 90, height: 64, color: '#3b82f6' }
    ],
    exitGate: { x: 870, y: 410, width: 64, height: 110 },
    laserBarrier: { x: 835, y: 350, width: 14, height: 170 },
    evaluate: (_switches: PuzzleSwitchData[], dials: PuzzleDialData[]) => {
      // Allow Red to be 128 (0x80)
      // Allow Green to be 0 (0x00)
      // Allow Blue to be 255 or 256 or 240/255
      const r = dials.find(d => d.id === 'l7-r')?.value ?? 0;
      const g = dials.find(d => d.id === 'l7-g')?.value ?? 0;
      const b = dials.find(d => d.id === 'l7-b')?.value ?? 0;

      const rHex = Math.min(255, r).toString(16).padStart(2, '0').toUpperCase();
      const gHex = Math.min(255, g).toString(16).padStart(2, '0').toUpperCase();
      const bHex = Math.min(255, b).toString(16).padStart(2, '0').toUpperCase();
      const currentColor = `#${rHex}${gHex}${bHex}`;

      // Target: R=128 (0x80), G=0 (0x00), B=255 (or closest step >= 224)
      const isSolved = (r === 128) && (g === 0) && (b >= 224);

      return {
        isSolved,
        currentValueText: `${currentColor} (R:${r} G:${g} B:${b})`,
        targetValueText: `#8000FF (R:128 G:0 B:255)`,
        matchDetails: isSolved ? 'Prism resonance achieved! Gateway energized.' : `Current: ${currentColor}. R=${rHex} (need 80), G=${gHex} (need 00), B=${bHex} (need FF).`,
        percentMatch: isSolved ? 100 : Math.round(((r === 128 ? 33 : 0) + (g === 0 ? 33 : 0) + (b >= 224 ? 34 : 0))),
        colorPreview: currentColor
      };
    }
  },

  // ==========================================
  // LEVEL 8: BINARY HALF-ADDER
  // ==========================================
  {
    id: 8,
    title: 'Level 8: Binary Half-Adder',
    subtitle: 'Binary Arithmetic & Carry Registers',
    category: 'arithmetic',
    difficulty: 'Specialist',
    targetDescription: 'Add Operand A (0b0110 = 6) and Operand B (0b0111 = 7). Configure 5-bit Sum Register.',
    hintTitle: 'Binary Addition Mechanics',
    hintExplanation: 'Adding numbers in binary follows: 0+0=0, 0+1=1, 1+1=10 (0 with carry 1), 1+1+1=11 (1 with carry 1). Here: 6 + 7 = 13. In 5-bit binary: 13 = 8 + 4 + 1 -> 0b01101.',
    hintRules: [
      'Operand A: 6 (0b0110)',
      'Operand B: 7 (0b0111)',
      'Decimal Sum: 6 + 7 = 13',
      'Binary Sum (5-bit): 0b01101 (16=0, 8=1, 4=1, 2=0, 1=1)'
    ],
    hintTable: [
      { key: 'Bit 4 (16)', val: '0' },
      { key: 'Bit 3 (8)', val: '1 (Active)' },
      { key: 'Bit 2 (4)', val: '1 (Active)' },
      { key: 'Bit 1 (2)', val: '0' },
      { key: 'Bit 0 (1)', val: '1 (Active)' },
      { key: 'Sum', val: '8 + 4 + 1 = 13' }
    ],
    parMoves: 5,
    parTime: 40,
    playerSpawn: { x: 70, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 960, height: 60, type: 'solid', color: '#1e293b' },
      { x: 180, y: 400, width: 500, height: 16, type: 'solid', label: 'Arithmetic Unit: Result Register [S4..S0]' }
    ],
    switches: [
      { id: 'l8-s4', label: 'S4', subLabel: 'val: 16', weight: 16, value: 0, x: 210, y: 340, width: 60, height: 56, color: '#06b6d4' },
      { id: 'l8-s3', label: 'S3', subLabel: 'val: 8', weight: 8, value: 0, x: 300, y: 340, width: 60, height: 56, color: '#06b6d4' },
      { id: 'l8-s2', label: 'S2', subLabel: 'val: 4', weight: 4, value: 0, x: 390, y: 340, width: 60, height: 56, color: '#06b6d4' },
      { id: 'l8-s1', label: 'S1', subLabel: 'val: 2', weight: 2, value: 0, x: 480, y: 340, width: 60, height: 56, color: '#06b6d4' },
      { id: 'l8-s0', label: 'S0', subLabel: 'val: 1', weight: 1, value: 0, x: 570, y: 340, width: 60, height: 56, color: '#06b6d4' }
    ],
    dials: [],
    exitGate: { x: 870, y: 410, width: 64, height: 110 },
    laserBarrier: { x: 835, y: 350, width: 14, height: 170 },
    evaluate: (switches: PuzzleSwitchData[]) => {
      let sum = 0;
      let binStr = '';
      for (let i = 4; i >= 0; i--) {
        const sw = switches.find(s => s.id === `l8-s${i}`);
        const v = sw?.value || 0;
        sum += v * (sw?.weight || 0);
        binStr += v;
      }
      const targetVal = 13;
      const isSolved = sum === targetVal;

      return {
        isSolved,
        currentValueText: `0b${binStr} (${sum})`,
        targetValueText: `0b01101 (13 = 6 + 7)`,
        matchDetails: isSolved ? 'Arithmetic carry verified! Barrier dropped.' : `Current sum: ${sum}. Target is 13 (A: 6 + B: 7).`,
        percentMatch: isSolved ? 100 : Math.max(0, Math.min(95, Math.round((1 - Math.abs(sum - targetVal) / 31) * 100)))
      };
    }
  },

  // ==========================================
  // LEVEL 9: MEMORY POINTER & HEX OFFSET
  // ==========================================
  {
    id: 9,
    title: 'Level 9: Memory Pointer & Hex Offset',
    subtitle: 'Base + Offset Pointer Arithmetic',
    category: 'memory',
    difficulty: 'Master',
    targetDescription: 'Base Address is 0x0200. Target Address is 0x024D. Set 8-bit Offset switches to 77 (0x4D).',
    hintTitle: 'Pointer Addressing (Base + Offset)',
    hintExplanation: 'CPU memory access frequently adds an offset to a base pointer: Effective Address = Base + Offset. Target is 0x024D (589), Base is 0x0200 (512). The offset is 589 - 512 = 77 (0x4D = 64 + 8 + 4 + 1).',
    hintRules: [
      'Target Address: 0x024D (589)',
      'Base Address: 0x0200 (512)',
      'Required Offset: 589 - 512 = 77 (0x4D)',
      'Offset Binary: 64 + 8 + 4 + 1 = 77 (0b01001101)'
    ],
    hintTable: [
      { key: 'Bit 6 (64)', val: '1 (Active)' },
      { key: 'Bit 3 (8)', val: '1 (Active)' },
      { key: 'Bit 2 (4)', val: '1 (Active)' },
      { key: 'Bit 0 (1)', val: '1 (Active)' },
      { key: 'Total Offset', val: '64 + 8 + 4 + 1 = 77 (0x4D)' }
    ],
    parMoves: 6,
    parTime: 45,
    playerSpawn: { x: 70, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 960, height: 60, type: 'solid', color: '#1e293b' },
      { x: 140, y: 400, width: 620, height: 16, type: 'solid', label: 'Kernel Memory Offset Register [7..0]' }
    ],
    switches: [
      { id: 'l9-b7', label: 'b7', subLabel: '128', weight: 128, value: 0, x: 160, y: 340, width: 54, height: 56, color: '#eab308' },
      { id: 'l9-b6', label: 'b6', subLabel: '64', weight: 64, value: 0, x: 235, y: 340, width: 54, height: 56, color: '#eab308' },
      { id: 'l9-b5', label: 'b5', subLabel: '32', weight: 32, value: 0, x: 310, y: 340, width: 54, height: 56, color: '#eab308' },
      { id: 'l9-b4', label: 'b4', subLabel: '16', weight: 16, value: 0, x: 385, y: 340, width: 54, height: 56, color: '#eab308' },
      { id: 'l9-b3', label: 'b3', subLabel: '8', weight: 8, value: 0, x: 460, y: 340, width: 54, height: 56, color: '#eab308' },
      { id: 'l9-b2', label: 'b2', subLabel: '4', weight: 4, value: 0, x: 535, y: 340, width: 54, height: 56, color: '#eab308' },
      { id: 'l9-b1', label: 'b1', subLabel: '2', weight: 2, value: 0, x: 610, y: 340, width: 54, height: 56, color: '#eab308' },
      { id: 'l9-b0', label: 'b0', subLabel: '1', weight: 1, value: 0, x: 685, y: 340, width: 54, height: 56, color: '#eab308' }
    ],
    dials: [],
    exitGate: { x: 870, y: 410, width: 64, height: 110 },
    laserBarrier: { x: 835, y: 350, width: 14, height: 170 },
    evaluate: (switches: PuzzleSwitchData[]) => {
      let offset = 0;
      for (let i = 7; i >= 0; i--) {
        const sw = switches.find(s => s.id === `l9-b${i}`);
        offset += (sw?.value || 0) * (sw?.weight || 0);
      }
      const base = 512; // 0x0200
      const targetAddress = 589; // 0x024D
      const computedAddress = base + offset;
      const isSolved = offset === 77;

      const offsetHex = offset.toString(16).toUpperCase().padStart(2, '0');
      const addressHex = computedAddress.toString(16).toUpperCase().padStart(4, '0');

      return {
        isSolved,
        currentValueText: `0x${addressHex} (Offset: +0x${offsetHex} / ${offset})`,
        targetValueText: `0x024D (Base 0x0200 + Offset 0x4D)`,
        matchDetails: isSolved ? 'Kernel offset mapped accurately! Access granted.' : `Current address: 0x${addressHex}. Offset is ${offset} (need 77).`,
        percentMatch: isSolved ? 100 : Math.max(0, Math.min(95, Math.round((1 - Math.abs(offset - 77) / 255) * 100)))
      };
    }
  },

  // ==========================================
  // LEVEL 10: THE MASTER CITADEL CORE (FINALE)
  // ==========================================
  {
    id: 10,
    title: 'Level 10: The Master Citadel Core',
    subtitle: 'Grand Finale: Multi-Stage Binary & Hex Convergence',
    category: 'master',
    difficulty: 'Master',
    targetDescription: 'Breach the 3 Citadel Locks: Lock 1 (0b11010010 = 210), Lock 2 (Hex 0xD2 = 210), and Lock 3 (Odd Parity Bit = 1).',
    hintTitle: 'Grand Citadel Convergence Protocol',
    hintExplanation: 'The Citadel Core requires synchronized triple authentication: an 8-bit binary register matching 210, a dual-nibble Hex dial matching 0xD2, and an odd parity bit to pass the checksum verification.',
    hintRules: [
      'Lock 1 (Binary): 128 + 64 + 16 + 2 = 210 (0b11010010)',
      'Lock 2 (Hex High): D = 13 (13 × 16 = 208)',
      'Lock 2 (Hex Low): 2 = 2 (208 + 2 = 210 -> 0xD2)',
      'Lock 3 (Parity): There are four 1-bits in 11010010 (even). For ODD parity, set parity bit = 1!'
    ],
    hintTable: [
      { key: 'Binary Lock', val: '0b11010010 (Dec 210)' },
      { key: 'Hex Lock', val: '0xD2 (Dec 210)' },
      { key: 'Parity Bit', val: '1 (Ensures Odd Parity)' }
    ],
    parMoves: 8,
    parTime: 60,
    playerSpawn: { x: 70, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 960, height: 60, type: 'solid', color: '#1e293b' },
      // Tier 1: Binary register
      { x: 120, y: 410, width: 440, height: 16, type: 'solid', label: 'Lock 1: 8-Bit Binary Array' },
      // Tier 2: Hex dials & parity
      { x: 120, y: 280, width: 440, height: 16, type: 'solid', label: 'Lock 2 & 3: Hex Dials & Parity Node' },
      // Stepping platform
      { x: 600, y: 350, width: 140, height: 16, type: 'solid', label: 'Overlord Conduit' }
    ],
    switches: [
      // 8-bit array for 210: 128 + 64 + 16 + 2
      { id: 'l10-b7', label: 'b7', subLabel: '128', weight: 128, value: 0, x: 130, y: 350, width: 48, height: 56, color: '#ef4444' },
      { id: 'l10-b6', label: 'b6', subLabel: '64', weight: 64, value: 0, x: 185, y: 350, width: 48, height: 56, color: '#ef4444' },
      { id: 'l10-b5', label: 'b5', subLabel: '32', weight: 32, value: 0, x: 240, y: 350, width: 48, height: 56, color: '#ef4444' },
      { id: 'l10-b4', label: 'b4', subLabel: '16', weight: 16, value: 0, x: 295, y: 350, width: 48, height: 56, color: '#ef4444' },
      { id: 'l10-b3', label: 'b3', subLabel: '8', weight: 8, value: 0, x: 350, y: 350, width: 48, height: 56, color: '#ef4444' },
      { id: 'l10-b2', label: 'b2', subLabel: '4', weight: 4, value: 0, x: 405, y: 350, width: 48, height: 56, color: '#ef4444' },
      { id: 'l10-b1', label: 'b1', subLabel: '2', weight: 2, value: 0, x: 460, y: 350, width: 48, height: 56, color: '#ef4444' },
      { id: 'l10-b0', label: 'b0', subLabel: '1', weight: 1, value: 0, x: 515, y: 350, width: 48, height: 56, color: '#ef4444' },
      // Parity bit switch
      { id: 'l10-parity', label: 'Parity', subLabel: 'Odd Check', weight: 1, value: 0, x: 460, y: 220, width: 70, height: 56, color: '#f59e0b' }
    ],
    dials: [
      { id: 'l10-dh', label: 'Hex High', subLabel: '0x0..0xF', min: 0, max: 15, step: 1, value: 0, format: 'hex', x: 160, y: 210, width: 90, height: 64, color: '#c084fc' },
      { id: 'l10-dl', label: 'Hex Low', subLabel: '0x0..0xF', min: 0, max: 15, step: 1, value: 0, format: 'hex', x: 280, y: 210, width: 90, height: 64, color: '#c084fc' }
    ],
    exitGate: { x: 870, y: 410, width: 64, height: 110 },
    laserBarrier: { x: 835, y: 350, width: 14, height: 170 },
    evaluate: (switches: PuzzleSwitchData[], dials: PuzzleDialData[]) => {
      // 1. Binary sum
      let binSum = 0;
      for (let i = 7; i >= 0; i--) {
        const sw = switches.find(s => s.id === `l10-b${i}`);
        binSum += (sw?.value || 0) * (sw?.weight || 0);
      }
      const binOk = binSum === 210;

      // 2. Hex sum
      const dh = dials.find(d => d.id === 'l10-dh')?.value ?? 0;
      const dl = dials.find(d => d.id === 'l10-dl')?.value ?? 0;
      const hexSum = dh * 16 + dl;
      const hexOk = dh === 13 && dl === 2; // 0xD2 = 210

      // 3. Parity bit
      const parity = switches.find(s => s.id === 'l10-parity')?.value ?? 0;
      const parityOk = parity === 1;

      const isSolved = binOk && hexOk && parityOk;
      const dhHex = dh.toString(16).toUpperCase();
      const dlHex = dl.toString(16).toUpperCase();

      return {
        isSolved,
        currentValueText: `Bin: ${binSum} · Hex: 0x${dhHex}${dlHex} (${hexSum}) · Parity: ${parity}`,
        targetValueText: `Bin: 210 (0b11010010) · Hex: 0xD2 · Parity: 1`,
        matchDetails: isSolved ? 'MASTER CITADEL OVERRIDDEN! ALL GATES UNLOCKED!' : `Locks: Binary (${binOk ? 'OK' : `${binSum}/210`}), Hex (${hexOk ? 'OK' : `0x${dhHex}${dlHex}/0xD2`}), Parity (${parityOk ? 'OK' : 'Need 1'}).`,
        percentMatch: (binOk ? 40 : 0) + (hexOk ? 40 : 0) + (parityOk ? 20 : 0)
      };
    }
  }
];
