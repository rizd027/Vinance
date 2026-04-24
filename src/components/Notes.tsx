import React, { useState, useRef } from 'react';
import { Plus, Trash2, StickyNote, X, Pin, Edit2 } from 'lucide-react';

import { Note } from '../types';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NotesProps {
  notes: Note[];
  onAdd: (note: Omit<Note, 'id'>) => void;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  userId: string;
}

const NOTE_COLORS = [
  { bg: 'bg-card-bg border-violet-500/40', text: 'text-text-primary', value: 'violet', accent: '#8b5cf6' },
  { bg: 'bg-card-bg border-amber-500/40', text: 'text-text-primary', value: 'amber', accent: '#f59e0b' },
  { bg: 'bg-card-bg border-rose-500/40', text: 'text-text-primary', value: 'rose', accent: '#f43f5e' },
  { bg: 'bg-card-bg border-emerald-500/40', text: 'text-text-primary', value: 'emerald', accent: '#10b981' },
  { bg: 'bg-card-bg border-sky-500/40', text: 'text-text-primary', value: 'sky', accent: '#0ea5e9' },
  { bg: 'bg-card-bg border-fuchsia-500/40', text: 'text-text-primary', value: 'fuchsia', accent: '#d946ef' },
  { bg: 'bg-card-bg border-slate-500/40', text: 'text-text-primary', value: 'slate', accent: '#94a3b8' },
];

function getColorDef(value: string) {
  return NOTE_COLORS.find(c => c.value === value) || NOTE_COLORS[0];
}

