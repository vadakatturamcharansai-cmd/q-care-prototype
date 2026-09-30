"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Users, 
  BedDouble, 
  AlertTriangle,
  CheckCircle2,
  Settings,
  ChevronRight,
  Database,
  BrainCircuit,
  Workflow,
  Cpu,
  BarChart3,
  Server,
  Play
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  SCENARIOS, 
  ScenarioPreset, 
  detectBottleneck, 
  generatePlan, 
  generateForecastData,
  OptimizationPlan
} from "@/lib/simulation";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}>
      {children}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, unit = "", alert = false }: { title: string; value: number | string; icon: React.ElementType; unit?: string; alert?: boolean }) {
  return (
    <Card className={cn("p-5 flex items-center justify-between", alert && "border-warning/50 bg-warning/5")}>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className={cn("text-2xl font-semibold", alert ? "text-warning-foreground" : "text-foreground")}>
            {value}
          </h3>
          <span className="text-sm text-muted-foreground font-medium">{unit}</span>
        </div>
      </div>
      <div className={cn("p-3 rounded-lg", alert ? "bg-warning/10 text-warning-foreground" : "bg-muted text-primary")}>
        <Icon className="w-5 h-5" />
      </div>
    </Card>
  );
}

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "architecture">("dashboard");
  const [scenario, setScenario] = useState<ScenarioPreset>("NORMAL");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [plan, setPlan] = useState<OptimizationPlan | null>(null);
  const [demoState, setDemoState] = useState<"idle" | "running" | "completed">("idle");
  const [optStep, setOptStep] = useState(0);

  const currentState = SCENARIOS[scenario];
  const forecastData = generateForecastData(currentState);
  const bottleneck = detectBottleneck(currentState);

  const handleSetScenario = (s: ScenarioPreset) => {
    setScenario(s);
    setPlan(null);
    setDemoState("idle");
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setDemoState("running");
    setOptStep(0);
    setPlan(null);
    
    const steps = 5;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      setOptStep(currentStep);
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          setIsOptimizing(false);
          setPlan(generatePlan(currentState, scenario));
          setDemoState("completed");
        }, 500);
      }
    }, 600);
  };

  const handleRunDemo = () => {
    handleSetScenario("ICU_SURGE");
    setTimeout(() => {
      handleOptimize();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#161616] font-sans selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight text-primary">Q-CARE</h1>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Predictive Replanning</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={cn("text-sm font-medium transition-colors", activeTab === "dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("architecture")}
              className={cn("text-sm font-medium transition-colors", activeTab === "architecture" ? "text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              Architecture
            </button>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success-foreground text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              SYSTEM ACTIVE
            </div>
            <button onClick={handleRunDemo} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95">
              <Play className="w-4 h-4 fill-current" />
              RUN DEMO
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Scenario Controls (Side Panel / Top Bar) */}
        {activeTab === "dashboard" && (
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold">Scenario Simulator</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SCENARIOS) as ScenarioPreset[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSetScenario(s)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    scenario === s 
                      ? "bg-primary text-white shadow-sm" 
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  )}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            
            {/* Header Area */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Predictive Hospital Resource Replanning</h2>
              <p className="text-muted-foreground">Predict pressure. Replan resources. Act before the bottleneck.</p>
              <div className="inline-block mt-3 px-2.5 py-1 bg-gray-100 text-gray-500 rounded text-[11px] font-semibold tracking-wider uppercase border border-gray-200">
                Synthetic Operational Demo
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard title="BED OCCUPANCY" value={currentState.bedOccupancy} unit="%" icon={BedDouble} alert={currentState.bedOccupancy > 85} />
              <StatCard title="ICU OCCUPANCY" value={currentState.icuOccupancy} unit="%" icon={Activity} alert={currentState.icuOccupancy > 80} />
              <StatCard title="STAFF AVAILABLE" value={currentState.staffAvailable} icon={Users} alert={currentState.staffAvailable < 25} />
              <StatCard title="OR UTILIZATION" value={currentState.orUtilization} unit="%" icon={Activity} alert={currentState.orUtilization > 90} />
              <StatCard title="EMERGENCY RSRV" value={currentState.emergencyReserve} unit="%" icon={AlertTriangle} alert={currentState.emergencyReserve < 30} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Forecast Chart */}
              <Card className="lg:col-span-2 p-5 flex flex-col h-[400px]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">Resource Pressure — Next 6 Hours</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <BarChart3 className="w-4 h-4" /> Demo confidence indicator: <span className="font-medium text-foreground">87%</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary"></div> ICU</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-400"></div> Beds</div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                      />
                      <ReferenceLine y={90} stroke="#EF4444" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Safe Threshold (90%)', fill: '#EF4444', fontSize: 11, fontWeight: 600 }} />
                      <Line type="monotone" dataKey="icuOccupancy" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="ICU %" />
                      <Line type="monotone" dataKey="bedOccupancy" stroke="#60A5FA" strokeWidth={2} dot={false} name="Beds %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Bottleneck & Optimization Trigger */}
              <div className="flex flex-col gap-6">
                
                <AnimatePresence mode="wait">
                  {bottleneck ? (
                    <motion.div
                      key="bottleneck"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="p-5 border-destructive/30 bg-destructive/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
                        <div className="flex items-start gap-3 mb-4">
                          <div className="p-2 rounded-full bg-destructive/10 text-destructive-foreground mt-0.5">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-destructive-foreground text-sm tracking-wide uppercase">Upcoming Bottleneck Detected</h3>
                            <p className="font-semibold text-lg mt-0.5">{bottleneck.resource}</p>
                          </div>
                        </div>
                        
                        <div className="bg-white/60 rounded-lg p-3 mb-4 text-sm text-foreground/80 border border-destructive/10">
                          {bottleneck.reason}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-6">
                          <div className="bg-white rounded p-2 border border-gray-100">
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Current</p>
                            <p className="font-bold">{bottleneck.current}%</p>
                          </div>
                          <div className="bg-white rounded p-2 border border-gray-100">
                            <p className="text-[10px] text-destructive-foreground font-semibold uppercase">Forecast Peak</p>
                            <p className="font-bold text-destructive-foreground">{bottleneck.peak}%</p>
                          </div>
                        </div>

                        {!plan && (
                          <button 
                            onClick={handleOptimize}
                            disabled={isOptimizing}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-80 disabled:active:scale-100"
                          >
                            {isOptimizing ? (
                              <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4 animate-spin" />
                                <span>Generating...</span>
                              </div>
                            ) : (
                              <>
                                <BrainCircuit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                GENERATE FEASIBLE PLAN
                              </>
                            )}
                          </button>
                        )}
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div key="safe" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Card className="p-5 border-success/30 bg-success/5 h-full flex flex-col items-center justify-center text-center py-10">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 text-success-foreground">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-success-foreground mb-2">System Stable</h3>
                        <p className="text-sm text-foreground/70">No critical bottlenecks projected in the 6-hour forecast window.</p>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Event Log */}
                <Card className="p-4 flex-1 flex flex-col">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-1.5"><Activity className="w-4 h-4 text-muted-foreground"/> Timeline</h4>
                  <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-1.5 before:w-px before:bg-gray-100 ml-1">
                    <div className="relative pl-5 text-xs">
                      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-gray-200 border-2 border-white" />
                      <span className="text-muted-foreground mr-2 font-mono">10:00</span>
                      Hospital state updated
                    </div>
                    <div className="relative pl-5 text-xs">
                      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-gray-200 border-2 border-white" />
                      <span className="text-muted-foreground mr-2 font-mono">10:01</span>
                      6-hour forecast generated
                    </div>
                    {bottleneck && (
                      <div className="relative pl-5 text-xs font-medium text-destructive-foreground">
                        <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-destructive border-2 border-white" />
                        <span className="text-destructive-foreground/70 mr-2 font-mono">10:01</span>
                        {bottleneck.resource} pressure detected
                      </div>
                    )}
                    {demoState === "completed" && (
                      <div className="relative pl-5 text-xs font-medium text-success-foreground">
                        <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-success border-2 border-white" />
                        <span className="text-success-foreground/70 mr-2 font-mono">10:02</span>
                        Feasible plan recommended
                      </div>
                    )}
                  </div>
                </Card>
                
              </div>
            </div>

            {/* Optimization Progress / Plan Section */}
            <AnimatePresence mode="wait">
              {isOptimizing && (
                <motion.div
                  key="optimizing"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="p-8 flex flex-col items-center justify-center border-primary/20 bg-primary/5">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-primary">
                      <BrainCircuit className="w-5 h-5" />
                      Q-CARE Optimization Engine
                    </h3>
                    
                    <div className="w-full max-w-3xl flex justify-between items-center relative">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: `${(optStep / 4) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      
                      {[
                        { icon: Database, label: "Current State" },
                        { icon: Settings, label: "Constraints" },
                        { icon: Cpu, label: "Classical Baseline" },
                        { icon: Workflow, label: "Hybrid Layer" },
                        { icon: CheckCircle2, label: "Validation" }
                      ].map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 border-2",
                            optStep >= i ? "bg-primary border-primary text-white" : "bg-white border-gray-200 text-gray-400"
                          )}>
                            <step.icon className="w-5 h-5" />
                          </div>
                          <span className={cn(
                            "text-xs font-semibold whitespace-nowrap absolute -bottom-6",
                            optStep >= i ? "text-primary" : "text-gray-400"
                          )}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                    
                    <p className="mt-12 text-sm text-muted-foreground font-medium animate-pulse">
                      {optStep === 0 && "Reading current state..."}
                      {optStep === 1 && "Applying hospital constraints..."}
                      {optStep === 2 && "Evaluating candidate plans..."}
                      {optStep === 3 && "Checking feasibility via simulated hybrid search..."}
                      {optStep === 4 && "Generating recommendation..."}
                    </p>
                    <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest">Hybrid optimization layer simulated for prototype demonstration</p>
                  </Card>
                </motion.div>
              )}

              {plan && !isOptimizing && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Actions List */}
                    <Card className="p-0 overflow-hidden border-success/30">
                      <div className="bg-success/5 p-5 border-b border-success/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                          <h3 className="font-bold text-lg text-success-foreground">NEXT FEASIBLE PLAN</h3>
                        </div>
                        <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-success/20 text-success-foreground rounded">
                          Constraint Check Passed
                        </div>
                      </div>
                      
                      <div className="p-5 divide-y divide-gray-100">
                        {plan.actions.map((action, i) => (
                          <div key={action.id} className="py-4 first:pt-0 last:pb-0 group">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <div className="space-y-2 w-full">
                                <h4 className="font-semibold text-[15px]">{action.action}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                  <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">WHY?</p>
                                    <p className="text-xs leading-relaxed text-gray-600">{action.why}</p>
                                  </div>
                                  <div className="bg-success/5 p-2.5 rounded border border-success/10">
                                    <p className="text-[10px] font-bold text-success-foreground uppercase mb-1 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> CONSTRAINT CHECK
                                    </p>
                                    <p className="text-xs leading-relaxed text-success-foreground/80">{action.constraintCheck}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Impact Summary */}
                    <div className="space-y-6">
                      <Card className="p-5">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Plan Impact Summary</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <span className="text-sm font-medium">Projected ICU Peak</span>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-destructive-foreground font-bold">{plan.impact.icuPeak[0]}%</span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <span className="text-success-foreground font-bold">{plan.impact.icuPeak[1]}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <span className="text-sm font-medium">Staff Conflict</span>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-destructive-foreground font-bold">{plan.impact.staffConflict[0]}</span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <span className="text-success-foreground font-bold">{plan.impact.staffConflict[1]}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <span className="text-sm font-medium">Emergency Reserve</span>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-destructive-foreground font-bold">{plan.impact.emergencyReserve[0]}%</span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <span className="text-success-foreground font-bold">{plan.impact.emergencyReserve[1]}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Delayed Procedures</span>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-bold text-gray-500">{plan.impact.delayedProcedures[0]}</span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <span className="font-bold text-gray-800">{plan.impact.delayedProcedures[1]}</span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-6 text-[10px] text-center text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-4">Simulated prototype scenario</p>
                      </Card>

                      <Card className="bg-primary text-white p-5">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-white/10 rounded-xl">
                            <Workflow className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Resource Network Optimized</h4>
                            <p className="text-sm text-white/70 leading-relaxed">
                              Resources are optimized together — not as isolated departments. This plan respects shared constraints across beds, staff, and operating rooms.
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        ) : (
          /* Architecture Page */
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">System Architecture</h2>
              <p className="text-muted-foreground">From data ingestion to quantum-hybrid optimization.</p>
            </div>

            <Card className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto gap-4">
                
                <div className="flex flex-col items-center gap-2 p-4 w-full md:w-32 bg-gray-50 rounded-xl border border-gray-100">
                  <Database className="w-8 h-8 text-primary" />
                  <span className="text-xs font-semibold text-center">Hospital Data</span>
                </div>
                
                <ChevronRight className="w-6 h-6 text-gray-300 hidden md:block" />
                <div className="h-6 w-px bg-gray-300 md:hidden" />
                
                <div className="flex flex-col items-center gap-2 p-4 w-full md:w-32 bg-gray-50 rounded-xl border border-gray-100">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <span className="text-xs font-semibold text-center">Demand Forecast</span>
                </div>
                
                <ChevronRight className="w-6 h-6 text-gray-300 hidden md:block" />
                <div className="h-6 w-px bg-gray-300 md:hidden" />
                
                <div className="flex flex-col items-center gap-2 p-4 w-full md:w-40 bg-primary/5 rounded-xl border border-primary/20">
                  <BrainCircuit className="w-8 h-8 text-primary" />
                  <span className="text-xs font-semibold text-center text-primary">Optimization Engine</span>
                </div>
                
                <ChevronRight className="w-6 h-6 text-gray-300 hidden md:block" />
                <div className="h-6 w-px bg-gray-300 md:hidden" />
                
                <div className="flex flex-col items-center gap-2 p-4 w-full md:w-32 bg-success/5 rounded-xl border border-success/20">
                  <Activity className="w-8 h-8 text-success-foreground" />
                  <span className="text-xs font-semibold text-center text-success-foreground">Decision Support</span>
                </div>

              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-muted-foreground" />
                  Prototype Stack (Current)
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Next.js & React</li>
                  <li className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> TypeScript</li>
                  <li className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Tailwind CSS & Framer Motion</li>
                  <li className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Deterministic Simulation Logic</li>
                  <li className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Vercel Serverless Deployment</li>
                </ul>
                <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded text-xs text-gray-500 italic">
                  Note: This prototype uses synthetic operational data and deterministic simulation logic for immediate hackathon demonstration.
                </div>
              </Card>

              <Card className="p-6 border-primary/20 bg-primary/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                  <Cpu className="w-5 h-5" />
                  Production Extension (Planned)
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Python FastAPI Backend</li>
                  <li className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> XGBoost / LightGBM Forecasting</li>
                  <li className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> OR-Tools (Classical MILP)</li>
                  <li className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> D-Wave Ocean SDK (QUBO)</li>
                  <li className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> EMR / HL7 Live Integration</li>
                </ul>
              </Card>
            </div>
            
            <Card className="p-6 border-warning/30 bg-warning/5">
              <h3 className="font-bold text-warning-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                OUT OF SCOPE
              </h3>
              <p className="text-sm text-foreground/80 mb-3">Q-CARE is strictly an operational decision-support system. The following are explicitly out of scope:</p>
              <div className="flex gap-4">
                <span className="text-sm font-medium line-through text-muted-foreground">Clinical diagnosis</span>
                <span className="text-sm font-medium line-through text-muted-foreground">Treatment recommendations</span>
                <span className="text-sm font-medium line-through text-muted-foreground">Autonomous clinical decisions</span>
              </div>
            </Card>

          </div>
        )}
      </main>
    </div>
  );
}
