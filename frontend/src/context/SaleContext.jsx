import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getActiveCoupons } from '../services/couponService';

const SaleContext = createContext(null);

export const SaleProvider = ({ children }) => {
    const [saleCoupons, setSaleCoupons] = useState([]);
    const location = useLocation();

    useEffect(() => {
        async function loadSaleCoupons() {
            try {
                const result = await getActiveCoupons();
                if (result.success && result.coupons) {
                    const sitewideCoupons = result.coupons.filter(c => Number(c.minimumOrderAmount) === 0);
                    setSaleCoupons(sitewideCoupons);
                }
            } catch {
                console.warn('Failed to load sale coupons');
            }
        }

        loadSaleCoupons();

        window.addEventListener('focus', loadSaleCoupons);
        return () => window.removeEventListener('focus', loadSaleCoupons);
    }, [location.pathname]);

    function getBestSaleForPrice(price) {
        if (!price || saleCoupons.length === 0) return null;

        let best = null;

        for (let i = 0; i < saleCoupons.length; i++) {
            const coupon = saleCoupons[i];
            let saving = 0;

            if (coupon.discountPercentage > 0) {
                saving = (price * coupon.discountPercentage) / 100;
            } else if (coupon.discountAmount > 0) {
                saving = coupon.discountAmount;
            }

            saving = Math.min(saving, price);

            if (!best || saving > best.saving) {
                best = {
                    discountedPrice: price - saving,
                    saving,
                    pct: coupon.discountPercentage > 0 ? coupon.discountPercentage : null,
                    label: coupon.code
                };
            }
        }

        return best && best.saving > 0 ? best : null;
    }

    return (
        <SaleContext.Provider value={{ getBestSaleForPrice, hasSale: saleCoupons.length > 0 }}>
            {children}
        </SaleContext.Provider>
    );
};

export const useSale = () => {
    const ctx = useContext(SaleContext);
    if (!ctx) throw new Error('useSale must be used inside SaleProvider');
    return ctx;
};

export default SaleContext;
