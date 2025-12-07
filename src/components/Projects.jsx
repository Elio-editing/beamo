import React, { useState } from 'react';
import { Plus, Trash2, Calendar, CheckCircle2, Circle, ChevronDown, ChevronUp, Edit2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';

export const Projects = ({ projects, sessions = [], darkMode, onAddProject, onDeleteProject, onToggleProject, onUpdateProject }) => {
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', deadline: '', description: '' });
  const [expandedProject, setExpandedProject] = useState(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [completingProject, setCompletingProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', deadline: '', description: '' });

  // Gérer la complétion avec animation
  const handleCompleteProject = async (projectId, isCurrentlyCompleted) => {
    // Si on marque comme complété (pas déjà complété)
    if (!isCurrentlyCompleted) {
      setCompletingProject(projectId);
      // Attendre que toute l'animation se termine avant de basculer
      setTimeout(async () => {
        await onToggleProject(projectId);
        setCompletingProject(null);
      }, 1000);
    } else {
      // Si on dé-complète, pas d'animation
      await onToggleProject(projectId);
    }
  };

  // Composant check animé
  const AnimatedCheck = ({ isAnimating }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        className={isAnimating ? 'animate-check-circle' : ''}
        fill="currentColor"
        fillOpacity={isAnimating ? 0 : 1}
      />
      <path
        d="M8 12.5l3 3 5-6"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isAnimating ? 'animate-check-draw' : ''}
      />
    </svg>
  );

  // Réinitialiser le champ de sous-tâche quand on change de projet
  const handleExpandProject = (projectId) => {
    if (expandedProject !== projectId) {
      setNewSubtask(''); // Réinitialiser le champ
    }
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  // Calculer les heures par projet
  const getProjectHours = (projectId) => {
    const projectSessions = sessions.filter(s => s.projectId === projectId);
    const deep = projectSessions
      .filter(s => s.type === 'deep')
      .reduce((sum, s) => sum + s.duration, 0) / 3600;
    const shallow = projectSessions
      .filter(s => s.type === 'shallow')
      .reduce((sum, s) => sum + s.duration, 0) / 3600;
    return {
      deep,
      shallow,
      total: deep + shallow
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newProject.name && newProject.deadline) {
      onAddProject({
        ...newProject,
        completed: false,
        createdAt: Date.now(),
        subtasks: []
      });
      setNewProject({ name: '', deadline: '', description: '' });
      setShowForm(false);
    }
  };

  const handleAddSubtask = async (projectId) => {
    if (!newSubtask.trim()) return;

    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedSubtasks = [
        ...(project.subtasks || []),
        {
          id: Date.now().toString(),
          text: newSubtask,
          completed: false
        }
      ];
      await onUpdateProject(projectId, { subtasks: updatedSubtasks });
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = async (projectId, subtaskId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedSubtasks = (project.subtasks || []).map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      await onUpdateProject(projectId, { subtasks: updatedSubtasks });
    }
  };

  const handleDeleteSubtask = async (projectId, subtaskId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedSubtasks = (project.subtasks || []).filter(st => st.id !== subtaskId);
      await onUpdateProject(projectId, { subtasks: updatedSubtasks });
    }
  };

  // Édition de projet
  const startEditingProject = (project) => {
    setEditingProject(project.id);
    setEditForm({
      name: project.name,
      deadline: project.deadline,
      description: project.description || ''
    });
  };

  const cancelEditingProject = () => {
    setEditingProject(null);
    setEditForm({ name: '', deadline: '', description: '' });
  };

  const saveProjectEdit = async (projectId) => {
    if (editForm.name && editForm.deadline) {
      await onUpdateProject(projectId, {
        name: editForm.name,
        deadline: editForm.deadline,
        description: editForm.description
      });
      setEditingProject(null);
      setEditForm({ name: '', deadline: '', description: '' });
    }
  };

  // Réorganisation des sous-tâches
  const moveSubtaskUp = async (projectId, subtaskIndex) => {
    if (subtaskIndex === 0) return;
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedSubtasks = [...(project.subtasks || [])];
      [updatedSubtasks[subtaskIndex - 1], updatedSubtasks[subtaskIndex]] =
      [updatedSubtasks[subtaskIndex], updatedSubtasks[subtaskIndex - 1]];
      await onUpdateProject(projectId, { subtasks: updatedSubtasks });
    }
  };

  const moveSubtaskDown = async (projectId, subtaskIndex) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || subtaskIndex >= (project.subtasks || []).length - 1) return;
    const updatedSubtasks = [...(project.subtasks || [])];
    [updatedSubtasks[subtaskIndex + 1], updatedSubtasks[subtaskIndex]] =
    [updatedSubtasks[subtaskIndex], updatedSubtasks[subtaskIndex + 1]];
    await onUpdateProject(projectId, { subtasks: updatedSubtasks });
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDeadlineColor = (deadline, completed) => {
    if (completed) return 'text-zinc-500';
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return 'text-red-500';
    if (days === 0) return 'text-orange-500';
    if (days <= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatDeadline = (deadline) => {
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return `En retard de ${Math.abs(days)}j`;
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Demain";
    if (days <= 7) return `Dans ${days}j`;
    return new Date(deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const activeProjects = projects.filter(p => !p.completed);
  const completedProjects = projects.filter(p => p.completed);

  return (
    <div className={`p-4 md:p-6 rounded-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h2 className="text-xs md:text-sm font-medium uppercase tracking-wider opacity-60">
          Projets
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`p-2 rounded-xl ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'} transition-colors`}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Add Project Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 animate-fadeIn">
          <input
            type="text"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="Nom du projet"
            className={`w-full px-3 md:px-4 py-2 rounded-xl outline-none text-sm md:text-base ${
              darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-300'
            }`}
            required
          />
          <div>
            <label className="block text-xs opacity-60 mb-1 ml-1">Deadline</label>
            <input
              type="date"
              value={newProject.deadline}
              onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
              className={`w-full px-2 md:px-4 py-2 rounded-xl outline-none text-sm md:text-base ${
                darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-300'
              }`}
              required
            />
          </div>
          <textarea
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            placeholder="Description (optionnel)"
            rows={2}
            className={`w-full px-3 md:px-4 py-2 rounded-xl outline-none resize-none text-sm md:text-base ${
              darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-300'
            }`}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewProject({ name: '', deadline: '', description: '' });
              }}
              className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
                darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'
              }`}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div className="space-y-2 mb-4">
          {activeProjects.map((project) => (
            <div
              key={project.id}
              className={`p-4 rounded-xl ${
                darkMode ? 'bg-zinc-800/50' : 'bg-white'
              } border ${darkMode ? 'border-zinc-700' : 'border-zinc-200'} ${
                completingProject === project.id ? 'animate-slideOut' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingProject === project.id ? (
                    // Mode édition
                    <div className="space-y-2 animate-fadeIn">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Nom du projet"
                        className={`w-full px-3 py-2 rounded-lg outline-none text-sm ${
                          darkMode ? 'bg-zinc-700 border border-zinc-600' : 'bg-zinc-100 border border-zinc-300'
                        }`}
                      />
                      <input
                        type="date"
                        value={editForm.deadline}
                        onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg outline-none text-sm ${
                          darkMode ? 'bg-zinc-700 border border-zinc-600' : 'bg-zinc-100 border border-zinc-300'
                        }`}
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Description (optionnel)"
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg outline-none resize-none text-sm ${
                          darkMode ? 'bg-zinc-700 border border-zinc-600' : 'bg-zinc-100 border border-zinc-300'
                        }`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveProjectEdit(project.id)}
                          className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <Save size={14} />
                          Sauvegarder
                        </button>
                        <button
                          onClick={cancelEditingProject}
                          className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                            darkMode ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-zinc-200 hover:bg-zinc-300'
                          }`}
                        >
                          <X size={14} />
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Mode normal
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteProject(project.id, project.completed);
                          }}
                          className={`hover:opacity-70 transition-opacity ${
                            completingProject === project.id ? 'animate-completion-bounce' : ''
                          }`}
                        >
                          {project.completed || completingProject === project.id ? (
                            <div className={`text-green-500 ${completingProject === project.id ? 'animate-check-scale' : ''}`}>
                              <AnimatedCheck isAnimating={completingProject === project.id} />
                            </div>
                          ) : (
                            <Circle size={20} className="text-zinc-400" />
                          )}
                        </button>
                        <h3 className="font-medium text-sm md:text-base truncate">{project.name}</h3>
                      </div>
                      {project.description && (
                        <p className="text-sm opacity-60 ml-7 mb-2">{project.description}</p>
                      )}
                      <div className="flex items-center gap-2 ml-7">
                        <Calendar size={14} className={getDeadlineColor(project.deadline, false)} />
                        <span className={`text-sm font-medium ${getDeadlineColor(project.deadline, false)}`}>
                          {formatDeadline(project.deadline)}
                        </span>
                      </div>
                    </>
                  )}
                  {/* Statistiques du projet */}
                  {(() => {
                    const hours = getProjectHours(project.id);
                    if (hours.total > 0) {
                      return (
                        <div className="mt-2 ml-7 flex gap-3 text-xs">
                          <span className="text-green-500 font-medium">{hours.deep.toFixed(1)}h Deep</span>
                          <span className="opacity-20">•</span>
                          <span className="text-purple-500 font-medium">{hours.shallow.toFixed(1)}h Shallow</span>
                          <span className="opacity-20">•</span>
                          <span className="opacity-60">{hours.total.toFixed(1)}h Total</span>
                        </div>
                      );
                    }
                  })()}

                  {/* Sous-tâches */}
                  {editingProject !== project.id && project.subtasks && project.subtasks.length > 0 && (
                    <div className="mt-3 ml-7 space-y-1">
                      {project.subtasks.map((subtask, index) => (
                        <div key={subtask.id} className="flex items-center gap-2 group">
                          <button
                            onClick={() => handleToggleSubtask(project.id, subtask.id)}
                            className="hover:opacity-70 transition-opacity"
                          >
                            {subtask.completed ? (
                              <CheckCircle2 size={14} className="text-green-500" />
                            ) : (
                              <Circle size={14} className="text-zinc-400" />
                            )}
                          </button>
                          <span className={`text-xs flex-1 ${subtask.completed ? 'line-through opacity-50' : ''}`}>
                            {subtask.text}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              onClick={() => moveSubtaskUp(project.id, index)}
                              disabled={index === 0}
                              className={`p-1 rounded hover:bg-zinc-700 transition-colors ${
                                index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => moveSubtaskDown(project.id, index)}
                              disabled={index === project.subtasks.length - 1}
                              className={`p-1 rounded hover:bg-zinc-700 transition-colors ${
                                index === project.subtasks.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubtask(project.id, subtask.id)}
                              className="p-1 rounded hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={12} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulaire ajout sous-tâche */}
                  {editingProject !== project.id && expandedProject === project.id && (
                    <div className="mt-3 ml-7 flex gap-2 animate-fadeIn">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="Nouvelle sous-tâche..."
                        className={`flex-1 px-3 py-1 text-sm rounded-lg outline-none ${
                          darkMode ? 'bg-zinc-700 border border-zinc-600' : 'bg-zinc-100 border border-zinc-300'
                        }`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddSubtask(project.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddSubtask(project.id)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}

                  {/* Bouton ajouter sous-tâche */}
                  {editingProject !== project.id && (
                    <button
                      onClick={() => handleExpandProject(project.id)}
                      className={`mt-2 ml-7 text-xs opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1`}
                    >
                      <Plus size={12} />
                      {expandedProject === project.id ? 'Annuler' : 'Ajouter sous-tâche'}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => startEditingProject(project)}
                    className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-500"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl mb-2 transition-colors ${
              darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'
            }`}
          >
            <h3 className="text-xs uppercase tracking-wider opacity-40">
              Terminés ({completedProjects.length})
            </h3>
            {showCompleted ? (
              <ChevronUp size={16} className="opacity-40" />
            ) : (
              <ChevronDown size={16} className="opacity-40" />
            )}
          </button>

          {showCompleted && (
            <div className="space-y-2 animate-fadeIn">
              {completedProjects.map((project) => (
              <div
                key={project.id}
                className={`p-4 rounded-xl ${
                  darkMode ? 'bg-zinc-800/30' : 'bg-zinc-100'
                } border ${darkMode ? 'border-zinc-700/50' : 'border-zinc-200'} opacity-60`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteProject(project.id, project.completed);
                        }}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <div className="text-green-500">
                          <AnimatedCheck isAnimating={false} />
                        </div>
                      </button>
                      <h3 className="font-medium line-through">{project.name}</h3>
                    </div>
                    {project.description && (
                      <p className="text-sm opacity-60 ml-7 line-through">{project.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && !showForm && (
        <div className="text-center py-8 opacity-40">
          <p className="text-sm">Aucun projet pour le moment</p>
          <p className="text-xs mt-1">Cliquez sur + pour en ajouter</p>
        </div>
      )}
    </div>
  );
};
