import { LikedReadItem, MyPost, MySeries, Comment } from "@/types/firebase";

export const mockPostSeries: MySeries[] = [
  {
    id: 'series-1',
    title: '알고리즘실습',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
    content: '9개의 포스트 • 마지막 업데이트 2023년 11월 25일',
    userId: 'user-1',
    authorEmail: 'john.doe@example.com',
    authorName: 'John Doe',
    isTrashed: false,
    trashedAt: new Date('2023-11-25T10:30:00Z'),
    createdAt: new Date('2023-11-25T10:30:00Z'),
    updatedAt: new Date('2023-11-25T10:30:00Z'),
    comments: [],
    subNotes: [
      {
        id: 'subnote-s1-1',
        title: '정렬 알고리즘',
        createdAt: new Date('2023-11-01T10:00:00Z'),
        updatedAt: new Date('2023-11-01T10:00:00Z')
      },
      {
        id: 'subnote-s1-2', 
        title: '검색 알고리즘',
        createdAt: new Date('2023-11-05T10:00:00Z'),
        updatedAt: new Date('2023-11-05T10:00:00Z')
      },
      {
        id: 'subnote-s1-3',
        title: '그래프 알고리즘',
        createdAt: new Date('2023-11-10T10:00:00Z'),
        updatedAt: new Date('2023-11-10T10:00:00Z')
      }
    ]
  },
  {
    id: 'series-2', 
    title: '세계사',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    content: '0개의 포스트 • 마지막 업데이트 2023년 9월 28일',
    userId: 'user-1',
    authorEmail: 'john.doe@example.com',
    authorName: 'John Doe', 
    isTrashed: false,
    trashedAt: new Date('2023-09-28T10:30:00Z'),
    createdAt: new Date('2023-09-28T10:30:00Z'),
    updatedAt: new Date('2023-09-28T10:30:00Z'),
    comments: [],
    subNotes: []
  },
  {
    id: 'series-3',
    title: '컴퓨터구조',
    thumbnail: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=400&h=250&fit=crop',
    content: '2개의 포스트 • 마지막 업데이트 2023년 9월 27일',
    userId: 'user-1',
    authorEmail: 'john.doe@example.com',
    authorName: 'John Doe',
    isTrashed: false,
    trashedAt: new Date('2023-09-27T10:30:00Z'),
    createdAt: new Date('2023-09-27T10:30:00Z'),
    updatedAt: new Date('2023-09-27T10:30:00Z'),
    comments: [],
    subNotes: [
      {
        id: 'subnote-s3-1',
        title: 'CPU 구조',
        createdAt: new Date('2023-09-20T10:00:00Z'),
        updatedAt: new Date('2023-09-20T10:00:00Z')
      },
      {
        id: 'subnote-s3-2',
        title: '메모리 시스템',
        createdAt: new Date('2023-09-25T10:00:00Z'),
        updatedAt: new Date('2023-09-25T10:00:00Z')
      }
    ]
  },
  {
    id: 'series-4',
    title: '아산수학',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
    content: '1개의 포스트 • 마지막 업데이트 2023년 9월 22일',
    userId: 'user-1',
    authorEmail: 'john.doe@example.com',
    authorName: 'John Doe',
    isTrashed: false,
    trashedAt: new Date('2023-09-22T10:30:00Z'),
    createdAt: new Date('2023-09-22T10:30:00Z'),
    updatedAt: new Date('2023-09-22T10:30:00Z'),
    comments: [],
    subNotes: [
      {
        id: 'subnote-s4-1',
        title: '미적분학 기초',
        createdAt: new Date('2023-09-22T10:00:00Z'),
        updatedAt: new Date('2023-09-22T10:00:00Z')
      }
    ]
  },
  {
    id: 'series-5',
    title: 'React 심화',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    content: '5개의 포스트 • 마지막 업데이트 2023년 12월 15일',
    userId: 'user-1',
    authorEmail: 'john.doe@example.com',
    authorName: 'John Doe',
    isTrashed: false,
    trashedAt: new Date('2023-12-15T10:30:00Z'),
    createdAt: new Date('2023-12-15T10:30:00Z'),
    updatedAt: new Date('2023-12-15T10:30:00Z'),
    comments: [],
    subNotes: [
      {
        id: 'subnote-s5-1',
        title: 'Context API',
        createdAt: new Date('2023-12-01T10:00:00Z'),
        updatedAt: new Date('2023-12-01T10:00:00Z')
      },
      {
        id: 'subnote-s5-2',
        title: 'Custom Hooks',
        createdAt: new Date('2023-12-05T10:00:00Z'),
        updatedAt: new Date('2023-12-05T10:00:00Z')
      },
      {
        id: 'subnote-s5-3',
        title: 'Performance 최적화',
        createdAt: new Date('2023-12-10T10:00:00Z'),
        updatedAt: new Date('2023-12-10T10:00:00Z')
      }
    ]
  },
  {
    id: 'series-6',
    title: 'TypeScript 마스터',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
    content: '3개의 포스트 • 마지막 업데이트 2023년 10월 30일',
    userId: 'user-1',
    authorEmail: 'john.doe@example.com',
    authorName: 'John Doe',
    isTrashed: false,
    trashedAt: new Date('2023-10-30T10:30:00Z'),
    createdAt: new Date('2023-10-30T10:30:00Z'),
    updatedAt: new Date('2023-10-30T10:30:00Z'),
    comments: [],
    subNotes: [
      {
        id: 'subnote-s6-1',
        title: 'Generic Types',
        createdAt: new Date('2023-10-15T10:00:00Z'),
        updatedAt: new Date('2023-10-15T10:00:00Z')
      },
      {
        id: 'subnote-s6-2',
        title: 'Advanced Types',
        createdAt: new Date('2023-10-20T10:00:00Z'),
        updatedAt: new Date('2023-10-20T10:00:00Z')
      },
      {
        id: 'subnote-s6-3',
        title: 'Type Guards',
        createdAt: new Date('2023-10-25T10:00:00Z'),
        updatedAt: new Date('2023-10-25T10:00:00Z')
      }
    ]
  }
];


