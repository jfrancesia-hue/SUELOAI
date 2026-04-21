'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, MapPin, DollarSign, ShoppingCart } from 'lucide-react';
import { Button, Input, Badge, EmptyState, LoadingSpinner } from '@/components/ui';

interface Listing {
  id: string;
  seller_id: string;
  project_id: string;
  tokens_offered: number;
  tokens_remaining: number;
  price_per_token: number;
  currency: string;
  status: string;
  notes: string | null;
  project?: {
    id: string;
    title: string;
    location: string;
    expected_return: number;
    token_price: number;
  } | null;
  seller?: { full_name: string | null } | null;
}

export default function SecondaryMarketPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'market' | 'mine'>('market');
  const [buyForm, setBuyForm] = useState<{ listingId: string | null; tokens: string }>({
    listingId: null,
    tokens: '',
  });

  const fetchListings = async () => {
    setLoading(true);
    const url = tab === 'mine' ? '/api/secondary/listings?mine=true' : '/api/secondary/listings';
    const res = await fetch(url);
    const data = await res.json();
    setListings(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [tab]);

  const handleBuy = async (listingId: string) => {
    const tokens = Number(buyForm.tokens);
    if (!tokens || tokens <= 0) {
      alert('Cantidad inválida');
      return;
    }
    const res = await fetch('/api/secondary/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, tokens_to_buy: tokens }),
    });
    const body = await res.json();
    if (res.ok) {
      alert('✅ Compra ejecutada. Los tokens ya están en tu cartera.');
      setBuyForm({ listingId: null, tokens: '' });
      fetchListings();
    } else {
      alert(`Error: ${body.error}`);
    }
  };

  const handleCancel = async (listingId: string) => {
    if (!confirm('¿Cancelar este listing?')) return;
    await fetch(`/api/secondary/listings?id=${listingId}`, { method: 'DELETE' });
    fetchListings();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-surface-900">Mercado secundario</h1>
        <p className="text-surface-600 mt-1">
          Compra-venta de fracciones entre inversores. Fee de plataforma: 1% (paga el comprador).
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('market')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'market'
              ? 'bg-brand-500 text-white'
              : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
          }`}
        >
          🛒 Ofertas disponibles
        </button>
        <button
          onClick={() => setTab('mine')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'mine'
              ? 'bg-brand-500 text-white'
              : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
          }`}
        >
          📋 Mis listings
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title={tab === 'mine' ? 'Sin listings propios' : 'Sin ofertas abiertas'}
          description={
            tab === 'mine'
              ? 'Todavía no pusiste fracciones en venta. Andá a tu cartera y listá tokens que querés vender.'
              : 'En este momento no hay ofertas en el mercado secundario.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => {
            const isMine = tab === 'mine';
            return (
              <div key={l.id} className="card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-surface-900">
                      {l.project?.title || 'Proyecto'}
                    </h3>
                    {l.project?.location && (
                      <p className="text-sm text-surface-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {l.project.location}
                      </p>
                    )}
                  </div>
                  <Badge variant={l.status === 'open' ? 'success' : 'default'}>{l.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-surface-500">Tokens disponibles</p>
                    <p className="font-medium text-surface-900">{l.tokens_remaining}</p>
                  </div>
                  <div>
                    <p className="text-surface-500">Precio por token</p>
                    <p className="font-medium text-surface-900">
                      {l.currency} {Number(l.price_per_token).toFixed(2)}
                    </p>
                  </div>
                  {l.project?.expected_return != null && (
                    <div>
                      <p className="text-surface-500">Retorno esperado</p>
                      <p className="font-medium text-brand-500">
                        {Number(l.project.expected_return)}%
                      </p>
                    </div>
                  )}
                  {l.project?.token_price != null && (
                    <div>
                      <p className="text-surface-500">Precio primario</p>
                      <p className="font-medium text-surface-600">
                        USD {Number(l.project.token_price).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {l.notes && <p className="text-sm text-surface-600 italic">"{l.notes}"</p>}

                {!isMine ? (
                  buyForm.listingId === l.id ? (
                    <div className="flex gap-2 items-end">
                      <Input
                        label="Cantidad"
                        type="number"
                        value={buyForm.tokens}
                        onChange={(e) =>
                          setBuyForm({ listingId: l.id, tokens: e.target.value })
                        }
                        className="flex-1"
                        max={l.tokens_remaining}
                      />
                      <Button size="sm" onClick={() => handleBuy(l.id)}>
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setBuyForm({ listingId: null, tokens: '' })}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      icon={ShoppingCart}
                      onClick={() => setBuyForm({ listingId: l.id, tokens: '' })}
                      className="w-full"
                    >
                      Comprar
                    </Button>
                  )
                ) : (
                  l.status === 'open' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleCancel(l.id)}
                      className="w-full"
                    >
                      Cancelar listing
                    </Button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
