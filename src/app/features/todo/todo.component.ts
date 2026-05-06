import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, MoreVertical, Star, Trash2, Check, X, Search, Calendar, Filter, Sparkles, Tag, ChevronRight, Activity, Clock, Zap } from 'lucide-angular';

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
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-[#0F172A] text-slate-200 p-4 md:p-8 lg:p-12 font-sans selection:bg-indigo-500/30">
      
      <!-- Premium Glass Header -->
      <header class="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-indigo-500/20">
            <lucide-icon [name]="SparklesIcon" size="12"></lucide-icon>
            AI-Enhanced Workflow
          </div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
            Focus <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 font-medium font-sans">Command</span>
          </h1>
          <p class="text-slate-400 text-sm md:text-base max-w-md font-medium leading-relaxed">
            Your intelligence-backed workspace for high-velocity task management and priority execution.
          </p>
        </div>

        <!-- Real-time Stats Cards -->
        <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div class="glass-stat px-6 py-4 rounded-2xl min-w-[140px]">
            <div class="flex items-center gap-2 text-indigo-400 mb-1">
              <lucide-icon [name]="ActivityIcon" size="14"></lucide-icon>
              <span class="text-[10px] font-bold uppercase tracking-wider">Productivity</span>
            </div>
            <div class="text-2xl font-black text-white">94%</div>
          </div>
          <div class="glass-stat px-6 py-4 rounded-2xl min-w-[140px]">
            <div class="flex items-center gap-2 text-emerald-400 mb-1">
              <lucide-icon [name]="CheckIcon" size="14"></lucide-icon>
              <span class="text-[10px] font-bold uppercase tracking-wider">Completed</span>
            </div>
            <div class="text-2xl font-black text-white">{{ completedCount() }}</div>
          </div>
        </div>
      </header>

      <main class="max-w-6xl mx-auto space-y-6">
        
        <!-- Search & Control Bar -->
        <div class="flex flex-col lg:flex-row gap-4 items-center">
          <div class="relative w-full lg:flex-1 group">
            <lucide-icon [name]="SearchIcon" size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"></lucide-icon>
            <input 
              type="text" 
              placeholder="Query tasks by title or metadata..." 
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              class="w-full pl-12 pr-6 py-4 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-white placeholder-slate-500 transition-all font-medium"
            >
          </div>
          
          <div class="flex items-center gap-3 w-full lg:w-auto">
            <div class="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
              <button class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all" 
                [class.bg-indigo-500]="activeFilter() === 'all'" 
                [class.text-white]="activeFilter() === 'all'"
                [class.text-slate-400]="activeFilter() !== 'all'"
                (click)="activeFilter.set('all')">All</button>
              <button class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all" 
                [class.bg-indigo-500]="activeFilter() === 'starred'" 
                [class.text-white]="activeFilter() === 'starred'"
                [class.text-slate-400]="activeFilter() !== 'starred'"
                (click)="activeFilter.set('starred')">Starred</button>
            </div>
            
            <button (click)="openAddModal()" 
              class="flex-1 lg:flex-none h-14 px-8 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] text-white rounded-2xl font-bold transition-all text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
              <lucide-icon [name]="PlusIcon" size="18"></lucide-icon>
              Assemble Task
            </button>
          </div>
        </div>

        <!-- Dynamic Task List Container -->
        <div class="group/container relative">
          <!-- List Shadow Background -->
          <div class="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full opacity-50 -z-10 animate-pulse"></div>
          
          <div class="bg-white/5 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
            
            <div class="divide-y divide-white/5">
              @for (task of filteredTasks(); track task.id) {
                <div class="task-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:bg-white/[0.03] transition-all duration-500 relative cursor-pointer"
                  (click)="toggleTask(task)">
                  
                  <div class="flex items-center gap-6 flex-1">
                    <!-- Premium Checkbox Wrapper -->
                    <div class="relative flex items-center justify-center group/check" (click)="$event.stopPropagation(); toggleTask(task)">
                       <div class="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center"
                         [class.bg-emerald-500]="task.completed"
                         [class.border-emerald-500]="task.completed"
                         [class.border-slate-600]="!task.completed">
                         <lucide-icon *ngIf="task.completed" [name]="CheckIcon" size="16" class="text-white"></lucide-icon>
                       </div>
                       <!-- Click ripple effect simulation -->
                       <div class="absolute inset-0 rounded-full scale-0 group-active/check:scale-150 bg-emerald-500/20 transition-transform duration-500"></div>
                    </div>
                    
                    <div class="space-y-1">
                      <div class="flex items-center gap-3">
                        <h3 class="text-base md:text-lg font-bold transition-all"
                          [class.text-slate-500]="task.completed"
                          [class.line-through]="task.completed"
                          [class.text-white]="!task.completed"
                          [class.font-medium]="task.completed">
                          {{ task.title }}
                        </h3>
                        @if (task.priority === 'High') {
                          <span class="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-md text-[10px] font-black uppercase border border-rose-500/20 tracking-tighter animate-pulse">
                            <lucide-icon [name]="ZapIcon" size="10"></lucide-icon> Critical
                          </span>
                        }
                      </div>

                      <div class="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <div class="flex items-center gap-1.5 overflow-hidden">
                          <lucide-icon [name]="CalendarIcon" size="14" class="text-indigo-400"></lucide-icon>
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
                  <div class="flex items-center justify-between sm:justify-end gap-6" (click)="$event.stopPropagation()">
                    <div class="flex items-center gap-2">
                       <button class="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all group/star"
                         [class.text-amber-400]="task.starred"
                         [class.text-slate-600]="!task.starred"
                         (click)="toggleStar(task)">
                         <lucide-icon [name]="StarIcon" size="18" [attr.fill]="task.starred ? 'currentColor' : 'none'"></lucide-icon>
                       </button>
                       <button (click)="deleteTask(task)"
                         class="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
                        <lucide-icon [name]="Trash2Icon" size="18"></lucide-icon>
                       </button>
                    </div>
                    
                    <div class="h-10 flex items-center gap-3 px-4 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-slate-500 group-hover:border-indigo-500/30 transition-all">
                      <lucide-icon [name]="ClockIcon" size="12" class="text-indigo-400"></lucide-icon>
                      <span class="uppercase tracking-widest leading-none">Active Draft</span>
                      <lucide-icon [name]="ChevronRightIcon" size="14" class="text-slate-700"></lucide-icon>
                    </div>
                  </div>
                  
                  <!-- Subtle Bottom Border Glow -->
                  <div class="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              } @empty {
                <div class="py-24 text-center flex flex-col items-center justify-center space-y-4">
                  <div class="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 block animate-bounce">
                    <lucide-icon [name]="ActivityIcon" size="40"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-xl font-black text-white mb-2 tracking-tight">System Idle</h3>
                    <p class="text-slate-500 text-sm max-w-xs mx-auto font-medium leading-relaxed">All intelligence-processed tasks are cleared. Ready for your next directive.</p>
                  </div>
                </div>
              }
            </div>

            <!-- List Footer -->
            <footer class="p-6 bg-indigo-500/5 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
               <div class="flex items-center gap-3">
                 <div class="flex -space-x-2">
                   @for(i of [1,2,3]; track i) {
                     <div class="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                       UI
                     </div>
                   }
                 </div>
                 <span class="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">{{ completedCount() }} Task Intercepts Resolved</span>
               </div>
               
               <button class="text-indigo-400 hover:text-indigo-300 text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 group">
                 Flush Completed
                 <lucide-icon [name]="CheckIcon" size="14" class="group-hover:translate-x-1 transition-transform"></lucide-icon>
               </button>
            </footer>

          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100%;
    }
    
    .glass-stat {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.5);
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      
      &:hover {
        background: rgba(255, 255, 255, 0.06);
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
  readonly PlusIcon = Plus;
  readonly StarIcon = Star;
  readonly Trash2Icon = Trash2;
  readonly CheckIcon = Check;
  readonly SearchIcon = Search;
  readonly SparklesIcon = Sparkles;
  readonly CalendarIcon = Calendar;
  readonly FilterIcon = Filter;
  readonly ActivityIcon = Activity;
  readonly ZapIcon = Zap;
  readonly ClockIcon = Clock;
  readonly ChevronRightIcon = ChevronRight;

  searchQuery = signal('');
  activeFilter = signal<'all' | 'starred'>('all');

  tasks = signal<Todo[]>([
    { id: '1', title: 'Synthesize neural architecture for Dashboard v4', completed: false, starred: true, date: 'May 06, 2026', priority: 'High', tag: { label: 'Development', colorClass: 'tag-blue' } },
    { id: '2', title: 'Optimize low-latency stream processing nodes', completed: true, starred: false, date: 'May 07, 2026', priority: 'Medium', tag: { label: 'Performance', colorClass: 'tag-purple' } },
    { id: '3', title: 'Execute cross-regional stakeholder deployment', completed: false, starred: false, date: 'May 12, 2026', priority: 'Low', tag: { label: 'Strategy', colorClass: 'tag-orange' } },
    { id: '4', title: 'Audit AI safety protocols for revenue forecasting', completed: false, starred: true, date: 'May 06, 2026', priority: 'High', tag: { label: 'Security', colorClass: 'tag-blue' } },
    { id: '5', title: 'Review semantic search vector re-indexing', completed: false, starred: false, date: 'May 08, 2026', priority: 'Medium', tag: { label: 'Database', colorClass: 'tag-green' } },
    { id: '6', title: 'Design haptic feedback patterns for VR workspace', completed: true, starred: false, date: 'May 04, 2026', priority: 'Low', tag: { label: 'Design', colorClass: 'tag-purple' } }
  ]);

  filteredTasks = computed(() => {
    let list = this.tasks();
    const query = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();

    if (query) {
      list = list.filter(t => t.title.toLowerCase().includes(query));
    }

    if (filter === 'starred') {
      list = list.filter(t => t.starred);
    }

    return list;
  });

  completedCount = computed(() => {
    return this.tasks().filter(t => t.completed).length;
  });

  toggleTask(task: Todo) {
    this.tasks.update(tasks => 
      tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
    );
  }

  toggleStar(task: Todo) {
    this.tasks.update(tasks => 
      tasks.map(t => t.id === task.id ? { ...t, starred: !t.starred } : t)
    );
  }

  deleteTask(task: Todo) {
    this.tasks.update(tasks => tasks.filter(t => t.id !== task.id));
  }

  openAddModal() {
    const newTask: Todo = {
      id: Math.random().toString(),
      title: 'Initialize system directive: ' + Math.floor(Math.random() * 1000).toString(16).toUpperCase(),
      completed: false,
      starred: false,
      date: 'May 06, 2026',
      priority: Math.random() > 0.7 ? 'High' : (Math.random() > 0.4 ? 'Medium' : 'Low'),
      tag: { label: 'System', colorClass: 'tag-blue' }
    };
    this.tasks.update(tasks => [newTask, ...tasks]);
  }
}