export const mockPostsYouMightBeInterestedIn: MyPost[] = [
  {
    id: '1',
    title: '[Algorithm] 라빈 카프(Rabin-Karp) 알고리즘',
    content: '라빈 카프 알고리즘이란? 특이한 문자열 알고리즘이다. 일정 패턴의 문자열 찾는데 용도가 쓰인다. 이 알고리즘의 가장 중요한 핵심은 해시이다. 해시에 문자열을 저장하여 비교를 가능하게 한다.',
    authorName: 'Junseo Kim',
    authorEmail: 'junseo@example.com',
    createdAt: new Date('2020-02-13'),
    likeCount: 0,
    userId: 'user1',
    thumbnail: '',
    isTrashed: false,
    trashedAt: new Date(),
    viewCount: 120,
    commentCount: 5,
    comments: [],
    subNotes: []
  },
  {
    id: '2',
    title: '[Algorithm] 문자열 매칭 알고리즘',
    content: '특정한 글이 있을 때, 그 글의서어 특정한 문자열을 찾는 알고리즘이다. 간단히 하나씩 비교하는 방법 같은 경우에 알고리즘이다. 정확하고 효율적인 매칭을 위해 다양한 기법들이 개발되어 있습니다.',
    authorName: 'Junseo Kim',
    authorEmail: 'junseo@example.com',
    createdAt: new Date('2020-02-12'),
    likeCount: 0,
    userId: 'user1',
    thumbnail: '',
    isTrashed: false,
    trashedAt: new Date(),
    viewCount: 85,
    commentCount: 2,
    comments: [],
    subNotes: []
  },
  {
    id: '3',
    title: '[알고리즘] 그림으로 알아보는 문자열 검색 알고리즘',
    content: '보이어-무어 알고리즘, 라빈-카프 알고리즘과 구현하기. 문자열 검색은 컴퓨터 과학에서 매우 중요한 주제 중 하나입니다.',
    authorName: 'emplam27',
    authorEmail: 'emplam27@example.com',
    createdAt: new Date('2020-12-16'),
    likeCount: 4,
    userId: 'user2',
    thumbnail: '/api/placeholder/300/200',
    isTrashed: false,
    trashedAt: new Date(),
    viewCount: 234,
    commentCount: 8,
    comments: [],
    subNotes: []
  },
  {
    id: '4',
    title: '문자열 검색 알고리즘 정리(KMP)',
    content: 'APSS 스터디에서 코딩테스트 출제를 하고 있어 스터디원들이 내 문제없으면 심화없다 미스케이크므로 문제를 내는 도중 코딩 출제문제가 생각났습니다. KMP 알고리즘의 핵심 원리와 구현 방법을 자세히 다룹니다.',
    authorName: 'jiho',
    authorEmail: 'jiho@example.com',
    createdAt: new Date('2020-01-06'),
    likeCount: 0,
    userId: 'user3',
    thumbnail: '',
    isTrashed: false,
    trashedAt: new Date(),
    viewCount: 156,
    commentCount: 3,
    comments: [],
    subNotes: []
  },
  {
    id: '5',
    title: '[알고리즘] 슬라이딩 윈도우(Sliding Window)',
    content: '슬라이딩 윈도우란? 고정 사이즈의 윈도우가 이동하면서 윈도우 내에 있는 데이터를 이용해 문제를 풀어나가는 알고리즘을 말한다. 배열이나 문자열에서 연속된 부분을 효율적으로 처리할 때 사용됩니다.',
    authorName: '재혁',
    authorEmail: 'jaehyuk@example.com',
    createdAt: new Date('2023-06-20'),
    likeCount: 3,
    userId: 'user4',
    thumbnail: '',
    isTrashed: false,
    trashedAt: new Date(),
    viewCount: 189,
    commentCount: 7,
    comments: [],
    subNotes: []
  },
  {
    id: '6',
    title: '검색(Search) 알고리즘 이야기',
    content: '검색(Search)이란? 검색 알고리즘을 이야기 정의: 데이터 집합에서 원하는 데이터를 찾는 문제를 해결하는 알고리즘이다. 선형 검색부터 이진 검색까지 다양한 검색 기법을 소개합니다.',
    authorName: '나가 꿈꾸는 개발 서지',
    authorEmail: 'seoji@example.com',
    createdAt: new Date('2023-04-12'),
    likeCount: 1,
    userId: 'user5',
    thumbnail: '/api/placeholder/300/200',
    isTrashed: false,
    trashedAt: new Date(),
    viewCount: 267,
    commentCount: 12,
    comments: [],
    subNotes: []
  },
  {
    id: '7',
    title: '[알고리즘] 해시(Hash)',
    content: '해시 알고리즘에 대한 기본 개념부터 실제 구현까지. 해시 테이블의 동작 원리와 충돌 해결 방법, 그리고 다양한 해시 함수들에 대해 알아봅니다.',
    authorName: '백곰',
    authorEmail: 'whitebear@example.com',
    createdAt: new Date('2021-07-26'),
    likeCount: 4,
    userId: 'user6',
    thumbnail: '',
    isTrashed: false,
    trashedAt: new Date(),
    viewCount: 198,
    commentCount: 6,
    comments: [],
    subNotes: []
  },
  {
    id: '8',
    title: '시니어 엔지니어가 만들던 빡센 이유 #1',
    content: '일일적으로 엔지니어는 프로그래밍을 쌓아서 능력의 교육을 통해 웹 개발하는 경력 쌓는다. 실무에서 겪는 다양한 상황들과 그에 따른 해결책들을 공유합니다.',
    authorName: '김성완 (Matthew)',
    authorEmail: 'matthew@example.com',
    createdAt: new Date('2024-06-19'),
    likeCount: 139,
    userId: 'user7',
    thumbnail: '/api/placeholder/300/200',
    isTrashed: false,
    trashedAt: new Date(),
    viewCount: 1250,
    commentCount: 45,
    comments: [],
    subNotes: []
  }
];


