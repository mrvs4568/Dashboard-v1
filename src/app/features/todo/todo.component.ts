import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucidePlus, LucideStar, LucideTrash2, LucideCheck, LucideSearch, LucideSparkles, LucideCalendar, LucideActivity, LucideZap, LucideClock, LucideChevronRight } from '@lucide/angular';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  starred: boolean;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  tag?: {
    label: string;
    colorClass: string;
  };
}

@Component({
  selector: 'app-todo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, LucidePlus, LucideStar, LucideTrash2, LucideCheck, LucideSearch, LucideSparkles, LucideCalendar, LucideActivity, LucideZap, LucideClock, LucideChevronRight],
  template: `
    <div class="todo-page p-4 md:p-8 lg:p-12 font-sans selection:bg-indigo-500/30">

      <!-- Premium Glass Header -->
      <header class="max-w-6xl mx-auto mb-10 flex flex-col flex-wrap md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 todo-accent rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-indigo-500/20">
            <svg lucideSparkles size="12"></svg>
            AI-Enhanced Workflow
          </div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tight todo-text flex items-center gap-3">
            Focus <span class="todo-accent font-medium font-sans">Command</span>
          </h1>
          <p class="todo-muted text-sm md:text-base max-w-md font-medium leading-relaxed">
            Your intelligence-backed workspace for high-velocity task management and priority execution.
          </p>
        </div>

        <!-- Real-time Stats Cards -->
        <div class="todo-stats flex flex-wrap gap-4 max-w-full pb-2">
          <div class="glass-stat box-border px-6 py-4 rounded-2xl min-w-[140px]">
            <div class="flex items-center gap-2 todo-accent mb-1">
              <svg lucideActivity size="14"></svg>
              <span class="text-[10px] font-bold uppercase tracking-wider">Productivity</span>
            </div>
            <div class="text-2xl font-black todo-text">{{ productivity() }}%</div>
          </div>
          <div class="glass-stat box-border px-6 py-4 rounded-2xl min-w-[140px]">
            <div class="flex items-center gap-2 todo-success mb-1">
              <svg lucideCheck size="14"></svg>
              <span class="text-[10px] font-bold uppercase tracking-wider">Completed</span>
            </div>
            <div class="text-2xl font-black todo-text">{{ completedCount() }}</div>
          </div>
        </div>
      </header>

      <main class="max-w-6xl mx-auto space-y-6">

        <!-- Search & Control Bar -->
        <div class="flex flex-col lg:flex-row gap-4 items-center">
          <div class="relative w-full min-w-0 lg:flex-1 group">
            <svg lucideSearch size="20" class="absolute left-4 top-1/2 -translate-y-1/2 todo-muted  transition-colors"></svg>
            <input
              type="text"
              placeholder="Query tasks by title or metadata..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              class="w-full box-border pl-12 pr-6 py-4 todo-inset backdrop-blur-xl border todo-border rounded-2xl text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 todo-text transition-all font-medium"
              >
          </div>

          <div class="todo-toolbar flex items-center gap-3 w-full lg:w-auto shrink-0">
            <div class="flex todo-inset p-1 rounded-xl border todo-border shrink-0">
              <button class="px-4 py-2 border-0 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                [class.bg-indigo-500]="activeFilter() === 'all'"
                [class.text-white]="activeFilter() === 'all'"
                [class.todo-muted]="activeFilter() !== 'all'"
                [class.bg-transparent]="activeFilter() !== 'all'"
              (click)="activeFilter.set('all')">All</button>
              <button class="px-4 py-2 border-0 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                [class.bg-indigo-500]="activeFilter() === 'starred'"
                [class.text-white]="activeFilter() === 'starred'"
                [class.todo-muted]="activeFilter() !== 'starred'"
                [class.bg-transparent]="activeFilter() !== 'starred'"
              (click)="activeFilter.set('starred')">Starred</button>
            </div>

            <button (click)="openAddForm()"
              class="flex-1 lg:flex-none h-14 px-8 border-0 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] text-white rounded-2xl font-bold transition-all text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
              <svg lucidePlus size="18"></svg>
              Add Task
            </button>
          </div>
        </div>

        @if (showAddForm()) {
          <form (ngSubmit)="addTask()"
                class="todo-panel border border-slate-700 rounded-2xl p-6 space-y-4">

            <h2 class="text-xl font-bold todo-text">{{ editingId() ? 'Edit Task' : 'Create Task' }}</h2>

            <label class="block text-sm todo-muted">
              Task Title
              <input type="text"
                     name="title"
                     required
                     maxlength="120"
                     [ngModel]="newTitle()"
                     (ngModelChange)="newTitle.set($event)"
                     placeholder="Enter task title"
                     class="block w-full box-border mt-2 p-3 rounded-xl todo-inset border todo-border todo-text">
            </label>

            <label class="block text-sm todo-muted">
              Priority
              <select name="priority"
                      [ngModel]="newPriority()"
                      (ngModelChange)="newPriority.set($event)"
                      class="block w-full mt-2 p-3 rounded-xl todo-inset border todo-border todo-text">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <div class="flex flex-wrap gap-3">
              <button type="submit"
                      [disabled]="!newTitle().trim()"
                      class="px-6 py-3 rounded-xl border-0 bg-indigo-600 text-white font-bold disabled:opacity-40">
                {{ editingId() ? 'Save Changes' : 'Create Task' }}
              </button>

              <button type="button"
                      (click)="closeAddForm()"
                      class="px-6 py-3 rounded-xl bg-transparent border todo-border todo-text">
                Cancel
              </button>
            </div>
          </form>
        }

        <!-- Dynamic Task List Container -->
        <div class="group/container relative">
          <!-- List Shadow Background -->
          <div class="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full opacity-50 -z-10 animate-pulse"></div>

          <div class="todo-panel backdrop-blur-3xl rounded-[32px] border todo-border todo-shadow overflow-hidden">

            <div class="todo-dividers">
              @for (task of filteredTasks(); track task.id) {
                <div class="task-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group  transition-all duration-500 relative">

                  <div class="todo-task-content flex items-center gap-6 flex-1">
                    <!-- Premium Checkbox Wrapper -->
                    <div class="relative flex shrink-0 items-center justify-center group/check cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 rounded-full"
                      role="checkbox"
                      tabindex="0"
                      [attr.aria-checked]="task.completed"
                      [attr.aria-label]="'Complete task: ' + task.title"
                      (click)="$event.stopPropagation(); toggleTask(task)"
                      (keydown.space)="$event.preventDefault(); toggleTask(task)">
                      <div class="w-7 h-7 box-border rounded-full border-2 border-solid transition-all flex items-center justify-center"
                        [class.bg-emerald-500]="task.completed"
                        [class.border-emerald-500]="task.completed"
                        [class.todo-border]="!task.completed">
                        @if (task.completed) {
                          <svg lucideCheck size="16" class="text-white"></svg>
                        }
                      </div>
                      <!-- Click ripple effect simulation -->
                      <div class="absolute inset-0 rounded-full scale-0 group-active/check:scale-150 bg-emerald-500/20 transition-transform duration-500"></div>
                    </div>

                    <div class="todo-task-info space-y-1">
                      <div class="flex items-center gap-3">
                        <h3 class="text-base md:text-lg font-bold transition-all"
                          [class.todo-muted]="task.completed"
                          [class.line-through]="task.completed"
                          [class.todo-text]="!task.completed"
                          [class.font-medium]="task.completed">
                          {{ task.title }}
                        </h3>
                        @if (task.priority === 'High') {
                          <span class="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 todo-critical rounded-md text-[10px] font-black uppercase border border-rose-500/20 tracking-tighter animate-pulse">
                            <svg lucideZap size="10"></svg> Critical
                          </span>
                        }
                      </div>

                      <div class="todo-task-meta flex items-center gap-4 text-xs font-semibold todo-muted">
                        <div class="flex items-center gap-1.5 overflow-hidden">
                          <svg lucideCalendar size="14" class="todo-accent"></svg>
                          <span>{{ task.date }}</span>
                        </div>
                        @if (task.tag) {
                          <div class="flex items-center gap-1.5">
                            <div class="w-2 h-2 rounded-full" [ngClass]="task.tag.colorClass === 'tag-blue' ? 'bg-indigo-500' : task.tag.colorClass === 'tag-purple' ? 'bg-fuchsia-500' : 'bg-emerald-500'"></div>
                            <span class="uppercase tracking-widest text-[9px]">{{ task.tag.label }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Action Area -->
                  <div class="todo-task-actions flex items-center justify-between sm:justify-end gap-6" (click)="$event.stopPropagation()">
                    <div class="flex items-center gap-2">
                      <button class="h-10 w-10 flex items-center justify-center rounded-xl todo-inset border todo-border hover:border-amber-500/50 hover:bg-amber-500/10 transition-all group/star"
                        [class.todo-starred]="task.starred"
                        [class.todo-muted]="!task.starred"
                        type="button"
                        [attr.aria-label]="'Star task: ' + task.title"
                        [attr.aria-pressed]="task.starred"
                        (click)="toggleStar(task)">
                        <svg lucideStar size="18" [attr.fill]="task.starred ? 'currentColor' : 'none'"></svg>
                      </button>
                      <button type="button"
                        (click)="openEditForm(task)"
                        [attr.aria-label]="'Edit ' + task.title"
                        class="px-3 h-10 rounded-xl todo-inset border todo-border todo-accent hover:bg-indigo-500/10 cursor-pointer">
                        Edit
                      </button>
                      <button type="button"
                        [attr.aria-label]="'Delete ' + task.title"
                        title="Delete task"
                        (click)="deleteTask(task)"
                        class="h-10 w-10 flex items-center justify-center rounded-xl todo-inset border todo-border hover:border-rose-500/50 hover:bg-rose-500/10 todo-muted hover:text-rose-500 transition-all cursor-pointer">
                        <svg lucideTrash2 size="18"></svg>
                      </button>
                    </div>

                    <div class="todo-task-status h-10 flex items-center gap-3 px-4 todo-inset rounded-xl border todo-border text-[10px] font-bold todo-muted group-hover:border-indigo-500/30 transition-all">
                      <svg lucideClock size="12" class="todo-accent"></svg>
                      <span class="uppercase tracking-widest leading-none">
                         {{ task.completed ? 'Completed' : 'Pending' }}
                       </span>
                      <svg lucideChevronRight size="14" class="todo-muted"></svg>
                    </div>
                  </div>

                  <!-- Subtle Bottom Border Glow -->
                  <div class="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                } @empty {
                <div class="py-24 text-center flex flex-col items-center justify-center space-y-4">
                  <div class="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center todo-accent block animate-bounce">
                    <svg lucideActivity size="40"></svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-black todo-text mb-2 tracking-tight">System Idle</h3>
                    <p class="todo-muted text-sm max-w-xs mx-auto font-medium leading-relaxed">All intelligence-processed tasks are cleared. Ready for your next directive.</p>
                  </div>
                </div>
              }
            </div>

            <!-- List Footer -->
            <footer class="p-6 bg-indigo-500/5 border-t todo-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="flex -space-x-2">
                  @for(i of [1,2,3]; track i) {
                    <div class="w-8 h-8 rounded-full border-2 todo-border todo-inset flex items-center justify-center text-[10px] font-bold todo-muted">
                      UI
                    </div>
                  }
                </div>
                <span class="text-xs font-bold todo-muted uppercase tracking-widest leading-none">{{ completedCount() }} Task Intercepts Resolved</span>
              </div>

              <button type="button"
                 (click)="flushCompleted()"
                 [disabled]="completedCount() === 0"
                 class="disabled:opacity-40 disabled:cursor-not-allowed bg-transparent border-0 cursor-pointer todo-accent hover:text-indigo-300 text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 group">
                Flush Completed
                <svg lucideCheck size="14" class="group-hover:translate-x-1 transition-transform"></svg>
              </button>
            </footer>

          </div>
        </div>
      </main>
    </div>
    `,
  styles: [`
    .todo-page input,
    .todo-page select,
    .todo-page button.todo-border {
      border: 1px solid var(--border-color);
      box-sizing: border-box;
    }

    .todo-page [role="checkbox"][aria-checked="false"] > div:first-child {
      border-color: var(--text-muted);
    }

    .todo-task-info {
      min-width: 0;
      flex: 1;
    }

    .todo-task-info h3 {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    @media (max-width: 767px) {
      .todo-page {
        padding: 12px;
        border-radius: 16px;
      }

      .todo-page header {
        margin-bottom: 20px;
        gap: 16px;
      }

      .todo-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        width: 100%;
        gap: 8px;
      }

      .glass-stat {
        min-width: 0;
        padding: 12px;
      }

      .todo-toolbar {
        flex-wrap: wrap;
        gap: 10px;
      }

      .todo-toolbar > button {
        flex: 1 0 100%;
        width: 100%;
        padding: 0 12px;
        white-space: nowrap;
        height: 44px;
      }

      .task-card {
        flex-direction: column;
        align-items: stretch;
        padding: 14px;
        gap: 14px;
        min-width: 0;
      }

      .todo-task-content {
        align-items: flex-start;
        gap: 10px;
      }

      .todo-task-info > div:first-child {
        flex-wrap: wrap;
        gap: 6px;
      }

      .todo-task-info h3 {
        margin: 0;
        line-height: 1.5;
      }

      .todo-task-meta {
        flex-wrap: wrap;
        gap: 8px;
      }

      .todo-task-actions {
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 8px;
        padding-top: 10px;
        border-top: 1px solid var(--border-color);
      }

      .todo-task-status {
        gap: 6px;
        padding: 0 8px;
        max-width: 100%;
        box-sizing: border-box;
      }

      .todo-task-status svg:last-child {
        display: none;
      }

      .todo-page form,
      .todo-page footer {
        padding: 14px;
      }
    }

    .todo-page {
      min-height: 100%;
      box-sizing: border-box;
      background: var(--bg-color);
      color: var(--text-main);
      border-radius: 24px;
    }

    .todo-panel {
      background: var(--surface);
    }

    .todo-inset {
      background: var(--bg-color);
    }

    .todo-border {
      border-color: var(--border-color);
    }

    .todo-text {
      color: var(--text-main);
    }

    .todo-muted {
      color: var(--text-muted);
    }

    .todo-accent {
      color: var(--primary);
    }

    .todo-success {
      color: color-mix(in srgb, var(--text-main) 50%, #10b981);
    }

    .todo-critical {
      color: color-mix(in srgb, var(--text-main) 45%, #ef4444);
    }

    .todo-starred {
      color: color-mix(in srgb, var(--text-main) 30%, #f59e0b);
    }

    .todo-shadow {
      box-shadow: var(--shadow-sm);
    }

    .todo-dividers > .task-card + .task-card {
      border-top: 1px solid var(--border-color);
    }

    .task-card:hover {
      background: color-mix(in srgb, var(--primary) 4%, var(--surface));
    }

    .todo-page input::placeholder {
      color: var(--text-muted);
    }

    .todo-page button:focus-visible,
    .todo-page input:focus-visible,
    .todo-page select:focus-visible,
    .todo-page [role="checkbox"]:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 3px;
    }

    button[title="Delete task"]:hover {
      color: #ef4444;
    }

    :host {
      display: block;
      min-height: 100%;
    }

    .glass-stat {
      background: var(--surface);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);

      &:hover {
        background: var(--bg-color);
        border-color: rgba(99, 102, 241, 0.3);
        transform: translateY(-4px);
      }
    }

    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    @keyframes pulse-subtle {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
    }
  `]
})
export class TodoComponent {
  // Lucide Icons

