import { Components } from 'react-markdown';
import React from 'react';
import { defaultSchema } from 'rehype-sanitize';
import { HTMLTag, LatexStructure } from './interface';
import { ThemeOption } from './ThemeSelector';

// Import all available themes
import {
  githubLight,
  githubDark,
  dracula,
  tokyoNight,
  tokyoNightDay,
  tokyoNightStorm,
  vscodeDark,
  vscodeLight,
  materialDark,
  materialLight,
  solarizedLight,
  solarizedDark,
  nord,
  monokai,
  gruvboxDark,
  sublime,
  okaidia,
  eclipse,
  bespin,
  atomone,
  aura,
  basicDark,
  basicLight
} from '@uiw/codemirror-themes-all';


export const components: Components = {
    // Custom components for better styling
    h1: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h1 className="text-gray-700 text-4xl font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h1>
    ),
    h2: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h2 className="text-gray-700 text-3xl font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h2>
    ),
    h3: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h3 className="text-gray-700 text-2xl font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h3>
    ),
    h4: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h4 className="text-gray-700 text-xl font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h4>
    ),
    h5: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h5 className="text-gray-700 text-lg font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h5>
    ),
    h6: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h6 className="text-gray-700 text-base font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h6>
    ),
    p: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</p>
    ),
    b: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <b className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</b>
    ),
    i: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <i className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</i>
    ),
    u: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <u className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</u>
    ),
    s: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <s className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</s>
    ),
    sup: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <sup className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</sup>
    ),
    sub: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <sub className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</sub>
    ),
    br: ({ style }: { style?: React.CSSProperties }) => (
      <br style={style} />
    ),
    hr: ({ style }: { style?: React.CSSProperties }) => (
      <hr className="my-4 border-gray-200 dark:border-gray-700" style={style} />
    ),
    code: (props: React.ComponentProps<'code'> & { inline?: boolean }) => {
      const { inline, children, style, ...rest } = props;
      return inline ? (
        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" style={style} {...rest} >
          {children}
        </code>
      ) : (
        <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-line" style={style} {...rest}>
          {children}
        </code>
      );
    },
    blockquote: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 my-4" style={style}>
        {children}
      </blockquote>
    ),
    ul: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1" style={style}>{children}</ul>
    ),
    ol: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1" style={style}>{children}</ol>
    ),
    li: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <li className="text-gray-700 dark:text-gray-300" style={style}>{children}</li>
    ),
    table: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-auto border border-collapse border-gray-200 dark:border-gray-700" style={style}>
          {children}
        </table>
      </div>
    ),
    tr: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <tr className="border border-collapse border-gray-200 dark:border-gray-700" style={style}>{children}</tr>
    ),
    th: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <th className="border border-collapse border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left" style={style}>
        {children}
      </th>
    ),
    td: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <td className="border border-collapse border-gray-200 dark:border-gray-700 px-4 py-2" style={style}>
        {children}
      </td>
    ),
    img: ({ src, alt, style, ...props }: React.ComponentProps<'img'> & { src: string; alt: string }) => (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt={alt}
        style={style}
        className="max-w-full h-auto rounded-lg shadow-sm my-4"
        {...props}
      />
    ),
    a: ({ children, href, style }: React.ComponentProps<'a'> & { href: string }) => (
      <a
        href={href}
        style={style}
        className="text-blue-600 dark:text-blue-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  } as Components & string;

  // Simplified sanitize schema - less restrictive for KaTeX
export const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': ['className', 'style', 'aria-hidden'], // Allow className and style on all elements
    span: [...(defaultSchema.attributes?.span || []), 'className', 'style', 'aria-hidden'],
    div: [...(defaultSchema.attributes?.div || []), 'className', 'style'],
    annotation: ['encoding'],
    math: ['xmlns', 'display'],
    semantics: [],
    // Allow all MathML attributes
    mi: ['mathvariant'],
    mn: [],
    mo: ['stretchy', 'fence', 'separator', 'lspace', 'rspace'],
    mrow: [],
    msup: [],
    msub: [],
    mfrac: ['linethickness'],
    msqrt: [],
    mroot: [],
    mtable: ['columnalign', 'rowspacing', 'columnspacing'],
    mtr: [],
    mtd: ['columnspan', 'rowspan'],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    // KaTeX generates these elements
    'math', 'annotation', 'semantics', 'mtext', 'mn', 'mo', 'mi', 'mspace',
    'mover', 'munder', 'munderover', 'msup', 'msub', 'msubsup', 'mfrac',
    'mroot', 'msqrt', 'mtable', 'mtr', 'mtd', 'mlongdiv', 'mscarries',
    'mscarry', 'msgroup', 'msline', 'msrow', 'mstack', 'mrow'
  ]
};

