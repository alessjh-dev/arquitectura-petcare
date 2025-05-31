// src/app/settings/page.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Save, Pencil, Camera, Trash2, Calendar, Scale, PawPrint } from 'lucide-react';
import Image from 'next/image';

interface PetData {
  id?: string;
  name: string;
  photo: string | null; // Base64 string (con prefijo data:image/...)
  birthDate: string | null;
  weight: number | null;
  breed: string | null;
  recordedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [petData, setPetData] = useState<PetData>({
    name: '',
    photo: null,
    birthDate: null,
    weight: null,
    breed: null,
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);

    async function fetchPetData() {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) {
          if (res.status === 404) {
            setError(null);
            setPetData({ name: '', photo: null, birthDate: null, weight: null, breed: null }); // Resetear si no hay mascota
            return;
          }
          throw new Error('Error al obtener datos de la mascota');
        }
        const data: PetData = await res.json();
        setPetData({
          name: data?.name ?? '',
          photo: data?.photo ?? null, // Ya viene con el prefijo base64 del backend
          birthDate: data?.birthDate ?? null,
          weight: data?.weight ?? null,
          breed: data?.breed ?? null,
          id: data.id,
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchPetData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPetData(prev => ({ ...prev, [id]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPetData(prev => ({ ...prev, [id]: value === '' ? null : parseFloat(value) }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validación básica del tamaño del archivo (ej. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Por favor, selecciona una imagen de menos de 5MB.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result ya es una Data URL (ej. data:image/png;base64,...)
        setPetData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPetData(prev => ({ ...prev, photo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Limpia el input de archivo
    }
  };

  const handleSaveChanges = async () => {
    if (!petData.name.trim()) {
      alert('El nombre de la mascota no puede estar vacío.');
      return;
    }
    try {
      setLoading(true);
      const dataToSend = {
        name: petData.name,
        photo: petData.photo, // petData.photo ya es un string base64 con el prefijo o null
        birthDate: petData.birthDate,
        weight: petData.weight,
        breed: petData.breed,
      };

      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar datos');
      }

      const updatedData: PetData = await res.json();
      setPetData({
        name: updatedData.name,
        photo: updatedData.photo, // Ya viene base64 con prefijo
        birthDate: updatedData.birthDate,
        weight: updatedData.weight,
        breed: updatedData.breed,
        id: updatedData.id,
      });

      alert('¡Configuración actualizada correctamente!');
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
            <p>Cargando datos de mascota...</p>
          ) : error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="text-sm"
                    disabled={loading}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        // Opcional: recargar datos originales si se cancela la edición
                        // fetchPetData();
                      }}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleSaveChanges}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={loading || !petData.name.trim()}
                    >
                      <Save className="mr-2 h-5 w-5" />
                      Guardar Cambios
                    </Button>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-card">
                <Label htmlFor="petPhoto" className="text-lg font-medium">Foto de tu Mascota</Label>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary shadow-lg bg-muted flex items-center justify-center">
                  {petData.photo ? (
                    <Image src={petData.photo} alt="Foto de la Mascota" fill style={{ objectFit: 'cover' }} className="transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <Camera size={48} className="text-muted-foreground" />
                  )}
                </div>
                <Input
                  id="petPhoto"
                  type="file"
                  accept="image/jpeg,image/png"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="w-full max-w-xs cursor-pointer"
                  disabled={loading || !isEditing}
                />
                {petData.photo && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="mt-2"
                    disabled={loading || !isEditing}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar Foto
                  </Button>
                )}
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="flex items-center gap-2 text-lg font-medium">
                    <PawPrint size={20} /> Nombre
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={petData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className={isEditing ? 'border-primary' : 'opacity-70 cursor-not-allowed'}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="birthDate" className="flex items-center gap-2 text-lg font-medium">
                    <Calendar size={20} /> Fecha de Nacimiento
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={petData.birthDate || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className={isEditing ? 'border-primary' : 'opacity-70 cursor-not-allowed'}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="flex items-center gap-2 text-lg font-medium">
                    <Scale size={20} /> Peso (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={petData.weight ?? ''}
                    onChange={handleNumberInputChange}
                    disabled={!isEditing || loading}
                    className={isEditing ? 'border-primary' : 'opacity-70 cursor-not-allowed'}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="breed" className="flex items-center gap-2 text-lg font-medium">
                    <PawPrint size={20} /> Raza
                  </Label>
                  <Input
                    id="breed"
                    type="text"
                    value={petData.breed ?? ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className={isEditing ? 'border-primary' : 'opacity-70 cursor-not-allowed'}
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}