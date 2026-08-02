import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, FlaskConical, Cog, Droplet, Warehouse,
    Truck, BarChart3, Users, Settings, Search, Bell, ChevronDown,
    Calendar, Download, ArrowRight, Box, CheckCircle2, HardHat,
    Wind, Droplets, Cloud, Zap, HeartPulse, ShieldCheck, Shield, Fan, X, XCircle,
} from "lucide-react";
import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

/* ─────────────────────────── Gas & Workflow Config ─────────────────────────── */

const GASES = [
    { id: "all", name: "All", fullName: "All Gases", icon: LayoutDashboard, steps: [] },
    { id: "O2", name: "GOX", fullName: "Gaseous Oxygen", icon: Wind, steps: ["Logistics", "Laboratory", "Production", "Distribution"] },
    { id: "N2", name: "N₂", fullName: "Nitrogen", icon: Cloud, steps: ["Logistics", "Laboratory", "Production", "Distribution"] },
    { id: "CO2", name: "CO₂", fullName: "Carbon Dioxide", icon: FlaskConical, steps: ["Logistics", "Laboratory", "Production", "Distribution"] },
    { id: "N2O", name: "N₂O", fullName: "Nitrous Oxide", icon: Zap, steps: ["Logistics", "Laboratory", "Conditionnement", "Distribution"] },
    { id: "MEOPA", name: "MEOPA", fullName: "MEOPA Mix", icon: HeartPulse, steps: ["Logistics", "Laboratory", "Conditionnement", "Distribution"] },
    { id: "AIR", name: "Air", fullName: "Air Respirable", icon: Fan, steps: ["Logistics", "Laboratory", "Production", "Distribution"] },
];

const STEP_ICON: Record<string, React.ElementType> = {
    Logistics: Package, Laboratory: FlaskConical, Production: Cog,
    Conditionnement: Droplet, Distribution: Truck,
};

const globalNav = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: BarChart3, label: "Reports" },
    { icon: Users, label: "Users" },
    { icon: Settings, label: "Settings" },
];

/* ─────────────────────────── Sub-Views for Each Party ─────────────────────────── */

