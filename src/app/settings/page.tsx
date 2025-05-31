// src/app/settings/page.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Save, Pencil, Camera, Trash2 } from 'lucide-react';
import Image from 'next/image'; // Importamos Image de next/image para optimización

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [petName, setPetName] = useState<string>('');
  const [petPhoto, setPetPhoto] = useState<string | null>(null); // Base64 string for display
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Referencia para el input de archivo

  useEffect(() => {
    setMounted(true);

    async function fetchPetData() {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) {
          if (res.status === 404) {
            // No hay mascota, se creará al guardar
            setPetName('');
            setPetPhoto(null);
            setError(null);
            return;
          }
          throw new Error('Error al obtener datos de la mascota');
        }
        const data = await res.json();
        setPetName(data?.name ?? '');
        setPetPhoto(data?.photo ?? null); // La foto ya viene en base64 desde la API
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchPetData();
  }, []);

  const handlePetNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPetName(event.target.value);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Almacena la cadena base64 para previsualización y envío
        setPetPhoto(reader.result as string);
      };
      reader.readAsDataURL(file); // Lee el archivo como una URL de datos (base64)
    }
  };

  const handleRemovePhoto = () => {
    setPetPhoto(null); // Elimina la foto del estado
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Limpia el input de archivo
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      // Extrae solo la parte base64 de la cadena (después de 'data:image/png;base64,')
      const photoBase64 = petPhoto ? petPhoto.split(',')[1] : null;

      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: petName,
          photo: photoBase64, // Enviamos la cadena base64 (o null)
        }),
      });

      if (!res.ok) throw new Error('Error al guardar datos');

      const updatedData = await res.json();
      setPetName(updatedData.name);
      setPetPhoto(updatedData.photo); // La API devuelve la foto ya en base64

      alert('¡Configuración actualizada correctamente!');
      setIsEditingName(false); // Sale del modo edición de nombre
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
            <p>Cargando datos de mascota...</p>
          ) : error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : (
            <div className="space-y-4">
              {/* Sección de Foto de la Mascota */}
              <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-card">
                <Label htmlFor="petPhoto" className="text-lg font-medium">Foto de tu Mascota</Label>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary shadow-lg bg-muted flex items-center justify-center">
                  {petPhoto ? (
                    <Image
                      src={petPhoto}
                      alt="Foto de la Mascota"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <Camera size={48} className="text-muted-foreground" />
                  )}
                </div>
                <Input
                  id="petPhoto"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="w-full max-w-xs cursor-pointer"
                  disabled={loading}
                />
                {petPhoto && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="mt-2"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar Foto
                  </Button>
                )}
              </div>

              {/* Sección de Nombre de la Mascota */}
              <div className="space-y-1.5 p-4 border rounded-lg bg-card">
                <Label htmlFor="petName" className="text-lg font-medium">Nombre de tu Mascota</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="petName"
                    type="text"
                    value={petName}
                    onChange={handlePetNameChange}
                    disabled={!isEditingName || loading}
                    className={isEditingName ? 'border-primary' : 'opacity-70 cursor-not-allowed'}
                  />
                  {!isEditingName ? (
                    <Button
                      variant="ghost"
                      onClick={() => setIsEditingName(true)}
                      className="text-sm"
                      disabled={loading}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  ) : null}
                </div>
                {isEditingName && (
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
            </div>
          )}
        </section>
      </div>
    </div>
  );
}