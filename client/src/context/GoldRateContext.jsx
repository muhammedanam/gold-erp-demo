import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRates, updateRates as apiUpdateRates } from '../api';

const GoldRateContext = createContext(null);

export function GoldRateProvider({ children }) {
  const [rates, setRates] = useState({
    rate_date: new Date().toISOString().split('T')[0],
    gold_22k_gram: 7150.00,
    gold_22k_pavan: 57200.00,
    gold_24k_gram: 7800.00,
    gold_18k_gram: 5850.00,
    silver_gram: 98.00,
    silver_kg: 98000.00,
    old_gold_purchase_rate: 6800.00
  });
  const [loading, setLoading] = useState(true);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isShowroomBoardOpen, setIsShowroomBoardOpen] = useState(false);

  const fetchRates = async () => {
    try {
      const res = await getRates();
      if (res.success && res.data) {
        setRates(res.data);
      }
    } catch (err) {
      console.warn('Using local rates cache:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const saveRates = async (newRates) => {
    try {
      const res = await apiUpdateRates(newRates);
      if (res.success && res.data) {
        setRates(res.data);
        return { success: true };
      }
    } catch (err) {
      // Optimistic update for local demo
      const rate22k = Number(newRates.gold_22k_gram);
      const updated = {
        ...rates,
        ...newRates,
        gold_22k_gram: rate22k,
        gold_22k_pavan: rate22k * 8.0,
        gold_24k_gram: Number(newRates.gold_24k_gram || rate22k * (24 / 22)),
        gold_18k_gram: Number(newRates.gold_18k_gram || rate22k * (18 / 22)),
        silver_gram: Number(newRates.silver_gram || 98),
        silver_kg: Number(newRates.silver_gram || 98) * 1000,
        old_gold_purchase_rate: Number(newRates.old_gold_purchase_rate || rate22k - 350)
      };
      setRates(updated);
      return { success: true };
    }
  };

  return (
    <GoldRateContext.Provider value={{
      rates,
      loading,
      refreshRates: fetchRates,
      saveRates,
      isRateModalOpen,
      setIsRateModalOpen,
      isShowroomBoardOpen,
      setIsShowroomBoardOpen
    }}>
      {children}
    </GoldRateContext.Provider>
  );
}

export function useGoldRates() {
  const context = useContext(GoldRateContext);
  if (!context) throw new Error('useGoldRates must be used within GoldRateProvider');
  return context;
}