export const htmlTags: HTMLTag[] = [
  { name: 'Bold', tag: 'strong', icon: 'B', description: 'Bold text' },
  { name: 'Italic', tag: 'em', icon: 'I', description: 'Italic text' },
  { name: 'Underline', tag: 'u', icon: 'U', description: 'Underlined text' },
  { name: 'Code', tag: 'code', icon: '</>', description: 'Inline code' },
  { name: 'Link', tag: 'a href=""', icon: '🔗', description: 'Hyperlink' },
  { name: 'Heading 1', tag: 'h1', icon: "H1", description: 'Heading level 1' },
  { name: 'Heading 2', tag: 'h2', icon: "H2", description: 'Heading level 2' },  // Don't touch this
  { name: 'Heading 3', tag: 'h3', icon: "H3", description: 'Heading level 3' },
  { name: 'Heading 4', tag: 'h4', icon: "H4", description: 'Heading level 4' },
  { name: 'Blockquote', tag: 'blockquote', icon: '❝', description: 'Block quote' },
];

export const latexStructures: LatexStructure[] = [
  { name: 'Inline Math', expression: '${|}$', icon: '$', description: 'Inline math expression', cursorOffset:2 },
  { name: 'Block Math', expression: '$${|}$$', icon: '$$', description: 'Block math expression', isBlock: true, cursorOffset: 3 },
  { name: 'Fraction', expression: '$$\\frac{|}{|}$$', icon: '½', description: 'Fraction (\\frac)', cursorOffset: 8 },
  { name: 'Square Root', expression: '$$\\sqrt{|} $$', icon: '√', description: 'Square root (\\sqrt)', cursorOffset: 8 },
  { name: 'Summation', expression: '$$\\sum_{|}^{|}$$', icon: 'Σ', description: 'Summation with limits', cursorOffset: 8 },
  { name: 'Integral', expression: '$$\\int_{|}^{|}$$', icon: '∫', description: 'Integral with limits', cursorOffset: 8 },
  { name: 'Superscript', expression: '$$\\^{|}$$', icon: 'xⁿ', description: 'Superscript', cursorOffset: 5 },
  { name: 'Subscript', expression: '$$\\_{|}$$', icon: 'xₙ', description: 'Subscript', cursorOffset: 5 },
];

// Define available themes
export const availableThemes: ThemeOption[] = [
  // Light themes
  { name: 'GitHub Light', value: 'githubLight', theme: githubLight, category: 'light' },
  { name: 'Material Light', value: 'materialLight', theme: materialLight, category: 'light' },
  { name: 'Solarized Light', value: 'solarizedLight', theme: solarizedLight, category: 'light' },
  { name: 'Tokyo Night Day', value: 'tokyoNightDay', theme: tokyoNightDay, category: 'light' },
  { name: 'VS Code Light', value: 'vscodeLight', theme: vscodeLight, category: 'light' },
  { name: 'Eclipse', value: 'eclipse', theme: eclipse, category: 'light' },
  { name: 'Basic Light', value: 'basicLight', theme: basicLight, category: 'light' },

  // Dark themes
  { name: 'GitHub Dark', value: 'githubDark', theme: githubDark, category: 'dark' },
  { name: 'Dracula', value: 'dracula', theme: dracula, category: 'dark' },
  { name: 'Tokyo Night', value: 'tokyoNight', theme: tokyoNight, category: 'dark' },
  { name: 'Tokyo Night Storm', value: 'tokyoNightStorm', theme: tokyoNightStorm, category: 'dark' },
  { name: 'VS Code Dark', value: 'vscodeDark', theme: vscodeDark, category: 'dark' },
  { name: 'Material Dark', value: 'materialDark', theme: materialDark, category: 'dark' },
  { name: 'Solarized Dark', value: 'solarizedDark', theme: solarizedDark, category: 'dark' },
  { name: 'Nord', value: 'nord', theme: nord, category: 'dark' },
  { name: 'Monokai', value: 'monokai', theme: monokai, category: 'dark' },
  { name: 'Gruvbox Dark', value: 'gruvboxDark', theme: gruvboxDark, category: 'dark' },
  { name: 'Sublime', value: 'sublime', theme: sublime, category: 'dark' },
  { name: 'Okaidia', value: 'okaidia', theme: okaidia, category: 'dark' },
  { name: 'Bespin', value: 'bespin', theme: bespin, category: 'dark' },
  { name: 'Atom One', value: 'atomone', theme: atomone, category: 'dark' },
  { name: 'Aura', value: 'aura', theme: aura, category: 'dark' },
  { name: 'Basic Dark', value: 'basicDark', theme: basicDark, category: 'dark' },
];