  editingId = signal<string | null>(null);
  showAddForm = signal(false);
  newTitle = signal('');
  newPriority = signal<Todo['priority']>('Medium');

  searchQuery = signal('');
  activeFilter = signal<'all' | 'starred'>('all');

  private readonly storageKey = 'dashstack.todo.v1';

  tasks = signal<Todo[]>(this.restoreTasks([
    { id: '1', title: 'Synthesize neural architecture for Dashboard v4', completed: false, starred: true, date: 'May 06, 2026', priority: 'High', tag: { label: 'Development', colorClass: 'tag-blue' } },
    { id: '2', title: 'Optimize low-latency stream processing nodes', completed: true, starred: false, date: 'May 07, 2026', priority: 'Medium', tag: { label: 'Performance', colorClass: 'tag-purple' } },
    { id: '3', title: 'Execute cross-regional stakeholder deployment', completed: false, starred: false, date: 'May 12, 2026', priority: 'Low', tag: { label: 'Strategy', colorClass: 'tag-orange' } },
    { id: '4', title: 'Audit AI safety protocols for revenue forecasting', completed: false, starred: true, date: 'May 06, 2026', priority: 'High', tag: { label: 'Security', colorClass: 'tag-blue' } },
    { id: '5', title: 'Review semantic search vector re-indexing', completed: false, starred: false, date: 'May 08, 2026', priority: 'Medium', tag: { label: 'Database', colorClass: 'tag-green' } },
    { id: '6', title: 'Design haptic feedback patterns for VR workspace', completed: true, starred: false, date: 'May 04, 2026', priority: 'Low', tag: { label: 'Design', colorClass: 'tag-purple' } }
  ]));

