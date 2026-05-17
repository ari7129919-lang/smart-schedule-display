import React, { useState } from 'react';
import { supabaseAPI } from '@/api/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { FileText, Plus, Trash2, Save, GripVertical, Maximize2, Minimize2, ChevronDown, ChevronUp, Image, Zap, Type, Video } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import RichTextEditor from '@/components/admin/RichTextEditor';
import AnimatedImage from '@/components/display/AnimatedImage';

// Resolve images array with backward compatibility
function getNoticeImages(notice) {
  if (notice?.imageUrls && notice.imageUrls.length > 0) return notice.imageUrls;
  if (notice?.imageUrl) return [notice.imageUrl];
  return [];
}

const dayNames = {
  sunday: 'ראשון',
  monday: 'שני',
  tuesday: 'שלישי',
  wednesday: 'רביעי',
  thursday: 'חמישי',
  saturday: 'מוצ"ש'
};

const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday'];

function NoticePreview({ notice }) {
  const previewStyles = `
    .preview-content { direction: rtl; text-align: right; }
    .preview-content p { margin: 0.3em 0; }
    .preview-content h1 { font-size: 1.5em; font-weight: 700; margin: 0.35em 0; }
    .preview-content h2 { font-size: 1.25em; font-weight: 700; margin: 0.35em 0; }
    .preview-content h3 { font-size: 1.1em; font-weight: 600; margin: 0.25em 0; }
    .preview-content ul, .preview-content ol { margin: 0.3em 0; padding-right: 1.5em; }
    .preview-content li { margin: 0.2em 0; }
    .preview-content strong { font-weight: 700; }
    .preview-content * { max-width: 100%; overflow-wrap: break-word; word-break: break-word; }
    .preview-content table { width: 100%; border-collapse: collapse; margin: 0.5em 0; }
    .preview-content table td, .preview-content table th { border: 1px solid #ccc; padding: 8px; text-align: right; }
    .preview-content table th { background-color: #f5f5f5; font-weight: 600; }
    @keyframes textGlow {
      0%, 100% { text-shadow: 0 0 4px var(--glow-color, #8FAE9B); }
      50% { text-shadow: 0 0 16px var(--glow-color, #8FAE9B), 0 0 4px var(--glow-color, #8FAE9B); }
    }
    .text-glow { animation: textGlow 2s ease-in-out infinite; }
  `;
  const images = getNoticeImages(notice);
  const hasImages = images.length > 0;
  const isImageOnly = hasImages && !notice?.content;

  return (
    <div className="border rounded-xl p-4 bg-white/90" style={{ minHeight: '200px' }}>
      <style>{previewStyles}</style>
      {notice?.title && (
        <h3 className="font-bold text-primary mb-2" style={{ fontSize: '20px', lineHeight: 1.3 }}>
          {notice.title}
        </h3>
      )}
      {notice?.content && (
        <div
          className={`preview-content text-secondary ${notice?.textGlowEnabled ? 'text-glow' : ''}`}
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            '--glow-color': notice?.textGlowEnabled ? (notice?.imageGlowColor || '#8FAE9B') : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />
      )}
      {notice?.videoUrl && !notice?.content && (
        <div style={{ height: '200px' }}>
          <video
            src={notice.videoUrl}
            className="w-full h-full object-contain rounded-lg"
            controls
            muted
            preload="metadata"
          />
        </div>
      )}
      {notice?.content && notice?.videoUrl && (
        <div className="mt-2" style={{ maxHeight: '150px' }}>
          <video
            src={notice.videoUrl}
            className="w-full h-full object-contain rounded-lg"
            controls
            muted
            preload="metadata"
            style={{ maxHeight: '150px' }}
          />
        </div>
      )}
      {isImageOnly && !notice?.videoUrl && (
        <div style={{ height: '200px' }}>
          {notice?.imageAnimationEnabled ? (
            <AnimatedImage
              images={images}
              effects={notice.imageAnimationEffects || []}
              speed={notice.imageAnimationSpeed || 'normal'}
              glowColor={notice.imageGlowColor || '#8FAE9B'}
              screenScale={1}
              alt={notice.title || ''}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <img src={images[0]} alt="" className="w-full h-full object-contain rounded-lg" />
          )}
        </div>
      )}
    </div>
  );
}

