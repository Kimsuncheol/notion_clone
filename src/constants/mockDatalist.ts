import { MyPost } from "@/types/firebase";

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

export const mockPosts: MyPost[] = [
  {
    id: 'post-1',
    title: 'Getting Started with React and TypeScript',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
    content: 'A comprehensive guide to building modern web applications with React and TypeScript. Learn about type safety, component patterns, and best practices...',
    createdAt: '2024-01-15T10:30:00Z',
    authorEmail: 'john.doe@example.com',
    authorName: 'John Doe',
    isTrashed: false,
    trashedAt: new Date('2024-01-15T10:30:00Z'),
    tags: ['React', 'TypeScript', 'Web Development'],
    series: 'React Fundamentals',
    comments: [
      {
        id: 'comment-1',
        text: 'Great tutorial! Very helpful for beginners.',
        author: 'Jane Smith',
        authorEmail: 'jane.smith@example.com',
        timestamp: new Date('2024-01-16T14:20:00Z')
      },
      {
        id: 'comment-2',
        text: 'Could you add more examples about hooks?',
        author: 'Mike Johnson',
        authorEmail: 'mike.johnson@example.com',
        timestamp: new Date('2024-01-17T09:15:00Z')
      }
    ],
    subNotes: [
      {
        id: 'subnote-1',
        title: 'TypeScript Basics',
        content: 'Introduction to TypeScript fundamentals...',
        createdAt: new Date('2024-01-15T10:45:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z')
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Advanced State Management with Zustand',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
    content: 'Explore the power of Zustand for state management in React applications. Learn about stores, persistence, and advanced patterns...',
    createdAt: '2024-02-01T16:45:00Z',
    authorEmail: 'john.doe@example.com',
    authorName: 'John Doe',
    isTrashed: false,
    trashedAt: new Date('2024-02-01T16:45:00Z'),
    tags: ['Zustand', 'State Management', 'React'],
    series: 'State Management Series',
    comments: [
      {
        id: 'comment-3',
        text: 'Zustand is so much simpler than Redux!',
        author: 'Sarah Wilson',
        authorEmail: 'sarah.wilson@example.com',
        timestamp: new Date('2024-02-02T08:30:00Z')
      }
    ],
    subNotes: [
      {
        id: 'subnote-2',
        title: 'Store Setup',
        content: 'How to create your first Zustand store...',
        createdAt: new Date('2024-02-01T17:00:00Z'),
        updatedAt: new Date('2024-02-01T17:15:00Z')
      },
      {
        id: 'subnote-3',
        title: 'Persistence',
        content: 'Adding persistence to your Zustand stores...',
        createdAt: new Date('2024-02-01T17:30:00Z'),
        updatedAt: new Date('2024-02-01T17:45:00Z')
      }
    ]
  },
  {
    id: 'post-3',
    title: 'Building Responsive UIs with Tailwind CSS',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
    content: 'Master responsive design with Tailwind CSS. Learn about breakpoints, grid systems, and mobile-first design principles...',
    createdAt: '2024-02-10T12:20:00Z',
    authorEmail: 'john.doe@example.com',
    authorName: 'John Doe',
    isTrashed: false,
    trashedAt: new Date('2024-02-10T12:20:00Z'),
    tags: ['Tailwind CSS', 'CSS', 'Responsive Design'],
    series: 'Frontend Styling',
    comments: [],
    subNotes: [
      {
        id: 'subnote-4',
        title: 'Breakpoint Strategy',
        content: 'How to plan your responsive breakpoints...',
        createdAt: new Date('2024-02-10T12:35:00Z'),
        updatedAt: new Date('2024-02-10T12:50:00Z')
      }
    ]
  },
  {
    id: 'post-4',
    title: 'Next.js App Router Deep Dive',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop',
    content: 'Comprehensive guide to Next.js App Router, server components, and modern React patterns for building full-stack applications...',
    createdAt: '2024-02-20T09:10:00Z',
    authorEmail: 'john.doe@example.com',
    authorName: 'John Doe',
    isTrashed: false,
    trashedAt: new Date('2024-02-20T09:10:00Z'),
    tags: ['Next.js', 'React', 'Full Stack'],
    series: 'Next.js Mastery',
    comments: [
      {
        id: 'comment-4',
        text: 'The app router is a game changer!',
        author: 'Alex Chen',
        authorEmail: 'alex.chen@example.com',
        timestamp: new Date('2024-02-21T15:45:00Z')
      },
      {
        id: 'comment-5',
        text: 'Great explanation of server components.',
        author: 'Emma Davis',
        authorEmail: 'emma.davis@example.com',
        timestamp: new Date('2024-02-22T11:20:00Z')
      }
    ],
    subNotes: [
      {
        id: 'subnote-5',
        title: 'Server vs Client Components',
        content: 'Understanding the difference and when to use each...',
        createdAt: new Date('2024-02-20T09:25:00Z'),
        updatedAt: new Date('2024-02-20T09:40:00Z')
      },
      {
        id: 'subnote-6',
        title: 'Routing Patterns',
        content: 'Advanced routing patterns in App Router...',
        createdAt: new Date('2024-02-20T10:00:00Z'),
        updatedAt: new Date('2024-02-20T10:15:00Z')
      }
    ]
  }
];