  filteredTasks = computed(() => {
    let list = this.tasks();
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.activeFilter();

    if (query) {
      list = list.filter(t =>
        [
          t.title,
          t.priority,
          t.tag?.label ?? '',
          t.date,
          t.completed ? 'Completed' : 'Pending',
          t.priority === 'High' ? 'Critical' : ''
        ].some(value => value.toLowerCase().includes(query))
      );
    }

    if (filter === 'starred') {
      list = list.filter(t => t.starred);
    }

    return list;
  });

  completedCount = computed(() => {
    return this.tasks().filter(t => t.completed).length;
  });

  productivity = computed(() => {
    const total = this.tasks().length;
    return total === 0
      ? 0
      : Math.round(this.completedCount() / total * 100);
  });

  private updateTasks(updater: (tasks: Todo[]) => Todo[]): void {
    this.tasks.update(updater);

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.tasks())
      );
    } catch {
      // Tasks remain usable when browser storage is unavailable.
    }

    const editingId = this.editingId();

    if (editingId !== null &&
        !this.tasks().some(task => task.id === editingId)) {
      this.closeAddForm();
    }
  }

  private restoreTasks(defaultTasks: Todo[]): Todo[] {
    try {
      const raw = localStorage.getItem(this.storageKey);

      if (raw === null) return defaultTasks;

      const stored: unknown = JSON.parse(raw);

      if (!Array.isArray(stored)) return defaultTasks;

      const restored: Todo[] = [];
      const seen = new Set<string>();

      for (const item of stored) {
        if (!item || typeof item !== 'object') continue;

        if (typeof item.id !== 'string' ||
            !item.id.trim() ||
            seen.has(item.id)) continue;

        if (typeof item.title !== 'string' ||
            !item.title.trim() ||
            item.title.length > 120) continue;

        if (typeof item.completed !== 'boolean' ||
            typeof item.starred !== 'boolean') continue;

        if (typeof item.date !== 'string' ||
            !item.date.trim()) continue;

        if (!['Low', 'Medium', 'High'].includes(item.priority)) {
          continue;
        }

        const task: Todo = {
          id: item.id,
          title: item.title.trim(),
          completed: item.completed,
          starred: item.starred,
          date: item.date,
          priority: item.priority
        };

        if (item.tag &&
            typeof item.tag.label === 'string' &&
            item.tag.label.trim() &&
            ['tag-blue', 'tag-purple', 'tag-orange',
             'tag-green'].includes(item.tag.colorClass)) {
          task.tag = {
            label: item.tag.label,
            colorClass: item.tag.colorClass
          };
        }

        restored.push(task);
        seen.add(item.id);
      }

      return restored;
    } catch {
      return defaultTasks;
    }
  }

  flushCompleted(): void {
    this.updateTasks(tasks =>
      tasks.filter(task => !task.completed)
    );
  }

  toggleTask(task: Todo) {
    this.updateTasks(tasks =>
      tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
    );
  }

  toggleStar(task: Todo) {
    this.updateTasks(tasks =>
      tasks.map(t => t.id === task.id ? { ...t, starred: !t.starred } : t)
    );
  }

  deleteTask(task: Todo) {
    this.updateTasks(tasks => tasks.filter(t => t.id !== task.id));
  }

  openAddForm(): void {
    this.closeAddForm();
    this.showAddForm.set(true);
  }

  openEditForm(task: Todo): void {
    this.editingId.set(task.id);
    this.newTitle.set(task.title);
    this.newPriority.set(task.priority);
    this.showAddForm.set(true);
  }

  closeAddForm(): void {
    this.editingId.set(null);
    this.showAddForm.set(false);
    this.newTitle.set('');
    this.newPriority.set('Medium');
  }

  addTask(): void {
    const title = this.newTitle().trim();
    const priority = this.newPriority();

    if (!title || title.length > 120) return;
    if (!['Low', 'Medium', 'High'].includes(priority)) return;

    const editingId = this.editingId();

    if (editingId !== null) {
      this.updateTasks(tasks =>
        tasks.map(task =>
          task.id === editingId
            ? { ...task, title, priority }
            : task
        )
      );

      this.closeAddForm();
      return;
    }

    const newTask: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      starred: false,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }),
      priority
    };

    this.updateTasks(tasks => [newTask, ...tasks]);
    this.searchQuery.set('');
    this.activeFilter.set('all');
    this.closeAddForm();
  }
}
