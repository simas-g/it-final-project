import { Type, FileText, Hash, ImageIcon as Image, ToggleLeft, Sparkles, Calendar, RefreshCw } from "lucide-react";

export const FIELD_TYPES = [
  { value: 'SINGLE_LINE_TEXT', label: 'Single Line Text', icon: Type, max: 3 },
  { value: 'MULTI_LINE_TEXT', label: 'Multi Line Text', icon: FileText, max: 3 },
  { value: 'NUMERIC', label: 'Number', icon: Hash, max: 3 },
  { value: 'IMAGE_URL', label: 'Image URL', icon: Image, max: 3 },
  { value: 'BOOLEAN', label: 'Yes/No (Boolean)', icon: ToggleLeft, max: 3 }
];

export const ELEMENT_TYPES = [
  { 
    value: 'FIXED_TEXT', 
    label: 'Fixed Text', 
    icon: Type,
    description: 'Static text',
    helpText: 'Enter any text (supports Unicode characters)',
    requiresValue: true,
    requiresFormat: false
  },
  { 
    value: 'RANDOM_6DIGIT', 
    label: '6-Digit Random', 
    icon: Hash,
    description: 'Random 6-digit number',
    helpText: 'Format: D6 for zero-padded (e.g., 000123), or leave empty',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'RANDOM_9DIGIT', 
    label: '9-Digit Random', 
    icon: Hash,
    description: 'Random 9-digit number',
    helpText: 'Format: D9 for zero-padded, X9 for hexadecimal',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'RANDOM_20BIT', 
    label: '20-bit Random', 
    icon: Hash,
    description: '20-bit random',
    helpText: 'Format: D7 for zero-padded decimal, X5 for hexadecimal',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'RANDOM_32BIT', 
    label: '32-bit Random', 
    icon: Hash,
    description: '32-bit random',
    helpText: 'Format: D10 for zero-padded decimal, X8 for hexadecimal',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'GUID', 
    label: 'GUID', 
    icon: Sparkles,
    description: 'UUID',
    helpText: 'Generates a standard UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)',
    requiresValue: false,
    requiresFormat: false
  },
  { 
    value: 'DATE_TIME', 
    label: 'Date/Time', 
    icon: Calendar,
    description: 'Creation timestamp',
    helpText: 'Format examples: yyyy (year), MM (month), dd (day), HH (hour), mm (minute), ss (second). Example: yyyyMMdd gives 20251015',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'SEQUENCE', 
    label: 'Sequence', 
    icon: RefreshCw,
    description: 'Auto-increment',
    helpText: 'Format: D4 for zero-padded (e.g., 0001, 0002)',
    requiresValue: false,
    requiresFormat: true
  }
];

