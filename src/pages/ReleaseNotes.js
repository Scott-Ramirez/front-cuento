import React, { useState, useEffect } from 'react';
import { Calendar, Tag, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

const ReleaseNotes = () => {
  const [releaseNotes, setReleaseNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState(new Set());

  useEffect(() => {
    fetchReleaseNotes();
  }, []);

  const fetchReleaseNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/release-notes');
      setReleaseNotes(response.data);
      setError(null);
    } catch (error) {
      setError('Error al cargar las notas de lanzamiento');
      console.error('Error fetching release notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (noteId) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'major':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'security':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patch':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'major':
        return 'Actualización Mayor';
      case 'security':
        return 'Seguridad';
      case 'minor':
        return 'Actualización Menor';
      case 'patch':
        return 'Corrección';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando notas de lanzamiento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchReleaseNotes}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Notas de Lanzamiento</h1>
          <p className="text-lg text-gray-600">
            Mantente al día con las últimas actualizaciones, mejoras y nuevas características
          </p>
        </div>

        {releaseNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No hay notas de lanzamiento</h3>
            <p className="text-gray-600">Las nuevas actualizaciones aparecerán aquí pronto.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {releaseNotes.map((note, index) => {
              const isExpanded = expandedNotes.has(note.id);
              const isFirst = index === 0;
              
              return (
                <div 
                  key={note.id} 
                  className={`bg-white rounded-lg shadow-md border-l-4 transition-all duration-200 hover:shadow-lg ${
                    isFirst ? 'border-l-blue-500' : 'border-l-gray-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-xl font-semibold text-gray-900">{note.title}</h2>
                          {isFirst && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Más reciente
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Tag className="w-4 h-4" />
                            <span>{note.version}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(note.releaseDate || note.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(note.type)}`}>
                            {getTypeLabel(note.type)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-gray max-w-none">
                      {isExpanded || note.content.length <= 200 ? (
                        <div className="whitespace-pre-line text-gray-700">{note.content}</div>
                      ) : (
                        <div className="whitespace-pre-line text-gray-700">
                          {note.content.substring(0, 200)}...
                        </div>
                      )}
                    </div>

                    {note.content.length > 200 && (
                      <button
                        onClick={() => toggleExpanded(note.id)}
                        className="flex items-center space-x-1 mt-4 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <span>Ver menos</span>
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Ver más</span>
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="border-t pt-8">
            <p className="text-gray-600">
              ¿Tienes sugerencias o has encontrado un problema? 
              <a href="/contact" className="text-blue-600 hover:text-blue-800 ml-1">
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotes;