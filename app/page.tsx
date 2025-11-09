'use client';

import React, { useState, useEffect } from 'react';
import { Download, Trophy, Users, Ticket, Plus, ChevronRight } from 'lucide-react';

// Types
interface Draw {
  id: number;
  name: string;
  totalTickets: number;
  status: string;
  createdAt: string;
}

interface DrawTicket {
  id: number;
  ticketNumber: number;
  purchased: boolean;
  buyerName: string | null;
}

interface Winner {
  rank: number;
  ticket: {
    ticketNumber: number;
    buyerName: string;
  };
}

interface DrawStats {
  purchasedTickets: number;
  availableTickets: number;
}

// API Base URL
const API_BASE_URL = 'http://localhost:3001';

// Main App Component
export default function AICRaffleApp() {
  const [currentView, setCurrentView] = useState<'home' | 'draw'>('home');
  const [selectedDrawId, setSelectedDrawId] = useState<number | null>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/draws`);
      const data = await response.json();
      setDraws(data);
    } catch (error) {
      console.error('Error fetching draws:', error);
    }
  };

  const handleCreateDraw = async (name: string, totalTickets: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/draws`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, totalTickets }),
      });
      
      if (response.ok) {
        await fetchDraws();
      }
    } catch (error) {
      console.error('Error creating draw:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDraw = (drawId: number) => {
    setSelectedDrawId(drawId);
    setCurrentView('draw');
  };

  if (currentView === 'draw' && selectedDrawId) {
    return (
      <DrawDetailView 
        drawId={selectedDrawId} 
        onBack={() => {
          setCurrentView('home');
          setSelectedDrawId(null);
          fetchDraws();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">AIC</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Ushindi Seme <span className="text-yellow-400">Prize Draw</span>
            </h1>
          </div>
          <p className="text-purple-200 text-lg">HONEST • TRANSPARENT • TICKET RAFFLE</p>
        </div>

        {/* Create New Draw Section */}
        <CreateDrawSection onCreateDraw={handleCreateDraw} loading={loading} />

        {/* All Draws Section */}
        <div className="bg-purple-800/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-600/30">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">All Draws</h2>
          </div>

          <div className="space-y-4">
            {draws.length === 0 ? (
              <div className="text-center py-12 text-purple-300">
                <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No draws created yet. Create your first draw above!</p>
              </div>
            ) : (
              draws.map((draw) => (
                <DrawCard 
                  key={draw.id} 
                  draw={draw} 
                  onSelect={() => handleSelectDraw(draw.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Draw Section Component
function CreateDrawSection({ onCreateDraw, loading }: { onCreateDraw: (name: string, tickets: number) => void; loading: boolean }) {
  const [drawName, setDrawName] = useState('');
  const [totalTickets, setTotalTickets] = useState('100');

  const handleCreateClick = () => {
    if (drawName.trim() && totalTickets) {
      onCreateDraw(drawName, parseInt(totalTickets));
      setDrawName('');
      setTotalTickets('100');
    }
  };

  return (
    <div className="bg-purple-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-purple-600/30">
      <div className="flex items-center gap-3 mb-6">
        <Plus className="w-6 h-6 text-white" />
        <h2 className="text-2xl font-bold text-white">Create New Draw</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white mb-2 font-medium">Draw Name</label>
          <input
            type="text"
            value={drawName}
            onChange={(e) => setDrawName(e.target.value)}
            placeholder="e.g., Christmas Raffle 2024"
            className="w-full px-4 py-3 rounded-lg bg-purple-900/50 border border-purple-600/50 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
          <label className="block text-white mb-2 font-medium">Total Tickets</label>
          <input
            type="number"
            value={totalTickets}
            onChange={(e) => setTotalTickets(e.target.value)}
            min="1"
            max="10000"
            placeholder="100"
            className="w-full px-4 py-3 rounded-lg bg-purple-900/50 border border-purple-600/50 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="md:col-span-2">
          <button
            onClick={handleCreateClick}
            disabled={loading || !drawName.trim() || !totalTickets}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Draw'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Draw Card Component
function DrawCard({ draw, onSelect }: { draw: Draw; onSelect: () => void }) {
  const statusColor = draw.status === 'open' ? 'text-green-400' : 'text-gray-400';
  const statusBg = draw.status === 'open' ? 'bg-green-400/20' : 'bg-gray-400/20';

  return (
    <button
      onClick={onSelect}
      className="w-full bg-purple-700/30 hover:bg-purple-700/50 backdrop-blur-sm rounded-xl p-6 border border-purple-600/30 transition-all flex items-center justify-between group"
    >
      <div className="text-left">
        <h3 className="text-xl font-bold text-white mb-2">{draw.name}</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-purple-300">{draw.totalTickets} tickets</span>
          <span className={`${statusColor} ${statusBg} px-3 py-1 rounded-full capitalize`}>
            {draw.status}
          </span>
        </div>
      </div>
      <ChevronRight className="w-6 h-6 text-purple-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </button>
  );
}

// Draw Detail View Component
function DrawDetailView({ drawId, onBack }: { drawId: number; onBack: () => void }) {
  const [draw, setDraw] = useState<Draw | null>(null);
  const [tickets, setTickets] = useState<DrawTicket[]>([]);
  const [stats, setStats] = useState<DrawStats | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [numberOfWinners, setNumberOfWinners] = useState('1');
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showWinners, setShowWinners] = useState(false);
  const [currentDrawingNumber, setCurrentDrawingNumber] = useState<number>(0);
  const [revealedWinners, setRevealedWinners] = useState<Winner[]>([]);

  useEffect(() => {
    fetchDrawDetails();
  }, [drawId]);

  const fetchDrawDetails = async () => {
    try {
      const [drawRes, ticketsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/draws/${drawId}`),
        fetch(`${API_BASE_URL}/draws/${drawId}/tickets`),
        fetch(`${API_BASE_URL}/draws/${drawId}/stats`),
      ]);

      const drawData = await drawRes.json();
      const ticketsData = await ticketsRes.json();
      const statsData = await statsRes.json();

      setDraw(drawData);
      setTickets(ticketsData);
      setStats(statsData);

      if (drawData.status === 'completed' && drawData.winners?.length > 0) {
        setWinners(drawData.winners);
        setShowWinners(true);
      }
    } catch (error) {
      console.error('Error fetching draw details:', error);
    }
  };

  const handleTicketClick = (ticketNumber: number, isPurchased: boolean) => {
    if (isPurchased) return;

    setSelectedTickets(prev =>
      prev.includes(ticketNumber)
        ? prev.filter(t => t !== ticketNumber)
        : [...prev, ticketNumber]
    );
  };

  const handlePurchase = async () => {
    if (!buyerName.trim() || selectedTickets.length === 0) return;

    try {
      const response = await fetch(`${API_BASE_URL}/draws/${drawId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          ticketNumbers: selectedTickets,
        }),
      });

      if (response.ok) {
        setSelectedTickets([]);
        setBuyerName('');
        await fetchDrawDetails();
      }
    } catch (error) {
      console.error('Error purchasing tickets:', error);
    }
  };

  const runAutomatedDrawSequence = async (winnersData: Winner[]) => {
    const purchasedTickets = tickets.filter(t => t.purchased);

    for (let i = 0; i < winnersData.length; i++) {
      // Reset state for new draw
      setRevealedWinners([]);
      setIsDrawing(true);

      // Animate random numbers for 3 seconds
      const animationDuration = 3000;
      const animationInterval = 100;
      const iterations = animationDuration / animationInterval;
      
      for (let j = 0; j < iterations; j++) {
        const randomTicket = purchasedTickets[Math.floor(Math.random() * purchasedTickets.length)];
        setCurrentDrawingNumber(randomTicket.ticketNumber);
        await new Promise(resolve => setTimeout(resolve, animationInterval));
      }

      // Show the actual winner
      setCurrentDrawingNumber(winnersData[i].ticket.ticketNumber);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stop animation and reveal this winner
      setIsDrawing(false);
      setRevealedWinners([winnersData[i]]);
      
      // Show winner for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Clear the revealed winners state to proceed to final page
    setRevealedWinners([]);
  };

  const handleRunDraw = async () => {
    if (!numberOfWinners || parseInt(numberOfWinners) < 1) return;

    try {
      const response = await fetch(`${API_BASE_URL}/draws/${drawId}/run-draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numberOfWinners: parseInt(numberOfWinners),
        }),
      });

      if (response.ok) {
        const winnersData = await response.json();
        setWinners(winnersData);
        
        // Start the automated sequence
        await runAutomatedDrawSequence(winnersData);
        
        // After all draws complete, show final winners page
        setShowWinners(true);
        await fetchDrawDetails();
      }
    } catch (error) {
      console.error('Error running draw:', error);
      setIsDrawing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/draws/${drawId}/export`);
      const data = await response.json();
      
      // Filter only purchased tickets
      const purchasedTickets = data.allTickets.filter((t: any) => t.purchased);
      
      // Create Excel-compatible HTML table
      const htmlTable = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>${data.drawName}</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #6B21A8; color: white; font-weight: bold; }
            .info { margin-bottom: 20px; }
            .info p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>${data.drawName} - Results</h1>
          <div class="info">
            <p><strong>Draw Date:</strong> ${new Date(data.drawDate).toLocaleString()}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Total Tickets:</strong> ${data.totalTickets}</p>
            <p><strong>Purchased Tickets:</strong> ${data.purchasedTickets}</p>
          </div>
          
          <h2>Winners</h2>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Ticket Number</th>
                <th>Winner Name</th>
                <th>Winning Time</th>
              </tr>
            </thead>
            <tbody>
              ${data.winners.map((w: any) => `
                <tr>
                  <td>${w.rank}</td>
                  <td>${w.ticketNumber}</td>
                  <td>${w.buyerName}</td>
                  <td>${new Date(w.winningTime).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>Purchased Tickets</h2>
          <table>
            <thead>
              <tr>
                <th>Ticket Number</th>
                <th>Buyer Name</th>
                <th>Purchased At</th>
              </tr>
            </thead>
            <tbody>
              ${purchasedTickets.map((t: any) => `
                <tr>
                  <td>${t.ticketNumber}</td>
                  <td>${t.buyerName}</td>
                  <td>${new Date(t.purchasedAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      // Create blob and download as .xls file
      const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.drawName.replace(/[^a-z0-9]/gi, '_')}_Results.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  if (!draw || !stats) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  if (isDrawing || revealedWinners.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col items-center justify-center p-8">
        {isDrawing ? (
          <DrawingAnimation currentNumber={currentDrawingNumber} />
        ) : (
          <WinnerReveal winner={revealedWinners[0]} />
        )}
      </div>
    );
  }

  if (showWinners) {
    return <WinnersDisplay winners={winners} drawName={draw.name} onBack={onBack} onExport={handleExport} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={onBack}
          className="text-white mb-6 hover:text-yellow-400 transition-colors flex items-center gap-2"
        >
          ← Back to All Draws
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{draw.name}</h1>
          <div className="flex items-center justify-center gap-6 text-lg">
            <span className="text-green-400">✓ {stats.purchasedTickets} Purchased</span>
            <span className="text-purple-300">○ {stats.availableTickets} Available</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Purchase Tickets */}
          <div className="lg:col-span-1">
            <div className="bg-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Purchase Tickets</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Buyer Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-4 py-3 rounded-lg bg-purple-900/50 border border-purple-600/50 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="bg-purple-900/50 rounded-lg p-4">
                  <p className="text-purple-300 text-sm mb-2">Selected: {selectedTickets.length} ticket(s)</p>
                  {selectedTickets.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTickets.map(num => (
                        <span key={num} className="bg-yellow-500 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                          #{num}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={!buyerName.trim() || selectedTickets.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                Purchase Tickets
              </button>

              {draw.status === 'open' && stats.purchasedTickets > 0 && (
                <>
                  <div className="border-t border-purple-600/30 pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <h3 className="text-lg font-bold text-white">Run Draw</h3>
                    </div>

                    <div className="mb-4">
                      <label className="block text-white mb-2 text-sm font-medium">Number of Winners</label>
                      <input
                        type="number"
                        value={numberOfWinners}
                        onChange={(e) => setNumberOfWinners(e.target.value)}
                        min="1"
                        max={stats.purchasedTickets}
                        className="w-full px-4 py-3 rounded-lg bg-purple-900/50 border border-purple-600/50 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>

                    <button
                      onClick={handleRunDraw}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      🎲 Run Draw
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Tickets Grid */}
          <div className="lg:col-span-2">
            <div className="bg-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30">
              <div className="flex items-center gap-3 mb-6">
                <Ticket className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">All Tickets</h2>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleTicketClick(ticket.ticketNumber, ticket.purchased)}
                    disabled={ticket.purchased}
                    className={`
                      aspect-square rounded-lg font-bold text-sm transition-all
                      ${ticket.purchased
                        ? 'bg-green-600/80 text-white cursor-not-allowed border border-green-500'
                        : selectedTickets.includes(ticket.ticketNumber)
                        ? 'bg-yellow-500 text-purple-900 scale-110 shadow-lg'
                        : 'bg-purple-700/50 text-white hover:bg-purple-600 hover:scale-105 border border-purple-500/50'
                      }
                    `}
                  >
                    {ticket.ticketNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Drawing Animation Component
function DrawingAnimation({ currentNumber }: { currentNumber: number }) {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-white mb-12">AIC USHINDI-SEME</h1>
      
      <div className="relative w-96 h-96 mx-auto mb-8">
        {/* Glass ball */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/30 to-purple-600/30 backdrop-blur-sm border-4 border-purple-400/50">
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent"></div>
        </div>
        
        {/* Bouncing number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-purple-900 text-4xl font-bold">{currentNumber}</span>
          </div>
        </div>
      </div>

      <p className="text-yellow-400 text-2xl font-bold animate-pulse">Drawing...</p>
    </div>
  );
}

// Winner Reveal Component (single winner display)
function WinnerReveal({ winner }: { winner: Winner }) {
  return (
    <div className="text-center animate-fade-in">
      <h1 className="text-5xl font-bold text-white mb-8">🎉 WINNER! 🎉</h1>
      
      <div className="bg-gradient-to-r from-purple-800/80 to-purple-700/80 backdrop-blur-sm rounded-2xl p-12 border-l-8 border-yellow-400 max-w-2xl">
        <div className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <Trophy className="w-12 h-12 text-purple-900" />
          </div>
          <div className="text-center">
            <div className="text-8xl font-bold text-yellow-400 mb-4">
              #{winner.rank}
            </div>
            <h3 className="text-4xl font-bold text-white mb-2">
              Ticket #{winner.ticket.ticketNumber}
            </h3>
            <p className="text-2xl text-purple-200">{winner.ticket.buyerName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Winners Display Component
function WinnersDisplay({ winners, drawName, onBack, onExport }: { 
  winners: Winner[]; 
  drawName: string; 
  onBack: () => void;
  onExport: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            🎉 WINNERS! 🎉
          </h1>
        </div>

        <div className="space-y-4 mb-8">
          {winners.map((winner) => (
            <div
              key={winner.rank}
              className="bg-gradient-to-r from-purple-800/80 to-purple-700/80 backdrop-blur-sm rounded-2xl p-8 border-l-8 border-yellow-400 flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-purple-900" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Ticket #{winner.ticket.ticketNumber}
                  </h3>
                  <p className="text-purple-200">Winner: {winner.ticket.buyerName}</p>
                </div>
              </div>
              <div className="text-6xl font-bold text-yellow-400">
                #{winner.rank}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onExport}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
          <button
            onClick={onBack}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}