import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Truck, Search, Bell, CheckCircle2, Users, FileText, Package,
} from "lucide-react";

export default function DistributionDashboard() {
    const navigate = useNavigate();
    const [batches, setBatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:5000/api/batches?party=distribution", {
                headers: { Authorization: `Bearer ${token}` },
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

    const dispatchBatch = async (lotId: string) => {
        const token = localStorage.getItem("token");
        // Update batch status to dispatched
        await fetch(`http://localhost:5000/api/batches/${lotId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "dispatched" }),
        });
        fetchBatches();
    };

    const filteredBatches = batches.filter(batch =>
        batch.lotId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.client.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <span className="text-sm font-medium">Loading distribution data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#00205B] flex items-center justify-center text-white font-bold text-xs">
                        AL
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Distribution Dashboard</h1>
                        <p className="text-xs text-slate-500">Shipping & Logistics</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search shipments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
                        />
                    </div>
                    <button className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            2
                        </span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="text-right">
                            <div className="text-sm font-semibold text-slate-900">Distribution Team</div>
                            <div className="text-xs text-slate-500">Logistics Manager</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 grid place-items-center font-bold">
                            DT
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Truck className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">{batches.length}</div>
                                <div className="text-xs text-slate-600 mt-0.5">Ready to Ship</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">
                                    {batches.reduce((sum, b) => sum + parseInt(b.quantity?.replace(/[^0-9]/g, '') || "0"), 0)}
                                </div>
                                <div className="text-xs text-slate-600 mt-0.5">Total Weight (kg)</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">98.5%</div>
                                <div className="text-xs text-slate-600 mt-0.5">On-Time Delivery</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Users className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">{new Set(batches.map(b => b.client)).size}</div>
                                <div className="text-xs text-slate-600 mt-0.5">Active Clients</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distribution Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Lot ID</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBatches.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No batches ready for distribution.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBatches.map((batch) => (
                                        <tr key={batch._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-slate-900">{batch.lotId}</td>
                                            <td className="px-6 py-4 text-slate-700">{batch.client}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{batch.quantity} kg</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                                                    Ready to Ship
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => dispatchBatch(batch.lotId)}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-[#00205B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#001a4a]"
                                                >
                                                    Dispatch
                                                    <Truck className="h-3 w-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}