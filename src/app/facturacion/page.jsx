"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';


import { useAuth } from '@/components/AuthContext';


export default function ListaFacturas() {
  const { role } = useAuth();
  const router = useRouter();
const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from('facturas')
        .select('id, fecha, total, estado, email, telefono, orden_id, cliente_id')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error cargando facturas:', error, JSON.stringify(error));
        setErrorMsg('No se pudieron cargar las facturas');
        setFacturas([]);
      } else {
        setFacturas(data || []);
      }

      setLoading(false);
    };

    fetchFacturas();
  }, []);

  // Redirigir técnicos a /ordenes solo en efecto
  useEffect(() => {
    if (role === 'tecnico' && router) {
      router.replace('/');
    }
  }, [role, router]);
  

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-red-600">
        Cargando facturas...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-red-600">
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Facturación</h1>
        <Link href="/facturacion/nueva-factura">
          <Button>Nueva Factura</Button>
        </Link>
      </div>

      {facturas.length === 0 ? (
        <div className="text-center py-8 text-stone-500">
          No hay facturas registradas.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="py-3 px-2">#</th>
                <th className="py-3 px-2">Fecha</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Estado</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Teléfono</th>
                <th className="py-3 px-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map(factura => (
                <tr
                  key={factura.id}
                  className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                >
                  <td className="py-2 px-2 font-bold">#{factura.id}</td>
                  <td className="py-2 px-2">
                    {factura.fecha
                      ? new Date(factura.fecha).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="py-2 px-2 font-bold text-green-600">
                    S/ {factura.total}
                  </td>
                  <td className="py-2 px-2">{factura.estado}</td>
                  <td className="py-2 px-2">{factura.email}</td>
                  <td className="py-2 px-2">{factura.telefono}</td>
                  <td className="py-2 px-2">
                    <Link
                      href={`/facturacion/${factura.id}`}
                      className="text-blue-600 underline text-sm"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}







