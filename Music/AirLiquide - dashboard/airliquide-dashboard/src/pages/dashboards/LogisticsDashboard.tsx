import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Package,
    FlaskConical,
    CheckCircle2,
    Truck,
    Droplet,
    XCircle,
    Search,
    Filter,
    Plus,
    Upload,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Calendar,
    X,
    FileText,
    User,
    Download,
} from "lucide-react";

export default function LogisticsDashboard() {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showDetailsPanel, setShowDetailsPanel] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [supplierFilter, setSupplierFilter] = useState("All Suppliers");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    const [newBatch, setNewBatch] = useState({
        lotId: "",
        gasId: "O2",
        quantity: "",
        supplier: "",
        client: "Internal",
    });

    const itemsPerPage = 10;

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:5000/api/batches", {
                headers: { Authorization: `Bearer ${token}` },
            });
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

    const handleAddBatch = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:5000/api/batches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...newBatch,
                    party: "logistics",
                    status: "received",
                }),
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewBatch({ lotId: "", gasId: "O2", quantity: "", supplier: "", client: "Internal" });
                fetchBatches();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleViewDetails = (batch) => {
        setSelectedBatch(batch);
        setShowDetailsPanel(true);
    };

    const filteredBatches = batches.filter((batch) => {
        const matchesSearch =
            batch.lotId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            batch.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
            batch.gasId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All Status" || batch.status === statusFilter.toLowerCase();
        const matchesType = typeFilter === "All Types" || batch.gasId === typeFilter;
        const matchesSupplier = supplierFilter === "All Suppliers" || batch.supplier === supplierFilter;

        return matchesSearch && matchesStatus && matchesType && matchesSupplier;
    });

    const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
    const paginatedBatches = filteredBatches.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const kpis = {
        total: batches.length,
        inLab: batches.filter((b) => b.party === "laboratory").length,
        approved: batches.filter((b) => b.status === "approved" || b.status === "ready").length,
        inProduction: batches.filter((b) => b.party === "production").length,
        readyForFilling: batches.filter((b) => b.party === "conditionnement").length,
        rejected: batches.filter((b) => b.status === "rejected").length,
    };

    const uniqueSuppliers = [...new Set(batches.map((b) => b.supplier))];
    const uniqueGases = [...new Set(batches.map((b) => b.gasId))];

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm font-medium">Loading dashboard data...</span>
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
                        <h1 className="text-lg font-bold text-slate-900">Raw Materials</h1>
                        <p className="text-xs text-slate-500">Manage and track all received raw materials</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search batch, material, supplier..."
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
                            { icon: Package, label: "Dashboard", active: false },
                            { icon: Package, label: "Raw Materials", active: true },
                            { icon: FlaskConical, label: "Laboratory", active: false },
                            { icon: Truck, label: "Production", active: false },
                            { icon: Droplet, label: "Filling", active: false },
                            { icon: Package, label: "Warehouse", active: false },
                            { icon: Truck, label: "Distribution", active: false },
                            { icon: FileText, label: "Reports", active: false },
                            { icon: User, label: "Users", active: false },
                            { icon: Package, label: "Settings", active: false },
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
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Safety is our priority</h3>
                                <p className="text-xs text-slate-600 mt-1">Work safely today for a better tomorrow</p>
                            </div>
                        </div>
                        <button className="w-full mt-3 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">
                            View Safety Guidelines
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
                                <Upload className="h-4 w-4" />
                                Import Materials
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                Register New Material
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-6 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{kpis.total}</div>
                                    <div className="text-xs text-slate-600 mt-0.5">Total Received</div>
                                    <div className="text-xs text-emerald-600 mt-2 font-semibold">▲ 20% vs last month</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <FlaskConical className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{kpis.inLab}</div>
                                    <div className="text-xs text-slate-600 mt-0.5">In Laboratory</div>
                                    <div className="text-xs text-amber-600 mt-2 font-semibold">▲ 33% vs last month</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{kpis.approved}</div>
                                    <div className="text-xs text-slate-600 mt-0.5">Approved</div>
                                    <div className="text-xs text-emerald-600 mt-2 font-semibold">▲ 12% vs last month</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <Truck className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{kpis.inProduction}</div>
                                    <div className="text-xs text-slate-600 mt-0.5">In Production</div>
                                    <div className="text-xs text-red-600 mt-2 font-semibold">▼ 16% vs last month</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                    <Droplet className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{kpis.readyForFilling}</div>
                                    <div className="text-xs text-slate-600 mt-0.5">Ready for Filling</div>
                                    <div className="text-xs text-red-600 mt-2 font-semibold">▼ 10% vs last month</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{kpis.rejected}</div>
                                    <div className="text-xs text-slate-600 mt-0.5">Rejected</div>
                                    <div className="text-xs text-red-600 mt-2 font-semibold">▼ 50% vs last month</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex-1 min-w-[260px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by batch no., material, supplier..."
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
                                <option>received</option>
                                <option>pending</option>
                                <option>testing</option>
                                <option>ready</option>
                                <option>approved</option>
                                <option>rejected</option>
                            </select>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-600 focus:outline-none"
                            >
                                <option>All Types</option>
                                {uniqueGases.map((gas) => (
                                    <option key={gas} value={gas}>
                                        {gas}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={supplierFilter}
                                onChange={(e) => setSupplierFilter(e.target.value)}
                                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-600 focus:outline-none"
                            >
                                <option>All Suppliers</option>
                                {uniqueSuppliers.map((supplier) => (
                                    <option key={supplier} value={supplier}>
                                        {supplier}
                                    </option>
                                ))}
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
                                        <th className="px-6 py-4">Batch / Lot No.</th>
                                        <th className="px-6 py-4">Material Name</th>
                                        <th className="px-6 py-4">Material Type</th>
                                        <th className="px-6 py-4">Supplier</th>
                                        <th className="px-6 py-4">Received Date</th>
                                        <th className="px-6 py-4">Quantity</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedBatches.map((batch) => (
                                        <tr key={batch._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900">
                                                {batch.lotId}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{batch.gasId}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">Gas</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{batch.supplier}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(batch.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                {batch.quantity} kg
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${batch.status === "approved" || batch.status === "ready"
                                                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                                        : batch.status === "rejected"
                                                            ? "bg-red-50 text-red-700 ring-red-200"
                                                            : batch.status === "testing" || batch.party === "laboratory"
                                                                ? "bg-amber-50 text-amber-700 ring-amber-200"
                                                                : "bg-slate-100 text-slate-700 ring-slate-200"
                                                        }`}
                                                >
                                                    {batch.status === "approved" || batch.status === "ready"
                                                        ? "Approved"
                                                        : batch.status === "rejected"
                                                            ? "Rejected"
                                                            : batch.status === "testing" || batch.party === "laboratory"
                                                                ? "In Laboratory"
                                                                : batch.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(batch)}
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
                                    {Math.min(itemsPerPage, filteredBatches.length)}
                                </span>{" "}
                                of <span className="font-medium text-slate-700">{filteredBatches.length}</span>{" "}
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

                {/* Batch Details Panel */}
                {showDetailsPanel && selectedBatch && (
                    <aside className="w-96 bg-white border-l border-slate-200 p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-semibold text-slate-900">Batch Details</h2>
                            <button
                                onClick={() => setShowDetailsPanel(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${selectedBatch.status === "approved" || selectedBatch.status === "ready"
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                    : selectedBatch.status === "rejected"
                                        ? "bg-red-50 text-red-700 ring-red-200"
                                        : "bg-amber-50 text-amber-700 ring-amber-200"
                                    }`}
                            >
                                {selectedBatch.status === "approved" || selectedBatch.status === "ready"
                                    ? "Approved"
                                    : selectedBatch.status === "rejected"
                                        ? "Rejected"
                                        : "In Laboratory"}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Batch / Lot No.</div>
                                <div className="text-sm font-bold text-slate-900 font-mono">{selectedBatch.lotId}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Material Name</div>
                                <div className="text-sm font-medium text-slate-900">{selectedBatch.gasId}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Material Type</div>
                                <div className="text-sm font-medium text-slate-900">Gas</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Supplier</div>
                                <div className="text-sm font-medium text-slate-900">{selectedBatch.supplier}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Received Date</div>
                                <div className="text-sm font-medium text-slate-900">
                                    {new Date(selectedBatch.date).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Quantity Received</div>
                                <div className="text-sm font-medium text-slate-900">{selectedBatch.quantity} kg</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Unit</div>
                                <div className="text-sm font-medium text-slate-900">kg</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Received By</div>
                                <div className="text-sm font-medium text-slate-900">Logistics Team</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Source Document</div>
                                <div className="text-sm font-medium text-blue-600 flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    GRN-{selectedBatch.lotId}.pdf
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-500 mb-1">Notes</div>
                                <div className="text-sm text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    Material received in good condition.
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-6 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                            View Full Details
                        </button>
                    </aside>
                )}
            </div>

            {/* Add Material Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Register New Material</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleAddBatch} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Batch / Lot No.
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-600 focus:outline-none"
                                    value={newBatch.lotId}
                                    onChange={(e) => setNewBatch({ ...newBatch, lotId: e.target.value })}
                                    placeholder="e.g., RM-2505-011"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Material Type (Gas)
                                </label>
                                <select
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-600 focus:outline-none"
                                    value={newBatch.gasId}
                                    onChange={(e) => setNewBatch({ ...newBatch, gasId: e.target.value })}
                                >
                                    <option value="O2">Oxygen (O₂)</option>
                                    <option value="N2">Nitrogen (N₂)</option>
                                    <option value="CO2">Carbon Dioxide (CO₂)</option>
                                    <option value="N2O">Nitrous Oxide (N₂O)</option>
                                    <option value="MEOPA">MEOPA</option>
                                    <option value="AIR">Air Respirable</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Quantity (kg)
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-600 focus:outline-none"
                                    value={newBatch.quantity}
                                    onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                                    placeholder="e.g., 1250"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Supplier
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-600 focus:outline-none"
                                    value={newBatch.supplier}
                                    onChange={(e) => setNewBatch({ ...newBatch, supplier: e.target.value })}
                                    placeholder="e.g., Air Liquide Group"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="h-10 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                                >
                                    Register Material
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}