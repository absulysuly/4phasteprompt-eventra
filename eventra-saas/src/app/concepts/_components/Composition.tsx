"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Variant, GridType, categories, useVariantStyles, CircleTile, HexTile, PillTile, ReachPreview, PaymentMethods } from './ConceptsCommon';

function GridLanding({ variant, grid }: { variant: Variant; grid: GridType }) {
  const s = useVariantStyles(variant);
  const Tile = grid === 'circular' ? CircleTile : grid === 'hex' ? HexTile : PillTile;
  return (
    <div className={`p-4 rounded-2xl ${s.panel}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Category Grid</div>
        <div className={`px-3 py-1.5 rounded-full text-white bg-gradient-to-r ${s.accent}`}>Landing</div>
      </div>
      {grid === 'pill' ? (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
          {categories.map((c, idx) => (
            <div key={c.key} className="snap-center">
              <Tile label={c.name} icon={c.icon} variant={variant} selected={idx === 2} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {categories.map((c, idx) => (
            <Tile key={c.key} label={c.name} icon={c.icon} variant={variant} selected={idx === 2} />
          ))}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-3">Hover/Focus: scale 1.02; Press: depress 1–2px. Keyboard: arrow keys to move focus; Enter to open modal.</div>
    </div>
  );
}

function SubcategoryModalDemo({ variant, grid }: { variant: Variant; grid: GridType }) {
  const s = useVariantStyles(variant);
  const Tile = grid === 'circular' ? CircleTile : grid === 'hex' ? HexTile : PillTile;
  const subs = new Array(12).fill(0).map((_, i) => ({ name: `Sub ${i+1}`, icon: '🏷️' }));
  return (
    <div className={`p-4 rounded-2xl ${s.panel}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Category Detail Modal</div>
        <div className={`px-3 py-1.5 rounded-full text-white bg-gradient-to-r ${s.accent}`}>Modal</div>
      </div>
      <div className="text-sm text-gray-600 mb-3">Swipe down to close; swipe left/right to paginate when more than 9 items.</div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {subs.slice(0, 9).map((sbc, idx) => (
          <Tile key={idx} label={sbc.name} icon={sbc.icon} variant={variant} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        {[0,1].map(p => (
          <div key={p} className={`w-2 h-2 rounded-full ${p===0? 'bg-indigo-500':'bg-gray-300'}`}></div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-3">Accessibility: modal has focus trap, Esc to close, pagination buttons visible for keyboard.</div>
    </div>
  );
}

function SubcategoryInteractiveModal({ variant, grid, onClose }: { variant: Variant; grid: GridType; onClose: () => void }) {
  const s = useVariantStyles(variant);
  const Tile = grid === 'circular' ? CircleTile : grid === 'hex' ? HexTile : PillTile;
  const subs = new Array(20).fill(0).map((_, i) => ({ name: `Sub ${i + 1}`, icon: '🏷️' }));
  const pageSize = 9;
  const pageCount = Math.ceil(subs.length / pageSize);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const startRef = useRef<{ x: number; y: number } | null>(null);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const minSwipe = 50;

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.targetTouches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
    lastRef.current = { x: t.clientX, y: t.clientY };
  }
  function handleTouchMove(e: React.TouchEvent) {
    const t = e.targetTouches[0];
    lastRef.current = { x: t.clientX, y: t.clientY };
  }
  function handleTouchEnd() {
    if (!startRef.current || !lastRef.current) return;
    const dx = lastRef.current.x - startRef.current.x;
    const dy = lastRef.current.y - startRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    // Vertical swipe down to close
    if (dy > minSwipe && absY > absX) {
      onClose();
      return;
    }
    // Horizontal left/right to paginate
    if (absX > minSwipe && absX > absY) {
      if (dx < 0 && page < pageCount - 1) setPage(page + 1);
      if (dx > 0 && page > 0) setPage(page - 1);
    }
    startRef.current = null;
    lastRef.current = null;
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && page < pageCount - 1) setPage(p => p + 1);
      if (e.key === 'ArrowLeft' && page > 0) setPage(p => p - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, page, pageCount]);

  const items = subs.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`absolute inset-x-0 bottom-0 sm:inset-y-8 sm:mx-auto sm:max-w-xl p-4 rounded-t-2xl sm:rounded-2xl ${s.panel}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-gray-300" aria-hidden />
        <div className="flex items-center justify-between mb-2">
          <div id="modal-title" className="text-lg font-semibold">Category Detail</div>
          <button onClick={onClose} aria-label="Close" className="rounded-full w-8 h-8 grid place-items-center hover:bg-gray-100">✕</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {items.map((it, idx) => (
            <div key={idx} onClick={() => setSelected(it.name)}>
              <Tile label={it.name} icon={it.icon} variant={variant} />
            </div>
          ))}
        </div>
        {selected && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="px-2 py-1 rounded-full bg-gray-100 border">{selected}</div>
            <button onClick={() => setSelected(null)} aria-label="Clear selection" className="text-gray-600 hover:text-gray-900">×</button>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className="px-2 py-1 rounded border text-sm disabled:opacity-50">‹ Prev</button>
          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i===page? 'bg-indigo-500':'bg-gray-300'}`} />
            ))}
          </div>
          <button disabled={page===pageCount-1} onClick={()=>setPage(p=>Math.min(pageCount-1,p+1))} className="px-2 py-1 rounded border text-sm disabled:opacity-50">Next ›</button>
        </div>
        <div className="mt-2 text-xs text-gray-500">Swipe down to close • Swipe left/right to paginate • Esc to close • Arrow keys to paginate</div>
      </div>
    </div>
  );
}

