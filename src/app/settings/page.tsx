// src/app/settings/page.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
// Asegúrate de que estos componentes existan en tu proyecto
// Por ejemplo, podrían ser componentes de Shadcn UI o personalizados
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
// Iconos de Lucide React
import { Save, Pencil, Camera, Trash2, Calendar, Scale, PawPrint } from 'lucide-react';
import Image from 'next/image';

// Interfaz para los datos de la mascota
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

// Componente principal de la página de configuración
export default function SettingsPage() {
  // Estado para verificar si el componente está montado en el cliente
  const [mounted, setMounted] = useState(false);
  // Estado para almacenar los datos de la mascota
  const [petData, setPetData] = useState<PetData>({
    name: '',
    photo: null,
    birthDate: null,
    weight: null,
    breed: null,
  });
  // Estado para controlar el modo de edición
  const [isEditing, setIsEditing] = useState<boolean>(false);
  // Estado para mostrar un indicador de carga
  const [loading, setLoading] = useState<boolean>(true);
  // Estado para manejar mensajes de error
  const [error, setError] = useState<string | null>(null);
  // Estado para mostrar mensajes de éxito o información al usuario
  const [message, setMessage] = useState<string | null>(null);
  // Referencia para el input de tipo file, para poder resetearlo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // useEffect para manejar el montaje del componente y la carga inicial de datos
  useEffect(() => {
    setMounted(true); // Indica que el componente está montado en el cliente

    // Función asíncrona para obtener los datos de la mascota
    async function fetchPetData() {
      try {
        setLoading(true); // Activa el estado de carga
        const res = await fetch('/api/data'); // Llama al endpoint GET /api/data
        if (!res.ok) {
          if (res.status === 404) {
            // Si no se encuentra la mascota, no es un error crítico, solo significa que no hay datos
            setError(null);
            setMessage('No se encontraron datos de mascota. Puedes crear uno.');
            setPetData({ name: '', photo: null, birthDate: null, weight: null, breed: null }); // Resetea los datos
            return;
          }
          // Si es otro tipo de error HTTP, lanza un error
          throw new Error('Error al obtener datos de la mascota');
        }
        // Si la respuesta es exitosa, parsea los datos y actualiza el estado
        const data: PetData = await res.json();
        setPetData({
          name: data?.name ?? '',
          photo: data?.photo ?? null,
          birthDate: data?.birthDate ?? null,
          weight: data?.weight ?? null,
          breed: data?.breed ?? null,
          id: data.id,
        });
        setMessage(null); // Limpia cualquier mensaje anterior
      } catch (err) {
        // Captura y muestra cualquier error durante la carga
        setError((err as Error).message);
        setMessage(null);
      } finally {
        setLoading(false); // Desactiva el estado de carga
      }
    }

    fetchPetData(); // Ejecuta la función de carga de datos al montar el componente
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez al montar

  // Maneja el cambio de valor en los inputs de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPetData(prev => ({ ...prev, [id]: value }));
  };

  // Maneja el cambio de valor en los inputs numéricos (peso)
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // Convierte a número flotante, o a null si el campo está vacío
    setPetData(prev => ({ ...prev, [id]: value === '' ? null : parseFloat(value) }));
  };

  // Maneja la selección de una nueva foto
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validación básica del tamaño del archivo (ej. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage("El archivo es demasiado grande. Por favor, selecciona una imagen de menos de 5MB.");
        if (fileInputRef.current) fileInputRef.current.value = ''; // Limpia el input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result ya es una Data URL (ej. data:image/png;base64,...)
        setPetData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file); // Lee el archivo como Data URL
    }
  };

  // Maneja la eliminación de la foto actual
  const handleRemovePhoto = () => {
    setPetData(prev => ({ ...prev, photo: null })); // Establece la foto a null
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Limpia el input de archivo
    }
  };

  // Maneja el guardado de los cambios en los datos de la mascota
  const handleSaveChanges = async () => {
    if (!petData.name.trim()) {
      setMessage('El nombre de la mascota no puede estar vacío.');
      return;
    }
    try {
      setLoading(true); // Activa el estado de carga
      setMessage(null); // Limpia mensajes anteriores
      setError(null); // Limpia errores anteriores

      // Prepara los datos a enviar (sin el ID, ya que es un POST o PUT)
      const dataToSend = {
        name: petData.name,
        photo: petData.photo,
        birthDate: petData.birthDate,
        weight: petData.weight,
        breed: petData.breed,
      };

      // Realiza la petición POST al endpoint /api/data
      const res = await fetch('/api/data', {
        method: 'POST', // O 'PUT' si estás actualizando una mascota existente por ID
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar datos');
      }

      // Si la respuesta es exitosa, actualiza los datos de la mascota con la respuesta del servidor
      const updatedData: PetData = await res.json();
      setPetData({
        name: updatedData.name,
        photo: updatedData.photo,
        birthDate: updatedData.birthDate,
        weight: updatedData.weight,
        breed: updatedData.breed,
        id: updatedData.id,
      });

      setMessage('¡Configuración actualizada correctamente!'); // Muestra mensaje de éxito
      setIsEditing(false); // Sale del modo de edición
    } catch (err) {
      // Captura y muestra cualquier error durante el guardado
      setError(`Error: ${(err as Error).message}`);
      setMessage(null);
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  // Función para activar el GET endpoint /api/activity/today
  const handleInvisibleButtonClick = async () => {
    console.log("Botón invisible clickeado. Activando GET endpoint /api/activity/today...");
    try {
      setLoading(true); // Activa el estado de carga
      setMessage(null); // Limpia mensajes anteriores
      setError(null); // Limpia errores anteriores

      // Realiza la petición GET al endpoint /api/activity/today
      const res = await fetch('/api/activity/today');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al registrar la actividad');
      }
      const data = await res.json();
      console.log('Actividad registrada con éxito:', data);
      setMessage('Actividad registrada con éxito hoy.'); // Muestra mensaje de éxito
    } catch (err) {
      // Captura y muestra cualquier error durante la llamada al endpoint
      setError(`Error al registrar actividad: ${(err as Error).message}`);
      setMessage(null);
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  // Si el componente no está montado, no renderiza nada para evitar problemas de hidratación
  if (!mounted) return null;

  return (
    <div className="container mx-auto p-4 pb-24 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Configuración</h1>
      </div>

      {/* Sección para mostrar mensajes de éxito o error */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Mi Mascota</h2>
          {loading ? (
            <p className="text-center py-4">Cargando datos de mascota...</p>
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
      {/* Botón invisible al final de la página */}
      <div className="mt-8 flex justify-center">
        <Button
          variant="ghost" // Hace que el botón sea visualmente "invisible" o sin estilo prominente
          className="opacity-0 hover:opacity-100 transition-opacity duration-300 w-full h-12 text-gray-500 hover:text-gray-900" // Lo hace invisible y solo aparece al pasar el mouse
          onClick={handleInvisibleButtonClick}
          disabled={loading}
        >
          Activar GET Endpoint (Invisible)
        </Button>
      </div>
    </div>
  );
}
