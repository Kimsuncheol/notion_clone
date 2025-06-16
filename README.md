# Notion Clone

A feature-rich Notion-like editor built with Next.js, TypeScript, and Firebase.

## Features

### Table Block Enhancements

#### Column and Row Resizing
- **Column Resizing**: When you select a full column (all cells from row 0 to row m-1 in a column), you can resize the column width by dragging the right border of the selected column
  - **Space Redistribution**: Resizing a column redistributes space to/from adjacent columns to maintain fixed table width
  - **Adjacent Column Priority**: Space is taken from/given to the next column (right side), or previous column if no next column exists
- **Row Resizing**: When you select a full row (all cells from column 0 to column n-1 in a row), you can resize the row height by dragging the bottom border of the selected row
- **Constraints**: 
  - **Fixed Table Width**: Total table width remains constant during column resizing (600px default)
  - **Minimum column width**: 60px (prevents adjacent columns from becoming too narrow)
  - **Minimum row height**: 24px
  - **Redistribution Logic**: Column resizing only proceeds if adjacent columns can accommodate the change

#### Column and Row Addition
- **Add Column**: 
  - **Hover Effect**: Hover over the right border of the table to see sky-blue border with '+' icon
  - **Click to Add**: Click the right border to add a new column (up to 7 columns maximum)
  - **Visual Feedback**: Border becomes thicker and shows '+' icon on hover
  - **Growth**: Table width grows with new columns (up to 800px maximum)
- **Add Row**:
  - **Hover Effect**: Hover over the bottom border of the table to see sky-blue border with '+' icon  
  - **Click to Add**: Click the bottom border to add a new row
  - **Alternative**: Press Enter in the last row to automatically add a new row

#### Column and Row Deletion
- **Column Deletion**: Select full column(s) by clicking and dragging from [0][c] to [m-1][c], then press **Backspace** to delete the selected column(s)
- **Row Deletion**: Select full row(s) by clicking and dragging from [r][0] to [r][n-1], then press **Backspace** to delete the selected row(s)
- **Safety**: Cannot delete all columns or all rows - at least one must remain

#### Selection Patterns
- **Full Column Selection**: Drag from cell (0, c) to cell (m-1, c) where m is the number of rows
- **Full Row Selection**: Drag from cell (r, 0) to cell (r, n-1) where n is the number of columns
- **Multiple Columns**: Drag from (0, c1) to (m-1, c2) to select columns c1 through c2
- **Multiple Rows**: Drag from (r1, 0) to (r2, n-1) to select rows r1 through r2

#### Cross-Platform Support
- **Mac**: Uses Cmd+C for copying (detects Mac automatically)
- **Windows/Linux**: Uses Ctrl+C for copying
- **Backspace**: Works on all platforms for deletion

#### Dynamic Table Width Behavior
- **Growing Width**: Table width can grow up to 800px maximum as columns are added
- **Smart Resizing**: When you resize a column:
  1. **Growth Mode**: If table width < 800px, column simply expands
  2. **Redistributive Mode**: If at max width (800px), space is redistributed with adjacent columns
  3. **Primary Target**: Space is taken from/given to the **next column** (right side)
  4. **Fallback Target**: If no next column exists, space is redistributed with the **previous column** (left side)
  5. **Minimum Width Protection**: Resizing only occurs if the adjacent column can maintain minimum width (60px)
- **Column Limits**: Maximum of 7 columns allowed
- **Smart Initialization**: New columns receive default width (120px)

#### Visual Feedback
- **Selection Highlighting**: Selected cells show blue background
- **Resize Handles**: Blue handles appear on selected columns/rows for resizing
- **Add Column/Row Borders**: 
  - **Sky-blue hover effect** on right and bottom borders when hovering
  - **'+' icon** appears on hover to indicate add functionality
  - **Thicker borders** (4px) when actively hovering vs normal (2px)
  - **Smooth transitions** with 200ms duration for professional feel
- **Cursor Changes**: 
  - `cursor-col-resize` for column resizing
  - `cursor-row-resize` for row resizing
  - `cursor-pointer` for add column/row borders
- **Constraint Feedback**: 
  - Resize operations are prevented if they would violate minimum width constraints
  - Add column disabled when maximum columns (7) reached
  - Tooltip shows current column count and limit

### Inter-Table Navigation

The editor now supports intelligent navigation between table blocks:

#### Navigation Rules
1. **Arrow Down from Last Row**: 
   - From position (lastRow, k, tableBlock) → (0, min(k, nextTableCols-1), nextTableBlock)
   - Preserves column position when possible

2. **Arrow Up from First Row**:
   - From position (0, k, tableBlock) → (lastRow, min(k, prevTableCols-1), prevTableBlock)
   - Preserves column position when possible

3. **Column Preservation**:
   - Target column = `Math.min(sourceColumn, targetTableColumns - 1)`
   - Ensures navigation to valid column even if target table has fewer columns

#### Example Scenarios
```
Table A (3x4) → Table B (5x2)
From A(2,3) pressing ↓ → B(0,1) // column 3→1 (preserved as much as possible)

Table B (5x2) → Table A (3x4)  
From B(0,1) pressing ↑ → A(2,1) // column 1→1 (exact preservation)
```

### Block Hover Menu System

Enhanced hover menu with hierarchical navigation:

#### Features
- **List Menu**: Hierarchical submenu structure
  - Unordered Lists: Multiple bullet styles (•, ◦, ▪, ▫)
  - Ordered Lists: Multiple numbering types (1, A, a, I, i)
- **Comment System**: Beautiful comment widget with user avatars
- **Block Conversion**: Convert between different block types
- **Smart Positioning**: Menu positioned to the left of blocks

#### Usage
1. Hover over any block to see the hover menu
2. Click the block menu icon (⊞) to see conversion options
3. Navigate through submenus for list options
4. Click comment icon (💬) to add/view comments

### Enhanced Comment System

#### Features
- **Professional Design**: Gradient headers and hover effects
- **Avatar System**: Colorful gradient avatars with user initials
- **Smart Timestamps**: Human-readable time formatting
- **CRUD Operations**: Create, read, update, delete comments
- **Count Badge**: Shows comment count on blocks

### Ordered Lists with Intelligent Numbering

#### Auto-Numbering by Level
- **Level 0**: Numbers (1, 2, 3...)
- **Level 1**: Lowercase letters (a, b, c...)
- **Level 2**: Lowercase Roman (i, ii, iii...)
- **Level 3**: Capital letters (A, B, C...)

#### Features
- **Context-Aware**: Numbering restarts appropriately within parent context
- **Tab Navigation**: Automatically changes numbering type on indentation
- **Manual Override**: Click numbers to manually cycle through types
- **Roman Numerals**: Full support for Roman numeral conversion

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notion_clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Firebase configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI components

## Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── blocks/            # Block components (Text, List, Table, etc.)
│   ├── BlockHoverMenu.tsx # Hover menu system
│   ├── BlockWrapper.tsx   # Hover detection wrapper
│   └── Editor.tsx         # Main editor component
├── contexts/              # React contexts
├── services/              # Firebase services
├── store/                 # Redux store and slices
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
