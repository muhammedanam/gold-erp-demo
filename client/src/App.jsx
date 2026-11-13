import React, { useState } from 'react';
import { GoldRateProvider } from './context/GoldRateContext';
import { RateTicker } from './components/layout/RateTicker';
import { Sidebar } from './components/layout/Sidebar';
import { POSBilling } from './components/pos/POSBilling';
import { InventoryManager } from './components/inventory/InventoryManager';
import { OldGoldEvaluator } from './components/oldgold/OldGoldEvaluator';
import { ChitManager } from './components/chit/ChitManager';
import { KarigarLedger } from './components/karigar/KarigarLedger';
import { InvoiceList } from './components/pos/InvoiceList';
import { DayBookReport } from './components/reports/DayBookReport';
import { RateBoardModal } from './components/rates/RateBoardModal';
import { ShowroomDisplayBoard } from './components/rates/ShowroomDisplayBoard';

function MainApp() {
  const [currentTab, setCurrentTab] = useState('pos');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      {/* Showroom Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Kerala Live Gold Rate Ticker */}
        <RateTicker />

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'pos' && <POSBilling />}
            {currentTab === 'inventory' && <InventoryManager />}
            {currentTab === 'old-gold' && <OldGoldEvaluator />}
            {currentTab === 'chit' && <ChitManager />}
            {currentTab === 'karigar' && <KarigarLedger />}
            {currentTab === 'invoices' && <InvoiceList />}
            {currentTab === 'day-book' && <DayBookReport />}
          </div>
        </main>
      </div>

      {/* Modals & Fullscreen Overlays */}
      <RateBoardModal />
      <ShowroomDisplayBoard />
    </div>
  );
}

export default function App() {
  return (
    <GoldRateProvider>
      <MainApp />
    </GoldRateProvider>
  );
}