export const mockLikedReadItems: LikedReadItem[] = [
  {
    id: '1',
    title: 'Claude Code 활용',
    description: '이제 코딩의여정 승리로 승마는 Claude Code. 프로그램 개발의 든든한 파트너로써 다양한 작업에 도움을 주는 Claude Code. 지금까지는 기술으로 생산...',
    thumbnail: '/note_logo.png',
    authorId: 'dev-jin',
    authorName: 'Dev Jin',
    authorAvatar: '/note_logo.png',
    viewCount: 53,
    likeCount: 12,
    createdAt: new Date('2023-07-15'),
    tags: ['Development', 'AI']
  },
  {
    id: '2',
    title: 'WSL2 Window Subsystem for Linux 설치를 통해 개발 환경 만들기',
    description: '윈도우에서 개발환경 구축하기 위한 가이드입니다. WSL2 를 통해 리눅스 환경을 Windows에서 사용할 수 있게 하는 WSL...',
    thumbnail: '/note_logo.png',
    authorId: 'wls-expert',
    authorName: 'WSL Expert',
    authorAvatar: '/note_logo.png',
    viewCount: 1,
    likeCount: 0,
    createdAt: new Date('2023-08-22'),
    tags: ['WSL', 'Windows', 'Linux']
  },
  {
    id: '3',
    title: '[개발자 업무의 사이더 이야기…',
    description: '개발자로서의 일상과 다양한 경험들을 공유하는 사이더 이야기. 프로젝트 진행하면서 겪었던 문제들과 해결책을 중심으로 블로그 포스팅을 예정입니다.',
    thumbnail: '/note_logo.png',
    authorId: 'dev-cider',
    authorName: 'Cider',
    authorAvatar: '/note_logo.png',
    viewCount: 936,
    likeCount: 24,
    createdAt: new Date('2023-06-10'),
    tags: ['Development', 'Story']
  },
  {
    id: '4',
    title: 'iPhone 자료조직 관리법…',
    description: '아이폰으로 더욱 스마트하게 자료를 관리하고 정리하는 방법. Abstract Data Type의 개념을 활용해서 효율적인 자료조직 관리를 실현...',
    thumbnail: '/note_logo.png',
    authorId: 'ios-master',
    authorName: 'iOS 마스터',
    authorAvatar: '/note_logo.png',
    viewCount: 15,
    likeCount: 3,
    createdAt: new Date('2023-09-01'),
    tags: ['iOS', 'Productivity']
  },
  {
    id: '5',
    title: '[Python 코믹하고] python…',
    description: 'Python으로 데이터 분석 및 자동화를 위한 재미있고 실용적인 예제들을 소개합니다. 기초부터 고급까지 다양한 파이썬 활용법과 팁들을 다룹니다.',
    thumbnail: '/note_logo.png',
    authorId: 'python-lover',
    authorName: '파이썬러',
    authorAvatar: '/note_logo.png',
    viewCount: 0,
    likeCount: 0,
    createdAt: new Date('2023-08-08'),
    tags: ['Python', 'Data Analysis']
  },
  {
    id: '6',
    title: '[Python 처리로] 무덤의…',
    description: '파이썬을 이용한 데이터 처리와 분석 방법론에 대해 자세히 살펴보겠습니다. 효율적인 코드 작성부터 복잡한 데이터 구조 처리까지 다양한 실무 예제를 포함합니다.',
    thumbnail: '/note_logo.png',
    authorId: 'data-analyst',
    authorName: '데이터 분석가',
    authorAvatar: '/note_logo.png',
    viewCount: 2,
    likeCount: 1,
    createdAt: new Date('2023-08-20'),
    tags: ['Python', 'Processing']
  },
  {
    id: '7',
    title: '우선순위 큐 (Priority Que…',
    description: '자료구조의 핵심인 우선순위 큐에 대해 알아보고, 실제 개발에서 어떻게 활용할 수 있는지 다양한 예제와 함께 살펴보겠습니다.',
    thumbnail: '/note_logo.png',
    authorId: 'algorithm-master',
    authorName: 'Algorithm 마스터',
    authorAvatar: '/note_logo.png',
    viewCount: 1,
    likeCount: 0,
    createdAt: new Date('2023-09-05'),
    tags: ['Algorithm', 'Data Structure']
  },
  {
    id: '8',
    title: '라이브러 - 어시블에 (binary s…',
    description: '바이너리 서치 알고리즘의 구현과 최적화 방법에 대해 자세히 알아보겠습니다. 시간복잡도 향상을 위한 다양한 기법들을 소개합니다.',
    thumbnail: '/note_logo.png',
    authorId: 'search-expert',
    authorName: 'Search Expert',
    authorAvatar: '/note_logo.png',
    viewCount: 7,
    likeCount: 2,
    createdAt: new Date('2023-08-15'),
    tags: ['Algorithm', 'Binary Search']
  }
]