export default function NoticesManager({ notices, daySchedules = [], onSave, onDelete, onReorder }) {
  const [editingNotice, setEditingNotice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [noticeTab, setNoticeTab] = useState('active');
  const [showWorkshopDialog, setShowWorkshopDialog] = useState(false);

  const activeNotices = notices.filter(n => !n.archived);
  const archivedNotices = notices.filter(n => n.archived);
  const displayedNotices = noticeTab === 'active' ? activeNotices : archivedNotices;

  const handleNew = () => {
    setEditingNotice({
      title: '',
      content: '',
      active: true,
      archived: false,
      days: [],
      workshopNames: [],
      priority: activeNotices.length + 1
    });
    setShowPreview(false);
    setIsFullScreen(false);
  };

  const handleSave = () => {
    if (editingNotice) {
      onSave(editingNotice);
      setEditingNotice(null);
      setShowPreview(false);
      setIsFullScreen(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    const reordered = Array.from(displayedNotices);
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(destIndex, 0, moved);

    if (onReorder) {
      onReorder(reordered);
    }
  };

  const getWorkshopsForSelectedDays = () => {
    if (!editingNotice?.days?.length) return [];
    const workshops = [];
    const seen = new Set();
    editingNotice.days.forEach(day => {
      const schedule = daySchedules.find(d => d.dayOfWeek === day);
      if (schedule?.workshops?.length) {
        schedule.workshops.forEach(w => {
          if (w.name && !seen.has(w.name)) {
            seen.add(w.name);
            workshops.push({ name: w.name, day });
          }
        });
      }
    });
    return workshops;
  };

  const selectedWorkshops = editingNotice?.workshopNames || [];
  const availableWorkshops = getWorkshopsForSelectedDays();

  const toggleWorkshop = (name) => {
    setEditingNotice(prev => {
      if (!prev) return null;
      const names = prev.workshopNames || [];
      if (names.includes(name)) {
        return { ...prev, workshopNames: names.filter(n => n !== name) };
      }
      return { ...prev, workshopNames: [...names, name] };
    });
  };

  const selectAllWorkshops = () => {
    setEditingNotice(prev => {
      if (!prev) return null;
      const allNames = availableWorkshops.map(w => w.name);
      return { ...prev, workshopNames: allNames };
    });
  };

  const clearAllWorkshops = () => {
    setEditingNotice(prev => {
      if (!prev) return null;
      return { ...prev, workshopNames: [] };
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            מודעות
          </CardTitle>
          {noticeTab === 'active' && (
            <Button onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" />
              מודעה חדשה
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 border-b pb-2">
            <button
              onClick={() => setNoticeTab('active')}
              className={`px-4 py-1.5 rounded-t-lg text-sm font-medium transition-colors ${
                noticeTab === 'active'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              פעילות ({activeNotices.length})
            </button>
            <button
              onClick={() => setNoticeTab('archived')}
              className={`px-4 py-1.5 rounded-t-lg text-sm font-medium transition-colors ${
                noticeTab === 'archived'
                  ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ארכיון ({archivedNotices.length})
            </button>
          </div>

          {noticeTab === 'active' ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="notices-list">
                {(droppableProvided) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    className="space-y-3"
                  >
                    {displayedNotices.map((notice, index) => (
                      <Draggable key={notice.id} draggableId={String(notice.id)} index={index}>
                        {(draggableProvided, snapshot) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            className={`p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors ${
                              snapshot.isDragging ? 'bg-blue-50 border-blue-300 shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                {...draggableProvided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                title="גרור לשינוי סדר"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <button
                                onClick={() => onSave({ ...notice, active: !notice.active })}
                                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                  notice.active
                                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                                    : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-green-50 hover:text-green-600 hover:border-green-300'
                                }`}
                                title={notice.active ? 'לחץ להסתיר' : 'לחץ להציג'}
                              >
                                {notice.active ? '● פעיל' : '○ כבוי'}
                              </button>
                              <div className="min-w-0">
                                <h4 className="font-medium truncate">{notice.title}</h4>
                                {notice.days?.length > 0 && (
                                  <p className="text-xs text-blue-600 mt-0.5">
                                    ימים: {notice.days.map(d => dayNames[d]).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-amber-600 border-amber-300 hover:bg-amber-50"
                                onClick={() => onSave({ ...notice, archived: true, active: false })}
                              >
                                העבר לארכיון
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingNotice(notice);
                                  setShowPreview(false);
                                  setIsFullScreen(false);
                                }}
                              >
                                ערוך
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(notice.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                    {displayedNotices.length === 0 && (
                      <p className="text-center text-gray-500 py-8">אין מודעות פעילות</p>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="space-y-3">
              {displayedNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors bg-amber-50/30"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-500 border-gray-300">
                      בארכיון
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{notice.title}</h4>
                      {notice.days?.length > 0 && (
                        <p className="text-xs text-blue-600 mt-0.5">
                          ימים: {notice.days.map(d => dayNames[d]).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() => onSave({ ...notice, archived: false })}
                    >
                      שחזר
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(notice.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {displayedNotices.length === 0 && (
                <p className="text-center text-gray-500 py-8">אין מודעות בארכיון</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingNotice} onOpenChange={(open) => {
        if (!open) {
          setEditingNotice(null);
          setShowPreview(false);
          setIsFullScreen(false);
        }
      }}>
        <DialogContent
          className={`${
            isFullScreen
              ? 'max-w-full w-screen h-screen max-h-screen p-0 gap-0 overflow-hidden'
              : 'max-w-2xl max-h-[90vh] overflow-y-auto'
          }`}
          style={isFullScreen ? { borderRadius: 0 } : undefined}
        >
          <DialogHeader className={isFullScreen ? 'px-6 pt-4 pb-2 border-b shrink-0' : ''}>
            <div className="flex items-center justify-between">
              <DialogTitle>{editingNotice?.id ? 'עריכת מודעה' : 'מודעה חדשה'}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => setShowPreview(p => !p)}
                >
                  {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  תצוגה מקדימה
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => setIsFullScreen(f => !f)}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  {isFullScreen ? 'חלון קטן' : 'מסך מלא'}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className={`${isFullScreen ? 'flex-1 flex overflow-hidden' : ''}`}>
            <div className={`${isFullScreen ? 'flex-1 overflow-y-auto p-6' : 'space-y-4 py-4 px-4'}`}>
              <div>
                <Label>כותרת</Label>
                <Input
                  value={editingNotice?.title || ''}
                  onChange={e => setEditingNotice(prev => prev ? {...prev, title: e.target.value} : null)}
                />
              </div>
              <div>
                <Label>תוכן המודעה</Label>
                <RichTextEditor
                  value={editingNotice?.content || ''}
                  onChange={v => setEditingNotice(prev => prev ? {...prev, content: v} : null)}
                  placeholder="תוכן המודעה..."
                />
              </div>
              <div>
                <Label>קובץ PDF (לחלופין במקום טקסט)</Label>
                <div className="flex gap-2 mt-1 items-center">
                  <Input
                    value={editingNotice?.pdfUrl || ''}
                    onChange={e => setEditingNotice(prev => prev ? {...prev, pdfUrl: e.target.value} : null)}
                    placeholder="הדבק URL של PDF..."
                    dir="ltr"
                  />
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm whitespace-nowrap transition-colors">
                      📎 העלה PDF
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) {
                          alert('הקובץ גדול מדי. מקסימום 10MB');
                          return;
                        }
                        try {
                          const result = await supabaseAPI.upload(file);
                          if (result && result.url) {
                            setEditingNotice(prev => prev ? {...prev, pdfUrl: result.url} : null);
                          } else {
                            alert('שגיאה בהעלאת הקובץ');
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          alert('שגיאה בהעלאת הקובץ: ' + (error.message || 'בעיית חיבור לשרת'));
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                {editingNotice?.pdfUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-green-600">✅ PDF מחובר</span>
                    <button onClick={() => setEditingNotice(prev => prev ? {...prev, pdfUrl: ''} : null)} className="text-red-400 text-sm hover:text-red-600">הסר</button>
                  </div>
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  תמונות (לחלופין / בנוסף לטקסט)
                </Label>
                <div className="flex gap-2 mt-1 items-center">
                  <Input
                    value=""
                    placeholder="הדבק URL של תמונה..."
                    dir="ltr"
                    onChange={e => {
                      const url = e.target.value.trim();
                      if (!url) return;
                      setEditingNotice(prev => {
                        if (!prev) return null;
                        const urls = prev.imageUrls || [];
                        if (urls.includes(url)) return prev;
                        return {...prev, imageUrls: [...urls, url]};
                      });
                      e.target.value = '';
                    }}
                  />
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm whitespace-nowrap transition-colors">
                      🖼️ העלה תמונה
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        const uploadedUrls = [];
                        for (const file of files) {
                          if (file.size > 10 * 1024 * 1024) {
                            alert(`הקובץ ${file.name} גדול מדי. מקסימום 10MB`);
                            continue;
                          }
                          try {
                            const result = await supabaseAPI.upload(file);
                            if (result && result.url) {
                              uploadedUrls.push(result.url);
                            } else {
                              alert(`שגיאה בהעלאת הקובץ ${file.name}`);
                            }
                          } catch (error) {
                            console.error('Upload error:', error);
                            alert(`שגיאה בהעלאת הקובץ ${file.name}: ` + (error.message || 'בעיית חיבור לשרת'));
                          }
                        }
                        if (uploadedUrls.length > 0) {
                          setEditingNotice(prev => {
                            if (!prev) return null;
                            const current = prev.imageUrls || [];
                            return {...prev, imageUrls: [...current, ...uploadedUrls]};
                          });
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                {/* Thumbnail gallery */}
                {(editingNotice?.imageUrls?.length > 0 || editingNotice?.imageUrl) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(editingNotice?.imageUrls || (editingNotice?.imageUrl ? [editingNotice.imageUrl] : [])).map((url, idx) => (
                      <div key={`${url}-${idx}`} className="relative group">
                        <img src={url} alt="" className="h-16 w-16 rounded object-cover border" />
                        <button
                          onClick={() => {
                            setEditingNotice(prev => {
                              if (!prev) return null;
                              const urls = prev.imageUrls || (prev.imageUrl ? [prev.imageUrl] : []);
                              const newUrls = urls.filter((u, i) => i !== idx);
                              // If all removed, clear legacy imageUrl too
                              if (newUrls.length === 0) {
                                return {...prev, imageUrls: [], imageUrl: ''};
                              }
                              return {...prev, imageUrls: newUrls, imageUrl: newUrls[0]};
                            });
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  סרטון / וידאו (לחלופין)
                </Label>
                <div className="flex gap-2 mt-1 items-center">
                  <Input
                    value={editingNotice?.videoUrl || ''}
                    onChange={e => setEditingNotice(prev => prev ? {...prev, videoUrl: e.target.value} : null)}
                    placeholder="הדבק URL של סרטון..."
                    dir="ltr"
                  />
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm whitespace-nowrap transition-colors">
                      🎬 העלה סרטון
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 50 * 1024 * 1024) {
                          alert('הקובץ גדול מדי. מקסימום 50MB');
                          return;
                        }
                        try {
                          const result = await supabaseAPI.upload(file);
                          if (result && result.url) {
                            setEditingNotice(prev => prev ? {...prev, videoUrl: result.url} : null);
                          } else {
                            alert('שגיאה בהעלאת הקובץ');
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          alert('שגיאה בהעלאת הקובץ: ' + (error.message || 'בעיית חיבור לשרת'));
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                {editingNotice?.videoUrl && (
                  <div className="mt-2">
                    <video
                      src={editingNotice.videoUrl}
                      className="h-24 rounded object-cover border"
                      controls
                      muted
                      preload="metadata"
                      style={{ maxWidth: '200px' }}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-green-600">✅ סרטון מחובר</span>
                      <button onClick={() => setEditingNotice(prev => prev ? {...prev, videoUrl: ''} : null)} className="text-red-400 text-sm hover:text-red-600">הסר</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Effects Panel */}
              {(editingNotice?.imageUrls?.length > 0 || editingNotice?.imageUrl) && (
                <div className="border rounded-lg p-4 bg-gray-50/50 space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <Label className="font-semibold">אפקטים ואנימציות לתמונה</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingNotice?.imageAnimationEnabled || false}
                      onCheckedChange={v => setEditingNotice(prev => prev ? {...prev, imageAnimationEnabled: v} : null)}
                    />
                    <Label className="text-sm">הפעל אנימציה חיה</Label>
                  </div>

                  {editingNotice?.imageAnimationEnabled && (
                    <>
                      <div>
                        <Label className="text-sm font-medium mb-1 block">בחר אפקטים (ניתן לסמן כמה)</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'התהפכות', value: 'flip' },
                            { label: 'זום', value: 'zoom' },
                            { label: 'דופק', value: 'pulse' },
                            { label: 'זוהר מסגרת', value: 'glow-border' },
                          ].map(opt => (
                            <label key={opt.value} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${
                              (editingNotice?.imageAnimationEffects || []).includes(opt.value)
                                ? 'bg-blue-50 border-blue-400 text-blue-700'
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={(editingNotice?.imageAnimationEffects || []).includes(opt.value)}
                                onChange={() => {
                                  setEditingNotice(prev => {
                                    if (!prev) return null;
                                    const current = prev.imageAnimationEffects || [];
                                    if (current.includes(opt.value)) {
                                      return {...prev, imageAnimationEffects: current.filter(e => e !== opt.value)};
                                    } else {
                                      return {...prev, imageAnimationEffects: [...current, opt.value]};
                                    }
                                  });
                                }}
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-1 block">מהירות אנימציה</Label>
                        <div className="flex gap-2">
                          {[
                            { label: 'איטי', value: 'slow' },
                            { label: 'רגיל', value: 'normal' },
                            { label: 'מהיר', value: 'fast' },
                          ].map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setEditingNotice(prev => prev ? {...prev, imageAnimationSpeed: opt.value} : null)}
                              className={`flex-1 py-1.5 px-2 rounded-md border text-sm font-medium transition-colors ${
                                (editingNotice?.imageAnimationSpeed || 'normal') === opt.value
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-1 block">צבע זוהר</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingNotice?.imageGlowColor || '#8FAE9B'}
                            onChange={e => setEditingNotice(prev => prev ? {...prev, imageGlowColor: e.target.value} : null)}
                            className="w-10 h-10 rounded cursor-pointer border"
                          />
                          <Input
                            value={editingNotice?.imageGlowColor || ''}
                            onChange={e => setEditingNotice(prev => prev ? {...prev, imageGlowColor: e.target.value} : null)}
                            placeholder="#8FAE9B"
                            className="w-32 font-mono"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Type className="w-4 h-4" />
                    <Switch
                      checked={editingNotice?.textGlowEnabled || false}
                      onCheckedChange={v => setEditingNotice(prev => prev ? {...prev, textGlowEnabled: v} : null)}
                    />
                    <Label className="text-sm">זוהר לטקסט המודעה</Label>
                  </div>
                </div>
              )}
              <div className={`${isFullScreen ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-2 gap-4'}`}>
                <div>
                  <Label>תאריך יעד (לספירה לאחור)</Label>
                  <Input
                    type="date"
                    value={editingNotice?.targetDate || ''}
                    onChange={e => setEditingNotice(prev => prev ? {...prev, targetDate: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label>זמן הצגה (שניות) — ריק = ברירת מחדל מערכת</Label>
                  <Input
                    type="number"
                    min="3"
                    max="300"
                    value={editingNotice?.displaySeconds || ''}
                    onChange={e => setEditingNotice(prev => prev ? {...prev, displaySeconds: e.target.value ? Number(e.target.value) : null} : null)}
                    placeholder="לדוגמה: 30"
                  />
                </div>
              </div>
              <div>
                <Label>ימים להצגה (ריק = כל הימים)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dayOrder.map(day => (
                    <Badge
                      key={day}
                      variant={(editingNotice?.days || []).includes(day) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setEditingNotice(prev => {
                          if (!prev) return null;
                          const days = prev.days || [];
                          if (days.includes(day)) {
                            return {...prev, days: days.filter(d => d !== day)};
                          } else {
                            return {...prev, days: [...days, day]};
                          }
                        });
                      }}
                    >
                      {dayNames[day]}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Workshop filter */}
              <div>
                <Label>סדנאות להצגה (ריק = כל הסדנאות)</Label>
                {availableWorkshops.length === 0 ? (
                  <p className="text-sm text-gray-400 mt-2">בחר ימים כדי לבחור סדנאות ספציפיות</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowWorkshopDialog(true)}
                      >
                        בחר סדנאות
                      </Button>
                      {selectedWorkshops.length > 0 && (
                        <span className="text-sm text-blue-600">
                          נבחרו {selectedWorkshops.length} מתוך {availableWorkshops.length} סדנאות
                        </span>
                      )}
                    </div>
                    {selectedWorkshops.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedWorkshops.map(name => (
                          <Badge key={name} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">סידור תצוגה</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingNotice(prev => prev ? {...prev, layout: 'single'} : null)}
                      className={`flex-1 py-2 px-3 border rounded-md text-sm transition-colors ${
                        (!editingNotice?.layout || editingNotice?.layout === 'single')
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      מודעה אחת
                    </button>
                    <button
                      onClick={() => setEditingNotice(prev => prev ? {...prev, layout: 'dual'} : null)}
                      className={`flex-1 py-2 px-3 border rounded-md text-sm transition-colors ${
                        editingNotice?.layout === 'dual'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      שתי מודעות צד-בצד
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {editingNotice?.layout === 'dual'
                      ? 'המודעה תוצג במחצית הגודל לצד מודעה אחרת'
                      : 'מודעה בגודל מלא'}
                  </p>
                </div>
                <div>
                  <Label className="mb-2 block">מצב מודעה</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingNotice?.active}
                        onCheckedChange={v => setEditingNotice(prev => prev ? {...prev, active: v} : null)}
                      />
                      <Label className="text-sm">מודעה פעילה</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingNotice?.isFullScreen}
                        onCheckedChange={v => setEditingNotice(prev => prev ? {...prev, isFullScreen: v} : null)}
                      />
                      <Label className="text-sm">הצג על כל המסך</Label>
                    </div>
                  </div>
                </div>
              </div>

              {!isFullScreen && showPreview && (
                <div className="border-t pt-4 mt-4">
                  <Label className="mb-2 block text-blue-600">תצוגה מקדימה</Label>
                  <NoticePreview notice={editingNotice} />
                </div>
              )}
            </div>

            {isFullScreen && (
              <div className="w-[45%] border-r bg-gray-50 p-6 overflow-y-auto flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">תצוגה מקדימה</h3>
                </div>
                <NoticePreview notice={editingNotice} />
              </div>
            )}
          </div>

          <DialogFooter className={`gap-2 ${isFullScreen ? 'px-6 py-4 border-t shrink-0' : ''}`}>
            <Button variant="outline" onClick={() => {
              setEditingNotice(null);
              setShowPreview(false);
              setIsFullScreen(false);
            }}>
              ביטול
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              שמור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workshop Selection Dialog */}
      <Dialog open={showWorkshopDialog} onOpenChange={setShowWorkshopDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>בחר סדנאות להצגה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {availableWorkshops.length === 0 ? (
              <p className="text-center text-gray-500 py-4">אין סדנאות זמינות לימים שנבחרו</p>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={selectAllWorkshops}>
                    בחר הכל
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={clearAllWorkshops}>
                    נקה הכל
                  </Button>
                </div>
                <div className="space-y-3">
                  {editingNotice?.days?.map(day => {
                    const dayWorkshops = availableWorkshops.filter(w => w.day === day);
                    if (dayWorkshops.length === 0) return null;
                    return (
                      <div key={day} className="border rounded-lg p-3">
                        <div className="font-medium text-sm text-gray-700 mb-2">
                          {dayNames[day]}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {dayWorkshops.map(w => (
                            <Badge
                              key={w.name}
                              variant={selectedWorkshops.includes(w.name) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => toggleWorkshop(w.name)}
                            >
                              {selectedWorkshops.includes(w.name) ? '✓ ' : ''}{w.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowWorkshopDialog(false)}>
              סגור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
