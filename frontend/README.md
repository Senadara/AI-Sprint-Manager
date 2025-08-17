# AI Sprint Manager Frontend

A modern React application for AI-powered sprint planning and project management.

## Features

### Project Management
- Create, edit, and delete projects
- View project details and progress
- Manage project information including deadlines and tech stack

### AI Sprint Planning
- Generate sprint plans using AI based on project data
- Customizable project parameters (description, deadline, tech stack)
- Real-time sprint generation with detailed task breakdown
- Save generated sprints to projects

### Sprint Management
- View all sprints for a project
- Sprint details including start/end dates and task counts
- Task preview for each sprint
- Navigate to sprint boards for detailed task management

### Task Management
- Kanban board for task visualization
- Real-time task updates
- Task status tracking (todo, in-progress, done)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Creating a Project
1. Navigate to Project Management
2. Click "Create Project"
3. Fill in project name and description
4. Save the project

### Generating Sprints with AI
1. Go to Project Management
2. Click "Sprint Management" on any project
3. Click "Generate New Sprint"
4. Customize project parameters if needed
5. Add additional requirements (optional)
6. Click "Generate Sprint Plan"
7. Review the generated sprints and tasks
8. Click "Save to Project" to save the sprints

### Managing Sprints
1. Navigate to Sprint Management for a project
2. View all sprints with their details
3. Click "View Board" to see tasks in Kanban view
4. Delete sprints if needed

## API Integration

The frontend integrates with the backend API for:
- Project CRUD operations
- AI sprint generation
- Sprint and task management
- User authentication

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Axios for API calls
- React Router for navigation
- Context API for state management
