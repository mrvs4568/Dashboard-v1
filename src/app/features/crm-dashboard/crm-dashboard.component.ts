import { Component, ChangeDetectionStrategy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { ThemeService } from '../../core/services/theme.service';

type Period = 'day' | 'week' | 'month' | 'year';
type ActivityFilter = 'all' | 'sales' | 'communication' | 'tasks';

@Component({
  selector: 'app-crm-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, NgxEchartsModule],
  templateUrl: './crm-dashboard.component.html',
  styleUrls: ['./crm-dashboard.component.css']
})
export class CrmDashboardComponent {
  private themeService = inject(ThemeService);
  
  readonly activityFilter = signal<ActivityFilter>('all');

  readonly activityFilters = [
    { label: 'All activity', value: 'all' as ActivityFilter },
    { label: 'Sales activity', value: 'sales' as ActivityFilter },
    { label: 'Communication', value: 'communication' as ActivityFilter },
    { label: 'Completed tasks', value: 'tasks' as ActivityFilter }
  ];

  readonly activityFilterLabel = computed(() =>
    this.activityFilters.find(
      item => item.value === this.activityFilter()
    )?.label ?? 'All activity'
  );

  setActivityFilter(value: ActivityFilter): void {
    if (!this.activityFilters.some(item => item.value === value)) return;
    this.activityFilter.set(value);
  }

  readonly period = signal<Period>('month');
  readonly darkMode = this.themeService.isDarkMode;
  readonly periods = [
    { label: 'Today', value: 'day' as Period },
    { label: 'This Week', value: 'week' as Period },
    { label: 'This Month', value: 'month' as Period },
    { label: 'This Year', value: 'year' as Period }
  ];
  readonly periodLabel = computed(() => this.periods.find(p => p.value === this.period())?.label ?? 'This Month');

  readonly labels = computed(() => {
    if (this.period() === 'day') return ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
    if (this.period() === 'week') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (this.period() === 'year') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from({ length: 9 }, (_, i) => `P${i + 1}`);
  });

  private readonly data = {
    day: { engagement: [42, 58, 55, 72, 66, 84, 91], tickets: [120, 180, 140, 240, 210, 300, 285], resolved: [92, 150, 128, 210, 188, 260, 250], retention: [61, 65, 64, 70, 72, 76, 79], relationship: [70, 73, 75, 80, 78, 84, 88] },
    week: { engagement: [48, 64, 58, 74, 69, 82, 89], tickets: [760, 980, 840, 1180, 1020, 1360, 1245], resolved: [640, 820, 760, 1030, 920, 1190, 1089], retention: [64, 68, 72, 70, 75, 77, 81], relationship: [68, 74, 78, 73, 80, 84, 89] },
    month: { engagement: [50, 66, 72, 85, 74, 78, 92, 99, 98], tickets: [820, 1050, 1120, 1280, 1090, 980, 1245, 1420, 1350], resolved: [520, 700, 780, 840, 640, 590, 820, 930, 875], retention: [66, 72, 68, 82, 88, 70, 79, 84, 93], relationship: [58, 76, 82, 73, 80, 70, 76, 90, 94] },
    year: { engagement: [58, 62, 65, 69, 71, 74, 78, 80, 84, 88, 92, 97], tickets: [820, 900, 780, 980, 1040, 930, 1120, 1250, 1180, 1320, 1420, 1540], resolved: [700, 760, 720, 820, 900, 850, 980, 1080, 1040, 1180, 1280, 1370], retention: [62, 65, 67, 69, 70, 72, 73, 75, 77, 79, 81, 84], relationship: [70, 72, 76, 78, 80, 81, 83, 86, 88, 90, 92, 94] }
  };

  private multiplier() { return this.period() === 'day' ? .08 : this.period() === 'week' ? .35 : this.period() === 'year' ? 12 : 1; }
  setPeriod(value: Period): void {
    if (!this.periods.some(p => p.value === value)) return;
    this.period.set(value);
  }

  readonly periodSummary = computed(() => {
    const d = this.data[this.period()];
    const sum = (values: number[]) =>
      values.reduce((total, value) => total + value, 0);

    return {
      tickets: sum(d.tickets),
      resolved: sum(d.resolved),
      engagement: d.engagement[d.engagement.length - 1],
      relationship: d.relationship[d.relationship.length - 1],
      retention: d.retention[d.retention.length - 1],
      pipelineConversion: (
        Math.round(1245 * this.multiplier()) /
        Math.round(8932 * this.multiplier()) * 100
      ).toFixed(1),
      salesConversion: (
        Math.round(8932 * this.multiplier()) /
        Math.round(125430 * this.multiplier()) * 100
      ).toFixed(2)
    };
  });
  toggleTheme() { this.themeService.toggleTheme(); }

  readonly kpis = computed(() => {
    const m = this.multiplier();
    return [
      { title: 'Total Customers', value: Math.round(24568 * m).toLocaleString(), delta: '+18.2%', up: true, icon: 'person', color: 'violet', spark: [8,14,18,15,26,22,34].map(v=>v*m) },
      { title: 'New Leads', value: Math.round(8932 * m).toLocaleString(), delta: '+24.5%', up: true, icon: 'rocket_launch', color: 'emerald', spark: [12,18,16,26,22,30,44].map(v=>v*m) },
      { title: 'Opportunities', value: Math.round(5642 * m).toLocaleString(), delta: '+16.8%', up: true, icon: 'groups', color: 'green', spark: [10,14,17,21,18,28,32].map(v=>v*m) },
      { title: 'Won Deals', value: Math.round(1245 * m).toLocaleString(), delta: '+22.6%', up: true, icon: 'verified', color: 'blue', spark: [4,8,7,13,12,18,25].map(v=>v*m) },
      { title: 'Total Revenue', value: '$' + (2.45 * m).toFixed(2) + 'M', delta: '+23.8%', up: true, icon: 'attach_money', color: 'purple', spark: [18,26,22,34,38,46,58].map(v=>v*m) },
      { title: 'Avg. Deal Size', value: '$' + Math.round(2450000 * m / Math.round(1245 * m)).toLocaleString(), delta: '+14.3%', up: true, icon: 'business_center', color: 'blue', spark: [9,12,18,16,24,27,33].map(v=>v*(m>1?1.08:1)) }
    ];
  });

  readonly pipelineStages = computed(() => { const m = this.multiplier(); return [
    { name: 'New Leads', value: Math.round(8932*m), color: 'linear-gradient(90deg,#7c3aed,#5b21b6)' },
    { name: 'Contacted', value: Math.round(6542*m), color: 'linear-gradient(90deg,#4f46e5,#2563eb)' },
    { name: 'Qualified', value: Math.round(4823*m), color: 'linear-gradient(90deg,#2563eb,#0ea5e9)' },
    { name: 'Proposal', value: Math.round(2350*m), color: 'linear-gradient(90deg,#0ea5e9,#0891b2)' },
    { name: 'Negotiation', value: Math.round(1362*m), color: 'linear-gradient(90deg,#06b6d4,#0f766e)' },
    { name: 'Won', value: Math.round(1245*m), color: 'linear-gradient(90deg,#059669,#22c55e)' }
  ]; });

  readonly salesFunnel = computed(() => { const m = this.multiplier(); return [
    { name: 'Awareness', count: Math.round(125430*m), color: 'linear-gradient(90deg,#7c3aed,#5b21b6)' },
    { name: 'Interest', count: Math.round(87652*m), color: 'linear-gradient(90deg,#4f46e5,#2563eb)' },
    { name: 'Consideration', count: Math.round(45680*m), color: 'linear-gradient(90deg,#2563eb,#0284c7)' },
    { name: 'Intent', count: Math.round(22450*m), color: 'linear-gradient(90deg,#0284c7,#0f766e)' },
    { name: 'Purchase', count: Math.round(8932*m), color: 'linear-gradient(90deg,#047857,#22c55e)' }
  ]; });

  customerSegments = computed(() => [
    { name: 'New Customers', percent: '35.6%', value: '8,736', color: '#3b82f6' }, { name: 'Returning Customers', percent: '28.4%', value: '6,972', color: '#a855f7' }, { name: 'Loyal Customers', percent: '20.8%', value: '5,108', color: '#f59e0b' }, { name: 'At Risk Customers', percent: '10.2%', value: '2,505', color: '#fb923c' }, { name: 'Churned Customers', percent: '5.0%', value: '1,247', color: '#f43f5e' }
  ]);
  segmentationData = computed(() => [
    { name: 'Enterprise', percent: '22.5%', value: '5,523', color: '#2563eb' }, { name: 'Mid Market', percent: '28.3%', value: '6,946', color: '#a855f7' }, { name: 'Small Business', percent: '30.7%', value: '7,533', color: '#0ea5e9' }, { name: 'Startup', percent: '12.8%', value: '3,146', color: '#f59e0b' }, { name: 'Individual', percent: '5.8%', value: '1,420', color: '#f97316' }
  ]);
  leadsData = computed(() => [
    { name: 'Website', percent: '35.4%', value: '3,158', color: '#2563eb' }, { name: 'Referral', percent: '22.8%', value: '2,036', color: '#9333ea' }, { name: 'Social Media', percent: '18.6%', value: '1,659', color: '#0ea5e9' }, { name: 'Email Campaign', percent: '12.4%', value: '1,107', color: '#14b8a6' }, { name: 'Events', percent: '6.8%', value: '605', color: '#f59e0b' }, { name: 'Others', percent: '3.9%', value: '347', color: '#64748b' }
  ]);
  recentActivity = computed(() => [
    { title:'New Lead Added', subtitle:'Acme Corporation', time:'2 min ago', icon:'person_add', bg:'#8b5cf6' }, { title:'Deal Won', subtitle:'$25,400', time:'15 min ago', icon:'attach_money', bg:'#2563eb' }, { title:'Meeting Scheduled', subtitle:'TechSolutions Inc.', time:'1 hour ago', icon:'event', bg:'#10b981' }, { title:'Email Opened', subtitle:'Product Demo', time:'2 hours ago', icon:'mail', bg:'#7c3aed' }, { title:'Call Completed', subtitle:'Robert Johnson', time:'3 hours ago', icon:'call', bg:'#047857' }, { title:'Task Completed', subtitle:'Follow up with lead', time:'4 hours ago', icon:'check_circle', bg:'#16a34a' }
  ]);
  readonly filteredActivity = computed(() => {
    const filter = this.activityFilter();

    return this.recentActivity().filter(item => {
      switch (filter) {
        case 'sales':
          return ['person_add', 'attach_money'].includes(item.icon);
        case 'communication':
          return ['event', 'mail', 'call'].includes(item.icon);
        case 'tasks':
          return item.icon === 'check_circle';
        default:
          return true;
      }
    });
  });

  topReps = computed(() => [
    { name:'Sarah Johnson', revenue:'$245,800', growth:'+28.6%', avatar:'https://i.pravatar.cc/150?img=12' }, { name:'Michael Chen', revenue:'$198,450', growth:'+22.4%', avatar:'https://i.pravatar.cc/150?img=13' }, { name:'Emily Davis', revenue:'$176,320', growth:'+19.8%', avatar:'https://i.pravatar.cc/150?img=32' }, { name:'James Wilson', revenue:'$142,890', growth:'+16.3%', avatar:'https://i.pravatar.cc/150?img=33' }, { name:'Lisa Anderson', revenue:'$126,540', growth:'+14.2%', avatar:'https://i.pravatar.cc/150?img=47' }
  ]);

  buildCsv(): string {
    const period = this.periodLabel();
    const summary = this.periodSummary();

    const rows: string[][] = [
      ['Data Type', 'Period', 'Metric', 'Value'],
      ...this.kpis().map(kpi =>
        ['Demo', period, kpi.title, kpi.value]
      ),
      ['Demo', period, 'Total Tickets', String(summary.tickets)],
      ['Demo', period, 'Resolved Tickets', String(summary.resolved)],
      ['Demo', period, 'Engagement Score', `${summary.engagement}%`],
      ['Demo', period, 'Relationship Score', `${summary.relationship}%`],
      ['Demo', period, 'Retention Rate', `${summary.retention}%`],
      ['Demo', period, 'Pipeline Conversion', `${summary.pipelineConversion}%`],
      ['Demo', period, 'Sales Conversion', `${summary.salesConversion}%`]
    ];

    return rows.map(row =>
      row.map(value => `"${value.replace(/"/g, '""')}"`).join(',')
    ).join('\r\n');
  }

  exportReport(): void {
    const blob = new Blob(
      ['\uFEFF', this.buildCsv()],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `dashstack-crm-demo-${this.period()}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  sparkline(color: string, values: number[]): EChartsOption { return { animation:true, grid:{left:0,right:0,top:2,bottom:2}, xAxis:{type:'category',show:false}, yAxis:{type:'value',show:false,scale:true}, series:[{ type:'line', data:values, smooth:.45, symbol:'none', lineStyle:{color,width:2.5}, areaStyle:{ color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:`${color}66`},{offset:1,color:`${color}00`}]) } }], tooltip:{show:false} }; }
  private lineArea(values: number[], color: string): EChartsOption { 
    return { animation:true, tooltip:{trigger:'axis',backgroundColor: this.darkMode() ? 'rgba(15,23,42,.94)' : 'rgba(255,255,255,.94)',borderColor: this.darkMode() ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)',textStyle:{color: this.darkMode() ? '#fff' : '#0f172a'}}, grid:{top:16,right:10,bottom:26,left:4,containLabel:true}, xAxis:{type:'category',boundaryGap:false,data:this.labels(),axisLine:{show:false},axisTick:{show:false},axisLabel:{color:'#94a3b8',fontSize:10}}, yAxis:{type:'value',axisLabel:{color:'#64748b',fontSize:10,formatter:'{value}%'},splitLine:{lineStyle:{color: this.darkMode() ? 'rgba(148,163,184,.08)' : 'rgba(15,23,42,.08)'}}}, series:[{type:'line',data:values,smooth:true,symbolSize:6,itemStyle:{color},lineStyle:{color,width:3},areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:`${color}55`},{offset:1,color:`${color}00`}])}}]}; 
  }
  clientEngagementOptions = computed(() => this.lineArea(this.data[this.period()].engagement, '#a855f7'));
  relationshipOptions = computed(() => this.lineArea(this.data[this.period()].relationship, '#ec4899'));
  retentionOptions = computed(() => this.lineArea(this.data[this.period()].retention, '#a855f7'));
  supportMetricsOptions = computed<EChartsOption>(() => { 
    const d = this.data[this.period()]; 
    return { animation:true, tooltip:{trigger:'axis',backgroundColor: this.darkMode() ? 'rgba(15,23,42,.94)' : 'rgba(255,255,255,.94)',borderColor: this.darkMode() ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)',textStyle:{color: this.darkMode() ? '#fff' : '#0f172a'}}, legend:{top:0,right:0,icon:'circle',itemWidth:8,textStyle:{color:'#94a3b8',fontSize:11},data:['Tickets','Resolved','Unresolved']}, grid:{top:34,bottom:20,left:10,right:10,containLabel:true}, xAxis:{type:'category',boundaryGap:false,data:this.labels(),axisLine:{show:false},axisTick:{show:false},axisLabel:{color:'#94a3b8',fontSize:10}}, yAxis:{type:'value',splitLine:{lineStyle:{color: this.darkMode() ? 'rgba(148,163,184,.08)' : 'rgba(15,23,42,.08)'}},axisLabel:{color:'#64748b',fontSize:10}}, series:[ {name:'Tickets',type:'line',smooth:true,data:d.tickets,itemStyle:{color:'#3b82f6'},lineStyle:{width:2.5}}, {name:'Resolved',type:'line',smooth:true,data:d.resolved,itemStyle:{color:'#10b981'},lineStyle:{width:2.5}}, {name:'Unresolved',type:'line',smooth:true,data:d.tickets.map((v,i)=>Math.max(0,v-d.resolved[i])),itemStyle:{color:'#a855f7'},lineStyle:{width:2.5}} ]};
  });
  private donut(data: any[], colors: string[]): EChartsOption { 
    return { animation:true, tooltip:{trigger:'item',backgroundColor: this.darkMode() ? 'rgba(15,23,42,.94)' : 'rgba(255,255,255,.94)',borderColor: this.darkMode() ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)',textStyle:{color: this.darkMode() ? '#fff' : '#0f172a'}}, color:colors, series:[{type:'pie',radius:['56%','82%'],center:['50%','50%'],avoidLabelOverlap:true,label:{show:false},itemStyle:{borderRadius:8,borderColor: this.darkMode() ? '#071225' : '#ffffff',borderWidth:2},data}]}; 
  }
  customerInsightsOptions = computed(() => this.donut([{value:8736,name:'New Customers'},{value:6972,name:'Returning Customers'},{value:5108,name:'Loyal Customers'},{value:2505,name:'At Risk Customers'},{value:1247,name:'Churned Customers'}], ['#3b82f6','#a855f7','#f59e0b','#fb923c','#f43f5e']));
  segmentationOptions = computed(() => this.donut([{value:5523,name:'Enterprise'},{value:6946,name:'Mid Market'},{value:7533,name:'Small Business'},{value:3146,name:'Startup'},{value:1420,name:'Individual'}], ['#2563eb','#a855f7','#0ea5e9','#f59e0b','#f97316']));
  leadsOptions = computed(() => this.donut([{value:3158,name:'Website'},{value:2036,name:'Referral'},{value:1659,name:'Social Media'},{value:1107,name:'Email Campaign'},{value:605,name:'Events'},{value:347,name:'Others'}], ['#2563eb','#9333ea','#0ea5e9','#14b8a6','#f59e0b','#64748b']));
}
