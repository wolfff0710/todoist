import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Sun,
  Moon,
  FolderPlus,
  Tag,
  Flag,
  ListTodo,
  CalendarDays,
  Inbox as InboxIcon,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Filter,
  Check,
  AlignLeft,
  MoreVertical,
  Layers,
  Search,
  SlidersHorizontal,
  Bell,
  LayoutGrid,
  Zap,
  Play,
  CheckSquare,
  ArrowRight,
  Timer
} from 'lucide-react';

// Default initial state data
const INITIAL_PROJECTS = [
  { id: 'proj-1', name: 'Work', color: 'bg-indigo-500', icon: 'briefcase' },
  { id: 'proj-2', name: 'Personal', color: 'bg-emerald-500', icon: 'user' },
  { id: 'proj-3', name: 'Health & Fitness', color: 'bg-rose-500', icon: 'activity' },
];

const getTodayStr = () => new Date().toISOString().split('T')[0];

const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Review project architecture & Todovex schema',
    description: 'Ensure smooth database relationships and responsive time slots.',
    dueDate: getTodayStr(),
    startTime: '09:00',
    duration: 60,
    priority: 'p1',
    projectId: 'proj-1',
    completed: false,
    tags: ['Dev', 'Architecture'],
  },
  {
    id: 'task-2',
    title: 'Morning Cardio & Meditation',
    description: '30 mins outdoor run + 15 mins mindful meditation.',
    dueDate: getTodayStr(),
    startTime: '07:30',
    duration: 45,
    priority: 'p2',
    projectId: 'proj-3',
    completed: true,
    tags: ['Health'],
  },
  {
    id: 'task-3',
    title: 'Design Time-Blocking Component',
    description: 'Craft vertical hourly timeline grid with drag/drop interactions.',
    dueDate: getTodayStr(),
    startTime: '10:30',
    duration: 90,
    priority: 'p1',
    projectId: 'proj-1',
    completed: false,
    tags: ['UI/UX', 'React'],
  },
  {
    id: 'task-4',
    title: 'Weekly Grocery Shopping',
    description: 'Buy organic greens, almond milk, and meal prep protein.',
    dueDate: getTodayStr(),
    startTime: '16:00',
    duration: 60,
    priority: 'p3',
    projectId: 'proj-2',
    completed: false,
    tags: ['Errands'],
  },
];

