# Admin Panel Guide

## Overview
The admin panel provides a clear, organized way to manage realtor notes across different scopes: listings, buildings, neighborhoods, and global knowledge.

## Admin Dashboard (`/admin`)
The main dashboard provides:
- **Statistics**: Quick view of note counts by scope
- **Quick Actions**: Direct links to add notes for each scope
- **Navigation**: Easy access to all admin features

## Note Management Pages

### 1. Listing Notes (`/admin/notes/listing`)
**Purpose**: Add insights for specific MLS listings

**Features**:
- **Listing Search**: Search for listings by address, neighborhood, or MLS number
- **Auto-fill**: Click search results to auto-populate listing ID
- **Context**: Notes appear on listing detail pages
- **Embeddings**: Automatically embedded for semantic search

**How to Use**:
1. Search for a listing using the search bar
2. Click on a search result to select it
3. Enter tags (optional) and note content
4. Click "Save Listing Note"

### 2. Neighborhood Notes (`/admin/notes/neighborhood`)
**Purpose**: Share knowledge about neighborhoods

**Features**:
- **Autocomplete**: Pre-populated list of Chicago neighborhoods
- **Custom Input**: Can enter any neighborhood name
- **Context**: Notes appear on all listings in that neighborhood
- **Embeddings**: Automatically embedded for semantic search

**How to Use**:
1. Type or select a neighborhood name
2. Enter tags (optional) and note content
3. Click "Save Neighborhood Note"

### 3. Building Notes (`/admin/notes/building`)
**Purpose**: Add notes about specific buildings

**Features**:
- **Address Input**: Enter full building address
- **Auto-normalization**: Unit numbers are automatically stripped
- **Context**: Notes appear on all listings in that building
- **Embeddings**: Automatically embedded for semantic search

**How to Use**:
1. Enter the full building address (e.g., "2330 N Clark St, Chicago, IL 60614")
2. Enter tags (optional) and note content
3. Click "Save Building Note"

### 4. Global Notes (`/admin/notes/global`)
**Purpose**: Add general knowledge and insights

**Features**:
- **No Scope Required**: Applies to all queries
- **General Knowledge**: Market trends, buying advice, etc.
- **Embeddings**: Automatically embedded for semantic search

**How to Use**:
1. Enter tags (optional) and note content
2. Click "Save Global Note"

### 5. All Notes (`/admin/notes`)
**Purpose**: View and manage all notes

**Features**:
- **Filter by Scope**: Filter notes by type
- **Edit Notes**: Click "Edit" to modify existing notes
- **Delete Notes**: Remove notes with confirmation
- **View Details**: See tags, scope, and creation date

## Embeddings Management (`/admin/embeddings`)

**Purpose**: Verify and manage embeddings for semantic search

**Features**:
- **Statistics**: View counts of notes with/without embeddings
- **Visual Indicators**: See which notes have embeddings
- **Regenerate**: Fix notes with missing embeddings
- **Verification**: Ensure all notes are properly embedded

**How Embeddings Work**:
1. When you create a note, an embedding is automatically generated
2. Embeddings enable semantic search in the chat advisor
3. If an embedding is missing, the note won't appear in semantic searches
4. Use the regenerate button to fix missing embeddings

## Key Concepts

### Note Scopes
- **Listing**: Specific to one MLS listing
- **Building**: Applies to all units in a building
- **Neighborhood**: Applies to all listings in a neighborhood
- **Global**: Available for all queries

### Keys and Matching
- **Listing Key**: `mred:{listing_id}`
- **Building Key**: `building:{normalized_address}` (unit stripped)
- **Neighborhood Key**: `neighborhood:{slugified_name}`

### Embeddings
- Generated automatically using OpenAI's embedding model
- Stored in Supabase pgvector column
- Used for semantic similarity search
- 1536-dimensional vectors

## Best Practices

1. **Be Specific**: More detailed notes provide better context
2. **Use Tags**: Tags help organize and filter notes
3. **Regular Updates**: Keep notes current and relevant
4. **Verify Embeddings**: Check `/admin/embeddings` periodically
5. **Scope Appropriately**: Use the right scope for each note

## Troubleshooting

### Note Not Appearing in Chat
- Check if the note has an embedding (`/admin/embeddings`)
- Verify the scope matches the query context
- Ensure the note is properly saved

### Missing Embedding
- Go to `/admin/embeddings`
- Find the note without an embedding
- Click "Regenerate" to fix it

### Listing Search Not Working
- Ensure you're searching in Chicago
- Try different search terms (address, neighborhood, MLS number)
- Check that the Repliers API is configured correctly

