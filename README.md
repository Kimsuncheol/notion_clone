# Notion Clone - Inter-Table Navigation

This Notion-like editor supports advanced navigation between table blocks.

## Inter-Table Navigation Features

### Vertical Navigation Between Tables

When you have multiple table blocks in sequence, you can navigate between them using arrow keys:

#### Scenario 1: Arrow Down Navigation
- **Current Position**: Table 1, Row k-1, Column t (where 0 ≤ t < n)
- **Action**: Press Arrow Down
- **Result**: Navigate to Table 2, Row 0, Column min(t, q-1)

#### Scenario 2: Arrow Up Navigation  
- **Current Position**: Table 2, Row 0, Column t (where 0 ≤ t < o)
- **Action**: Press Arrow Up
- **Result**: Navigate to Table 1, Row m-1, Column min(t, n-1)

### Key Features

1. **Column Preservation**: When navigating between tables, the system attempts to maintain the same column position
2. **Boundary Handling**: If the target table has fewer columns, navigation goes to the last available column
3. **Smart Positioning**: 
   - Arrow Down from last row → First row of next table
   - Arrow Up from first row → Last row of previous table

### Example Navigation Flow

```
Table 0 [5×3]  ← Arrow Up from Table 1 goes to row 4, same column
Table 1 [3×4]  ← Arrow Down from Table 0 goes to row 0, same column  
Table 2 [6×2]  ← Arrow Down from Table 1 goes to row 0, min(column, 1)
```

### Usage

1. Create multiple table blocks using `/table` command
2. Navigate within tables using arrow keys
3. When you reach the edge of a table (first/last row), continue pressing arrow keys to move to adjacent tables
4. The cursor will automatically position itself in the appropriate cell of the target table

### Technical Implementation

- Tables pass their current row/column coordinates when navigating out of bounds
- The Editor component calculates the optimal target position based on table dimensions
- Navigation preserves column position when possible, falling back to boundary columns when necessary

## Development

To test the inter-table navigation:

1. Start the development server: `npm run dev`
2. Create a new page
3. Add multiple table blocks using `/table`
4. Use arrow keys to navigate between tables and observe the smart positioning

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