// Helper functions
const getPriorityColor = (p) => {
  switch (p) {
    case 'p1': return { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500', badge: 'bg-rose-500' };
    case 'p2': return { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500', badge: 'bg-amber-500' };
    case 'p3': return { text: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500', badge: 'bg-sky-500' };
    default: return { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-400', badge: 'bg-slate-400' };
  }
};

const formatTimeRange = (startTime, duration) => {
  if (!startTime) return '';
  const [h, m] = startTime.split(':').map(Number);
  const start = new Date();
  start.setHours(h, m, 0);

  const end = new Date(start.getTime() + duration * 60000);
  const format = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return `${format(start)} - ${format(end)}`;
};

export default function App() {
  // Persistence State
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('todovex_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('todovex_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('todovex_theme');
    return saved ? JSON.parse(saved) === 'dark' : true;
  });

  // UI State
  const [activeFilter, setActiveFilter] = useState('today'); // 'inbox', 'today', 'upcoming', or project-id
  const [viewMode, setViewMode] = useState('widgets'); // 'widgets', 'list', or 'timeline'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // New Project Form Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('bg-purple-500');

  // Inline Widget Fast Task State
  const [widgetTaskTitle, setWidgetTaskTitle] = useState('');
  const [widgetTaskTime, setWidgetTaskTime] = useState('12:00');
  const [widgetTaskPriority, setWidgetTaskPriority] = useState('p2');
  const [widgetTaskProject, setWidgetTaskProject] = useState(INITIAL_PROJECTS[0]?.id || '');

  // Audio completion effect trigger (Synthesized Web Audio API)
  const playCompletionSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('todovex_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('todovex_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('todovex_theme', JSON.stringify(darkMode ? 'dark' : 'light'));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle Task Completion
  const toggleTaskCompletion = (id) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextStatus = !task.completed;
          if (nextStatus) playCompletionSound();
          return { ...task, completed: nextStatus };
        }
        return task;
      })
    );
  };

  // Quick Widget Task Add
  const handleQuickAddFromWidget = (e) => {
    e.preventDefault();
    if (!widgetTaskTitle.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: widgetTaskTitle.trim(),
      description: 'Added via Tablet Quick Widget',
      dueDate: selectedDate,
      startTime: widgetTaskTime,
      duration: 45,
      priority: widgetTaskPriority,
      projectId: widgetTaskProject || projects[0]?.id,
      completed: false,
      tags: ['Widget'],
    };

    setTasks((prev) => [newTask, ...prev]);
    setWidgetTaskTitle('');
    playCompletionSound();
  };

  // Task CRUD operations
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...taskData, id: editingTask.id } : t))
      );
    } else {
      const newTask = {
        ...taskData,
        id: `task-${Date.now()}`,
        completed: false,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const newProj = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      color: newProjectColor,
    };
    setProjects((prev) => [...prev, newProj]);
    setNewProjectName('');
    setIsProjectModalOpen(false);
  };

  // Filter tasks based on selected view / sidebar item
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }

      const todayStr = getTodayStr();
      if (activeFilter === 'today') {
        return task.dueDate === selectedDate;
      } else if (activeFilter === 'inbox') {
        return !task.projectId;
      } else if (activeFilter === 'upcoming') {
        return task.dueDate >= todayStr;
      } else {
        return task.projectId === activeFilter;
      }
    });
  }, [tasks, activeFilter, searchQuery, selectedDate]);

  // Current active task & upcoming list for Widgets
  const currentActiveTask = useMemo(() => {
    const uncompleted = filteredTasks.filter((t) => !t.completed && t.startTime);
    if (uncompleted.length === 0) return null;
    return uncompleted.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
  }, [filteredTasks]);

  const upcomingTasks = useMemo(() => {
    return filteredTasks
      .filter((t) => !t.completed && t.id !== currentActiveTask?.id)
      .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));
  }, [filteredTasks, currentActiveTask]);

  // Time-Blocking Slots (06:00 to 22:00)
  const hours = useMemo(() => {
    const list = [];
    for (let i = 6; i <= 22; i++) {
      list.push(`${i < 10 ? '0' : ''}${i}:00`);
    }
    return list;
  }, []);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Top Tablet Navigation Header */}
      <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl ${darkMode ? 'border-slate-800/80 bg-slate-950/70' : 'border-slate-200/80 bg-white/70'}`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl hover:bg-slate-500/10 active:scale-95 transition-transform"
            title="Toggle Menu"
          >
            <Layers className="w-5 h-5 text-indigo-500" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-rose-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-rose-500 to-amber-400 bg-clip-text text-transparent">
              Todovex <span className="text-xs text-indigo-400 font-semibold border border-indigo-500/30 px-2 py-0.5 rounded-full ml-1">Tab Edition</span>
            </span>
          </div>
        </div>

        {/* Search Bar & Quick Add Action Button */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block w-60 lg:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl border outline-none transition-all ${darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' : 'bg-slate-100 border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
            />
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 ${darkMode ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Responsive Tablet Sidebar Navigation */}
        <aside
          className={`w-64 border-r flex flex-col justify-between transition-all duration-300 ease-in-out absolute md:relative z-20 h-[calc(100vh-4rem)] backdrop-blur-xl ${darkMode ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200/80 bg-white/80'} ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16'}`}
        >
          <div className="p-3 space-y-6 overflow-y-auto">
            {/* Primary Nav Links */}
            <div className="space-y-1">
              <NavItem
                icon={<InboxIcon className="w-4 h-4 text-indigo-400" />}
                label="Inbox"
                count={tasks.filter((t) => !t.projectId && !t.completed).length}
                active={activeFilter === 'inbox'}
                onClick={() => setActiveFilter('inbox')}
                collapsed={!isSidebarOpen}
              />
              <NavItem
                icon={<CalendarIcon className="w-4 h-4 text-emerald-400" />}
                label="Today"
                count={tasks.filter((t) => t.dueDate === getTodayStr() && !t.completed).length}
                active={activeFilter === 'today'}
                onClick={() => setActiveFilter('today')}
                collapsed={!isSidebarOpen}
              />
              <NavItem
                icon={<CalendarDays className="w-4 h-4 text-purple-400" />}
                label="Upcoming"
                count={tasks.filter((t) => t.dueDate >= getTodayStr() && !t.completed).length}
                active={activeFilter === 'upcoming'}
                onClick={() => setActiveFilter('upcoming')}
                collapsed={!isSidebarOpen}
              />
            </div>

            {/* Custom Projects List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3">
                {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Projects</span>}
                {isSidebarOpen && (
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="text-slate-400 hover:text-indigo-400 transition"
                    title="Create Project"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => setActiveFilter(proj.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeFilter === proj.id ? (darkMode ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-900 shadow-sm') : 'text-slate-400 hover:bg-slate-500/10'}`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className={`w-2.5 h-2.5 rounded-full ${proj.color}`} />
                      {isSidebarOpen && <span className="truncate">{proj.name}</span>}
                    </div>
                    {isSidebarOpen && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                        {tasks.filter((t) => t.projectId === proj.id && !t.completed).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-3 border-t text-xs text-slate-400 flex items-center justify-between ${darkMode ? 'border-slate-800/80' : 'border-slate-200/80'}`}>
            {isSidebarOpen && (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-medium">Tablet Live Sync Active</span>
              </div>
            )}
          </div>
        </aside>

        {/* Dashboard Main Display Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Control Switcher Bar */}
          <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${darkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200/80 bg-white/50'}`}>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold tracking-tight capitalize">
                {activeFilter === 'today'
                  ? 'Today Workspace'
                  : activeFilter === 'inbox'
                  ? 'Inbox Tasks'
                  : activeFilter === 'upcoming'
                  ? 'Upcoming Timeline'
                  : projects.find((p) => p.id === activeFilter)?.name || 'Tasks'}
              </h1>

              {/* Date Step Control */}
              {activeFilter === 'today' && (
                <div className={`flex items-center rounded-xl border p-1 text-xs font-semibold ${darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-100'}`}>
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() - 1);
                      setSelectedDate(d.toISOString().split('T')[0]);
                    }}
                    className="p-1 hover:bg-slate-500/10 rounded-lg active:scale-95 transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5">{selectedDate}</span>
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() + 1);
                      setSelectedDate(d.toISOString().split('T')[0]);
                    }}
                    className="p-1 hover:bg-slate-500/10 rounded-lg active:scale-95 transition"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* View Mode Mode Switches: Widgets Dock, List, Time-Block */}
            <div className="flex items-center space-x-2">
              <div className={`flex p-1 rounded-xl border ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'}`}>
                <button
                  onClick={() => setViewMode('widgets')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'widgets' ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Tablet Widgets</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'timeline' ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time-Block Schedule</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Content Views */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {viewMode === 'widgets' ? (
              /* TAB WIDGETS OVERLAY DOCK */
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* WIDGET 1: Active Focus & Countdown Widget */}
                  <div className={`lg:col-span-1 rounded-3xl border p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden shadow-lg transition-transform hover:scale-[1.01] ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Focus Task</h2>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">LIVE</span>
                    </div>

                    {currentActiveTask ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-lg font-extrabold tracking-tight">{currentActiveTask.title}</h3>
                          <p className="text-xs text-slate-400 line-clamp-2">{currentActiveTask.description || 'No description provided'}</p>
                        </div>

                        <div className="flex items-center space-x-3 text-xs font-medium text-slate-400">
                          <span className="flex items-center space-x-1 bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-xl">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatTimeRange(currentActiveTask.startTime, currentActiveTask.duration)}</span>
                          </span>
                          <span className="flex items-center space-x-1 bg-slate-500/10 px-2.5 py-1 rounded-xl">
                            <Timer className="w-3.5 h-3.5 text-rose-400" />
                            <span>{currentActiveTask.duration}m duration</span>
                          </span>
                        </div>

                        <button
                          onClick={() => toggleTaskCompletion(currentActiveTask.id)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Current Task Completed</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-2 text-slate-500">
                        <CheckSquare className="w-10 h-10 mx-auto stroke-1 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-400">No active time-blocked tasks left for today.</p>
                        <p className="text-xs text-slate-500">Add a time slot in the widget to start focusing!</p>
                      </div>
                    )}
                  </div>

                  {/* WIDGET 2: Inline Quick Add & Update Widget */}
                  <div className={`lg:col-span-2 rounded-3xl border p-5 sm:p-6 backdrop-blur-xl shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Widget Quick Task Creator</h2>
                      </div>
                      <span className="text-xs text-slate-500">Instant add without popup</span>
                    </div>

                    <form onSubmit={handleQuickAddFromWidget} className="space-y-4">
                      <input
                        type="text"
                        required
                        placeholder="What do you need to do? (e.g. Call Client at 2 PM)"
                        value={widgetTaskTitle}
                        onChange={(e) => setWidgetTaskTitle(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-100 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Time Slot</label>
                          <input
                            type="time"
                            value={widgetTaskTime}
                            onChange={(e) => setWidgetTaskTime(e.target.value)}
                            className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Priority</label>
                          <select
                            value={widgetTaskPriority}
                            onChange={(e) => setWidgetTaskPriority(e.target.value)}
                            className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                          >
                            <option value="p1">P1 - Urgent Red</option>
                            <option value="p2">P2 - High Amber</option>
                            <option value="p3">P3 - Medium Blue</option>
                            <option value="p4">P4 - Low Gray</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Project</label>
                          <select
                            value={widgetTaskProject}
                            onChange={(e) => setWidgetTaskProject(e.target.value)}
                            className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                          >
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                          + Push to Schedule Widget
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* WIDGET 3: Upcoming Tasks Live Widget List */}
                <div className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-xl shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <ListTodo className="w-4 h-4 text-rose-400" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Widget Queue ({upcomingTasks.length})</h2>
                    </div>
                    <span className="text-xs text-slate-500">Tap checkmark to complete directly</span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {upcomingTasks.length === 0 ? (
                      <p className="text-sm text-center py-6 text-slate-500">No upcoming tasks queued up.</p>
                    ) : (
                      upcomingTasks.map((task) => (
                        <WidgetTaskRow
                          key={task.id}
                          task={task}
                          project={projects.find((p) => p.id === task.projectId)}
                          onToggle={() => toggleTaskCompletion(task.id)}
                          onEdit={() => {
                            setEditingTask(task);
                            setIsModalOpen(true);
                          }}
                          darkMode={darkMode}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <CheckCircle2 className="w-16 h-16 stroke-1 text-slate-400 mb-3" />
                <h3 className="text-lg font-semibold text-slate-300">All clear for this view!</h3>
                <p className="text-sm max-w-sm mt-1 text-slate-500">
                  Enjoy your free time or add a new time-blocked task to keep your momentum going.
                </p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl text-sm font-semibold transition"
                >
                  + Add New Task
                </button>
              </div>
            ) : viewMode === 'list' ? (
              /* Traditional Todoist-Style List View */
              <div className="max-w-4xl mx-auto space-y-2">
                {filteredTasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    project={projects.find((p) => p.id === task.projectId)}
                    onToggle={() => toggleTaskCompletion(task.id)}
                    onEdit={() => {
                      setEditingTask(task);
                      setIsModalOpen(true);
                    }}
                    onDelete={() => deleteTask(task.id)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            ) : (
              /* Interactive Todovex Time-Blocking Vertical Schedule View */
              <div className="max-w-5xl mx-auto">
                <TimeBlockingSchedule
                  hours={hours}
                  tasks={filteredTasks}
                  projects={projects}
                  selectedDate={selectedDate}
                  onToggleTask={toggleTaskCompletion}
                  onEditTask={(task) => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  onAddTaskAtTime={(time) => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Task Creation / Editing Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          editingTask={editingTask}
          projects={projects}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          darkMode={darkMode}
        />
      )}

      {/* Project Creation Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold mb-4">Create New Project</h3>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Side Hustle, Learning React"
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Color Tag</label>
                <div className="flex space-x-3">
                  {['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setNewProjectColor(color)}
                      className={`w-7 h-7 rounded-full ${color} transition transform ${newProjectColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-500/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Widget Task Row Component
function WidgetTaskRow({ task, project, onToggle, onEdit, darkMode }) {
  const pColor = getPriorityColor(task.priority);

  return (
    <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 hover:scale-[1.005] ${darkMode ? 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <button onClick={onToggle} className={`transition active:scale-90 ${pColor.text}`}>
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
          ) : (
            <Circle className="w-5 h-5 stroke-[1.75]" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-500' : ''}`}>
              {task.title}
            </span>
            {project && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-semibold ${project.color}`}>
                {project.name}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
            {task.startTime && (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>{task.startTime}</span>
              </span>
            )}
            <span>• {task.priority.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-500/10">
        <Edit3 className="w-4 h-4" />
      </button>
    </div>
  );
}

// Sidebar Item Component
function NavItem({ icon, label, count, active, onClick, collapsed }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${active ? 'bg-gradient-to-r from-indigo-500/10 to-rose-500/10 text-indigo-400 shadow-sm border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-500/10 hover:text-slate-200'}`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && typeof count === 'number' && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">{count}</span>
      )}
    </button>
  );
}

// Single Task List Row Component
function TaskListItem({ task, project, onToggle, onEdit, onDelete, darkMode }) {
  const pColor = getPriorityColor(task.priority);

  return (
    <div
      className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:scale-[1.005] ${darkMode ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200/80 hover:border-slate-300'} ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        <button
          onClick={onToggle}
          className={`mt-0.5 transition active:scale-90 ${pColor.text}`}
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
          ) : (
            <Circle className="w-5 h-5 stroke-[1.75]" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className={`font-semibold text-sm truncate ${task.completed ? 'line-through text-slate-500' : ''}`}>
              {task.title}
            </span>
            {project && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-medium ${project.color}`}>
                {project.name}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>
          )}

          <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
            {task.startTime && (
              <span className="flex items-center space-x-1 bg-slate-500/10 px-2.5 py-0.5 rounded-lg">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>{formatTimeRange(task.startTime, task.duration)}</span>
              </span>
            )}

            {task.tags && task.tags.map((tag) => (
              <span key={tag} className="flex items-center space-x-0.5">
                <Tag className="w-2.5 h-2.5" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-slate-200"
          title="Edit Task"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Vertical Timeline Time-Blocking View Component
function TimeBlockingSchedule({ hours, tasks, projects, onToggleTask, onEditTask, onAddTaskAtTime, darkMode }) {
  return (
    <div className={`rounded-3xl border p-4 sm:p-6 shadow-xl backdrop-blur-xl ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/40 pb-3">
        <h2 className="font-bold text-xs tracking-wider text-slate-400 uppercase">Daily Schedule & Time Blocks</h2>
        <span className="text-xs text-slate-500">Tap hour slots to view schedule</span>
      </div>

      <div className="relative border-l border-slate-800/60 ml-12 space-y-6">
        {hours.map((hour) => {
          const hourTasks = tasks.filter((t) => t.startTime && t.startTime.startsWith(hour.substring(0, 2)));

          return (
            <div key={hour} className="relative group min-h-[60px] pl-6 flex flex-col justify-start">
              <div className="absolute -left-14 top-0 text-xs font-mono font-bold text-slate-400">
                {hour}
              </div>

              <div className="absolute left-0 right-0 top-3 border-b border-dashed border-slate-800/30 group-hover:border-indigo-500/40 transition" />

              <div className="relative z-10 space-y-2">
                {hourTasks.map((task) => {
                  const proj = projects.find((p) => p.id === task.projectId);
                  const pColor = getPriorityColor(task.priority);

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all transform hover:scale-[1.01] shadow-sm ${darkMode ? 'bg-slate-900 border-slate-700/80 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <button onClick={() => onToggleTask(task.id)} className={pColor.text}>
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-bold ${task.completed ? 'line-through text-slate-500' : ''}`}>
                              {task.title}
                            </span>
                            {proj && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-semibold ${proj.color}`}>
                                {proj.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-indigo-400" />
                              <span>{formatTimeRange(task.startTime, task.duration)}</span>
                            </span>
                            <span>{task.duration} mins</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onEditTask(task)}
                        className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Modal for Adding / Editing Tasks
function TaskModal({ isOpen, editingTask, projects, onClose, onSave, darkMode }) {
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || getTodayStr());
  const [startTime, setStartTime] = useState(editingTask?.startTime || '09:00');
  const [duration, setDuration] = useState(editingTask?.duration || 60);
  const [priority, setPriority] = useState(editingTask?.priority || 'p4');
  const [projectId, setProjectId] = useState(editingTask?.projectId || projects[0]?.id || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(editingTask?.tags || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      startTime,
      duration: Number(duration),
      priority,
      projectId,
      tags,
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (t) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl transition-transform ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-500/10 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 text-base font-semibold border-b outline-none transition ${darkMode ? 'bg-transparent border-slate-800 focus:border-indigo-500' : 'bg-transparent border-slate-200 focus:border-indigo-500'}`}
            />
          </div>

          <div>
            <textarea
              placeholder="Description or notes..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-3 rounded-xl border text-sm outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Duration (mins)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Priority</label>
              <div className="flex space-x-1">
                {[
                  { id: 'p1', label: 'P1', color: 'text-rose-500' },
                  { id: 'p2', label: 'P2', color: 'text-amber-500' },
                  { id: 'p3', label: 'P3', color: 'text-sky-500' },
                  { id: 'p4', label: 'P4', color: 'text-slate-400' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPriority(p.id)}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition ${priority === p.id ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                  >
                    <Flag className={`w-3 h-3 inline mr-1 ${p.color}`} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Tags</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add tag and press enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className={`flex-1 px-3 py-1.5 rounded-xl border text-xs outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 flex items-center space-x-1"
                >
                  <span>{t}</span>
                  <button type="button" onClick={() => removeTag(t)} className="text-slate-400 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-md"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}