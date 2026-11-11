import { Folder, Briefcase, User, Lightbulb, BookOpen, CheckSquare, Layers } from "lucide-react";

export const CATEGORY_STYLES = {
  All: { icon: Layers, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  Work: { icon: Briefcase, color: "text-blue-700 bg-blue-50 border-blue-200" },
  Personal: { icon: User, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  Ideas: { icon: Lightbulb, color: "text-amber-700 bg-amber-50 border-amber-200" },
  Study: { icon: BookOpen, color: "text-purple-700 bg-purple-50 border-purple-200" },
  Tasks: { icon: CheckSquare, color: "text-rose-700 bg-rose-50 border-rose-200" },
  General: { icon: Folder, color: "text-slate-700 bg-slate-100 border-slate-200" },
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center gap-1.5">
        <Folder className="w-3.5 h-3.5" />
        Categories:
      </span>

      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        const count = categoryCounts[category] || 0;
        const config = CATEGORY_STYLES[category] || {
          icon: Folder,
          color: "text-slate-700 bg-slate-100 border-slate-200",
        };
        const Icon = config.icon;

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              isSelected
                ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10"
                : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : ""}`} />
            <span>{category}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