function SponsorshipCheckout({ variant }: { variant: Variant }) {
  function VoucherModal({ onClose }: { onClose: () => void }) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="bg-white rounded-xl w-full max-w-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Request Voucher</div>
            <button onClick={onClose} aria-label="Close" className="text-gray-600 hover:text-gray-900">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Name</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm">Mobile (+964)</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="07xxxxxxxxx" />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm">Amount (IQD)</label>
              <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm">Intended Use</label>
              <select className="mt-1 w-full rounded-lg border px-3 py-2"><option>Sponsorship</option><option>Ticket</option></select>
            </div>
            <div>
              <label className="text-sm">Preferred Method</label>
              <select className="mt-1 w-full rounded-lg border px-3 py-2"><option>FIB</option><option>QI Card</option><option>FAST PAY</option><option>Bank</option><option>COD</option></select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">Address (optional)</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">Approval time: 24–48h • يجب الموافقة خلال ٢٤–٤٨ ساعة • پەسەندکردن ٢٤–٤٨ کاتژمێر</div>
          <div className="mt-3 flex items-center justify-between">
            <label className="text-xs text-gray-700 inline-flex items-center gap-2"><input type="checkbox" className="rounded" /> I agree to T&Cs</label>
            <button className="px-4 py-2 rounded-lg bg-gray-900 text-white">Submit</button>
          </div>
        </div>
      </div>
    );
  }
  const s = useVariantStyles(variant);
  const [placement, setPlacement] = useState<'Stories'|'Featured'|'Carousel'>('Featured');
  const [budget, setBudget] = useState(50);
  const [duration, setDuration] = useState(7);
  const [showVoucher, setShowVoucher] = useState(false);
  const [showBusiness, setShowBusiness] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  return (
    <div className={`p-4 rounded-2xl ${s.panel}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Sponsorship & Payment</div>
        <div className={`px-3 py-1.5 rounded-full text-white bg-gradient-to-r ${s.accent}`}>Checkout</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold mb-2">Placement</div>
            <div className="grid grid-cols-3 gap-2">
              {(['Stories','Featured','Carousel'] as const).map(p => (
                <button key={p} onClick={() => setPlacement(p)} className={`px-3 py-2 rounded-lg ${placement===p ? 'bg-gray-900 text-white' : s.card}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Budget (IQD)</label>
              <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={budget} onChange={e=>setBudget(Number(e.target.value)||0)} />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (days)</label>
              <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={duration} onChange={e=>setDuration(Number(e.target.value)||0)} />
            </div>
          </div>
          <ReachPreview placement={placement} budget={budget} duration={duration} />
          <div>
            <div className="text-sm font-semibold mb-2">Payment Methods</div>
            <PaymentMethods variant={variant} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-semibold">Voucher</label>
              <div className="flex gap-2">
                <input placeholder="Enter voucher / أدخل القسيمة / فۆچەر" className="flex-1 rounded-lg border px-3 py-2" />
                <button className="px-3 py-2 rounded-lg bg-gray-900 text-white">Redeem</button>
              </div>
              <button className="text-xs text-blue-600 hover:underline" onClick={()=>setShowVoucher(true)}>Request Voucher</button>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Saved Payment Methods</label>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`${s.card} px-2 py-1 rounded-md`}>QI •••• 1234</span>
                <span className={`${s.card} px-2 py-1 rounded-md`}>FAST PAY •••• 77</span>
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-xl p-4 ${s.card}`}>
          <div className="text-sm text-gray-600 mb-2">Live Preview</div>
          <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">Ad Preview</div>
          <div className="mt-3 text-xs text-gray-500">Provider tooltips describe inputs: QI (redirect), FAST PAY (mobile), FIB (gateway), Bank (upload receipt), COD (address).</div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-3">Business Linking: add bank/IBAN; status shown as Unverified/Pending/Verified. Admin panel: approve vouchers, reconcile transfers, schedule payouts.</div>
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-1.5 rounded-lg border text-xs" onClick={()=>setShowBusiness(v=>!v)}>Toggle Business Linking</button>
        <button className="px-3 py-1.5 rounded-lg border text-xs" onClick={()=>setShowAdmin(v=>!v)}>Toggle Admin Panel</button>
      </div>
      {showBusiness && (
        <div className={`mt-3 p-3 rounded-xl ${s.card}`}>
          <div className="text-sm font-semibold mb-2">Business Account Linking</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <input placeholder="Bank Name" className="rounded-lg border px-3 py-2" />
            <input placeholder="IBAN / Account" className="rounded-lg border px-3 py-2" />
            <input placeholder="Beneficiary" className="rounded-lg border px-3 py-2" />
            <input placeholder="Branch" className="rounded-lg border px-3 py-2" />
            <input placeholder="SWIFT (optional)" className="rounded-lg border px-3 py-2" />
          </div>
          <div className="mt-2 text-xs"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Pending</span> Verification</div>
        </div>
      )}
      {showAdmin && (
        <div className={`mt-3 p-3 rounded-xl ${s.card}`}>
          <div className="text-sm font-semibold mb-2">Admin / Merchant Panel</div>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="font-semibold">Vouchers</div>
              <ul className="mt-1 space-y-1">
                <li className="flex items-center justify-between"><span>#VC-1043 (IQD 50k)</span><span className="flex gap-1"><button className="text-green-600">Approve</button><button className="text-red-600">Reject</button></span></li>
                <li className="flex items-center justify-between"><span>#VC-1044 (IQD 120k)</span><span className="flex gap-1"><button className="text-green-600">Approve</button><button className="text-red-600">Reject</button></span></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold">Bank Transfers</div>
              <ul className="mt-1 space-y-1">
                <li className="flex items-center justify-between"><span>IQD 75k • REF 7A9C</span><button className="text-blue-600">Mark reconciled</button></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold">Payouts</div>
              <div className="mt-1">Next: 12 Oct • Queued: IQD 1.2m</div>
              <button className="mt-1 px-2 py-1 rounded border text-xs" disabled>Run now</button>
            </div>
          </div>
        </div>
      )}
      {showVoucher && <VoucherModal onClose={()=>setShowVoucher(false)} />}
    </div>
  );
}

export default function CompositionScreens({ variant, grid, interactive }: { variant: Variant; grid: GridType; interactive?: boolean }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GridLanding variant={variant} grid={grid} />
        {interactive ? (
          <div className="p-4 rounded-2xl bg-white border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">Category Detail Modal (Interactive)</div>
              <button onClick={()=>setShowModal(true)} className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm">Open Modal</button>
            </div>
            <div className="text-sm text-gray-600">This demo opens a real modal with swipe gestures and pagination.</div>
          </div>
        ) : (
          <SubcategoryModalDemo variant={variant} grid={grid} />
        )}
        <SponsorshipCheckout variant={variant} />
      </div>
      {interactive && showModal && (
        <SubcategoryInteractiveModal variant={variant} grid={grid} onClose={()=>setShowModal(false)} />
      )}
    </>
  );
}