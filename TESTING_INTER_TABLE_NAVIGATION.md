# Testing Inter-Table Navigation

## Setup
1. Open browser to `http://localhost:3002`
2. Sign in or use manual access (📖 Manual button)
3. Create a new page or use existing page

## Test Scenario

### Step 1: Create Multiple Tables
1. Type `/table` and press Enter to create first table
2. Type `/table` and press Enter to create second table  
3. Type `/table` and press Enter to create third table
4. You should now have 3 tables stacked vertically

### Step 2: Test Navigation
1. **Click on the first table** - any cell in the middle columns (not first or last column)
2. **Navigate to the last row** of the first table using arrow keys
3. **Press Arrow Down** - this should move you to the **first row** of the second table, **same column**
4. **Press Arrow Up** - this should move you back to the **last row** of the first table, **same column**

### Step 3: Test Column Preservation
1. **Click on column 2** of the second table, last row
2. **Press Arrow Down** - should move to column 2 of the third table, first row
3. **Click on column 4** of the third table, first row  
4. **Press Arrow Up** - should move to column 4 of the second table, last row

### Step 4: Test Edge Cases
1. **Click on the last column** of a table with 5 columns
2. Navigate to a table with only 3 columns
3. **Expected**: Should position cursor in column 2 (last available column)

## Debugging
Open browser console (F12 → Console) to see debug output:
- `TableBlock: Arrow UP/DOWN out of bounds` - when leaving a table
- `Inter-table navigation UP/DOWN` - when Editor processes the navigation
- `UP/DOWN Navigation - Looking for element` - when searching for target element
- `Successfully focused element` - when navigation succeeds

## Expected Behavior
✅ **Arrow Down from last row** → First row of next table, same column  
✅ **Arrow Up from first row** → Last row of previous table, same column  
✅ **Column preservation** when tables have same width  
✅ **Column clamping** when target table is narrower  
✅ **Smooth focus transition** with visual feedback

## Troubleshooting
If navigation doesn't work:
1. Check console for error messages
2. Verify table blocks are properly rendered with `data-block-index` attributes
3. Confirm input elements have correct `aria-label` attributes
4. Test with different table sizes and positions 