import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, AlertCircle, CheckCircle, TrendingUp, Users, Activity } from 'lucide-react';

export default function TicketingSystem() {
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'technical',
    assignee: ''
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const saved = localStorage.getItem('tickets');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTickets(parsed.map(t => ({
        ...t,
        createdAt: new Date(t.createdAt),
        resolvedAt: t.resolvedAt ? new Date(t.resolvedAt) : null,
        slaDeadline: new Date(t.slaDeadline)
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);

  const getSLA = (priority) => {
    const slaHours = { critical: 4, high: 8, medium: 24, low: 72 };
    return slaHours[priority] || 24;
  };

  const calculateSLADeadline = (createdAt, priority) => {
    const deadline = new Date(createdAt);
    deadline.setHours(deadline.getHours() + getSLA(priority));
    return deadline;
  };

  const addTicket = () => {
    if (!formData.title.trim()) return;
    const now = new Date();
    const newTicket = {
      id: Date.now(),
      ...formData,
      status: 'open',
      createdAt: now,
      slaDeadline: calculateSLADeadline(now, formData.priority),
      resolvedAt: null
    };
    setTickets([newTicket, ...tickets]);
    setFormData({ title: '', description: '', priority: 'medium', category: 'technical', assignee: '' });
  };

  const updateTicketStatus = (id, newStatus) => {
    setTickets(tickets.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          resolvedAt: newStatus === 'resolved' ? new Date() : null
        };
      }
      return t;
    }));
  };

  const deleteTicket = (id) => {
    setTickets(tickets.filter(t => t.id !== id));
  };

  const getTimeDiff = (date1, date2) => {
    const diff = Math.abs(date2 - date1);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const isSLABreached = (ticket) => {
    if (ticket.status === 'resolved') {
      return ticket.resolvedAt > ticket.slaDeadline;
    }
    return new Date() > ticket.slaDeadline;
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'open') return t.status === 'open';
    if (filter === 'in_progress') return t.status === 'in_progress';
    if (filter === 'resolved') return t.status === 'resolved';
    if (filter === 'breached') return isSLABreached(t);
    return true;
  });

  // KPI Calculations
  const kpis = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    breached: tickets.filter(t => isSLABreached(t)).length,
    slaCompliance: tickets.filter(t => t.status === 'resolved').length > 0
      ? ((tickets.filter(t => t.status === 'resolved' && !isSLABreached(t)).length / 
         tickets.filter(t => t.status === 'resolved').length) * 100).toFixed(1)
      : 100,
    avgResolutionTime: tickets.filter(t => t.status === 'resolved').length > 0
      ? (tickets.filter(t => t.status === 'resolved').reduce((acc, t) => {
          const diff = getTimeDiff(t.createdAt, t.resolvedAt);
          return acc + diff.hours + (diff.minutes / 60);
        }, 0) / tickets.filter(t => t.status === 'resolved').length).toFixed(1)
      : 0
  };

  const priorityColors = {
    critical: 'bg-red-100 border-red-300 text-red-800',
    high: 'bg-orange-100 border-orange-300 text-orange-800',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    low: 'bg-green-100 border-green-300 text-green-800'
  };

  const statusColors = {
    open: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    resolved: 'bg-green-500'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-gradient">
            IT Ticketing System
          </h1>
          <p className="text-gray-600 text-lg">Track, manage, and resolve support tickets with SLA monitoring</p>
        </div>

        {/* KPI Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Activity size={20} className="animate-pulse" />
              <span className="text-sm font-semibold">Total Tickets</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{kpis.total}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Clock size={20} />
              <span className="text-sm font-semibold">Open</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{kpis.open}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-yellow-100">
            <div className="flex items-center gap-2 text-yellow-600 mb-2">
              <Users size={20} />
              <span className="text-sm font-semibold">In Progress</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{kpis.inProgress}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-green-100">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle size={20} />
              <span className="text-sm font-semibold">Resolved</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{kpis.resolved}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-red-100">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle size={20} className={kpis.breached > 0 ? 'animate-pulse' : ''} />
              <span className="text-sm font-semibold">SLA Breached</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{kpis.breached}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-100">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <TrendingUp size={20} />
              <span className="text-sm font-semibold">SLA Compliance</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{kpis.slaCompliance}%</p>
          </div>
        </div>

        {/* Ticket Creation Form */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-indigo-100 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">Create New Ticket</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ticket Title"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({...formData, assignee: e.target.value})}
              placeholder="Assign to IT Staff (e.g., John Smith)"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Ticket Description"
            rows="3"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 mb-4"
          />
          <div className="flex flex-wrap gap-4">
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="low">Low Priority (72h SLA)</option>
              <option value="medium">Medium Priority (24h SLA)</option>
              <option value="high">High Priority (8h SLA)</option>
              <option value="critical">Critical (4h SLA)</option>
            </select>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="technical">Technical Issue</option>
              <option value="access">Access Request</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="network">Network</option>
            </select>
            <button
              onClick={addTicket}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              Create Ticket
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {['all', 'open', 'in_progress', 'resolved', 'breached'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap font-semibold transform hover:scale-105 ${
                filter === f
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow hover:shadow-md border border-gray-200'
              }`}
            >
              {f.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.map(ticket => {
            const breached = isSLABreached(ticket);
            const timeRemaining = ticket.status !== 'resolved' 
              ? getTimeDiff(new Date(), ticket.slaDeadline)
              : getTimeDiff(ticket.createdAt, ticket.resolvedAt);
            
            return (
              <div
                key={ticket.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-l-4 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                  breached ? 'border-red-500 animate-pulse-slow' : 'border-indigo-500'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">#{ticket.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${priorityColors[ticket.priority]}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${statusColors[ticket.status]}`}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {breached && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white flex items-center gap-1 shadow-lg animate-pulse">
                          <AlertCircle size={12} />
                          SLA BREACHED
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{ticket.title}</h4>
                    {ticket.description && (
                      <p className="text-gray-600 mb-3 leading-relaxed">{ticket.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="bg-gray-50 px-3 py-1 rounded-full">Category: <strong className="text-indigo-600">{ticket.category}</strong></span>
                      <span className="bg-gray-50 px-3 py-1 rounded-full">
                        Assignee: <strong className="text-purple-600">{ticket.assignee || 'Unassigned'}</strong>
                      </span>
                      <span className="bg-gray-50 px-3 py-1 rounded-full">Created: <strong>{ticket.createdAt.toLocaleString()}</strong></span>
                      <span className="bg-gray-50 px-3 py-1 rounded-full">SLA: <strong className="text-blue-600">{getSLA(ticket.priority)}h</strong></span>
                      {ticket.status === 'resolved' ? (
                        <span className="bg-green-50 px-3 py-1 rounded-full text-green-700">
                          Resolved in: <strong>{timeRemaining.hours}h {timeRemaining.minutes}m</strong>
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full ${breached ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                          {breached ? 'Overdue by:' : 'Time remaining:'} 
                          <strong> {timeRemaining.hours}h {timeRemaining.minutes}m</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTicket(ticket.id)}
                    className="text-red-500 hover:text-red-700 transition-all duration-200 ml-4 hover:scale-110"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => updateTicketStatus(ticket.id, 'open')}
                    disabled={ticket.status === 'open'}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow hover:shadow-md transform hover:scale-105 disabled:transform-none"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                    disabled={ticket.status === 'in_progress'}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow hover:shadow-md transform hover:scale-105 disabled:transform-none"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                    disabled={ticket.status === 'resolved'}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow hover:shadow-md transform hover:scale-105 disabled:transform-none"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            );
          })}
          {filteredTickets.length === 0 && (
            <div className="text-center py-20 bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg border border-indigo-100">
              <div className="animate-bounce mb-4">
                <Activity size={48} className="mx-auto text-indigo-400" />
              </div>
              <p className="text-gray-500 text-xl font-semibold">No tickets found</p>
              <p className="text-gray-400 text-sm mt-2">Create a ticket to get started</p>
            </div>
          )}
        </div>

        {/* Additional KPI Info */}
        {kpis.resolved > 0 && (
          <div className="mt-8 bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-xl p-6 border border-purple-100 hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-blue-100">
                <p className="text-gray-600 text-sm mb-2 font-semibold">Average Resolution Time</p>
                <p className="text-3xl font-bold text-blue-600">{kpis.avgResolutionTime} hours</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-purple-100">
                <p className="text-gray-600 text-sm mb-2 font-semibold">SLA Compliance Rate</p>
                <p className="text-3xl font-bold text-purple-600">{kpis.slaCompliance}%</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-green-100">
                <p className="text-gray-600 text-sm mb-2 font-semibold">Resolution Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {((kpis.resolved / kpis.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}