import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  type Task,
  type Page,
  type ApiResponse,
  type Priority,
  type Status,
} from "../types";
import { Pencil, Trash2, Plus, ArrowUpDown } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // --- API CALLS ---
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        size: 10,
        sortBy: sortColumn,
        direction: sortDirection,
      };

      if (priorityFilter !== "ALL") params.priority = priorityFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await api.get<ApiResponse<Page<Task>>>("/api/tasks", {
        params,
      });

      setTasks(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
      setTotalElements(res.data.data.totalElements);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  // Reload when any dependency changes
  useEffect(() => {
    fetchTasks();
  }, [page, priorityFilter, statusFilter, sortColumn, sortDirection]);

  // --- ACTIONS ---
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      fetchTasks(); // Refresh list after delete
    } catch (error) {
      alert("Failed to delete task");
    }
  };

  const handleSort = (column: string) => {
    // Toggle direction if clicking same column, otherwise reset to ASC
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Helper for Status Colors
  const getStatusColor = (status: Status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "CANCELLED":
        return "bg-slate-400";
      default:
        return "bg-amber-500";
    }
  };

  // Helper for Priority Colors
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-50 text-red-700 border-red-100";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "LOW":
        return "bg-green-50 text-green-700 border-green-100";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 font-sans text-slate-800">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your tasks and subtasks efficiently
          </p>
        </div>
        <button
          onClick={() => navigate("/tasks/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm active:scale-95"
        >
          <Plus size={18} /> Create Task
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* TOOLBAR (Filters) */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer hover:border-blue-400 transition"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer hover:border-blue-400 transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {totalElements} Records Found
          </span>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                {/* Sortable Headers */}
                {["Title", "Priority", "Status", "Deadline"].map((head) => (
                  <th
                    key={head}
                    onClick={() => handleSort(head.toLowerCase())}
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none group"
                  >
                    <div className="flex items-center gap-1">
                      {head}
                      <ArrowUpDown
                        size={12}
                        className={`text-slate-400 ${
                          sortColumn === head.toLowerCase()
                            ? "text-blue-600 opacity-100"
                            : "opacity-0 group-hover:opacity-50"
                        }`}
                      />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-slate-500 animate-pulse"
                  >
                    Loading tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-slate-400 italic"
                  >
                    No tasks found. Create one to get started!
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Title */}
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {task.title}
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${getStatusColor(
                            task.status
                          )}`}
                        ></span>
                        {task.status.replace("_", " ")}
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                      {task.deadline}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/tasks/edit/${task.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Task"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {totalElements > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-sm text-slate-600">
            <span>
              Page{" "}
              <span className="font-semibold text-slate-900">{page + 1}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </span>

            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm font-medium"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