export const mockComments: Comment[] = [
  {
    id: '1',
    noteId: 'note1',
    author: 'dina',
    authorEmail: 'dina@example.com',
    content: "I'm sorry for the inconvenience.",
    createdAt: new Date('2025-08-28'),
    comments: [
      {
        id: '2',
        parentCommentId: '1',
        noteId: 'note1',
        author: 'john_dev',
        authorEmail: 'john@example.com',
        content: 'No worries! Thanks for the explanation.',
        createdAt: new Date('2025-08-29'),
      }
    ]
  },
  {
    id: '3',
    noteId: 'note1',
    author: 'sarah_code',
    authorEmail: 'sarah@example.com',
    content: 'Great article! Very helpful insights on the implementation.',
    createdAt: new Date('2025-08-30'),
  },
  {
    id: '4',
    noteId: 'note1',
    author: 'mike_tech',
    authorEmail: 'mike@example.com',
    content: 'Could you elaborate more on the performance optimization part?',
    createdAt: new Date('2025-09-01'),
    comments: [
      {
        id: '5',
        parentCommentId: '4',
        noteId: 'note1',
        author: 'alex_senior',
        authorEmail: 'alex@example.com',
        content: 'I second this! Performance metrics would be great to see.',
        createdAt: new Date('2025-09-02'),
      }
    ]
  }
];