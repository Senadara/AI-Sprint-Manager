// src/components/Kanban.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { io } from "socket.io-client";
import "./Kanban.css";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000"); // pastikan URL & CORS sesuai

const Kanban = () => {
  const { projectId } = useParams(); // ambil dari URL: /projects/:projectId
  const [tasks, setTasks] = useState({ todo: [], "in-progress": [], done: [] });
 console.log("Project ID:", projectId); 
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // const res = await api.get(`/tasks/${projectId}`);
        const res = await api.get(`/tasks/1`); // ganti dengan projectId jika sudah ada
        const grouped = {
          todo: res.data.filter((t) => t.status === "todo"),
          "in-progress": res.data.filter((t) => t.status === "in-progress"),
          done: res.data.filter((t) => t.status === "done"),
        };
        setTasks(grouped);
      } catch (err) {
        console.error("Gagal fetch tasks:", err);
      }
    };
    fetchTasks();
  }, [projectId]);

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceCol = [...tasks[source.droppableId]];
    const destCol = [...tasks[destination.droppableId]];
    const [movedTask] = sourceCol.splice(source.index, 1);

    movedTask.status = destination.droppableId;
    destCol.splice(destination.index, 0, movedTask);

    const newState = {
      ...tasks,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    };

    setTasks(newState);

    try {
      await api.put(`/tasks/${movedTask.id}`, { status: movedTask.status });
    } catch (err) {
      alert("Gagal menyimpan perubahan. Coba lagi.");
      console.error("Gagal update task di server:", err);
    }
  };

  const columns = [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  return (
    <div className="kanban-board">
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((col) => (
          <Droppable droppableId={col.id} key={col.id}>
            {(provided) => (
              <div
                className="kanban-column"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h3>{col.title}</h3>
                {tasks[col.id]?.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="kanban-card"
                        style={provided.draggableProps.style}
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
      </DragDropContext>
    </div>
  );
};

export default Kanban;
