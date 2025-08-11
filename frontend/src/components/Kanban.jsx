// src/components/Kanban.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './Kanban.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Kanban = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks/dummyTasks');
        setTasks(res.data);
      } catch (error) {
        console.error('Gagal fetch tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const getColumns = () => ({
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    done: tasks.filter(t => t.status === 'done')
  });

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const columns = getColumns();
    const sourceTasks = Array.from(columns[source.droppableId]);
    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.status = destination.droppableId;

    const destTasks = Array.from(columns[destination.droppableId]);
    destTasks.splice(destination.index, 0, movedTask);

    const updatedTasks = [
      ...columns.todo,
      ...columns['in-progress'],
      ...columns.done
    ];

    setTasks(updatedTasks);

    // Jika mau simpan perubahan ke backend
    // api.put(`/tasks/${movedTask.id}`, { status: movedTask.status });
  };

  const columns = getColumns();

  return (
    <div>
      <h2>Kanban Board</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {Object.keys(columns).map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  className="kanban-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3>{status.toUpperCase()}</h3>
                  {columns[status].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          className="kanban-card"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {task.title}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Kanban;
