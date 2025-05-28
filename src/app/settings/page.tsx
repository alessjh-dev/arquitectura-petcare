'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button'; 
import { Input } from '@/components/ui/Input';   
import { Label } from '@/components/ui/Label';  
import { Save, Pencil } from 'lucide-react';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [petName, setPetName] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    async function fetchPetName() {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Error al obtener datos');
        const data = await res.json();
        setPetName(data?.name ?? '');
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchPetName();
  }, []);

  const handlePetNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPetName(event.target.value);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: petName, recordedAt: new Date().toISOString() }),
      });

      if (!res.ok) throw new Error('Error al guardar datos');

      alert('¡Nombre actualizado correctamente!');
      setIsEditing(false);
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto p-4 pb-24 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Configuración</h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Mi Mascota</h2>
          {loading ? (
            <p>Cargando nombre de mascota...</p>
          ) : error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="petName">Nombre de tu Mascota</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="petName"
                  type="text"
                  value={petName}
                  onChange={handlePetNameChange}
                  disabled={!isEditing}
                  className={isEditing ? 'border-primary' : 'opacity-70 cursor-not-allowed'}
                />
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="text-sm"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                ) : null}
              </div>
              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <Button
                    size="lg"
                    onClick={handleSaveChanges}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading}
                  >
                    <Save className="mr-2 h-5 w-5" />
                    Guardar Cambios
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}