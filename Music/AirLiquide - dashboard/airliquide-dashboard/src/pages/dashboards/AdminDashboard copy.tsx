import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, FlaskConical, Cog, Droplet, Warehouse,
    Truck, BarChart3, Users, Settings, Search, Bell, ChevronDown,
    Calendar, Download, ArrowRight, Box, CheckCircle2, HardHat,
    Wind, Droplets, Cloud, Zap, HeartPulse, ShieldCheck, Shield, Fan, X,
    AlertTriangle, Beaker, Factory, ClipboardList, Plus, TrendingUp, Filter, Eye
} from "lucide-react";
import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type GasId = "O2" | "N2" | "CO2" | "N2O" | "MEOPA" | "AIR";
type CodeType = "RM" | "FP" | "CITERNE";
type BatchStatus = "quarantine" | "pending" | "testing" | "approved" | "rejected" | "delivered";

interface LotParams {
    rawMaterials: string;
    day: string;
    equipe: string;
}

interface Batch {
    _id: string;
    lotId: string;
    codeType: CodeType;
    gasId: GasId;
    route?: "conditionnement" | "citerne";
    citerneType?: "3C" | "4C" | "7C";
    productName: string;
    supplier?: string;
    client?: string;
    quantity: string;
    party: string;
    status: BatchStatus;
    lotParams?: LotParams;
    history: { timestamp: string; action: string; party: string }[];
    createdAt: string;
}

/* ═══════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════ */

const GASES = [
    { id: "all", name: "All", fullName: "All Gases", icon: LayoutDashboard, steps: [], rmName: "", fpName: "", code: "", shelfLifeRM: "", shelfLifeFP: "" },
    { id: "O2", name: "O₂", fullName: "Oxygen Médicinal", icon: Wind, steps: ["Logistics", "RM Quarantine", "Laboratory RM", "Production", "FP Quarantine", "Laboratory FP", "Distribution"], rmName: "O2 médicinal liquide", fpName: "O2 médicinal conditionné", code: "O2", shelfLifeRM: "Date de fabrication + 3 mois", shelfLifeFP: "Date de fabrication + 5 ans", hasCiterne: true },
    { id: "N2", name: "N₂", fullName: "Azote Pharmaceutique", icon: Cloud, steps: ["Logistics", "RM Quarantine", "Laboratory RM", "Production", "FP Quarantine", "Laboratory FP", "Distribution"], rmName: "Azote pharmaceutique liquide", fpName: "Azote pharmaceutique conditionné", code: "N2", shelfLifeRM: "Date de fabrication + 3 mois", shelfLifeFP: "Date de fabrication + 5 ans" },
    { id: "CO2", name: "CO₂", fullName: "Dioxyde de Carbone", icon: Droplets, steps: ["Logistics", "RM Quarantine", "Laboratory RM", "Production", "FP Quarantine", "Laboratory FP", "Distribution"], rmName: "Dioxyde de carbone pharmaceutique liquide", fpName: "Dioxyde de carbone pharmaceutique conditionné", code: "CO2", shelfLifeRM: "Date de fabrication + 3 mois", shelfLifeFP: "Date de fabrication + 5 ans" },
    { id: "N2O", name: "N₂O", fullName: "Protoxyde d'Azote", icon: Zap, steps: ["Logistics", "RM Quarantine", "Laboratory RM", "Production", "FP Quarantine", "Laboratory FP", "Distribution"], rmName: "Protoxyde d'azote liquide", fpName: "Protoxyde d'azote conditionné", code: "N2O", shelfLifeRM: "Date de fabrication + 3 mois", shelfLifeFP: "Date de fabrication + 3 ans" },
    { id: "MEOPA", name: "MEOPA", fullName: "MEOPA Mix", icon: HeartPulse, steps: ["Logistics", "RM Quarantine", "Laboratory RM", "Production", "FP Quarantine", "Laboratory FP", "Distribution"], rmName: "Mélange N₂O/O₂", fpName: "MEOPA conditionné", code: "MEOPA", shelfLifeRM: "Date de fabrication + 3 mois", shelfLifeFP: "Date de fabrication + 2 ans" },
    { id: "AIR", name: "Air", fullName: "Air Respirable", icon: Fan, steps: ["Logistics", "RM Quarantine", "Laboratory RM", "Production", "FP Quarantine", "Laboratory FP", "Distribution"], rmName: "Air comprimé", fpName: "Air respirable conditionné", code: "AR", shelfLifeRM: "Date de fabrication + 3 mois", shelfLifeFP: "Date de fabrication + 5 ans" },
];

const STEP_ICON: Record<string, React.ElementType> = {
    Logistics: Truck,
    "RM Quarantine": Warehouse,
    "Laboratory RM": FlaskConical,
    Production: Factory,
    "FP Quarantine": Warehouse,
    "Laboratory FP": Beaker,
    Distribution: Package,
};

const globalNav = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Calendar, label: "System Calendar" },
    { icon: BarChart3, label: "Reports" },
    { icon: Users, label: "Users" },
    { icon: Settings, label: "Settings" },
];

/* ═══════════════════════════════════════════════════════════════════
   CODE GENERATORS
   ═══════════════════════════════════════════════════════════════════ */

