import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FlaskConical,
    Hourglass,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    Download,
    Plus,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Calendar,
    X,
    FileText,
    User,
    Beaker,
    Droplets,
    Thermometer,
    Wind,
} from "lucide-react";

export default function LaboratoryDashboard() {
    const navigate = useNavigate();
    const [samples, setSamples] = useState([]);
    const [selectedSample, setSelectedSample] = useState(null);
    const [showDetailsPanel, setShowDetailsPanel] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [activeTab, setActiveTab] = useState("All Samples");

    const itemsPerPage = 10;

    useEffect(() => {
        fetchSamples();
    }, []);

    const fetchSamples = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:5000/api/batches?party=laboratory", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                // Transform batches to samples format
                const samplesData = data.map((batch, index) => ({
                    id: `SMP-2505-${String(18 - index).padStart(4, "0")}`,
                    batchId: batch.lotId,
                    material: batch.gasId,
                    type: "Gas",
                    receivedDate: new Date(batch.date).toLocaleString(),
                    status: batch.status === "pending" ? "Pending" :
                        batch.status === "testing" ? "In Analysis" :
                            batch.status === "approved" || batch.status === "ready" ? "Approved" : "Rejected",
                    progress: batch.status === "pending" ? 0 :
                        batch.status === "testing" ? Math.floor(Math.random() * 60 + 40) : 100,
                    supplier: batch.supplier,
                    quantity: batch.quantity,
                    analyst: "Fatima Zahra",
                    tests: {
                        purity: batch.labResults?.purity || null,
                        moisture: batch.labResults?.h2o || null,
                        oilContent: batch.labResults?.co || null,
                        impurities: batch.labResults?.co2 || null,
                    }
                }));
                setSamples(samplesData);
            } else if (res.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
        } catch (err) {
            console.error("Failed to fetch samples", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (sample) => {
        setSelectedSample(sample);
        setShowDetailsPanel(true);
    };

    const handleApprove = async (sampleId) => {
        const token = localStorage.getItem("token");
        const batch = samples.find(s => s.id === sampleId);
        if (batch) {
            await fetch(`http://localhost:5000/api/batches/${batch.batchId}/lab`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    purity: 99.5 + Math.random() * 0.4,
                    co: Math.random() * 3,
                    co2: Math.random() * 200,
                    h2o: Math.random() * 50,
                }),
            });
            fetchSamples();
        }
    };

    const handleReject = async (sampleId) => {
        const token = localStorage.getItem("token");
        const batch = samples.find(s => s.id === sampleId);
        if (batch) {
            await fetch(`http://localhost:5000/api/batches/${batch.batchId}/reject`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSamples();
        }
    };

    const filteredSamples = samples.filter((sample) => {
        const matchesSearch =
            sample.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sample.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sample.material.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All Status" || sample.status === statusFilter;
        const matchesType = typeFilter === "All Types" || sample.type === typeFilter;
        const matchesTab = activeTab === "All Samples" ||
            (activeTab === "Pending" && sample.status === "Pending") ||
            (activeTab === "In Analysis" && sample.status === "In Analysis") ||
            (activeTab === "Approved" && sample.status === "Approved") ||
            (activeTab === "Rejected" && sample.status === "Rejected") ||
            (activeTab === "Completed" && sample.progress === 100);

        return matchesSearch && matchesStatus && matchesType && matchesTab;
    });

    const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
    const paginatedSamples = filteredSamples.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const kpis = {
        received: samples.length,
        pending: samples.filter(s => s.status === "Pending").length,
        approved: samples.filter(s => s.status === "Approved").length,
        rejected: samples.filter(s => s.status === "Rejected").length,
        avgTime: 45,
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm font-medium">Loading laboratory data...</span>
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
                        <h1 className="text-lg font-bold text-slate-900">Laboratory</h1>
                        <p className="text-xs text-slate-500">Analyze and manage raw material samples</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search batch, sample, material..."
                            className="h-10 w-72 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
                        />
                    </div>
                    <button className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                        <FileText className="h-5 w-5" />
                        <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            8
                        </span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="text-right">
                            <div className="text-sm font-semibold text-slate-900">Admin</div>
                            <div className="text-xs text-slate-500">Super Administrator</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 grid place-items-center font-bold">
                            A
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] p-4">
                    <nav className="space-y-1">
                        {[
                            { icon: FileText, label: "Dashboard", active: false },
                            { icon: FileText, label: "Raw Materials", active: false },
                            { icon: FlaskConical, label: "Laboratory", active: true },
                            { icon: FileText, label: "Production", active: false },
                            { icon: Droplets, label: "Filling", active: false },
                            { icon: FileText, label: "Warehouse", active: false },
                            { icon: FileText, label: "Distribution", active: false },
                            { icon: FileText, label: "Reports", active: false },
                            { icon: User, label: "Users", active: false },
                            { icon: FileText, label: "Settings", active: false },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Beaker className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Quality is our priority</h3>
                                <p className="text-xs text-slate-600 mt-1">Every analysis ensures safety and reliability</p>
                            </div>
                        </div>
                        <button className="w-full mt-3 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">
                            View Quality Policy
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mb-6">
                        <div></div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
                                <Download className="h-4 w-4" />
                                Export Report
                            </button>
                            <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                                <Plus className="h-4 w-4" />
                                New Analysis
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <FlaskConical className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-600">Samples Received</div>
                                    <div className="text-2xl font-bold text-slate-900 mt-0.5">{kpis.received}</div>
                                    <div className="text-xs text-blue-600 mt-2 font-semibold">today</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <Hourglass className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-600">Pending Analysis</div>
                                    <div className="text-2xl font-bold text-slate-900 mt-0.5">{kpis.pending}</div>
                                    <div className="text-xs text-amber-600 mt-2 font-semibold">awaiting</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-600">Approved</div>
                                    <div className="text-2xl font-bold text-slate-900 mt-0.5">{kpis.approved}</div>
                                    <div className="text-xs text-emerald-600 mt-2 font-semibold">today</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-600">Rejected</div>
                                    <div className="text-2xl font-bold text-slate-900 mt-0.5">{kpis.rejected}</div>
                                    <div className="text-xs text-red-600 mt-2 font-semibold">today</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-600">Avg. Analysis Time</div>
                                    <div className="text-2xl font-bold text-slate-900 mt-0.5">{kpis.avgTime} min</div>
                                    <div className="text-xs text-purple-600 mt-2 font-semibold">this month</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl border border-slate-200 mb-4">
                        <div className="flex items-center gap-6 px-6 border-b border-slate-200">
                            {["All Samples", "Pending", "In Analysis", "Completed", "Approved", "Rejected"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-slate-600 hover:text-slate-900"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="p-4 flex items-center gap-3 flex-wrap">
                            <div className="flex-1 min-w-[260px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by batch no., material..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-600 focus:outline-none"
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>In Analysis</option>
                                <option>Approved</option>
                                <option>Rejected</option>
                            </select>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-600 focus:outline-none"
                            >
                                <option>All Types</option>
                                <option>Gas</option>
                                <option>Liquid</option>
                                <option>Solid</option>
                            </select>
                            <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>May 1 - May 28, 2025</span>
                            </div>
                            <button className="flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
                                <Filter className="h-4 w-4" />
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Sample ID</th>
                                        <th className="px-6 py-4">Batch / Lot No.</th>
                                        <th className="px-6 py-4">Material Name</th>
                                        <th className="px-6 py-4">Material Type</th>
                                        <th className="px-6 py-4">Received Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Analysis Progress</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedSamples.map((sample) => (
                                        <tr key={sample.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900">
                                                {sample.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{sample.batchId}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{sample.material}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{sample.type}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{sample.receivedDate}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sample.status === "Approved"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : sample.status === "Rejected"
                                                            ? "bg-red-50 text-red-700"
                                                            : sample.status === "In Analysis"
                                                                ? "bg-blue-50 text-blue-700"
                                                                : "bg-amber-50 text-amber-700"
                                                        }`}
                                                >
                                                    {sample.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${sample.progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                                                                }`}
                                                            style={{ width: `${sample.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-slate-600 w-8">{sample.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(sample)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                            <div className="text-sm text-slate-500">
                                Showing <span className="font-medium text-slate-700">1</span> to{" "}
                                <span className="font-medium text-slate-700">
                                    {Math.min(itemsPerPage, filteredSamples.length)}
                                </span>{" "}
                                of <span className="font-medium text-slate-700">{filteredSamples.length}</span>{" "}
                                entries
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`h-8 w-8 flex items-center justify-center rounded-md text-sm font-medium ${currentPage === page
                                            ? "bg-blue-600 text-white"
                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sample Details Panel */}
                {showDetailsPanel && selectedSample && (
                    <aside className="w-96 bg-white border-l border-slate-200 p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-semibold text-slate-900">Sample Details</h2>
                            <button
                                onClick={() => setShowDetailsPanel(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${selectedSample.status === "Approved"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : selectedSample.status === "Rejected"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-blue-50 text-blue-700"
                                    }`}
                            >
                                {selectedSample.status === "In Analysis" ? "In Analysis" : selectedSample.status}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Sample ID</div>
                                <div className="text-sm font-bold text-slate-900 font-mono">{selectedSample.id}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Batch / Lot No.</div>
                                <div className="text-sm font-medium text-slate-900">{selectedSample.batchId}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Material Name</div>
                                <div className="text-sm font-medium text-slate-900">{selectedSample.material}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Material Type</div>
                                <div className="text-sm font-medium text-slate-900">{selectedSample.type}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Supplier</div>
                                <div className="text-sm font-medium text-slate-900">{selectedSample.supplier}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Received Date</div>
                                <div className="text-sm font-medium text-slate-900">{selectedSample.receivedDate}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Quantity Received</div>
                                <div className="text-sm font-medium text-slate-900">{selectedSample.quantity} kg</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Analyst</div>
                                <div className="text-sm font-medium text-slate-900">{selectedSample.analyst}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Analysis Started</div>
                                <div className="text-sm font-medium text-slate-900">May 28, 2025 10:00 AM</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-3">Tests in Progress</div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-slate-700">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Purity
                                        </span>
                                        <span className="text-emerald-600 text-xs">✓</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-slate-700">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Moisture
                                        </span>
                                        <span className="text-emerald-600 text-xs">✓</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-slate-700">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            Oil Content
                                        </span>
                                        <span className="text-blue-600 text-xs">In Progress</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-slate-700">
                                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                            Impurities
                                        </span>
                                        <span className="text-slate-500 text-xs">Pending</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-slate-700">
                                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                            Odor
                                        </span>
                                        <span className="text-slate-500 text-xs">Pending</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedSample.status === "In Analysis" && (
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => handleApprove(selectedSample.id)}
                                    className="flex-1 h-10 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(selectedSample.id)}
                                    className="flex-1 h-10 rounded-lg border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50"
                                >
                                    Reject
                                </button>
                            </div>
                        )}

                        <button className="w-full mt-4 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                            View Full Analysis
                        </button>
                    </aside>
                )}
            </div>

            {/* Bottom User Profile */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 grid place-items-center font-bold text-xs">
                        FZ
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-900">Fatima Zahra</div>
                        <div className="text-xs text-slate-500">Laboratory Analyst</div>
                    </div>
                </div>
            </div>
        </div>
    );
}