// Templates for the markdown editor
export const templates: Record<string, string> = {
  'meeting-notes': `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Time:** 
**Location:** 
**Attendees:** 

## Agenda
1. 
2. 
3. 

## Discussion Points

### Topic 1
- 
- 

### Topic 2
- 
- 

## Decisions Made
- 
- 

## Action Items
- [ ] **Task 1** - Assigned to: [Name] - Due: [Date]
- [ ] **Task 2** - Assigned to: [Name] - Due: [Date]
- [ ] **Task 3** - Assigned to: [Name] - Due: [Date]

## Next Meeting
**Date:** 
**Agenda Items:** 
- 
- 

---
*Meeting notes prepared by: [Your Name]*`,

  'project-readme': `# Project Name

![Project Logo](https://via.placeholder.com/150x150?text=Logo)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)

## Description

Brief description of what your project does and why it exists.

## Features

- ✨ Feature 1
- 🚀 Feature 2
- 🎯 Feature 3
- 🔧 Feature 4

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project-name.git

# Navigate to project directory
cd project-name

# Install dependencies
npm install
\`\`\`

## Usage

\`\`\`javascript
// Example usage
import { ProjectName } from 'project-name';

const example = new ProjectName();
example.doSomething();
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername) - email@example.com

Project Link: [https://github.com/username/project-name](https://github.com/username/project-name)`,

  'blog-post': `# Your Blog Post Title

![Featured Image](https://via.placeholder.com/800x400?text=Featured+Image)

*Published on ${new Date().toLocaleDateString()} by [Your Name]*

## Introduction

Start with a compelling hook that draws readers in. Explain what this post is about and why they should care.

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)
- [Section 3](#section-3)
- [Conclusion](#conclusion)

## Section 1

### Subsection 1.1

Write your content here. Use clear, concise language and break up text with:

- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- \`Code snippets\` for technical terms

> Use blockquotes for important points or quotes

### Subsection 1.2

Include examples, code blocks, or visuals:

\`\`\`javascript
// Example code block
function example() {
  return "This is an example";
}
\`\`\`

## Section 2

Continue developing your main points. Consider including:

1. Numbered lists for step-by-step processes
2. Statistics or data to support your points
3. Personal anecdotes or case studies

## Section 3

Build toward your conclusion. This is where you:

- Tie together all your main points
- Provide actionable insights
- Set up the conclusion

## Conclusion

Summarize your key points and provide a clear call-to-action. What do you want readers to do after reading this?

---

### About the Author

Brief bio about yourself and your expertise in this topic.

### Related Posts

- [Related Post 1](#)
- [Related Post 2](#)
- [Related Post 3](#)

*Tags: #tag1 #tag2 #tag3*`,

  'daily-journal': `# Daily Journal - ${new Date().toLocaleDateString()}

## Today's Weather
☀️ Weather: 
🌡️ Temperature: 

## Mood Check-in
😊 Overall mood: 
💭 Emotional state: 

## Today's Highlights

### What went well today?
- 
- 
- 

### What challenged me today?
- 
- 
- 

### What did I learn today?
- 
- 
- 

## Accomplishments
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## Gratitude
Three things I'm grateful for today:
1. 
2. 
3. 

## Tomorrow's Goals
- [ ] Priority 1
- [ ] Priority 2
- [ ] Priority 3

## Evening Reflection

### How did I grow today?


### What would I do differently?


### Random thoughts/observations:


---
*"Every day is a new beginning. Take a deep breath, smile, and start again."*`,

  'study-notes': `# Study Notes: [Subject/Topic]

**Date:** ${new Date().toLocaleDateString()}
**Chapter/Section:** 
**Source:** 

## Learning Objectives
By the end of this study session, I should be able to:
- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

## Key Concepts

### Concept 1: [Name]
**Definition:** 

**Important Points:**
- 
- 
- 

**Example:** 

### Concept 2: [Name]
**Definition:** 

**Important Points:**
- 
- 
- 

**Example:** 

## Formulas/Equations
\`\`\`
Formula 1: 
Formula 2: 
Formula 3: 
\`\`\`

## Diagrams/Visual Aids
*[Describe or embed images/diagrams]*

## Practice Problems

### Problem 1
**Question:** 

**Solution:** 

### Problem 2
**Question:** 

**Solution:** 

## Summary
Key takeaways from this study session:
- 
- 
- 

## Questions for Further Review
- ? 
- ? 
- ? 

## Next Steps
- [ ] Review these notes
- [ ] Practice additional problems
- [ ] Discuss concepts with study group
- [ ] Prepare for quiz/exam

---
**Study tip:** *Use active recall and spaced repetition for better retention.*`,

  'project-proposal': `# Project Proposal: [Project Name]

**Prepared by:** [Your Name]
**Date:** ${new Date().toLocaleDateString()}
**Version:** 1.0

## Executive Summary

Brief overview of the project, its objectives, and expected outcomes.

## Project Background

### Problem Statement
Describe the problem or opportunity this project addresses.

### Current Situation
Explain the current state and why change is needed.

## Project Objectives

### Primary Objectives
- 
- 
- 

### Secondary Objectives
- 
- 
- 

### Success Criteria
- 
- 
- 

## Scope of Work

### In Scope
- 
- 
- 

### Out of Scope
- 
- 
- 

## Methodology/Approach

Describe how you plan to execute the project:

1. **Phase 1:** Planning and Preparation
2. **Phase 2:** Implementation
3. **Phase 3:** Testing and Validation
4. **Phase 4:** Deployment and Handover

## Timeline

| Phase | Duration | Start Date | End Date | Deliverables |
|-------|----------|------------|----------|--------------|
| Phase 1 | 2 weeks | [Date] | [Date] | Planning documents |
| Phase 2 | 6 weeks | [Date] | [Date] | Core implementation |
| Phase 3 | 2 weeks | [Date] | [Date] | Testing reports |
| Phase 4 | 1 week | [Date] | [Date] | Final delivery |

## Resource Requirements

### Human Resources
- Project Manager: [Name/Role]
- Developer(s): [Name/Role]
- Designer(s): [Name/Role]
- Other: [Name/Role]

### Technical Resources
- 
- 
- 

### Budget Estimate
| Item | Cost | Notes |
|------|------|-------|
| Labor | $X,XXX | |
| Tools/Software | $XXX | |
| Infrastructure | $XXX | |
| **Total** | **$X,XXX** | |

## Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| Risk 1 | Medium | High | Strategy 1 |
| Risk 2 | Low | Medium | Strategy 2 |
| Risk 3 | High | Low | Strategy 3 |

## Expected Benefits

### Quantifiable Benefits
- 
- 
- 

### Qualitative Benefits
- 
- 
- 

## Conclusion

Summarize why this project should be approved and its importance to the organization.

## Next Steps

1. Review and approval of this proposal
2. Secure necessary resources and budget
3. Kick-off meeting and project initiation
4. Begin Phase 1 activities

---

**Approval Required:**
- [ ] Department Head
- [ ] Finance Team
- [ ] Technical Lead
- [ ] Project Sponsor`,

  'api-documentation': `# API Documentation

## Overview

Brief description of your API, its purpose, and main functionality.

**Base URL:** \`https://api.example.com/v1\`
**Version:** 1.0
**Last Updated:** ${new Date().toLocaleDateString()}

## Authentication

### API Key Authentication
\`\`\`http
GET /endpoint
Authorization: Bearer YOUR_API_KEY
\`\`\`

### OAuth 2.0
\`\`\`http
GET /endpoint
Authorization: Bearer YOUR_ACCESS_TOKEN
\`\`\`

## Rate Limiting

- **Rate Limit:** 1000 requests per hour
- **Headers:**
  - \`X-RateLimit-Limit\`: Request limit per hour
  - \`X-RateLimit-Remaining\`: Remaining requests
  - \`X-RateLimit-Reset\`: Time when limit resets

## Endpoints

### Users

#### Get User
\`GET /users/{id}\`

**Description:** Retrieve a specific user by ID.

**Parameters:**
- \`id\` (path, required): User ID

**Response:**
\`\`\`json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2023-01-01T00:00:00Z"
}
\`\`\`

#### Create User
\`POST /users\`

**Description:** Create a new user.

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2023-01-01T00:00:00Z"
}
\`\`\`

#### Update User
\`PUT /users/{id}\`

**Description:** Update an existing user.

**Parameters:**
- \`id\` (path, required): User ID

**Request Body:**
\`\`\`json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
\`\`\`

#### Delete User
\`DELETE /users/{id}\`

**Description:** Delete a user.

**Parameters:**
- \`id\` (path, required): User ID

**Response:** 204 No Content

## Error Handling

### Error Response Format
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
\`\`\`

### HTTP Status Codes
- \`200\` - OK
- \`201\` - Created
- \`204\` - No Content
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`403\` - Forbidden
- \`404\` - Not Found
- \`429\` - Too Many Requests
- \`500\` - Internal Server Error

## Code Examples

### JavaScript/Node.js
\`\`\`javascript
const response = await fetch('https://api.example.com/v1/users/123', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const user = await response.json();
\`\`\`

### Python
\`\`\`python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.example.com/v1/users/123', headers=headers)
user = response.json()
\`\`\`

### cURL
\`\`\`bash
curl -X GET "https://api.example.com/v1/users/123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"
\`\`\`

## SDKs and Libraries

- **JavaScript:** [@company/api-client](https://npmjs.com/package/@company/api-client)
- **Python:** [company-api-python](https://pypi.org/project/company-api-python/)
- **PHP:** [company/api-client](https://packagist.org/packages/company/api-client)

## Changelog

### Version 1.0 (${new Date().toLocaleDateString()})
- Initial release
- User management endpoints
- Authentication system

---

**Need Help?**
- 📧 Email: api-support@example.com
- 📚 Guides: [Developer Portal](https://developers.example.com)
- 💬 Community: [Discord](https://discord.gg/example)`,

  'task-list': `# Task Management - ${new Date().toLocaleDateString()}

## Today's Priority Tasks
- [ ] **High Priority:** Task 1 - Due: [Time]
- [ ] **High Priority:** Task 2 - Due: [Time]
- [ ] **Medium Priority:** Task 3 - Due: [Time]

## Weekly Goals
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3
- [ ] Goal 4

## Project Tasks

### Project A
- [ ] Task 1 - Assigned to: [Name] - Due: [Date]
- [ ] Task 2 - Assigned to: [Name] - Due: [Date]
- [ ] Task 3 - Assigned to: [Name] - Due: [Date]

### Project B
- [ ] Task 1 - Assigned to: [Name] - Due: [Date]
- [ ] Task 2 - Assigned to: [Name] - Due: [Date]

## Backlog
- [ ] Future task 1
- [ ] Future task 2
- [ ] Future task 3

## Completed Tasks ✅
- [x] ~~Completed task 1~~ - Completed on [Date]
- [x] ~~Completed task 2~~ - Completed on [Date]

## Notes & Ideas
- 💡 Idea 1: 
- 💡 Idea 2: 
- 📝 Note 1: 
- 📝 Note 2: 

## Daily Standup Notes

### What I worked on yesterday:
- 
- 

### What I'm working on today:
- 
- 

### Blockers/Issues:
- 
- 

## Review & Reflection

### What went well this week?
- 
- 

### What could be improved?
- 
- 

### Lessons learned:
- 
- 

---
*Task management tip: Break large tasks into smaller, actionable items for better progress tracking.*`
};