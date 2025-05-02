# Queue System Requirements for UroHealth Dashboard

This document outlines the requirements and specifications for the clinic queue management system.

## Overview

The queue system is designed to manage patient flow in the clinic, allowing staff to track patients who have physically arrived for their appointments and manage their order of service. The goal is maximum simplicity: automatic numbering and intuitive drag-and-drop queue management without extra buttons or complex status workflows.

## Core Requirements

### Automatic Numbering
- Automatically assign sequential numbers (1, 2, 3...) to all appointments scheduled for the current day
- Display these numbers prominently on each appointment card

### Dynamic Queue Reordering
- Allow drag-and-drop functionality to reposition patients in the queue
- When patients are reordered, their queue numbers automatically update (1, 2, 3, etc.)
- No priority button needed - just simple drag-and-drop for reordering

### Completion Handling
- When an appointment is marked as "Completed," automatically move it to the bottom of the list
- Remove completed appointments from the active queue count
- Total queue count should only reflect active/waiting patients

### User Interface
- Implement queue functionality in list view only
- Maintain a clean, simple list-based design for appointments
- Keep all existing appointment information visible
- Secretary should be able to manage everything with simple drag actions

## Implementation Strategy

### Phased Approach
1. **Phase 1: Queue Implementation**
   - Implement basic queue functionality in list view
   - Focus on automatic numbering and sequential display
   - Implement drag-and-drop reordering
   - Ensure completion handling works correctly

2. **Phase 2: Testing and Refinement**
   - Test with real-world scenarios
   - Gather feedback from secretaries and doctors
   - Refine the user experience based on feedback

### Technical Considerations
- Use a reliable drag-and-drop library (e.g., react-beautiful-dnd)
- Maintain a single source of truth for queue order in the application state
- Ensure the queue state persists between page refreshes
- Implement clear visual indicators for queue position

## User Experience Considerations

### Visual Design
- Queue numbers should be prominently displayed with high contrast
- Use visual cues to indicate draggable items (e.g., handle icon or subtle hover effect)
- Provide immediate visual feedback during drag operations
- Consider using subtle animations for reordering to improve user understanding

### Accessibility
- Ensure drag-and-drop functionality has keyboard alternatives
- Maintain sufficient color contrast for all queue elements
- Provide clear focus indicators for interactive elements

### Error Prevention
- Confirm before removing patients from the queue
- Provide undo functionality for accidental queue changes
- Implement auto-save to prevent data loss

## Data Persistence and Integration

### Database Integration
- Store queue positions in MongoDB to ensure persistence
- Update queue positions in real-time when changes occur
- Implement proper error handling for database operations

### API Requirements
- Create necessary API endpoints for queue management:
  - GET /api/queue/today - Retrieve today's queue
  - PUT /api/queue/reorder - Update queue positions
  - PUT /api/queue/complete - Mark appointment as completed

### Integration with Existing System
- Ensure queue functionality works with existing appointment data
- Maintain compatibility with current appointment status workflow
- Queue system should reset automatically at midnight

## Additional Requirements

*Note: This section will be populated with additional detailed requirements as needed.*