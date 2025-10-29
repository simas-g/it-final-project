import { useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';

import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export const useDndSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
};