function generateRMCode(gasCode: string, date: Date, seq: number): string {
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${gasCode}-${yy}-${mm}-${dd}-${String(seq).padStart(2, "0")}`;
}

function generateFPCode(rmCode: string, lotNum: number): string {
    return `${rmCode}-${String(lotNum).padStart(2, "0")}`;
}

function generateCiterneCode(gasCode: string, date: Date, citerne: string): string {
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${gasCode}-${yy}-${mm}-${dd}-${citerne}`;
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function StatusBadge({ status }: { status: BatchStatus }) {
    const styles = {
        quarantine: "bg-amber-50 text-amber-700 border-amber-200",
        pending: "bg-blue-50 text-blue-700 border-blue-200",
        testing: "bg-indigo-50 text-indigo-700 border-indigo-200",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
        delivered: "bg-slate-100 text-slate-600 border-slate-200",
    };
    const labels = {
        quarantine: "Quarantine", pending: "Pending", testing: "Testing",
        approved: "Approved", rejected: "Rejected", delivered: "Delivered",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === "quarantine" ? "bg-amber-500" : status === "pending" ? "bg-blue-500" :
                status === "testing" ? "bg-indigo-500" : status === "approved" ? "bg-emerald-500" :
                    status === "rejected" ? "bg-red-500" : "bg-slate-400"
                }`} />
            {labels[status]}
        </span>
    );
}

function KpiCard({ kpi }: { kpi: any }) {
    const Icon = kpi.icon;
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-start gap-3">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${kpi.bg} ${kpi.color}`}>
                    <Icon size={22} strokeWidth={2} />
                </div>
                <div className="leading-tight">
                    <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                    <div className="mt-0.5 whitespace-pre-line text-[13px] font-medium text-slate-600">{kpi.label}</div>
                </div>
            </div>
            <div className={`mt-3 text-xs font-semibold ${kpi.trendColor}`}>
                {kpi.up ? "▲" : "▼"} {kpi.delta}% vs yesterday
            </div>
        </div>
    );
}

