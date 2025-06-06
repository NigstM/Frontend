# Advanced Task Manager - Component Architecture

A comprehensive task management application built with React, Next.js, and TypeScript using a modular component architecture for better maintainability and reusability.

## 🏗️ Component Architecture

### Core Components

#### `TaskManager` (Main Container)
- **Purpose**: Main application container managing global state
- **Responsibilities**: 
  - State management for tasks, filters, and UI preferences
  - Local storage persistence
  - Undo/redo functionality
  - Import/export operations


#### `TaskForm`
- **Purpose**: Form for creating new tasks
- **Props**: `onAddTask`, `categories`
- **Features**: 
  - Multi-field form with validation
  - Priority, category, and due date selection
  - Real-time validation feedback


#### `TaskFilters`
- **Purpose**: Search, filter, and sort controls
- **Props**: Search query, filter state, sort options, bulk selection controls
- **Features**:
  - Text search across task properties
  - Filter by status (all, pending, completed, overdue)
  - Sort by multiple criteria
  - Bulk selection controls


#### `TaskList`
- **Purpose**: Container for rendering task items
- **Props**: Tasks array, selection state, event handlers
- **Features**:
  - Empty state handling
  - Responsive grid layout
  - Conditional rendering based on filters


#### `TaskItem`
- **Purpose**: Individual task display and interaction
- **Props**: Task data, selection state, event handlers
- **Features**:
  - Visual status indicators
  - Priority and category badges
  - Due date warnings
  - Hover actions (edit, delete)


#### `TaskEditForm`
- **Purpose**: Modal form for editing existing tasks
- **Props**: Task data, categories, save/cancel handlers
- **Features**:
  - Pre-populated form fields
  - Same validation as creation form
  - Due date management


### UI Components

#### `TaskStats`
- **Purpose**: Display task statistics dashboard
- **Props**: Statistics object with counts
- **Features**: 5-card layout showing total, completed, pending, overdue, and high-priority counts


#### `BulkActions`
- **Purpose**: Bulk operation controls
- **Props**: Selection count, action handlers
- **Features**: Mark complete, delete, and deselect actions for multiple tasks


#### `ProgressBar`
- **Purpose**: Visual progress indicator
- **Props**: Completed and total task counts
- **Features**: Animated progress bar with percentage display


#### `HeaderActions`
- **Purpose**: Top-level action buttons
- **Props**: Dark mode state, undo capability, import/export handlers
- **Features**: Undo, export, import, and theme toggle buttons


## 🔄 Data Flow

### State Management
\`\`\`
TaskManager (Root State)
├── tasks: Task[]
├── selectedTasks: Set<number>
├── filters: { search, filter, sort, showCompleted }
├── ui: { darkMode }
└── history: { undoStack }
\`\`\`

### Props Flow
\`\`\`
TaskManager
├── TaskForm (onAddTask)
├── TaskFilters (search/filter state + handlers)
├── BulkActions (selection state + handlers)
├── TaskStats (computed statistics)
├── ProgressBar (completion metrics)
└── TaskList
    └── TaskItem[] (task data + handlers)
        └── TaskEditForm (edit state + handlers)
\`\`\`


## 🎯 Component Benefits

## 🔧 Usage Patterns

### Adding New Features
1. **New Task Property**: Update Task interface, TaskForm, TaskEditForm, and TaskItem
2. **New Filter**: Add to TaskFilters component and filtering logic in TaskManager
3. **New Action**: Create new component or extend existing action components

### Customization
- **Styling**: Modify individual component styles without affecting others
- **Behavior**: Override component props or extend functionality
- **Layout**: Rearrange components in TaskManager without breaking functionality


## 📱 Responsive Design


## 🎨 Theming

Components support dark mode through:
- Tailwind CSS dark mode classes
- Consistent color schemes across components
- Theme state managed at the root level
- Automatic persistence of theme preference

---

This component architecture provides a solid foundation for a scalable, maintainable task management application while keeping the code organized and easy to understand.
