import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { type Task, type ApiResponse } from "../types";
import { Trash2, Plus, ArrowLeft, Save } from "lucide-react";

export default function TaskForm() {
  const { id } = useParams(); // Get ID from URL (if editing)
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // 1. Initialize Form
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Task>({
    defaultValues: {
      priority: "MEDIUM",
      status: "PENDING",
      subtasks: [], // Start with empty array
    },
  });

  // 2. Setup Dynamic Subtasks Array (The React version of FormArray)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subtasks",
  });

  // 3. Load Data (If Editing)
  useEffect(() => {
    if (isEditMode) {
      api.get<ApiResponse<Task>>(`/api/tasks/${id}`).then((res) => {
        // React Hook Form is smart enough to map the JSON to the form fields automatically
        reset(res.data.data);
      });
    }
  }, [id, reset]);

  // 4. Save Logic (Create or Update)
  const onSubmit = async (data: Task) => {
    try {
      if (isEditMode) {
        await api.put(`/api/tasks/${id}`, data);
      } else {
        await api.post("/api/tasks", data);
      }
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to save task. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 sm:p-8 bg-white shadow-xl rounded-2xl border border-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 hover:bg-slate-50 rounded-full transition text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Fill in the details below
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* --- Main Task Fields --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Task Title
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
              placeholder="e.g. Finish Project Report"
            />
            {errors.title && (
              <span className="text-red-500 text-xs mt-1 font-medium">
                {errors.title.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Priority
            </label>
            <div className="relative">
              <select
                {...register("priority")}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white appearance-none cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Deadline
            </label>
            <input
              type="date"
              {...register("deadline", { required: true })}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-600"
            />
          </div>

          {isEditMode && (
            <div className="col-span-full">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white cursor-pointer"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {/* --- Subtasks Section --- */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Subtasks
              <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {fields.length}
              </span>
            </h3>
            <button
              type="button"
              onClick={() =>
                append({
                  title: "",
                  priority: "MEDIUM",
                  status: "PENDING",
                  deadline: "",
                })
              }
              className="flex items-center gap-2 text-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 px-4 py-2 rounded-lg font-medium transition shadow-sm"
            >
              <Plus size={16} /> Add Subtask
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Hidden ID Field (Crucial for Updates!) */}
                <input type="hidden" {...register(`subtasks.${index}.id`)} />

                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-slate-400 mb-1 md:hidden">
                    Title
                  </label>
                  <input
                    {...register(`subtasks.${index}.title` as const, {
                      required: true,
                    })}
                    placeholder="Subtask title"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1 md:hidden">
                    Priority
                  </label>
                  <select
                    {...register(`subtasks.${index}.priority` as const)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-sm bg-white cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Med</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1 md:hidden">
                    Due Date
                  </label>
                  <input
                    type="date"
                    {...register(`subtasks.${index}.deadline` as const, {
                      required: true,
                    })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-sm text-slate-500"
                  />
                </div>

                <div className="md:col-span-1 flex justify-end md:justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                    title="Remove Subtask"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-400 text-sm">No subtasks yet.</p>
                <p className="text-slate-400 text-xs mt-1">
                  Click "Add Subtask" to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-500/30 active:scale-95"
          >
            <Save size={18} />
            {isEditMode ? "Update Task" : "Save Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