function GasSidebar({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
    return (
        <aside className="flex w-20 shrink-0 flex-col border-r border-slate-200 bg-white">
            <div className="flex-1 overflow-y-auto py-2">
                {GASES.map((gas) => {
                    const Icon = gas.icon;
                    const active = selected === gas.id;
                    return (
                        <button
                            key={gas.id}
                            onClick={() => onSelect(gas.id)}
                            className={`flex w-full flex-col items-center gap-1 px-1 py-3 text-[10px] font-semibold transition ${active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                        >
                            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                            <span className="leading-tight">{gas.name}</span>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}

function PartySidebar({ gasId, party, onParty, onOpenCalendar }: { gasId: string; party: string; onParty: (p: string) => void; onOpenCalendar: () => void }) {
    const gas = GASES.find((g) => g.id === gasId) || GASES[0];
    const user = JSON.parse(localStorage.getItem("user") || '{"role":"admin"}');

    return (
        <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
            <div className="flex h-16 items-center justify-center border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#00205B] flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-white" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">Air<span className="text-[#e2001a]">Liquide</span></span>
                </div>
            </div>

            <div className="px-4 pt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected Gas</div>
                <div className="mt-1 text-sm font-bold text-slate-900">{gas.fullName}</div>
                {gas.id !== "all" && (
                    <div className="mt-1 text-[11px] text-slate-500 leading-snug">
                        RM: {gas.shelfLifeRM}<br />
                        FP: {gas.shelfLifeFP}
                    </div>
                )}
            </div>

            <nav className="flex-1 space-y-1 p-3">
                <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Workflow</div>
                {gas.steps.map((step) => {
                    const StepIcon = STEP_ICON[step] || Box;
                    const active = party === step;
                    return (
                        <button
                            key={step}
                            onClick={() => onParty(step)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-blue-700 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:shadow-sm"}`}
                        >
                            <StepIcon size={18} strokeWidth={2} />
                            {step}
                        </button>
                    );
                })}

                {user.role === "admin" && (
                    <>
                        <div className="my-3 border-t border-slate-200" />
                        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Pages</div>
                        {globalNav.map((item) => {
                            const Icon = item.icon;
                            const active = party === item.label;
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => item.label === "System Calendar" ? onOpenCalendar() : onParty(item.label)}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-blue-700 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:shadow-sm"}`}
                                >
                                    <Icon size={18} strokeWidth={2} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </>
                )}
            </nav>

            <div className="mx-3 mb-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <HardHat size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-900">Safety First</div>
                        <div className="mt-0.5 text-[10px] leading-snug text-slate-500">Work safely today for a better tomorrow</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function Topbar({ onOpenCalendar }: { onOpenCalendar: () => void }) {
    const user = JSON.parse(localStorage.getItem("user") || '{"fullName":"Admin","role":"admin"}');
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
            <div>
                <h1 className="text-[26px] font-bold leading-none text-slate-900">Dashboard</h1>
                <p className="mt-1.5 text-sm text-slate-500">Air Liquide Factory Operations</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search batch, material, order…" className="h-10 w-[280px] rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <button onClick={onOpenCalendar} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Calendar size={16} className="text-blue-600" />
                    System Calendar
                </button>
                <div className="flex items-center gap-3 pl-2">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-600">
                        <Users size={18} />
                    </div>
                    <div className="leading-tight">
                        <div className="text-sm font-semibold text-slate-900">{user.fullName}</div>
                        <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                    </div>
                </div>
            </div>
        </header>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   PARTY VIEWS
   ═══════════════════════════════════════════════════════════════════ */

function LogisticsView({ batches, setBatches }: { batches: Batch[]; setBatches: React.Dispatch<React.SetStateAction<Batch[]>> }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedGas, setSelectedGas] = useState<GasId>("O2");
    const [supplier, setSupplier] = useState("");
    const [quantity, setQuantity] = useState("");
    const [route, setRoute] = useState<"conditionnement" | "citerne">("conditionnement");
    const [citerneType, setCiterneType] = useState<"3C" | "4C" | "7C">("3C");
    const [rawMat, setRawMat] = useState("");
    const [day, setDay] = useState("Day Shift");
    const [equipe, setEquipe] = useState("Equipe A");

    const logisticsBatches = batches.filter(b => b.party === "logistics" || b.party === "rm_quarantine");

    const handleCreate = async () => {
        const gas = GASES.find(g => g.id === selectedGas)!;
        const now = new Date();
        const seq = Math.floor(Math.random() * 90) + 10;
        let newBatch: Batch;

        if (selectedGas === "O2" && route === "citerne") {
            newBatch = {
                _id: `local-${Date.now()}`,
                lotId: generateCiterneCode(gas.code, now, citerneType),
                codeType: "CITERNE", gasId: selectedGas,
                productName: gas.rmName, route: "citerne", citerneType,
                supplier, quantity: quantity ? `${quantity} kg` : "TBD",
                party: "distribution", status: "pending",
                lotParams: { rawMaterials: rawMat || gas.rmName, day, equipe },
                history: [{ timestamp: now.toISOString(), action: `O2 received for citerne ${citerneType}`, party: "logistics" }],
                createdAt: now.toISOString(),
            };
        } else {
            newBatch = {
                _id: `local-${Date.now()}`,
                lotId: generateRMCode(gas.code, now, seq),
                codeType: "RM", gasId: selectedGas,
                productName: gas.rmName, route: "conditionnement",
                supplier, quantity: quantity ? `${quantity} kg` : "TBD",
                party: "rm_quarantine", status: "quarantine",
                lotParams: { rawMaterials: rawMat || gas.rmName, day, equipe },
                history: [{ timestamp: now.toISOString(), action: "Raw material received", party: "logistics" }],
                createdAt: now.toISOString(),
            };
        }

        // Optimistic local update (replace with POST /api/batches when ready)
        setBatches(prev => [newBatch, ...prev]);
        setShowModal(false);
        setSupplier(""); setQuantity(""); setRawMat("");
    };

    const sendToLab = async (batch: Batch) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/api/batches/${batch.lotId}/move`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nextParty: "laboratory", newStatus: "testing" }),
            });
            if (!res.ok) throw new Error("API Error");
        } catch (e) { /* silent fail — will update locally */ }

        setBatches(prev => prev.map(b => b._id === batch._id ? {
            ...b, party: "laboratory", status: "testing",
            history: [...b.history, { timestamp: new Date().toISOString(), action: "Sent to Laboratory RM", party: "rm_quarantine" }]
        } : b));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Logistics Intake & RM Quarantine</h2>
                    <p className="text-sm text-slate-500 mt-1">Receive raw materials. O₂ can go to conditionnement or citerne (3C/4C/7C).</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#00205B] text-white text-sm font-semibold rounded-lg hover:bg-[#001a4a] transition">
                    <Plus className="h-4 w-4" /> Receive Raw Material
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Receive New Raw Material</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X className="h-5 w-5 text-slate-500" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gas</label>
                                    <select value={selectedGas} onChange={e => setSelectedGas(e.target.value as GasId)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm">
                                        {GASES.filter(g => g.id !== "all").map(g => <option key={g.id} value={g.id}>{g.fullName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Quantity (kg)</label>
                                    <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 5000" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                                </div>
                            </div>

                            {selectedGas === "O2" && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Route</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setRoute("conditionnement")} className={`flex-1 h-10 rounded-lg text-sm font-medium border transition ${route === "conditionnement" ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-700 border-slate-200"}`}>Conditionnement</button>
                                        <button onClick={() => setRoute("citerne")} className={`flex-1 h-10 rounded-lg text-sm font-medium border transition ${route === "citerne" ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-700 border-slate-200"}`}>Citerne</button>
                                    </div>
                                    {route === "citerne" && (
                                        <div className="mt-2">
                                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Citerne Type</label>
                                            <div className="flex gap-2">
                                                {(["3C", "4C", "7C"] as const).map(c => (
                                                    <button key={c} onClick={() => setCiterneType(c)} className={`flex-1 h-10 rounded-lg text-sm font-medium border transition ${citerneType === c ? "bg-[#00205B] text-white border-[#00205B]" : "bg-white text-slate-700 border-slate-200"}`}>{c}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Supplier</label>
                                <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier name" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Raw Mat. Ref</label>
                                    <input type="text" value={rawMat} onChange={e => setRawMat(e.target.value)} placeholder="Grade" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Shift</label>
                                    <select value={day} onChange={e => setDay(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm">
                                        <option>Day Shift</option><option>Night Shift</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Equipe</label>
                                    <select value={equipe} onChange={e => setEquipe(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm">
                                        <option>Equipe A</option><option>Equipe B</option><option>Equipe C</option><option>Equipe D</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#00205B] text-white text-sm font-medium hover:bg-[#001a4a]">Create Batch</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <tr>
                            <th className="px-5 py-3.5">Code</th>
                            <th className="px-5 py-3.5">Gas</th>
                            <th className="px-5 py-3.5">Type</th>
                            <th className="px-5 py-3.5">Route</th>
                            <th className="px-5 py-3.5">Supplier</th>
                            <th className="px-5 py-3.5">Qty</th>
                            <th className="px-5 py-3.5">Equipe</th>
                            <th className="px-5 py-3.5">Status</th>
                            <th className="px-5 py-3.5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logisticsBatches.length === 0 ? (
                            <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-500">No raw materials in logistics or quarantine.</td></tr>
                        ) : (
                            logisticsBatches.map((lot) => (
                                <tr key={lot._id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-sm">{lot.lotId}</td>
                                    <td className="px-5 py-3.5"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded">{lot.gasId}</span></td>
                                    <td className="px-5 py-3.5 text-[12px] text-slate-600">{lot.codeType}</td>
                                    <td className="px-5 py-3.5 text-[12px] text-slate-600">
                                        {lot.route === "citerne" ? <span className="text-amber-600 font-semibold">Citerne {lot.citerneType}</span> : "Conditionnement"}
                                    </td>
                                    <td className="px-5 py-3.5 text-[13px] text-slate-700">{lot.supplier}</td>
                                    <td className="px-5 py-3.5 font-medium text-slate-900 text-[13px]">{lot.quantity}</td>
                                    <td className="px-5 py-3.5 text-[12px] text-slate-500">{lot.lotParams?.equipe}</td>
                                    <td className="px-5 py-3.5"><StatusBadge status={lot.status} /></td>
                                    <td className="px-5 py-3.5 text-right">
                                        {lot.party === "rm_quarantine" && (
                                            <button onClick={() => sendToLab(lot)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00205B] text-white text-[11px] font-semibold rounded-lg hover:bg-[#001a4a] transition">
                                                Send to Lab <ArrowRight className="h-3 w-3" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LaboratoryView({ batches, setBatches }: { batches: Batch[]; setBatches: React.Dispatch<React.SetStateAction<Batch[]>> }) {
    const handleAction = async (batch: Batch, action: "approve" | "reject") => {
        const token = localStorage.getItem("token");
        const url = action === "approve" ? `http://localhost:5000/api/batches/${batch.lotId}/lab` : `http://localhost:5000/api/batches/${batch.lotId}/reject`;
        try {
            await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: action === "approve" ? JSON.stringify({ purity: 99.8 }) : undefined });
        } catch { /* silent */ }

        setBatches(prev => prev.map(b => {
            if (b._id !== batch._id) return b;
            if (action === "reject") return { ...b, status: "rejected", history: [...b.history, { timestamp: new Date().toISOString(), action: "Rejected by laboratory", party: b.party }] };

            let nextParty = b.party;
            let nextStatus: BatchStatus = "approved";
            let historyAction = "";

            if (b.party === "laboratory") { // RM Lab
                nextParty = "production";
                historyAction = "RM conforme — approved for production";
            } else if (b.party === "laboratory_fp") { // FP Lab
                nextParty = "distribution";
                historyAction = "FP conforme — approved for distribution";
            } else if (b.codeType === "CITERNE" && b.party === "distribution") { // O2 Citerne Lab
                nextStatus = "approved";
                historyAction = "Citerne conforme — approved for delivery";
            }

            return { ...b, party: nextParty, status: nextStatus, history: [...b.history, { timestamp: new Date().toISOString(), action: historyAction, party: b.party }] };
        }));
    };

    const rmBatches = batches.filter(b => b.party === "laboratory" && b.status === "testing");
    const fpBatches = batches.filter(b => b.party === "laboratory_fp" && b.status === "testing");
    const citerneBatches = batches.filter(b => b.codeType === "CITERNE" && b.party === "distribution" && b.status === "pending");

    const LabTable = ({ title, subtitle, data, color }: { title: string; subtitle: string; data: Batch[]; color: string }) => (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className={`px-5 py-3 border-b`} style={{ backgroundColor: `${color}10`, borderColor: `${color}20` }}>
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color }}>{title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <tr>
                        <th className="px-5 py-3">Code</th>
                        <th className="px-5 py-3">Gas</th>
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">Qty</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">No batches awaiting analysis.</td></tr>
                    ) : (
                        data.map((lot) => (
                            <tr key={lot._id} className="hover:bg-slate-50/60">
                                <td className="px-5 py-3 font-mono font-bold text-slate-900 text-sm">{lot.lotId}</td>
                                <td className="px-5 py-3"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded">{lot.gasId}</span></td>
                                <td className="px-5 py-3 text-[13px] text-slate-700">{lot.productName}</td>
                                <td className="px-5 py-3 font-medium text-slate-900 text-[13px]">{lot.quantity}</td>
                                <td className="px-5 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleAction(lot, "approve")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-semibold rounded hover:bg-emerald-700">
                                            <CheckCircle2 className="h-3 w-3" /> Confirm
                                        </button>
                                        <button onClick={() => handleAction(lot, "reject")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-[11px] font-semibold rounded hover:bg-red-700">
                                            <X className="h-3 w-3" /> Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Laboratory Quality Control</h2>
                <p className="text-sm text-slate-500 mt-1">Double validation: RM must be <span className="font-semibold text-slate-700">conforme</span> before production. FP must be <span className="font-semibold text-slate-700">conforme</span> before distribution.</p>
            </div>
            <LabTable title="Raw Material Analysis (RM)" subtitle="Test raw materials from quarantine before production" data={rmBatches} color="#4f46e5" />
            <LabTable title="Final Product Analysis (FP)" subtitle="Test produced lots from FP quarantine before distribution" data={fpBatches} color="#059669" />
            <LabTable title="O₂ Citerne Verification" subtitle="Lab test O₂ in citerne (3C/4C/7C) before client delivery" data={citerneBatches} color="#d97706" />
        </div>
    );
}

function ProductionView({ batches, setBatches }: { batches: Batch[]; setBatches: React.Dispatch<React.SetStateAction<Batch[]>> }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [lotQuantity, setLotQuantity] = useState("");
    const [client, setClient] = useState("");
    const [newEquipe, setNewEquipe] = useState("Equipe A");

    const prodBatches = batches.filter(b => b.party === "production" && b.status === "approved");

    const startProduction = (batch: Batch) => {
        setSelectedBatch(batch);
        setNewEquipe(batch.lotParams?.equipe || "Equipe A");
        setShowModal(true);
    };

    const completeProduction = () => {
        if (!selectedBatch) return;
        const now = new Date();
        const fpCode = generateFPCode(selectedBatch.lotId, 1);

        setBatches(prev => prev.map(b => {
            if (b._id !== selectedBatch._id) return b;
            const paramsChanged = b.lotParams && (b.lotParams.equipe !== newEquipe || lotQuantity);
            return {
                ...b,
                lotId: fpCode,
                codeType: "FP",
                productName: GASES.find(g => g.id === b.gasId)?.fpName || b.productName,
                party: "laboratory_fp",
                status: "quarantine",
                quantity: lotQuantity ? `${lotQuantity} bottles` : b.quantity,
                client: client || "Stock",
                lotParams: {
                    rawMaterials: b.lotId,
                    day: b.lotParams?.day || "Day Shift",
                    equipe: newEquipe,
                },
                history: [...b.history, { timestamp: now.toISOString(), action: `Production completed. New lot: ${fpCode}. Params changed: ${paramsChanged ? "Yes" : "No"}`, party: "production" }],
            };
        }));
        setShowModal(false);
        setLotQuantity("");
        setClient("");
        setSelectedBatch(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Production & Lot Creation</h2>
                    <p className="text-sm text-slate-500 mt-1">Create bottles from approved RM. Code: <span className="font-mono text-xs bg-slate-100 px-1 rounded">GAZ-DATE-SEQ-LOTSNUM</span></p>
                </div>
            </div>

            {showModal && selectedBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Complete Production Lot</h3>
                        <p className="text-sm text-slate-500 mb-4">From RM: <span className="font-mono font-semibold">{selectedBatch.lotId}</span></p>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">FP Code (auto)</label>
                                <div className="h-10 rounded-lg bg-slate-50 border border-slate-200 px-3 flex items-center font-mono text-sm text-slate-700">{generateFPCode(selectedBatch.lotId, 1)}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Quantity (bottles)</label>
                                <input type="text" value={lotQuantity} onChange={e => setLotQuantity(e.target.value)} placeholder="e.g. 240" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Client / Destination</label>
                                <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="Client name" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Equipe (lot parameter)</label>
                                <select value={newEquipe} onChange={e => setNewEquipe(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm">
                                    <option>Equipe A</option><option>Equipe B</option><option>Equipe C</option><option>Equipe D</option>
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">If equipe changes, a new lot is created automatically.</p>
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                            <button onClick={completeProduction} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700">Complete & Send to FP Quarantine</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <tr>
                            <th className="px-5 py-3.5">RM Code</th>
                            <th className="px-5 py-3.5">Gas</th>
                            <th className="px-5 py-3.5">Product</th>
                            <th className="px-5 py-3.5">Qty</th>
                            <th className="px-5 py-3.5">Equipe</th>
                            <th className="px-5 py-3.5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {prodBatches.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No approved RM ready for production.</td></tr>
                        ) : (
                            prodBatches.map((lot) => (
                                <tr key={lot._id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-sm">{lot.lotId}</td>
                                    <td className="px-5 py-3.5"><span className="px-2 py-1 bg-purple-50 text-purple-700 text-[11px] font-bold rounded">{lot.gasId}</span></td>
                                    <td className="px-5 py-3.5 text-[13px] text-slate-700">{lot.productName}</td>
                                    <td className="px-5 py-3.5 font-medium text-slate-900 text-[13px]">{lot.quantity}</td>
                                    <td className="px-5 py-3.5 text-[12px] text-slate-500">{lot.lotParams?.equipe}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button onClick={() => startProduction(lot)} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition">
                                            Create Lot <ArrowRight className="h-3 w-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DistributionView({ batches, setBatches }: { batches: Batch[]; setBatches: React.Dispatch<React.SetStateAction<Batch[]>> }) {
    const distBatches = batches.filter(b =>
        (b.party === "distribution" && b.status === "approved") ||
        (b.codeType === "CITERNE" && b.status === "approved")
    );

    const dispatchBatch = async (batch: Batch) => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`http://localhost:5000/api/batches/${batch.lotId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "delivered" }),
            });
        } catch { /* silent */ }

        setBatches(prev => prev.map(b => b._id === batch._id ? {
            ...b, status: "delivered",
            history: [...b.history, { timestamp: new Date().toISOString(), action: "Dispatched to client", party: "distribution" }]
        } : b));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Distribution & Shipping</h2>
                    <p className="text-sm text-slate-500 mt-1">Ship approved final products and O₂ citerne deliveries.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <tr>
                            <th className="px-5 py-3.5">Code</th>
                            <th className="px-5 py-3.5">Type</th>
                            <th className="px-5 py-3.5">Gas</th>
                            <th className="px-5 py-3.5">Client</th>
                            <th className="px-5 py-3.5">Quantity</th>
                            <th className="px-5 py-3.5">Status</th>
                            <th className="px-5 py-3.5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {distBatches.length === 0 ? (
                            <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">No batches ready for distribution.</td></tr>
                        ) : (
                            distBatches.map((lot) => (
                                <tr key={lot._id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-sm">{lot.lotId}</td>
                                    <td className="px-5 py-3.5">
                                        {lot.codeType === "CITERNE" ? (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded">Citerne {lot.citerneType}</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded">FP</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded">{lot.gasId}</span></td>
                                    <td className="px-5 py-3.5 text-[13px] text-slate-700">{lot.client || "—"}</td>
                                    <td className="px-5 py-3.5 font-medium text-slate-900 text-[13px]">{lot.quantity}</td>
                                    <td className="px-5 py-3.5"><StatusBadge status={lot.status} /></td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button onClick={() => dispatchBatch(lot)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#00205B] text-white text-xs font-semibold rounded-lg hover:bg-[#001a4a] transition">
                                            Dispatch <Truck className="h-3 w-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════════════════════════════ */

function SettingsView() {
    const [settings, setSettings] = useState({
        emailAlerts: true,
        autoDispatch: false,
        labThreshold: 99.5,
        quarantineDays: 3,
        language: "fr",
        theme: "light",
    });

    const handleSave = () => {
        localStorage.setItem("al_settings", JSON.stringify(settings));
        alert("Settings saved successfully!");
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Factory Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Configure workflow parameters, thresholds, and system behavior.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Email Alerts</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Notify teams when batches move between parties</p>
                    </div>
                    <button
                        onClick={() => setSettings(s => ({ ...s, emailAlerts: !s.emailAlerts }))}
                        className={`w-11 h-6 rounded-full transition relative ${settings.emailAlerts ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${settings.emailAlerts ? "left-6" : "left-1"}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Auto-Dispatch</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Automatically dispatch approved batches to distribution</p>
                    </div>
                    <button
                        onClick={() => setSettings(s => ({ ...s, autoDispatch: !s.autoDispatch }))}
                        className={`w-11 h-6 rounded-full transition relative ${settings.autoDispatch ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${settings.autoDispatch ? "left-6" : "left-1"}`} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6 pb-4 border-b border-slate-100">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Lab Purity Threshold (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={settings.labThreshold}
                            onChange={e => setSettings(s => ({ ...s, labThreshold: parseFloat(e.target.value) }))}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Minimum purity to confirm a batch</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Quarantine Duration (days)</label>
                        <input
                            type="number"
                            value={settings.quarantineDays}
                            onChange={e => setSettings(s => ({ ...s, quarantineDays: parseInt(e.target.value) }))}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Language</label>
                        <select
                            value={settings.language}
                            onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Theme</label>
                        <select
                            value={settings.theme}
                            onChange={e => setSettings(s => ({ ...s, theme: e.target.value }))}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                </div>

                <div className="pt-2">
                    <button onClick={handleSave} className="px-6 py-2.5 rounded-lg bg-[#00205B] text-white text-sm font-semibold hover:bg-[#001a4a] transition">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   REPORTS PAGE
   ═══════════════════════════════════════════════════════════════════ */

function ReportsView({ batches }: { batches: Batch[] }) {
    const [dateRange, setDateRange] = useState("7");
    const [reportType, setReportType] = useState("overview");

    const filtered = useMemo(() => {
        const days = parseInt(dateRange);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return batches.filter(b => new Date(b.createdAt) >= cutoff);
    }, [batches, dateRange]);

    const gasBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        filtered.forEach(b => { counts[b.gasId] = (counts[b.gasId] || 0) + 1; });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    const statusBreakdown = useMemo(() => {
        const counts: Record<string, number> = { Approved: 0, Rejected: 0, Pending: 0, Delivered: 0 };
        filtered.forEach(b => {
            if (b.status === "approved") counts.Approved++;
            else if (b.status === "rejected") counts.Rejected++;
            else if (b.status === "delivered") counts.Delivered++;
            else counts.Pending++;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value, color: name === "Approved" ? "#10b981" : name === "Rejected" ? "#ef4444" : name === "Delivered" ? "#0ea5e9" : "#f59e0b" }));
    }, [filtered]);

    const partyBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        filtered.forEach(b => { counts[b.party] = (counts[b.party] || 0) + 1; });
        return Object.entries(counts).map(([name, value]) => ({ name: name.replace("_", " "), value }));
    }, [filtered]);

    const exportCSV = () => {
        const headers = "Lot ID,Gas,Type,Status,Party,Quantity,Client,Date\n";
        const rows = filtered.map(b => `${b.lotId},${b.gasId},${b.codeType},${b.status},${b.party},${b.quantity},${b.client || ""},${new Date(b.createdAt).toLocaleDateString()}`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `airliquide_report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Reports & Analytics</h2>
                    <p className="text-sm text-slate-500 mt-1">Generate and export factory performance reports.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm">
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                    <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition">
                        <Download className="h-4 w-4" /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">By Gas Type</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={gasBreakdown} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                                    {gasBreakdown.map((_, idx) => <Cell key={idx} fill={["#2563eb", "#10b981", "#f59e0b", "#a855f7", "#ef4444", "#64748b"][idx % 6]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">By Status</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusBreakdown} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                                    {statusBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">By Workflow Party</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={partyBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Detailed Batch Report ({filtered.length} records)</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <tr>
                            <th className="px-5 py-3">Code</th>
                            <th className="px-5 py-3">Gas</th>
                            <th className="px-5 py-3">Type</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Party</th>
                            <th className="px-5 py-3">Qty</th>
                            <th className="px-5 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(b => (
                            <tr key={b._id} className="hover:bg-slate-50/60">
                                <td className="px-5 py-3 font-mono text-sm text-slate-900">{b.lotId}</td>
                                <td className="px-5 py-3 text-sm">{b.gasId}</td>
                                <td className="px-5 py-3 text-sm"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">{b.codeType}</span></td>
                                <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                                <td className="px-5 py-3 text-sm text-slate-600">{b.party}</td>
                                <td className="px-5 py-3 text-sm font-medium">{b.quantity}</td>
                                <td className="px-5 py-3 text-sm text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════ */

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [selectedGas, setSelectedGas] = useState("all");
    const [selectedParty, setSelectedParty] = useState("Dashboard");
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBatches = async () => {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            try {
                let url = "http://localhost:5000/api/batches";
                if (selectedGas !== "all") url += `?gasId=${selectedGas.toUpperCase()}`;
                const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    setBatches(data);
                } else if (res.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
            } catch (err) {
                console.error("Failed to fetch batches", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBatches();
    }, [selectedGas, navigate]);

    const filteredBatches = useMemo(() => {
        if (selectedGas === "all") return batches;
        return batches.filter(b => b.gasId === selectedGas.toUpperCase());
    }, [batches, selectedGas]);

    const kpis = useMemo(() => [
        { label: "RM in\nQuarantine", value: filteredBatches.filter(b => b.party === "rm_quarantine").length, delta: 12, up: true, icon: Warehouse, bg: "bg-amber-50", color: "text-amber-600", trendColor: "text-emerald-600" },
        { label: "RM Lab\nTesting", value: filteredBatches.filter(b => b.party === "laboratory").length, delta: 5, up: true, icon: FlaskConical, bg: "bg-indigo-50", color: "text-indigo-600", trendColor: "text-emerald-600" },
        { label: "Approved\nfor Prod", value: filteredBatches.filter(b => b.party === "production").length, delta: 8, up: true, icon: CheckCircle2, bg: "bg-blue-50", color: "text-blue-600", trendColor: "text-emerald-600" },
        { label: "In\nProduction", value: filteredBatches.filter(b => b.party === "production").length, delta: 3, up: false, icon: Factory, bg: "bg-purple-50", color: "text-purple-600", trendColor: "text-red-500" },
        { label: "FP in\nQuarantine", value: filteredBatches.filter(b => b.party === "laboratory_fp" && b.status === "quarantine").length, delta: 2, up: true, icon: Package, bg: "bg-cyan-50", color: "text-cyan-600", trendColor: "text-emerald-600" },
        { label: "FP Lab\nTesting", value: filteredBatches.filter(b => b.party === "laboratory_fp" && b.status === "testing").length, delta: 1, up: false, icon: Beaker, bg: "bg-teal-50", color: "text-teal-600", trendColor: "text-red-500" },
        { label: "Ready for\nShipping", value: filteredBatches.filter(b => b.party === "distribution" && b.status === "approved").length, delta: 15, up: true, icon: Truck, bg: "bg-emerald-50", color: "text-emerald-600", trendColor: "text-emerald-600" },
        { label: "O₂ Citerne\nPending", value: filteredBatches.filter(b => b.codeType === "CITERNE" && b.status === "pending").length, delta: 4, up: true, icon: Droplet, bg: "bg-orange-50", color: "text-orange-600", trendColor: "text-emerald-600" },
        { label: "Rejected\nBatches", value: filteredBatches.filter(b => b.status === "rejected").length, delta: 50, up: false, icon: AlertTriangle, bg: "bg-red-50", color: "text-red-500", trendColor: "text-red-500" },
        { label: "Total\nDelivered", value: filteredBatches.filter(b => b.status === "delivered").length, delta: 22, up: true, icon: CheckCircle2, bg: "bg-slate-50", color: "text-slate-600", trendColor: "text-emerald-600" },
    ], [filteredBatches]);

    const flowSteps = useMemo(() => [
        { label: "Logistics\nIntake", icon: Truck, count: filteredBatches.filter(b => b.party === "logistics").length, tint: "bg-blue-50 text-blue-600" },
        { label: "RM\nQuarantine", icon: Warehouse, count: filteredBatches.filter(b => b.party === "rm_quarantine").length, tint: "bg-amber-50 text-amber-500" },
        { label: "Lab RM\nAnalysis", icon: FlaskConical, count: filteredBatches.filter(b => b.party === "laboratory").length, tint: "bg-indigo-50 text-indigo-600" },
        { label: "Production\n& Lots", icon: Factory, count: filteredBatches.filter(b => b.party === "production").length, tint: "bg-purple-50 text-purple-600" },
        { label: "FP\nQuarantine", icon: Package, count: filteredBatches.filter(b => b.party === "laboratory_fp" && b.status === "quarantine").length, tint: "bg-cyan-50 text-cyan-600" },
        { label: "Lab FP\nAnalysis", icon: Beaker, count: filteredBatches.filter(b => b.party === "laboratory_fp" && b.status === "testing").length, tint: "bg-teal-50 text-teal-600" },
        { label: "Distribution\n& Shipping", icon: Truck, count: filteredBatches.filter(b => b.party === "distribution" && b.status !== "delivered").length, tint: "bg-emerald-50 text-emerald-600" },
        { label: "Delivered", icon: CheckCircle2, count: filteredBatches.filter(b => b.status === "delivered").length, tint: "bg-slate-100 text-slate-600" },
    ], [filteredBatches]);

    const activities = useMemo(() => {
        const allHistory: any[] = [];
        filteredBatches.forEach(batch => {
            if (batch.history) {
                batch.history.forEach((h: any) => {
                    allHistory.push({ ...h, lotId: batch.lotId, gasId: batch.gasId, codeType: batch.codeType });
                });
            }
        });
        allHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return allHistory.slice(0, 6).map((h) => {
            let badge = "Info", badgeClass = "bg-slate-100 text-slate-700", dot = "bg-slate-500";
            if (h.party === "logistics") { badge = "Logistics"; badgeClass = "bg-blue-50 text-blue-700"; dot = "bg-blue-500"; }
            else if (h.party === "rm_quarantine") { badge = "Quarantine"; badgeClass = "bg-amber-50 text-amber-700"; dot = "bg-amber-500"; }
            else if (h.party === "laboratory") { badge = "Lab RM"; badgeClass = "bg-indigo-50 text-indigo-700"; dot = "bg-indigo-500"; }
            else if (h.party === "production") { badge = "Production"; badgeClass = "bg-purple-50 text-purple-700"; dot = "bg-purple-500"; }
            else if (h.party === "laboratory_fp") { badge = "Lab FP"; badgeClass = "bg-teal-50 text-teal-700"; dot = "bg-teal-500"; }
            else if (h.party === "distribution") { badge = "Dist."; badgeClass = "bg-emerald-50 text-emerald-700"; dot = "bg-emerald-500"; }
            else if (h.action.includes("Rejected")) { badge = "Rejected"; badgeClass = "bg-red-50 text-red-700"; dot = "bg-red-500"; }
            return {
                time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: `${h.codeType === "CITERNE" ? "🛢️" : "📦"} ${h.lotId} (${h.gasId}): ${h.action}`,
                badge, badgeClass, dot
            };
        });
    }, [filteredBatches]);

    const topMaterials = useMemo(() => {
        const counts: Record<string, number> = {};
        const key = selectedGas === "all" ? "gasId" : "supplier";
        filteredBatches.forEach(b => {
            const qty = parseInt(b.quantity?.replace(/[^0-9]/g, '') || "0");
            const name = key === "gasId" ? b.gasId : (b.supplier || "Unknown");
            counts[name] = (counts[name] || 0) + qty;
        });
        const colors = ["#2563eb", "#10b981", "#f59e0b", "#a855f7", "#ef4444", "#64748b", "#0ea5e9"];
        return Object.entries(counts).map(([name, kg], idx) => ({ name, kg, color: colors[idx % colors.length] })).sort((a, b) => b.kg - a.kg).slice(0, 5);
    }, [filteredBatches, selectedGas]);

    const totalMat = topMaterials.reduce((s, m) => s + m.kg, 0);

    const productionSeries = useMemo(() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const series = days.map(day => ({ day, rmReceived: 0, fpDelivered: 0 }));
        filteredBatches.forEach(b => {
            const d = new Date(b.createdAt);
            const dayName = days[d.getDay()];
            const entry = series.find(s => s.day === dayName);
            if (entry) {
                if (b.codeType === "RM") entry.rmReceived += 1;
                if (b.status === "delivered") entry.fpDelivered += 1;
            }
        });
        return series;
    }, [filteredBatches]);

    const batchStatus = useMemo(() => {
        const statusCounts = { "In Quarantine": 0, "Lab Testing": 0, "In Production": 0, "Approved": 0, "Rejected": 0, "Delivered": 0 };
        filteredBatches.forEach(b => {
            if (b.status === "rejected") statusCounts.Rejected++;
            else if (b.status === "delivered") statusCounts.Delivered++;
            else if (b.party === "rm_quarantine" || (b.party === "laboratory_fp" && b.status === "quarantine")) statusCounts["In Quarantine"]++;
            else if (b.party === "laboratory" || (b.party === "laboratory_fp" && b.status === "testing")) statusCounts["Lab Testing"]++;
            else if (b.party === "production") statusCounts["In Production"]++;
            else if (b.status === "approved") statusCounts.Approved++;
        });
        return [
            { name: "In Quarantine", value: statusCounts["In Quarantine"], color: "#f59e0b" },
            { name: "Lab Testing", value: statusCounts["Lab Testing"], color: "#6366f1" },
            { name: "In Production", value: statusCounts["In Production"], color: "#a855f7" },
            { name: "Approved", value: statusCounts.Approved, color: "#10b981" },
            { name: "Delivered", value: statusCounts.Delivered, color: "#0ea5e9" },
            { name: "Rejected", value: statusCounts.Rejected, color: "#ef4444" },
        ].filter(s => s.value > 0);
    }, [filteredBatches]);

    const totalBatch = batchStatus.reduce((s, b) => s + b.value, 0);
    const deliveredBatches = batchStatus.find(s => s.name === "Delivered")?.value || 0;
    const progressPercent = totalBatch > 0 ? Math.round((deliveredBatches / totalBatch) * 100) : 0;

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm font-medium">Loading factory data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            <GasSidebar selected={selectedGas} onSelect={(id) => { setSelectedGas(id); setSelectedParty("Dashboard"); }} />
            <PartySidebar gasId={selectedGas} party={selectedParty} onParty={setSelectedParty} onOpenCalendar={() => navigate('/calendar')} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar onOpenCalendar={() => navigate('/calendar')} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                    {selectedParty === "Logistics" && <LogisticsView batches={batches} setBatches={setBatches} />}
                    {selectedParty === "RM Quarantine" && <LogisticsView batches={batches} setBatches={setBatches} />}
                    {selectedParty === "Laboratory" && <LaboratoryView batches={batches} setBatches={setBatches} />}
                    {selectedParty === "Production" && <ProductionView batches={batches} setBatches={setBatches} />}
                    {selectedParty === "FP Quarantine" && <ProductionView batches={batches} setBatches={setBatches} />}
                    {selectedParty === "Laboratory FP" && <LaboratoryView batches={batches} setBatches={setBatches} />}
                    {selectedParty === "Distribution" && <DistributionView batches={batches} setBatches={setBatches} />}
                    {selectedParty === "Settings" && <SettingsView />}
                    {selectedParty === "Reports" && <ReportsView batches={batches} />}

                    {selectedParty === "Dashboard" && (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {kpis.map((k, i) => <KpiCard key={i} kpi={k} />)}
                            </div>

                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-6 text-base font-semibold text-slate-900">Factory Workflow Pipeline</h2>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        {flowSteps.map((step, i) => {
                                            const Icon = step.icon;
                                            return (
                                                <React.Fragment key={step.label}>
                                                    <div className="flex flex-col items-center text-center flex-1 min-w-[80px]">
                                                        <div className={`grid h-12 w-12 place-items-center rounded-full ${step.tint}`}><Icon size={20} strokeWidth={2} /></div>
                                                        <div className="mt-2 max-w-[88px] whitespace-pre-line text-[11.5px] font-medium leading-tight text-slate-600">{step.label}</div>
                                                        <div className="mt-1 text-xl font-bold text-slate-900">{step.count}</div>
                                                    </div>
                                                    {i < flowSteps.length - 1 && <ArrowRight size={16} className="hidden lg:block shrink-0 text-slate-300" />}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-8">
                                        <div className="mb-1.5 flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-700">Delivery Progress</span>
                                            <span className="font-semibold text-blue-600">{progressPercent}%</span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progressPercent}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
                                        <button className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">View All</button>
                                    </div>
                                    <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[320px] custom-scrollbar">
                                        {activities.length === 0 ? (
                                            <li className="py-8 text-sm text-slate-500 text-center">No recent activity</li>
                                        ) : (
                                            activities.map((a, i) => (
                                                <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                                    <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${a.dot}`} />
                                                    <span className="w-[52px] shrink-0 text-xs font-medium text-slate-500">{a.time}</span>
                                                    <span className="flex-1 text-sm leading-snug text-slate-700 truncate" title={a.text}>{a.text}</span>
                                                    <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${a.badgeClass}`}>{a.badge}</span>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-baseline gap-2">
                                        <h2 className="text-base font-semibold text-slate-900">{selectedGas === "all" ? "Gas Volume" : "Suppliers"}</h2>
                                        <span className="text-xs text-slate-400">(kg)</span>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="relative h-[180px] w-[180px] shrink-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={topMaterials} innerRadius={58} outerRadius={85} paddingAngle={2} dataKey="kg" stroke="none">
                                                        {topMaterials.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1">
                                            <ul className="divide-y divide-slate-100">
                                                {topMaterials.map((m) => (
                                                    <li key={m.name} className="grid grid-cols-[1fr_auto] items-center gap-x-4 py-1.5 text-sm">
                                                        <span className="flex items-center gap-2 text-slate-700"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />{m.name}</span>
                                                        <span className="font-semibold text-slate-900">{m.kg.toLocaleString()}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                                <span className="text-sm font-semibold text-slate-700">Total</span>
                                                <span className="text-sm font-bold text-slate-900">{totalMat.toLocaleString()} kg</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-3 flex items-baseline gap-2">
                                        <h2 className="text-base font-semibold text-slate-900">Weekly Throughput</h2>
                                        <span className="text-xs text-slate-400">(7 Days)</span>
                                    </div>
                                    <div className="h-[260px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={productionSeries} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
                                                <Line type="monotone" dataKey="rmReceived" name="RM Received" stroke="#93bbfd" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "#93bbfd" }} />
                                                <Line type="monotone" dataKey="fpDelivered" name="FP Delivered" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-2 text-base font-semibold text-slate-900">Batch Status</h2>
                                    <div className="flex items-center gap-5">
                                        <div className="relative h-[160px] w-[160px] shrink-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={batchStatus} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                                                        {batchStatus.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1">
                                            <div className="mb-3 flex items-baseline justify-between">
                                                <span className="text-xs text-slate-500">Total Batches</span>
                                                <span className="text-2xl font-bold text-slate-900">{totalBatch}</span>
                                            </div>
                                            <ul className="space-y-2.5">
                                                {batchStatus.map((b) => (
                                                    <li key={b.name} className="flex items-center justify-between text-sm">
                                                        <span className="flex items-center gap-2 text-slate-700"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />{b.name}</span>
                                                        <span className="text-slate-500"><span className="font-semibold text-slate-900">{b.value}</span> ({totalBatch > 0 ? ((b.value / totalBatch) * 100).toFixed(1) : 0}%)</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
