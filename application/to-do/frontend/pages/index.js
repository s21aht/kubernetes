import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');

  // Use env variable passed from Kubernetes
  const BACKEND_URL = "http://192.168.61.29:30001/";

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    const res = await axios.get(`${BACKEND_URL}/todos`);
    setTodos(res.data);
  };

  const addTodo = async () => {
    await axios.post(`${BACKEND_URL}/todos`, { task });
    setTask('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${BACKEND_URL}/todos/${id}`);
    fetchTodos();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>To-Do App</h1>
      <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Task"/>
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(t => (
          <li key={t.id}>
            {t.task} <button onClick={()=>deleteTodo(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