function LogisticsView({ batches, setBatches }: { batches: any[], setBatches: React.Dispatch<React.SetStateAction<any[]>> }) {
    const logisticsBatches = batches.filter(b => b.party === "logistics");

    const sendToLab = async (lotId: string) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/api/batches/${lotId}/move`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nextParty: "laboratory", newStatus: "pending" }),
            });
            if (res.ok) {
                const updatedBatch = await res.json();
                setBatches(prev => prev.map(b => b._id === updatedBatch._id ? updatedBatch : b));
            }
        } catch (err) {
            console.error("Failed to move batch", err);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Logistics Intake Queue</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Lot ID</th>
                            <th className="px-6 py-4">Gas Type</th>
                            <th className="px-6 py-4">Supplier</th>
                            <th className="px-6 py-4">Quantity</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logisticsBatches.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No lots currently in logistics.</td></tr>
                        ) : (
                            logisticsBatches.map((lot) => (
                                <tr key={lot._id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{lot.lotId}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">{lot.gasId}</span></td>
                                    <td className="px-6 py-4 text-slate-700">{lot.supplier}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{lot.quantity} kg</td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(lot.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => sendToLab(lot.lotId)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#00205B] text-white text-xs font-semibold rounded-lg hover:bg-[#001a4a] transition">
                                            Send to Lab <ArrowRight className="h-3 w-3" />
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

function LaboratoryView({ batches, setBatches }: { batches: any[], setBatches: React.Dispatch<React.SetStateAction<any[]>> }) {
    const labBatches = batches.filter(b => b.party === "laboratory");

    const handleAction = async (lotId: string, action: "approve" | "reject") => {
        const token = localStorage.getItem("token");
        const url = action === "approve"
            ? `http://localhost:5000/api/batches/${lotId}/lab`
            : `http://localhost:5000/api/batches/${lotId}/reject`;

        const body = action === "approve" ? JSON.stringify({ purity: 99.8, co: 1.2, co2: 150, h2o: 30 }) : {};

        try {
            const res = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body,
            });
            if (res.ok) {
                const updatedBatch = await res.json();
                setBatches(prev => prev.map(b => b._id === updatedBatch._id ? updatedBatch : b));
            }
        } catch (err) {
            console.error(`Failed to ${action} batch`, err);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Laboratory QC Queue</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Lot ID</th>
                            <th className="px-6 py-4">Gas Type</th>
                            <th className="px-6 py-4">Supplier</th>
                            <th className="px-6 py-4">Quantity</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {labBatches.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No batches awaiting laboratory analysis.</td></tr>
                        ) : (
                            labBatches.map((lot) => (
                                <tr key={lot._id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{lot.lotId}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">{lot.gasId}</span></td>
                                    <td className="px-6 py-4 text-slate-700">{lot.supplier}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{lot.quantity} kg</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${lot.status === "ready" ? "bg-emerald-50 text-emerald-700" :
                                            lot.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                                            }`}>
                                            {lot.status === "ready" ? "Approved" : lot.status === "rejected" ? "Rejected" : "In Analysis"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {lot.status !== "rejected" && lot.status !== "ready" && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleAction(lot.lotId, "approve")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700">
                                                    <CheckCircle2 className="h-3 w-3" /> Approve
                                                </button>
                                                <button onClick={() => handleAction(lot.lotId, "reject")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700">
                                                    <XCircle className="h-3 w-3" /> Reject
                                                </button>
                                            </div>
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

function ProductionView({ batches, setBatches }: { batches: any[], setBatches: React.Dispatch<React.SetStateAction<any[]>> }) {
    const prodBatches = batches.filter(b => b.party === "production");

    const completeProduction = async (lotId: string) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/api/batches/${lotId}/move`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nextParty: "distribution", newStatus: "approved" }),
            });
            if (res.ok) {
                const updatedBatch = await res.json();
                setBatches(prev => prev.map(b => b._id === updatedBatch._id ? updatedBatch : b));
            }
        } catch (err) {
            console.error("Failed to complete production", err);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Production Queue</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Lot ID</th>
                            <th className="px-6 py-4">Gas Type</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Quantity</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {prodBatches.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No batches in production.</td></tr>
                        ) : (
                            prodBatches.map((lot) => (
                                <tr key={lot._id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{lot.lotId}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">{lot.gasId}</span></td>
                                    <td className="px-6 py-4 text-slate-700">{lot.client}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{lot.quantity} kg</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => completeProduction(lot.lotId)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition">
                                            Complete & Distribute <ArrowRight className="h-3 w-3" />
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

function DistributionView({ batches, setBatches }: { batches: any[], setBatches: React.Dispatch<React.SetStateAction<any[]>> }) {
    const distBatches = batches.filter(b => b.party === "distribution");

    const dispatchBatch = async (lotId: string) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/api/batches/${lotId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "delivered" }),
            });
            if (res.ok) {
                const updatedBatch = await res.json();
                setBatches(prev => prev.map(b => b._id === updatedBatch._id ? updatedBatch : b));
            }
        } catch (err) {
            console.error("Failed to dispatch batch", err);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Distribution & Shipping</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Lot ID</th>
                            <th className="px-6 py-4">Gas Type</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Quantity</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {distBatches.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No batches ready for distribution.</td></tr>
                        ) : (
                            distBatches.map((lot) => (
                                <tr key={lot._id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{lot.lotId}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">{lot.gasId}</span></td>
                                    <td className="px-6 py-4 text-slate-700">{lot.client}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{lot.quantity} kg</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${lot.status === "delivered" ? "bg-slate-100 text-slate-700" : "bg-emerald-50 text-emerald-700"
                                            }`}>
                                            {lot.status === "delivered" ? "Delivered" : "Ready to Ship"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {lot.status !== "delivered" && (
                                            <button onClick={() => dispatchBatch(lot.lotId)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#00205B] text-white text-xs font-semibold rounded-lg hover:bg-[#001a4a] transition">
                                                Dispatch <Truck className="h-3 w-3" />
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

/* ─────────────────────────── Shared Components ─────────────────────────── */

function KpiCard({ kpi }: { kpi: any }) {
    const Icon = kpi.icon;
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-start gap-3">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${kpi.bg} ${kpi.color}`}>
                    <Icon size={22} strokeWidth={2} />
                </div>
                <div className="leading-tight">
                    <div className="text-3xl font-bold text-slate-900">{kpi.value}</div>
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
            <div className="flex h-16 items-center justify-center border-b border-slate-200">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700">
                    <div className="h-3 w-3 rounded-full bg-white" />
                </div>
            </div>
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

function PartySidebar({ gasId, party, onParty }: { gasId: string; party: string; onParty: (p: string) => void }) {
    const gas = GASES.find((g) => g.id === gasId) || GASES[0];
    const user = JSON.parse(localStorage.getItem("user") || '{"role": "admin"}');

    return (
        <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
            <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                    Air <span className="text-red-600">Liquide</span>
                </span>
            </div>

            <div className="px-4 pt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected Gas</div>
                <div className="mt-1 text-sm font-bold text-slate-900">{gas.fullName}</div>
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
                                    onClick={() => onParty(item.label)}
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
                        <div className="text-xs font-bold text-slate-900">Safety is our priority</div>
                        <div className="mt-0.5 text-[10px] leading-snug text-slate-500">Work safely today for a better tomorrow</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function Topbar() {
    const user = JSON.parse(localStorage.getItem("user") || '{"fullName": "Admin", "role": "admin"}');
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
            <div>
                <h1 className="text-[26px] font-bold leading-none text-slate-900">Dashboard</h1>
                <p className="mt-1.5 text-sm text-slate-500">Overview of today's operations</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search batch, material, order…"
                        className="h-10 w-[320px] rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <button className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <Calendar size={16} className="text-slate-500" />
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <ChevronDown size={14} className="text-slate-500" />
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

/* ─────────────────────────── Main Dashboard Page ─────────────────────────── */

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [selectedGas, setSelectedGas] = useState("all");
    const [selectedParty, setSelectedParty] = useState("Dashboard");
    const [batches, setBatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch Data based on Selected Gas
    useEffect(() => {
        const fetchBatches = async () => {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            try {
                let url = "http://localhost:5000/api/batches";
                if (selectedGas !== "all") {
                    url += `?gasId=${selectedGas}`;
                }
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    setBatches(await res.json());
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

    // 2. Dynamic KPIs
    const kpis = useMemo(() => [
        { label: "Raw Materials\nReceived", value: batches.filter(b => b.party === "logistics").length, delta: 20, up: true, icon: Box, bg: "bg-blue-50", color: "text-blue-600", trendColor: "text-emerald-600" },
        { label: "Waiting for\nLaboratory", value: batches.filter(b => b.party === "laboratory" && b.status === "pending").length, delta: 33, up: true, icon: FlaskConical, bg: "bg-amber-50", color: "text-amber-500", trendColor: "text-amber-600" },
        { label: "Approved by\nLaboratory", value: batches.filter(b => b.status === "ready" || b.status === "approved").length, delta: 12, up: true, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600", trendColor: "text-emerald-600" },
        { label: "In\nProduction", value: batches.filter(b => b.party === "production").length, delta: 16, up: true, icon: Cog, bg: "bg-purple-50", color: "text-purple-600", trendColor: "text-purple-600" },
        { label: "Ready for\nFilling", value: batches.filter(b => b.party === "conditionnement").length, delta: 10, up: false, icon: Droplet, bg: "bg-cyan-50", color: "text-cyan-600", trendColor: "text-red-500" },
        { label: "Ready for\nShipping", value: batches.filter(b => b.party === "distribution").length, delta: 27, up: true, icon: Truck, bg: "bg-emerald-50", color: "text-emerald-600", trendColor: "text-emerald-600" },
        { label: "Rejected\nBatches", value: batches.filter(b => b.status === "rejected").length, delta: 50, up: false, icon: X, bg: "bg-red-50", color: "text-red-500", trendColor: "text-red-500" },
    ], [batches]);

    // 3. Dynamic Flow Steps
    const flowSteps = useMemo(() => [
        { label: "Raw Materials\nReceived", icon: Box, count: batches.filter(b => b.party === "logistics").length, tint: "bg-blue-50 text-blue-600" },
        { label: "In Laboratory", icon: FlaskConical, count: batches.filter(b => b.party === "laboratory").length, tint: "bg-amber-50 text-amber-500" },
        { label: "Approved", icon: CheckCircle2, count: batches.filter(b => b.status === "approved" || b.status === "ready").length, tint: "bg-emerald-50 text-emerald-600" },
        { label: "In Production", icon: Cog, count: batches.filter(b => b.party === "production").length, tint: "bg-purple-50 text-purple-600" },
        { label: "In Filling", icon: Droplet, count: batches.filter(b => b.party === "conditionnement").length, tint: "bg-cyan-50 text-cyan-600" },
        { label: "In Warehouse", icon: Warehouse, count: batches.filter(b => b.party === "distribution" && b.status !== "delivered").length, tint: "bg-blue-50 text-blue-600" },
        { label: "Delivered", icon: Truck, count: batches.filter(b => b.status === "delivered").length, tint: "bg-emerald-50 text-emerald-600" },
    ], [batches]);

    // 4. Dynamic Recent Activities (from batch history)
    const activities = useMemo(() => {
        const allHistory: any[] = [];
        batches.forEach(batch => {
            if (batch.history) {
                batch.history.forEach((h: any) => {
                    allHistory.push({ ...h, lotId: batch.lotId, gasId: batch.gasId });
                });
            }
        });
        allHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return allHistory.slice(0, 5).map((h) => {
            let badge = "Info", badgeClass = "bg-slate-100 text-slate-700", dot = "bg-slate-500";
            if (h.action.includes("Created")) { badge = "Logistics"; badgeClass = "bg-indigo-50 text-indigo-700"; dot = "bg-indigo-500"; }
            else if (h.action.includes("Lab")) { badge = "Laboratory"; badgeClass = "bg-amber-50 text-amber-700"; dot = "bg-amber-500"; }
            else if (h.action.includes("Production")) { badge = "Production"; badgeClass = "bg-blue-50 text-blue-700"; dot = "bg-blue-500"; }
            else if (h.action.includes("Rejected")) { badge = "Rejected"; badgeClass = "bg-red-50 text-red-700"; dot = "bg-red-500"; }
            else if (h.action.includes("Moved")) { badge = "Moved"; badgeClass = "bg-emerald-50 text-emerald-700"; dot = "bg-emerald-500"; }

            return {
                time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: `Batch ${h.lotId} (${h.gasId}): ${h.action}`,
                badge, badgeClass, dot
            };
        });
    }, [batches]);

    // 5. Dynamic "Top Materials" (or Suppliers if gas is selected)
    const topMaterials = useMemo(() => {
        const counts: Record<string, number> = {};
        const key = selectedGas === "all" ? "gasId" : "supplier";

        batches.forEach(b => {
            const qty = parseInt(b.quantity?.replace(/[^0-9]/g, '') || "0");
            const name = key === "gasId" ? b.gasId : b.supplier;
            counts[name] = (counts[name] || 0) + qty;
        });

        const colors = ["#2563eb", "#10b981", "#f59e0b", "#a855f7", "#ef4444", "#64748b"];
        return Object.entries(counts)
            .map(([name, kg], idx) => ({ name, kg, color: colors[idx % colors.length] }))
            .sort((a, b) => b.kg - a.kg)
            .slice(0, 5);
    }, [batches, selectedGas]);

    const totalMat = topMaterials.reduce((s, m) => s + m.kg, 0);

    // 6. Dynamic Production Series (Last 7 Days)
    const productionSeries = useMemo(() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const series = days.map(day => ({ day, received: 0, completed: 0 }));

        batches.forEach(b => {
            const d = new Date(b.date);
            const dayName = days[d.getDay()];
            const entry = series.find(s => s.day === dayName);
            if (entry) {
                entry.received += 1;
                if (b.status === "approved" || b.status === "delivered") entry.completed += 1;
            }
        });
        return series;
    }, [batches]);

    // 7. Dynamic Batch Status
    const batchStatus = useMemo(() => {
        const statusCounts = { Completed: 0, "In Progress": 0, Pending: 0, Rejected: 0 };
        batches.forEach(b => {
            if (b.status === "rejected") statusCounts.Rejected++;
            else if (b.party === "logistics") statusCounts.Pending++;
            else if (["production", "laboratory", "conditionnement"].includes(b.party)) statusCounts["In Progress"]++;
            else statusCounts.Completed++;
        });
        return [
            { name: "Completed", value: statusCounts.Completed, color: "#10b981" },
            { name: "In Progress", value: statusCounts["In Progress"], color: "#3b82f6" },
            { name: "Pending", value: statusCounts.Pending, color: "#f59e0b" },
            { name: "Rejected", value: statusCounts.Rejected, color: "#ef4444" },
        ].filter(s => s.value > 0);
    }, [batches]);

    const totalBatch = batchStatus.reduce((s, b) => s + b.value, 0);
    const completedBatches = batchStatus.find(s => s.name === "Completed")?.value || 0;
    const progressPercent = totalBatch > 0 ? Math.round((completedBatches / totalBatch) * 100) : 0;

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm font-medium">Loading dashboard data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            <GasSidebar selected={selectedGas} onSelect={(id) => { setSelectedGas(id); setSelectedParty("Dashboard"); }} />
            <PartySidebar gasId={selectedGas} party={selectedParty} onParty={setSelectedParty} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {/* Render Specific Party View if selected, otherwise render Unified Dashboard */}
                    {selectedParty === "Logistics" && <LogisticsView batches={batches} setBatches={setBatches} />}
                    {selectedParty === "Laboratory" && <LaboratoryView batches={batches} setBatches={setBatches} />}
                    {selectedParty === "Production" && <ProductionView batches={batches} setBatches={setBatches} />}
                    {selectedParty === "Distribution" && <DistributionView batches={batches} setBatches={setBatches} />}

                    {selectedParty === "Dashboard" && (
                        <>
                            {/* KPIs */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {kpis.map((k, i) => <KpiCard key={i} kpi={k} />)}
                            </div>

                            {/* Flow & Activity */}
                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Production Flow */}
                                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-6 text-base font-semibold text-slate-900">Production Flow</h2>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        {flowSteps.map((step, i) => {
                                            const Icon = step.icon;
                                            return (
                                                <React.Fragment key={step.label}>
                                                    <div className="flex flex-col items-center text-center flex-1 min-w-[80px]">
                                                        <div className={`grid h-12 w-12 place-items-center rounded-full ${step.tint}`}>
                                                            <Icon size={20} strokeWidth={2} />
                                                        </div>
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
                                            <span className="font-medium text-slate-700">Overall Progress</span>
                                            <span className="font-semibold text-blue-600">{progressPercent}%</span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progressPercent}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
                                        <button className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">View All</button>
                                    </div>
                                    <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[320px]">
                                        {activities.length === 0 ? (
                                            <li className="py-8 text-sm text-slate-500 text-center">No recent activity recorded</li>
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

                            {/* Bottom Row Charts */}
                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Top Materials / Suppliers */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-baseline gap-2">
                                        <h2 className="text-base font-semibold text-slate-900">
                                            {selectedGas === "all" ? "Top Materials" : "Top Suppliers"}
                                        </h2>
                                        <span className="text-xs text-slate-400">(This Month)</span>
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
                                                        <span className="flex items-center gap-2 text-slate-700">
                                                            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                                                            {m.name}
                                                        </span>
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

                                {/* Production Overview */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-3 flex items-baseline gap-2">
                                        <h2 className="text-base font-semibold text-slate-900">Weekly Overview</h2>
                                        <span className="text-xs text-slate-400">(Last 7 Days)</span>
                                    </div>
                                    <div className="h-[260px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={productionSeries} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
                                                <Line type="monotone" dataKey="received" name="Received" stroke="#93bbfd" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "#93bbfd" }} />
                                                <Line type="monotone" dataKey="completed" name="Completed" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Batch Status */}
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
                                                        <span className="flex items-center gap-2 text-slate-700">
                                                            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                                                            {b.name}
                                                        </span>
                                                        <span className="text-slate-500">
                                                            <span className="font-semibold text-slate-900">{b.value}</span> ({totalBatch > 0 ? ((b.value / totalBatch) * 100).toFixed(1) : 0}%)
                                                        </span>
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