import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    // Persist theme preference
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/tasks`)
      .then(res => setTodos(res.data))
      .catch(err => console.error(err));
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/tasks`, { title: newTodo });
    setTodos([...todos, res.data]);
    setNewTodo("");
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${id}`);
    setTodos(todos.filter(todo => todo._id !== id));
  };

  const startEditing = (id, title) => {
    setEditingId(id);
    setEditingText(title);
  };

  const saveEdit = async (id) => {
    const res = await axios.put(`${process.env.REACT_APP_API_URL}/tasks/${id}`, { title: editingText });
    setTodos(todos.map(todo => todo._id === id ? { ...todo, ...res.data } : todo));
    setEditingId(null);
    setEditingText("");
  };

  const toggleComplete = async (id, completed) => {
    const res = await axios.put(`${process.env.REACT_APP_API_URL}/tasks/${id}`, { completed: !completed });
    setTodos(todos.map(todo => todo._id === id ? { ...todo, ...res.data } : todo));
  };

  // Animated toggle button (sun/moon)
  const ToggleIcon = () => (
    <motion.button
      onClick={() => setDarkMode(!darkMode)}
      className="absolute top-4 right-4 bg-white/70 dark:bg-gray-800/80 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors duration-300 border border-gray-200 dark:border-gray-700"
      whileTap={{ scale: 0.9, rotate: 15 }}
      aria-label="Toggle light/dark mode"
    >
      <motion.span
        initial={false}
        animate={{ rotate: darkMode ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-xl"
      >
        {darkMode ? "🌙" : "☀️"}
      </motion.span>
      <span className="font-semibold text-gray-700 dark:text-gray-200">
        {darkMode ? "Dark" : "Light"}
      </span>
    </motion.button>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500`}>
      <ToggleIcon />
      <motion.div
        className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-lg border border-gray-200 dark:border-gray-700"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
      >
        <h1 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 drop-shadow">
          Creative Todo App
        </h1>
        <form onSubmit={addTodo} className="flex mb-8">
          <input
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 transition-all duration-300 bg-white/80 dark:bg-gray-800/80"
            type="text"
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            placeholder="Add a new task"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-r-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-bold shadow"
            type="submit"
          >
            Add
          </motion.button>
        </form>
        <AnimatePresence>
          <ul>
            {todos.map(todo => (
              <motion.li
                key={todo._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo._id, todo.completed)}
                    className="h-5 w-5 accent-blue-500"
                  />
                  {editingId === todo._id ? (
                    <input
                      className="border px-2 py-1 rounded dark:bg-gray-800 dark:text-white"
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                    />
                  ) : (
                    <span className={todo.completed ? "line-through text-gray-400 dark:text-gray-500" : "font-medium dark:text-white"}>
                      {todo.title}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {editingId === todo._id ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="text-green-600 dark:text-green-400 hover:underline"
                      onClick={() => saveEdit(todo._id)}
                    >
                      Save
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => startEditing(todo._id, todo.title)}
                    >
                      Edit
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="text-red-500 dark:text-red-400 hover:underline"
                    onClick={() => deleteTodo(todo._id)}
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.li>
            ))}
          </ul>
        </AnimatePresence>
        {todos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-400 dark:text-gray-500 mt-6"
          >
            No todos yet. Add your first task!
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default App;
