import React from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FunctionsIcon from '@mui/icons-material/Functions';
import CalculateIcon from '@mui/icons-material/Calculate';
import { Template } from '@/types/templates';

export const templates: Template[] = [
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structure your meeting notes with agenda, participants, and action items',
    icon: React.createElement(BusinessIcon),
    category: 'business',
    content: `# Meeting Notes

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
*Meeting notes prepared by: [Your Name]*`
  },
  {
    id: 'project-readme',
    name: 'Project README',
    description: 'Professional README template for your projects',
    icon: React.createElement(CodeIcon),
    category: 'project',
    content: `# Project Name

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

## API Reference

### Methods

#### \`method(param)\`
- **Description:** What the method does
- **Parameters:** 
  - \`param\` (string): Description of parameter
- **Returns:** Description of return value

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

Project Link: [https://github.com/username/project-name](https://github.com/username/project-name)`
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Template for writing engaging blog posts',
    icon: React.createElement(ArticleIcon),
    category: 'article',
    content: `# Your Blog Post Title

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

*Tags: #tag1 #tag2 #tag3*`
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    description: 'Reflect on your day with this personal journal template',
    icon: React.createElement(CalendarTodayIcon),
    category: 'personal',
    content: `# Daily Journal - ${new Date().toLocaleDateString()}

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
*"Every day is a new beginning. Take a deep breath, smile, and start again."*`
  },
  {
    id: 'study-notes',
    name: 'Study Notes',
    description: 'Organize your study materials and notes effectively',
    icon: React.createElement(SchoolIcon),
    category: 'education',
    content: `# Study Notes: [Subject/Topic]

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
**Study tip:** *Use active recall and spaced repetition for better retention.*`
  },
  {
    id: 'project-proposal',
    name: 'Project Proposal',
    description: 'Professional project proposal template',
    icon: React.createElement(TrendingUpIcon),
    category: 'business',
    content: `# Project Proposal: [Project Name]

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
- [ ] Project Sponsor`
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    description: 'Comprehensive API documentation template',
    icon: React.createElement(DescriptionIcon),
    category: 'documentation',
    content: `# API Documentation

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
- 💬 Community: [Discord](https://discord.gg/example)`
  },
  {
    id: 'task-list',
    name: 'Task Management',
    description: 'Organize your tasks and track progress',
    icon: React.createElement(ListAltIcon),
    category: 'personal',
    content: `# Task Management - ${new Date().toLocaleDateString()}

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
  },

  // Math Templates
  {
    id: 'calculus-notes',
    name: 'Calculus Notes',
    description: 'Comprehensive template for calculus concepts, derivatives, and integrals',
    icon: React.createElement(FunctionsIcon),
    category: 'math',
    content: `# Calculus Notes - [Topic]

**Date:** ${new Date().toLocaleDateString()}
**Chapter:** 
**Professor/Source:** 

## Learning Objectives
- [ ] Understand [concept 1]
- [ ] Master [technique 1]
- [ ] Apply [theorem 1]

## Key Definitions

### Definition 1: [Name]
**Definition:** 

**Notation:** 

**Example:** 

---

### Definition 2: [Name]
**Definition:** 

**Notation:** 

**Example:** 

---

## Important Theorems

### Theorem 1: [Name]
**Statement:** 

**Conditions:** 
- 
- 

**Proof Sketch:** 

**Applications:** 
- 
- 

---

## Derivatives

### Basic Derivative Rules
| Function | Derivative | Notes |
|----------|------------|-------|
| \`f(x) = c\` | \`f'(x) = 0\` | Constant rule |
| \`f(x) = x^n\` | \`f'(x) = nx^{n-1}\` | Power rule |
| \`f(x) = e^x\` | \`f'(x) = e^x\` | Exponential |
| \`f(x) = ln(x)\` | \`f'(x) = 1/x\` | Natural log |

### Chain Rule
**Formula:** \`(f(g(x)))' = f'(g(x)) · g'(x)\`

**Example:** 

---

## Integrals

### Basic Integration Rules
| Function | Integral | Notes |
|----------|----------|-------|
| \`∫ x^n dx\` | \`(x^{n+1})/(n+1) + C\` | Power rule (n ≠ -1) |
| \`∫ e^x dx\` | \`e^x + C\` | Exponential |
| \`∫ 1/x dx\` | \`ln|x| + C\` | Natural log |

### Integration Techniques
1. **Substitution (u-substitution)**
   - When to use: 
   - Steps: 

2. **Integration by Parts**
   - Formula: \`∫ u dv = uv - ∫ v du\`
   - When to use: 

---

## Worked Examples

### Example 1: [Problem Type]
**Problem:** 

**Solution:**
Step 1: 

Step 2: 

Step 3: 

**Answer:** 

---

### Example 2: [Problem Type]
**Problem:** 

**Solution:**
Step 1: 

Step 2: 

Step 3: 

**Answer:** 

---

## Practice Problems
- [ ] Problem 1: 
- [ ] Problem 2: 
- [ ] Problem 3: 

## Summary
Key takeaways from this lesson:
- 
- 
- 

## Questions for Review
- ? 
- ? 
- ? 

---
*Remember: Practice makes perfect in calculus. Work through problems step by step.*`
  },

  {
    id: 'linear-algebra',
    name: 'Linear Algebra',
    description: 'Matrix operations, vector spaces, and linear transformations',
    icon: React.createElement(CalculateIcon),
    category: 'math',
    content: `# Linear Algebra Notes - [Topic]

**Date:** ${new Date().toLocaleDateString()}
**Chapter:** 
**Course:** 

## Learning Objectives
- [ ] Understand [concept]
- [ ] Master [operation]
- [ ] Apply [theorem]

## Vector Spaces

### Definition
A vector space V over a field F is a set with two operations:
- **Vector addition:** \`u + v ∈ V\` for all \`u, v ∈ V\`
- **Scalar multiplication:** \`cu ∈ V\` for all \`c ∈ F, u ∈ V\`

### Vector Space Axioms
1. **Associativity:** \`(u + v) + w = u + (v + w)\`
2. **Commutativity:** \`u + v = v + u\`
3. **Identity element:** \`∃ 0 ∈ V\` such that \`v + 0 = v\`
4. **Inverse elements:** \`∀ v ∈ V, ∃ (-v) ∈ V\` such that \`v + (-v) = 0\`
5. **Scalar multiplication compatibility:** \`a(bv) = (ab)v\`
6. **Identity element of scalar multiplication:** \`1v = v\`
7. **Distributivity:** \`a(u + v) = au + av\` and \`(a + b)v = av + bv\`

---

## Matrices

### Matrix Operations

#### Addition
Matrices \`A\` and \`B\` can be added if they have the same dimensions:
\`(A + B)_{ij} = A_{ij} + B_{ij}\`

#### Multiplication
For matrices \`A_{m×n}\` and \`B_{n×p}\`:
\`(AB)_{ij} = ∑_{k=1}^n A_{ik}B_{kj}\`

### Special Matrices
- **Identity Matrix:** \`I_n\` where \`I_{ij} = 1\` if \`i = j\`, 0 otherwise
- **Zero Matrix:** All entries are 0
- **Transpose:** \`(A^T)_{ij} = A_{ji}\`
- **Symmetric:** \`A = A^T\`
- **Skew-symmetric:** \`A = -A^T\`

---

## Linear Transformations

### Definition
A function \`T: V → W\` is a linear transformation if:
1. \`T(u + v) = T(u) + T(v)\` for all \`u, v ∈ V\`
2. \`T(cu) = cT(u)\` for all \`c ∈ F, u ∈ V\`

### Matrix Representation
Every linear transformation \`T: ℝ^n → ℝ^m\` can be represented by an \`m × n\` matrix \`A\`:
\`T(x) = Ax\`

### Important Properties
- **Kernel (Null Space):** \`ker(T) = {v ∈ V : T(v) = 0}\`
- **Image (Range):** \`im(T) = {T(v) : v ∈ V}\`
- **Rank-Nullity Theorem:** \`dim(V) = dim(ker(T)) + dim(im(T))\`

---

## Eigenvalues and Eigenvectors

### Definitions
- **Eigenvector:** Non-zero vector \`v\` such that \`Av = λv\`
- **Eigenvalue:** Scalar \`λ\` corresponding to eigenvector \`v\`

### Finding Eigenvalues
Solve the characteristic equation: \`det(A - λI) = 0\`

### Finding Eigenvectors
For each eigenvalue \`λ\`, solve: \`(A - λI)v = 0\`

---

## Worked Examples

### Example 1: Matrix Multiplication
**Problem:** Calculate \`AB\` where:
\`A = [1 2; 3 4]\` and \`B = [5 6; 7 8]\`

**Solution:**
\`AB = [1×5+2×7  1×6+2×8; 3×5+4×7  3×6+4×8] = [19 22; 43 50]\`

---

### Example 2: Finding Eigenvalues
**Problem:** Find eigenvalues of \`A = [3 1; 0 2]\`

**Solution:**
1. Characteristic polynomial: \`det(A - λI) = det([3-λ 1; 0 2-λ]) = (3-λ)(2-λ)\`
2. Eigenvalues: \`λ₁ = 3\`, \`λ₂ = 2\`

---

## Key Theorems

### Theorem 1: Invertible Matrix Theorem
For an \`n × n\` matrix \`A\`, the following are equivalent:
- \`A\` is invertible
- \`det(A) ≠ 0\`
- \`A\` has rank \`n\`
- The columns of \`A\` are linearly independent
- \`Ax = 0\` has only the trivial solution

---

## Practice Problems
- [ ] Calculate: \`[2 3; 1 4] × [1 0; 2 1]\`
- [ ] Find eigenvalues of: \`[4 2; 1 3]\`
- [ ] Determine if vectors are linearly independent: \`{[1;2;3], [2;1;0], [0;1;1]}\`

## Summary
Key concepts covered:
- 
- 
- 

---
*Linear algebra is the foundation of many advanced mathematical concepts.*`
  },

  {
    id: 'statistics-notes',
    name: 'Statistics & Probability',
    description: 'Probability distributions, hypothesis testing, and statistical analysis',
    icon: React.createElement(TrendingUpIcon),
    category: 'math',
    content: `# Statistics & Probability Notes - [Topic]

**Date:** ${new Date().toLocaleDateString()}
**Chapter:** 
**Course:** 

## Learning Objectives
- [ ] Understand [probability concept]
- [ ] Master [statistical test]
- [ ] Apply [distribution]

## Basic Probability

### Probability Rules
1. **Addition Rule:** \`P(A ∪ B) = P(A) + P(B) - P(A ∩ B)\`
2. **Multiplication Rule:** \`P(A ∩ B) = P(A) × P(B|A)\`
3. **Complement Rule:** \`P(A^c) = 1 - P(A)\`

### Conditional Probability
\`P(A|B) = P(A ∩ B) / P(B)\` where \`P(B) > 0\`

### Bayes' Theorem
\`P(A|B) = P(B|A) × P(A) / P(B)\`

---

## Probability Distributions

### Discrete Distributions

#### Binomial Distribution
- **Parameters:** \`n\` (trials), \`p\` (success probability)
- **PMF:** \`P(X = k) = C(n,k) × p^k × (1-p)^{n-k}\`
- **Mean:** \`μ = np\`
- **Variance:** \`σ² = np(1-p)\`

#### Poisson Distribution
- **Parameter:** \`λ\` (rate)
- **PMF:** \`P(X = k) = e^{-λ} × λ^k / k!\`
- **Mean:** \`μ = λ\`
- **Variance:** \`σ² = λ\`

### Continuous Distributions

#### Normal Distribution
- **Parameters:** \`μ\` (mean), \`σ\` (standard deviation)
- **PDF:** \`f(x) = (1/(σ√(2π))) × e^{-(x-μ)²/(2σ²)}\`
- **Standard Normal:** \`Z = (X - μ) / σ\`

#### Exponential Distribution
- **Parameter:** \`λ\` (rate)
- **PDF:** \`f(x) = λe^{-λx}\` for \`x ≥ 0\`
- **Mean:** \`μ = 1/λ\`
- **Variance:** \`σ² = 1/λ²\`

---

## Descriptive Statistics

### Measures of Central Tendency
- **Mean:** \`x̄ = (Σx_i) / n\`
- **Median:** Middle value when data is ordered
- **Mode:** Most frequently occurring value

### Measures of Variability
- **Range:** \`max - min\`
- **Variance:** \`s² = Σ(x_i - x̄)² / (n-1)\`
- **Standard Deviation:** \`s = √s²\`
- **Interquartile Range:** \`IQR = Q₃ - Q₁\`

---

## Hypothesis Testing

### General Procedure
1. **State hypotheses:** \`H₀\` (null) and \`H₁\` (alternative)
2. **Choose significance level:** \`α\` (typically 0.05)
3. **Calculate test statistic**
4. **Find p-value or critical value**
5. **Make decision:** Reject or fail to reject \`H₀\`

### Common Tests

#### One-Sample t-test
- **Test statistic:** \`t = (x̄ - μ₀) / (s/√n)\`
- **Degrees of freedom:** \`df = n - 1\`

#### Two-Sample t-test
- **Test statistic:** \`t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)\`

#### Chi-Square Test
- **Test statistic:** \`χ² = Σ((O - E)² / E)\`
- **Degrees of freedom:** \`df = (rows - 1) × (columns - 1)\`

---

## Confidence Intervals

### For Population Mean (σ known)
\`x̄ ± z_{α/2} × (σ/√n)\`

### For Population Mean (σ unknown)
\`x̄ ± t_{α/2} × (s/√n)\`

### For Population Proportion
\`p̂ ± z_{α/2} × √(p̂(1-p̂)/n)\`

---

## Worked Examples

### Example 1: Normal Distribution
**Problem:** If \`X ~ N(100, 15²)\`, find \`P(85 < X < 115)\`

**Solution:**
1. Standardize: \`Z₁ = (85-100)/15 = -1\`, \`Z₂ = (115-100)/15 = 1\`
2. \`P(85 < X < 115) = P(-1 < Z < 1) = 0.6827\`

---

### Example 2: Hypothesis Test
**Problem:** Test if \`μ = 50\` given \`x̄ = 52\`, \`s = 8\`, \`n = 25\`

**Solution:**
1. \`H₀: μ = 50\`, \`H₁: μ ≠ 50\`
2. \`t = (52-50)/(8/√25) = 2/1.6 = 1.25\`
3. \`df = 24\`, critical value \`t₀.₀₂₅ = 2.064\`
4. Since \`|1.25| < 2.064\`, fail to reject \`H₀\`

---

## Statistical Software

### R Commands
\`\`\`r
# Normal distribution
pnorm(1.96)  # P(Z ≤ 1.96)
qnorm(0.975) # 97.5th percentile

# t-test
t.test(data, mu = 50)

# Chi-square test
chisq.test(table)
\`\`\`

### Python (scipy.stats)
\`\`\`python
from scipy import stats

# Normal distribution
stats.norm.cdf(1.96)
stats.norm.ppf(0.975)

# t-test
stats.ttest_1samp(data, 50)

# Chi-square test
stats.chi2_contingency(table)
\`\`\`

---

## Practice Problems
- [ ] Calculate \`P(X > 2)\` if \`X ~ Poisson(3)\`
- [ ] Find 95% CI for mean given \`x̄ = 25\`, \`s = 4\`, \`n = 16\`
- [ ] Test \`H₀: p = 0.5\` vs \`H₁: p ≠ 0.5\` with 45 successes in 100 trials

## Summary
Key concepts:
- 
- 
- 

---
*Statistics helps us make sense of uncertainty and variability in data.*`
  },

  {
    id: 'discrete-math',
    name: 'Discrete Mathematics',
    description: 'Logic, set theory, combinatorics, and graph theory',
    icon: React.createElement(FunctionsIcon),
    category: 'math',
    content: `# Discrete Mathematics Notes - [Topic]

**Date:** ${new Date().toLocaleDateString()}
**Chapter:** 
**Course:** 

## Learning Objectives
- [ ] Master [logical concept]
- [ ] Understand [set operation]
- [ ] Apply [combinatorial principle]

## Logic and Proofs

### Logical Operators
| Operator | Symbol | Truth Condition |
|----------|--------|-----------------|
| Negation | ¬p | True when p is false |
| Conjunction | p ∧ q | True when both p and q are true |
| Disjunction | p ∨ q | True when at least one is true |
| Implication | p → q | False only when p is true and q is false |
| Biconditional | p ↔ q | True when p and q have same truth value |

### Logical Equivalences
- **De Morgan's Laws:** 
  - ¬(p ∧ q) ≡ ¬p ∨ ¬q
  - ¬(p ∨ q) ≡ ¬p ∧ ¬q
- **Distributive Laws:**
  - p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r)
  - p ∨ (q ∧ r) ≡ (p ∨ q) ∧ (p ∨ r)

### Proof Techniques
1. **Direct Proof:** Assume p, prove q
2. **Proof by Contradiction:** Assume ¬q, derive contradiction
3. **Proof by Contraposition:** Prove ¬q → ¬p
4. **Mathematical Induction:**
   - Base case: Prove P(1)
   - Inductive step: Prove P(k) → P(k+1)

---

## Set Theory

### Basic Definitions
- **Set:** Collection of distinct objects
- **Element:** Object in a set (x ∈ A)
- **Subset:** A ⊆ B if every element of A is in B
- **Empty Set:** ∅ has no elements
- **Universal Set:** U contains all objects under consideration

### Set Operations
- **Union:** A ∪ B = {x : x ∈ A or x ∈ B}
- **Intersection:** A ∩ B = {x : x ∈ A and x ∈ B}
- **Difference:** A - B = {x : x ∈ A and x ∉ B}
- **Complement:** A^c = {x ∈ U : x ∉ A}
- **Cartesian Product:** A × B = {(a,b) : a ∈ A and b ∈ B}

### Set Identities
- **Commutative:** A ∪ B = B ∪ A, A ∩ B = B ∩ A
- **Associative:** (A ∪ B) ∪ C = A ∪ (B ∪ C)
- **De Morgan's:** (A ∪ B)^c = A^c ∩ B^c

---

## Combinatorics

### Counting Principles
1. **Addition Principle:** If tasks can be done in m or n ways, total is m + n
2. **Multiplication Principle:** If tasks are done in sequence, total is m × n

### Permutations and Combinations

#### Permutations
- **Without repetition:** P(n,r) = n!/(n-r)!
- **With repetition:** n^r
- **Circular:** (n-1)!

#### Combinations
- **Without repetition:** C(n,r) = n!/(r!(n-r)!)
- **With repetition:** C(n+r-1,r)

### Binomial Theorem
(x + y)^n = Σ(k=0 to n) C(n,k) × x^(n-k) × y^k

---

## Graph Theory

### Basic Definitions
- **Graph:** G = (V, E) where V is vertices, E is edges
- **Degree:** Number of edges incident to a vertex
- **Path:** Sequence of vertices connected by edges
- **Cycle:** Path that starts and ends at same vertex
- **Connected:** There's a path between any two vertices

### Types of Graphs
- **Simple Graph:** No loops or multiple edges
- **Complete Graph:** Every pair of vertices is connected
- **Bipartite Graph:** Vertices can be divided into two disjoint sets
- **Tree:** Connected graph with no cycles
- **Directed Graph:** Edges have direction

### Important Theorems
- **Handshaking Lemma:** Σ deg(v) = 2|E|
- **Euler's Formula:** For connected planar graph: v - e + f = 2

---

## Relations and Functions

### Relations
- **Reflexive:** aRa for all a ∈ A
- **Symmetric:** aRb implies bRa
- **Transitive:** aRb and bRc implies aRc
- **Equivalence Relation:** Reflexive, symmetric, and transitive

### Functions
- **Injective (One-to-one):** f(a) = f(b) implies a = b
- **Surjective (Onto):** For every b ∈ B, ∃a ∈ A such that f(a) = b
- **Bijective:** Both injective and surjective

---

## Worked Examples

### Example 1: Proof by Induction
**Problem:** Prove that 1 + 2 + ... + n = n(n+1)/2

**Proof:**
**Base case:** n = 1: LHS = 1, RHS = 1(2)/2 = 1 ✓

**Inductive step:** Assume true for k, prove for k+1:
1 + 2 + ... + k + (k+1) = k(k+1)/2 + (k+1)
= (k+1)(k/2 + 1) = (k+1)(k+2)/2 ✓

---

### Example 2: Combinatorics
**Problem:** How many ways to choose 3 people from 10 for a committee?

**Solution:** C(10,3) = 10!/(3!7!) = 120

---

## Practice Problems
- [ ] Prove: If n is odd, then n² is odd
- [ ] Find |A ∪ B| if |A| = 15, |B| = 12, |A ∩ B| = 5
- [ ] How many 4-digit numbers can be formed using digits 1-6?
- [ ] Draw the complete graph K₅

## Summary
Key topics covered:
- 
- 
- 

---
*Discrete mathematics provides the foundation for computer science and logic.*`
  },

  {
    id: 'geometry-proofs',
    name: 'Geometry & Proofs',
    description: 'Euclidean geometry, coordinate geometry, and geometric proofs',
    icon: React.createElement(SchoolIcon),
    category: 'math',
    content: `# Geometry & Proofs - [Topic]

**Date:** ${new Date().toLocaleDateString()}
**Chapter:** 
**Course:** 

## Learning Objectives
- [ ] Master [geometric concept]
- [ ] Prove [theorem]
- [ ] Apply [geometric formula]

## Basic Geometric Concepts

### Points, Lines, and Planes
- **Point:** Location with no dimension
- **Line:** Infinite collection of points extending in both directions
- **Ray:** Part of a line with one endpoint
- **Segment:** Part of a line with two endpoints
- **Plane:** Flat surface extending infinitely

### Angles
- **Acute:** 0° < θ < 90°
- **Right:** θ = 90°
- **Obtuse:** 90° < θ < 180°
- **Straight:** θ = 180°
- **Reflex:** 180° < θ < 360°

### Angle Relationships
- **Complementary:** Two angles that sum to 90°
- **Supplementary:** Two angles that sum to 180°
- **Vertical:** Opposite angles formed by intersecting lines
- **Adjacent:** Angles that share a common side

---

## Triangles

### Triangle Classifications

#### By Sides
- **Equilateral:** All sides equal
- **Isosceles:** Two sides equal
- **Scalene:** All sides different

#### By Angles
- **Acute:** All angles < 90°
- **Right:** One angle = 90°
- **Obtuse:** One angle > 90°

### Triangle Theorems
- **Angle Sum:** Sum of angles = 180°
- **Exterior Angle:** Exterior angle = sum of remote interior angles
- **Triangle Inequality:** Sum of any two sides > third side

### Congruence Postulates
- **SSS:** Three sides congruent
- **SAS:** Two sides and included angle
- **ASA:** Two angles and included side
- **AAS:** Two angles and non-included side
- **HL:** Hypotenuse and leg (right triangles)

### Similarity Theorems
- **AA:** Two angles congruent
- **SSS:** Three sides proportional
- **SAS:** Two sides proportional and included angle congruent

---

## Quadrilaterals

### Properties
- **Parallelogram:**
  - Opposite sides parallel and equal
  - Opposite angles equal
  - Diagonals bisect each other

- **Rectangle:**
  - All properties of parallelogram
  - All angles are right angles
  - Diagonals are equal

- **Rhombus:**
  - All properties of parallelogram
  - All sides equal
  - Diagonals are perpendicular

- **Square:**
  - All properties of rectangle and rhombus

---

## Circles

### Basic Elements
- **Center:** Fixed point
- **Radius:** Distance from center to circle
- **Diameter:** Chord through center
- **Chord:** Line segment with endpoints on circle
- **Tangent:** Line touching circle at one point
- **Secant:** Line intersecting circle at two points

### Circle Theorems
- **Inscribed Angle:** Half the central angle
- **Tangent-Chord:** Angle between tangent and chord = inscribed angle
- **Power of a Point:** For intersecting chords: PA × PB = PC × PD

### Circle Formulas
- **Circumference:** C = 2πr = πd
- **Area:** A = πr²
- **Arc Length:** s = rθ (θ in radians)
- **Sector Area:** A = ½r²θ

---

## Coordinate Geometry

### Distance and Midpoint
- **Distance Formula:** d = √[(x₂-x₁)² + (y₂-y₁)²]
- **Midpoint Formula:** M = ((x₁+x₂)/2, (y₁+y₂)/2)

### Lines
- **Slope:** m = (y₂-y₁)/(x₂-x₁)
- **Point-Slope Form:** y - y₁ = m(x - x₁)
- **Slope-Intercept Form:** y = mx + b
- **Standard Form:** Ax + By = C

### Parallel and Perpendicular Lines
- **Parallel:** Same slope (m₁ = m₂)
- **Perpendicular:** Negative reciprocal slopes (m₁ × m₂ = -1)

---

## Area and Volume Formulas

### 2D Shapes
| Shape | Area Formula |
|-------|--------------|
| Triangle | A = ½bh |
| Rectangle | A = lw |
| Square | A = s² |
| Circle | A = πr² |
| Parallelogram | A = bh |
| Trapezoid | A = ½(b₁ + b₂)h |

### 3D Shapes
| Shape | Volume Formula | Surface Area |
|-------|----------------|--------------|
| Cube | V = s³ | SA = 6s² |
| Rectangular Prism | V = lwh | SA = 2(lw + lh + wh) |
| Cylinder | V = πr²h | SA = 2πr² + 2πrh |
| Sphere | V = (4/3)πr³ | SA = 4πr² |
| Cone | V = (1/3)πr²h | SA = πr² + πrl |

---

## Proof Techniques

### Two-Column Proof Format
| Statement | Reason |
|-----------|---------|
| 1. Given information | 1. Given |
| 2. Next logical step | 2. Definition/Postulate/Theorem |
| 3. Continue... | 3. Reason for step 3 |
| ... | ... |
| n. Conclusion | n. Reason for conclusion |

### Common Proof Strategies
1. **Direct Proof:** Use definitions and known facts
2. **Indirect Proof:** Assume opposite and find contradiction
3. **Coordinate Proof:** Use coordinate geometry

---

## Worked Examples

### Example 1: Triangle Congruence
**Given:** AB ≅ CD, AB ∥ CD
**Prove:** △ABC ≅ △CDA

**Proof:**
| Statement | Reason |
|-----------|---------|
| 1. AB ≅ CD | 1. Given |
| 2. AB ∥ CD | 2. Given |
| 3. AC ≅ AC | 3. Reflexive Property |
| 4. ∠BAC ≅ ∠DCA | 4. Alternate Interior Angles |
| 5. △ABC ≅ △CDA | 5. SAS |

---

### Example 2: Circle Problem
**Problem:** Find the area of a circle with radius 5 cm.

**Solution:**
A = πr² = π(5)² = 25π ≈ 78.54 cm²

---

## Practice Problems
- [ ] Prove: The diagonals of a rectangle are equal
- [ ] Find the area of a triangle with vertices (0,0), (4,0), (2,3)
- [ ] If two parallel lines are cut by a transversal, prove alternate interior angles are equal

## Summary
Key concepts:
- 
- 
- 

---
*Geometry combines logical reasoning with spatial visualization.*`
  }
];

export const categories = [
  { id: 'all', name: 'All Templates', count: templates.length },
  { id: 'documentation', name: 'Documentation', count: templates.filter(t => t.category === 'documentation').length },
  { id: 'article', name: 'Articles', count: templates.filter(t => t.category === 'article').length },
  { id: 'project', name: 'Projects', count: templates.filter(t => t.category === 'project').length },
  { id: 'business', name: 'Business', count: templates.filter(t => t.category === 'business').length },
  { id: 'education', name: 'Education', count: templates.filter(t => t.category === 'education').length },
  { id: 'personal', name: 'Personal', count: templates.filter(t => t.category === 'personal').length },
  { id: 'math', name: 'Mathematics', count: templates.filter(t => t.category === 'math').length },
]; 