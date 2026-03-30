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
    definition: string;
    example: string;
    image: string;
    emoji: string;
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
      { 
        word: 'Forest', 
        translation: 'Khu rừng', 
        definition: 'A large area of land that is thickly covered with trees.',
        example: 'The tropical forest is home to many rare animals and plants.', 
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
        emoji: '🌳'
      },
      { 
        word: 'Tree', 
        translation: 'Cây', 
        definition: 'A tall plant that can live for a long time. It has a single thick wooden stem.',
        example: 'They sat under the shade of a large oak tree to have their lunch.', 
        image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
        emoji: '🌲'
      },
      { 
        word: 'Mushroom', 
        translation: 'Nấm', 
        definition: 'A fungus with a round top and a short stem. Some types can be eaten.',
        example: 'We found some wild mushrooms growing at the foot of the old tree.', 
        image: 'https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?auto=format&fit=crop&w=800&q=80',
        emoji: '🍄'
      },
      { 
        word: 'Grass', 
        translation: 'Cỏ', 
        definition: 'A common wild plant with narrow green leaves and small flowers.',
        example: 'The children were playing happily on the soft green grass.', 
        image: 'https://images.unsplash.com/photo-1533460004989-cef01064af7c?auto=format&fit=crop&w=800&q=80',
        emoji: '🌱'
      },
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
      { 
        word: 'Volcano', 
        translation: 'Núi lửa', 
        definition: 'A mountain with a large opening at the top through which hot rocks and lava are forced out.',
        example: 'The active volcano erupted suddenly, sending ash high into the sky.', 
        image: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80',
        emoji: '🌋'
      },
      { 
        word: 'Lava', 
        translation: 'Dung nham', 
        definition: 'Hot liquid rock that comes out of a volcano.',
        example: 'The glowing red lava flowed slowly down the side of the mountain.', 
        image: 'https://images.unsplash.com/photo-1619266465172-02a857c3556d?auto=format&fit=crop&w=800&q=80',
        emoji: '🌋'
      },
      { 
        word: 'Fire', 
        translation: 'Lửa', 
        definition: 'The light, heat and flames that are produced when something burns.',
        example: 'The campers gathered around the bright fire to keep warm at night.', 
        image: 'https://images.unsplash.com/photo-1520110120835-c96a9f04218b?auto=format&fit=crop&w=800&q=80',
        emoji: '🔥'
      },
      { 
        word: 'Smoke', 
        translation: 'Khói', 
        definition: 'The grey, white or black gas that you can see in the air when something is burning.',
        example: 'Thick black smoke was rising from the chimney of the old factory.', 
        image: 'https://images.unsplash.com/photo-1509023467864-1ecbb3f034ce?auto=format&fit=crop&w=800&q=80',
        emoji: '🌫️'
      },
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
      { 
        word: 'Ocean', 
        translation: 'Đại dương', 
        definition: 'The mass of salt water that covers most of the earth\'s surface.',
        example: 'The Atlantic Ocean separates the Americas from Europe and Africa.', 
        image: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=800&q=80',
        emoji: '🌊'
      },
      { 
        word: 'Deep', 
        translation: 'Sâu', 
        definition: 'Having a large distance from the top or surface to the bottom.',
        example: 'The water is very deep here, so you must be careful when swimming.', 
        image: 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=800&q=80',
        emoji: '🤿'
      },
      { 
        word: 'Blue', 
        translation: 'Màu xanh dương', 
        definition: 'Having the color of a clear sky or the sea on a sunny day.',
        example: 'She was wearing a beautiful blue dress that matched her eyes.', 
        image: 'https://images.unsplash.com/photo-1500462859277-58a9462767b7?auto=format&fit=crop&w=800&q=80',
        emoji: '💙'
      },
      { 
        word: 'Water', 
        translation: 'Nước', 
        definition: 'A clear liquid, without color or taste, that falls from the sky as rain.',
        example: 'The sparkling water in the mountain stream was cold and refreshing.', 
        image: 'https://images.unsplash.com/photo-1548919973-5cfe5d4fc474?auto=format&fit=crop&w=800&q=80',
        emoji: '💧'
      },
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
      { 
        word: 'Beach', 
        translation: 'Bãi biển', 
        definition: 'An area of sand or small stones beside the sea or a lake.',
        example: 'We spent the whole day building sandcastles on the sunny beach.', 
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        emoji: '🏖️'
      },
      { 
        word: 'Island', 
        translation: 'Hòn đảo', 
        definition: 'A piece of land that is completely surrounded by water.',
        example: 'The small tropical island is only accessible by boat or helicopter.', 
        image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=800&q=80',
        emoji: '🏝️'
      },
      { 
        word: 'Sand', 
        translation: 'Cát', 
        definition: 'A substance that consists of very small grains of rock, found on beaches and in deserts.',
        example: 'The golden sand felt warm and soft between her toes as she walked.', 
        image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=800&q=80',
        emoji: '🏜️'
      },
      { 
        word: 'Wave', 
        translation: 'Sóng biển', 
        definition: 'A long line of water that moves across the surface of the sea and breaks on the shore.',
        example: 'The surfers were waiting for the perfect wave to ride back to the shore.', 
        image: 'https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?auto=format&fit=crop&w=800&q=80',
        emoji: '🌊'
      },
    ]
  }
];
