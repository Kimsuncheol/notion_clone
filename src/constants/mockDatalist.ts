// Updated mockTrendingItems with categories
export const mockTrendingItems: Array<{
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
}> = [
    {
      id: '1',
      title: 'Getting Started with React',
      content: 'Learn the fundamentals of React development including components, state management, and hooks.',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
      category: 'Frontend',
      tags: ['React', 'JavaScript', 'Beginner'],
      likes: 245,
      views: 1230
    },
    {
      id: '2',
      title: 'Advanced TypeScript Tips',
      content: 'Discover advanced TypeScript patterns and best practices for building scalable applications.',
      imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
      category: 'Frontend',
      tags: ['TypeScript', 'JavaScript', 'Advanced'],
      likes: 189,
      views: 892
    },
    {
      id: '3',
      title: 'UI/UX Design Principles',
      content: 'Essential design principles for creating intuitive and engaging user interfaces.',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      category: 'Design',
      tags: ['UI/UX', 'Design', 'Principles'],
      likes: 312,
      views: 1456
    },
    {
      id: '4',
      title: 'Firebase Best Practices',
      content: 'Learn how to effectively use Firebase for authentication, database, and hosting.',
      imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=250&fit=crop',
      category: 'Backend',
      tags: ['Firebase', 'Database', 'Cloud'],
      likes: 156,
      views: 743
    },
    {
      id: '5',
      title: 'Modern CSS Techniques',
      content: 'Explore modern CSS features including Grid, Flexbox, and custom properties.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
      category: 'Frontend',
      tags: ['CSS', 'Styling', 'Layout'],
      likes: 203,
      views: 967
    },
    {
      id: '6',
      title: 'API Development with Node.js',
      content: 'Build robust REST APIs using Node.js, Express, and modern JavaScript patterns.',
      imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
      category: 'Backend',
      tags: ['Node.js', 'API', 'Express'],
      likes: 278,
      views: 1134
    },
    {
      id: '7',
      title: 'Mobile Development Trends',
      content: 'Stay updated with the latest trends in mobile app development and cross-platform solutions.',
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
      category: 'Mobile',
      tags: ['Mobile', 'Trends', 'Cross-platform'],
      likes: 167,
      views: 821
    },
    {
      id: '8',
      title: 'Database Optimization',
      content: 'Techniques for optimizing database performance and query efficiency.',
      imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=250&fit=crop',
      category: 'Backend',
      tags: ['Database', 'Performance', 'Optimization'],
      likes: 134,
      views: 654
    },
    {
      id: '9',
      title: 'Figma to Code Workflow',
      content: 'Streamline your design-to-development process with efficient Figma workflows.',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop',
      category: 'Design',
      tags: ['Figma', 'Workflow', 'Design Systems'],
      likes: 198,
      views: 756
    },
    {
      id: '10',
      title: 'React Native Performance',
      content: 'Optimize your React Native apps for better performance and user experience.',
      imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop',
      category: 'Mobile',
      tags: ['React Native', 'Performance', 'Mobile'],
      likes: 223,
      views: 1089
    }
  ];

export const mockTags: string[] = [
  'JavaScript',
  'Database',
  'Mobile',
  'Performance',
  'React',
  'Beginner',
  'TypeScript',
  'Advanced',
  'UI/UX',
  'Design',
  'Principles',
  'Firebase',
  'Cloud',
  'CSS',
  'Styling',
  'Layout',
  'Node.js',
  'API',
  'Express',
  'Trends',
  'Cross-platform',
  'Optimization',
  'Figma',
  'Workflow',
  'Design Systems',
  'React Native'
]