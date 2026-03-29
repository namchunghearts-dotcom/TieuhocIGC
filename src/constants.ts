export interface EcoZone {
  id: string;
  name: string;
  color: string;
  icon: string;
  sound: string;
  description: string;
  vocab: {
    word: string;
    translation: string;
    example: string;
    image: string;
  }[];
}

export const ECO_ZONES: EcoZone[] = [
  {
    id: 'forest',
    name: 'Forest',
    color: 'bg-green-400',
    icon: '🌲',
    sound: 'https://assets.mixkit.co/active_storage/sfx/2861/2861-preview.mp3', // Bird chirping
    description: 'Khu rừng xanh mát với nhiều cây cối và sinh vật.',
    vocab: [
      { word: 'Forest', translation: 'Khu rừng', example: 'The forest is green and beautiful.', image: 'https://picsum.photos/seed/forest/400/300' },
      { word: 'Tree', translation: 'Cây', example: 'The tree is very tall.', image: 'https://picsum.photos/seed/tree/400/300' },
      { word: 'Mushroom', translation: 'Nấm', example: 'Look! The mushroom is red and white.', image: 'https://picsum.photos/seed/mushroom/400/300' },
      { word: 'Grass', translation: 'Cỏ', example: 'The grass is soft and green.', image: 'https://picsum.photos/seed/grass/400/300' },
    ]
  },
  {
    id: 'volcano',
    name: 'Volcano',
    color: 'bg-red-400',
    icon: '🌋',
    sound: 'https://assets.mixkit.co/active_storage/sfx/2533/2533-preview.mp3', // Rumble/Fire
    description: 'Núi lửa đang hoạt động với dòng dung nham nóng bỏng.',
    vocab: [
      { word: 'Volcano', translation: 'Núi lửa', example: 'The volcano is very hot and dangerous.', image: 'https://picsum.photos/seed/volcano/400/300' },
      { word: 'Lava', translation: 'Dung nham', example: 'Red lava flows from the volcano.', image: 'https://picsum.photos/seed/lava/400/300' },
      { word: 'Fire', translation: 'Lửa', example: 'Be careful with the fire!', image: 'https://picsum.photos/seed/fire/400/300' },
      { word: 'Smoke', translation: 'Khói', example: 'Smoke comes from the volcano.', image: 'https://picsum.photos/seed/smoke/400/300' },
    ]
  },
  {
    id: 'ocean',
    name: 'Ocean',
    color: 'bg-blue-400',
    icon: '🌊',
    sound: 'https://assets.mixkit.co/active_storage/sfx/1121/1121-preview.mp3', // Ocean waves
    description: 'Đại dương bao la với làn nước xanh thẳm.',
    vocab: [
      { word: 'Ocean', translation: 'Đại dương', example: 'The ocean is big and blue.', image: 'https://picsum.photos/seed/ocean/400/300' },
      { word: 'Deep', translation: 'Sâu', example: 'The ocean is very deep.', image: 'https://picsum.photos/seed/deep/400/300' },
      { word: 'Blue', translation: 'Màu xanh dương', example: 'I love the blue water.', image: 'https://picsum.photos/seed/blue/400/300' },
      { word: 'Water', translation: 'Nước', example: 'Fish live in the water.', image: 'https://picsum.photos/seed/water/400/300' },
    ]
  },
  {
    id: 'island',
    name: 'Beach & Island',
    color: 'bg-yellow-400',
    icon: '🏝️',
    sound: 'https://assets.mixkit.co/active_storage/sfx/1118/1118-preview.mp3', // Tropical beach
    description: 'Bãi biển đầy cát vàng và những hòn đảo nhỏ.',
    vocab: [
      { word: 'Beach', translation: 'Bãi biển', example: 'We play on the beach.', image: 'https://picsum.photos/seed/beach/400/300' },
      { word: 'Island', translation: 'Hòn đảo', example: 'I want to visit a small island.', image: 'https://picsum.photos/seed/island/400/300' },
      { word: 'Sand', translation: 'Cát', example: 'The sand is warm and yellow.', image: 'https://picsum.photos/seed/sand/400/300' },
      { word: 'Wave', translation: 'Sóng biển', example: 'The waves are big today.', image: 'https://picsum.photos/seed/wave/400/300' },
    ]
  }
];