export default function Notes({ notes = [], onAdd, onUpdate, onDelete, userId }: NotesProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('violet');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleAdd = () => {
    if (!newContent.trim()) return;
    const now = new Date().toISOString();
    onAdd({ userId, content: newContent.trim(), color: newColor, createdAt: now, updatedAt: now });
    setNewContent('');
    setNewColor('violet');
    setShowAdd(false);
  };

  const handleEditBlur = (note: Note) => {
    if (editContent.trim() && editContent !== note.content) {
      onUpdate({ ...note, content: editContent.trim(), updatedAt: new Date().toISOString() });
    }
    setEditingId(null);
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const handleUpdate = () => {
    if (!editingNote || !editContent.trim()) return;
    onUpdate({ 
      ...editingNote, 
      content: editContent.trim(), 
      color: editingNote.color,
      updatedAt: new Date().toISOString() 
    });
    setEditingNote(null);
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return a.isPinned ? -1 : 1;
  });


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1 lg:hidden">
          <h2 className="text-2xl font-black text-text-primary tracking-tight leading-none">Catatan Keuangan</h2>
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Memo & Rencana Strategis</p>
          <div className="h-1 w-12 bg-linear-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-accent to-secondary text-white rounded-2xl text-xs font-black shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          TULIS CATATAN
        </button>
      </div>

      {/* Notes count */}
      {notes && notes.length > 0 && (
        <p className="text-[11px] font-bold text-text-secondary">{notes.length} catatan tersimpan</p>
      )}

      {/* Notes Grid */}
      {!sortedNotes || sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-accent/20 to-secondary/20 flex items-center justify-center relative">
            <StickyNote className="w-10 h-10 text-accent relative z-10" />
            <div className="absolute top-2 right-2 w-4 h-4 bg-secondary rounded-full animate-ping opacity-20" />
          </div>
          <div className="text-center">
            <p className="text-base font-black text-text-primary mb-1">Belum ada catatan</p>
            <p className="text-xs font-medium text-text-secondary">Simpan rencana keuangan, ide, atau pengingat di sini.</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="mt-2 px-6 py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-xl text-xs font-black shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all">
            Tulis Catatan Pertama
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {sortedNotes.map((note, i) => {

              const colorDef = getColorDef(note.color);
              const isEditing = editingId === note.id;
              return (
                <div
                  key={note.id}
                  className={cn(
                    "break-inside-avoid rounded-3xl border-t-4 border-l border-r border-b p-5 cursor-text group relative transition-all shadow-sm",
                    colorDef.bg,
                    note.isPinned ? "ring-2 ring-accent/30 shadow-md shadow-accent/5" : "hover:shadow-md hover:border-accent/30"
                  )}
                  style={{ borderTopColor: colorDef.accent }}
                  onClick={() => !isEditing && startEdit(note)}
                >
                  {note.isPinned && (
                    <div className="absolute top-0 left-0 bg-accent text-white text-[8px] font-black uppercase px-2 py-1 rounded-tl-2xl rounded-br-xl shadow-sm z-10 flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5 fill-white" />
                      Disematkan
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); onUpdate({ ...note, isPinned: !note.isPinned }); }}
                      className={cn(
                        "p-2 bg-bg-main/80 backdrop-blur-sm border border-border-ui/50 rounded-xl transition-all shadow-sm", 
                        note.isPinned ? "text-accent border-accent/30" : "text-text-secondary hover:text-text-primary"
                      )}
                      title={note.isPinned ? "Lepas sematan" : "Sematkan catatan"}
                    >
                      <Pin className={cn("w-3.5 h-3.5", note.isPinned && "fill-accent")} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(note); }}
                      className="p-2 bg-bg-main/80 backdrop-blur-sm border border-border-ui/50 text-text-secondary hover:text-accent rounded-xl transition-all shadow-sm"
                      title="Edit catatan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                      className="p-2 bg-bg-main/80 backdrop-blur-sm border border-border-ui/50 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl transition-all shadow-sm"
                      title="Hapus catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>


                  {isEditing ? (
                    <textarea
                      autoFocus
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      onBlur={() => handleEditBlur(note)}
                      onKeyDown={e => e.key === 'Escape' && setEditingId(null)}
                      className="w-full bg-transparent outline-none text-sm text-text-primary font-medium resize-none min-h-[80px]"
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <div className={cn("pr-14", note.isPinned && "pt-3")}>
                      <p className="text-sm text-text-primary font-bold whitespace-pre-wrap leading-snug">
                        {note.content.split('\n')[0]}
                      </p>
                      {note.content.split('\n').length > 1 && (
                        <p className="text-xs text-text-secondary font-medium mt-1.5 leading-relaxed line-clamp-3">
                          {note.content.substring(note.content.indexOf('\n') + 1).trim()}
                        </p>
                      )}
                    </div>
                  )}


                  <div className="flex justify-between items-center mt-4">
                    <p className="text-[10px] font-bold text-text-secondary/60 tracking-wider">
                      {format(new Date(note.updatedAt), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                    </p>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorDef.accent }} />
                  </div>

                </div>
              );
            })}
        </div>
      )}

      {/* Add Note Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowAdd(false)} 
          />
          <div 
            className="relative bg-card-bg rounded-3xl border border-border-ui shadow-2xl w-full max-w-md p-6 mt-4 sm:mt-0 z-10"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-text-primary">Tulis Catatan</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Color selector */}
              <div className="flex items-center gap-2">
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setNewColor(c.value)}
                    className={cn("w-7 h-7 rounded-full transition-all hover:scale-110", newColor === c.value && 'scale-125 ring-2 ring-offset-2 ring-offset-card-bg')}
                    style={{ backgroundColor: c.accent, boxShadow: newColor === c.value ? `0 0 0 2px ${c.accent}` : undefined }}
                  />
                ))}
              </div>

              <textarea
                autoFocus
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Tulis catatan keuangan Anda..."
                rows={6}
                className="w-full p-3 bg-bg-main rounded-xl border border-border-ui focus:border-accent outline-none text-sm text-text-primary font-medium transition-all resize-none"
                onKeyDown={e => e.ctrlKey && e.key === 'Enter' && handleAdd()}
              />

              <p className="text-[10px] text-text-secondary">Tekan Ctrl+Enter untuk menyimpan</p>

              <button onClick={handleAdd} disabled={!newContent.trim()} className="w-full py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-2xl font-black text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                Simpan Catatan
              </button>
            </div>
            </div>
          </div>
        )}

      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setEditingNote(null)} 
          />
          <div 
            className="relative bg-card-bg rounded-3xl border border-border-ui shadow-2xl w-full max-w-md p-6 mt-4 sm:mt-0 z-10"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-text-primary">Edit Catatan</h3>
              <button onClick={() => setEditingNote(null)} className="p-2 hover:bg-bg-main rounded-lg transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Color selector */}
              <div className="flex items-center gap-2">
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setEditingNote({ ...editingNote, color: c.value })}
                    className={cn("w-7 h-7 rounded-full transition-all hover:scale-110", editingNote.color === c.value && 'scale-125 ring-2 ring-offset-2 ring-offset-card-bg')}
                    style={{ backgroundColor: c.accent, boxShadow: editingNote.color === c.value ? `0 0 0 2px ${c.accent}` : undefined }}
                  />
                ))}
              </div>

              <textarea
                autoFocus
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="Tulis catatan keuangan Anda..."
                rows={6}
                className="w-full p-3 bg-bg-main rounded-xl border border-border-ui focus:border-accent outline-none text-sm text-text-primary font-medium transition-all resize-none"
                onKeyDown={e => e.ctrlKey && e.key === 'Enter' && handleUpdate()}
              />

              <p className="text-[10px] text-text-secondary">Tekan Ctrl+Enter untuk menyimpan</p>

              <button onClick={handleUpdate} disabled={!editContent.trim()} className="w-full py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-2xl font-black text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
