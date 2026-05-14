import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, Plus, Trash2, Save, GripVertical, Eye, EyeOff, Archive, ArchiveRestore } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function TickerManager({ 
  items = [], 
  onSave, 
  onDelete, 
  onReorder,
  tickerEnabled,
  onToggleEnabled 
}) {
  const [editingItem, setEditingItem] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [itemTab, setItemTab] = useState('active');

  const activeItems = items.filter(n => !n.archived);
  const archivedItems = items.filter(n => n.archived);
  const displayedItems = itemTab === 'active' ? activeItems : archivedItems;

  const handleNew = () => {
    setEditingItem({
      text: '',
      active: true,
      archived: false,
      priority: activeItems.length + 1
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editingItem) {
      onSave(editingItem);
      setEditingItem(null);
      setShowDialog(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    const reordered = Array.from(displayedItems);
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(destIndex, 0, moved);

    if (onReorder) {
      onReorder(reordered);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={tickerEnabled}
              onCheckedChange={onToggleEnabled}
            />
            <div>
              <Label className="font-medium">
                {tickerEnabled ? 'האינסרט פעיל' : 'האינסרט כבוי'}
              </Label>
              <p className="text-sm text-gray-500 mt-0.5">
                {tickerEnabled 
                  ? 'האינסרט המיוחד יוצג בתחתית המסך מעל הטיקר הקבוע' 
                  : 'האינסרט המיוחד מוסתר — רק הטיקר הקבוע יוצג'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            פריטי אינסרט
          </CardTitle>
          {itemTab === 'active' && (
            <Button onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" />
              הוסף פריט
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b pb-2">
            <button
              onClick={() => setItemTab('active')}
              className={`px-4 py-1.5 rounded-t-lg text-sm font-medium transition-colors ${
                itemTab === 'active'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              פעילים ({activeItems.length})
            </button>
            <button
              onClick={() => setItemTab('archived')}
              className={`px-4 py-1.5 rounded-t-lg text-sm font-medium transition-colors ${
                itemTab === 'archived'
                  ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ארכיון ({archivedItems.length})
            </button>
          </div>

          {itemTab === 'active' ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="ticker-items-list">
                {(droppableProvided) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    className="space-y-3"
                  >
                    {displayedItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={String(item.id)} index={index}>
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
                                onClick={() => onSave({ ...item, active: !item.active })}
                                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                  item.active
                                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                                    : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-green-50 hover:text-green-600 hover:border-green-300'
                                }`}
                                title={item.active ? 'לחץ להסתיר' : 'לחץ להציג'}
                              >
                                {item.active ? '● פעיל' : '○ כבוי'}
                              </button>
                              <div className="min-w-0">
                                <p className="font-medium truncate text-sm">{item.text}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-amber-600 border-amber-300 hover:bg-amber-50"
                                onClick={() => onSave({ ...item, archived: true, active: false })}
                              >
                                <Archive className="w-3 h-3 mr-1" />
                                ארכיון
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowDialog(true);
                                }}
                              >
                                ערוך
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(item.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                    {displayedItems.length === 0 && (
                      <p className="text-center text-gray-500 py-8">אין פריטים פעילים</p>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="space-y-3">
              {displayedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors bg-amber-50/30"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-500 border-gray-300">
                      בארכיון
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm">{item.text}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() => onSave({ ...item, archived: false })}
                    >
                      <ArchiveRestore className="w-3 h-3 mr-1" />
                      שחזר
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {displayedItems.length === 0 && (
                <p className="text-center text-gray-500 py-8">אין פריטים בארכיון</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) {
          setEditingItem(null);
          setShowDialog(false);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'עריכת פריט אינסרט' : 'פריט אינסרט חדש'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>טקסט הפריט</Label>
              <Input
                value={editingItem?.text || ''}
                onChange={e => setEditingItem(prev => prev ? {...prev, text: e.target.value} : null)}
                placeholder="הקלד את הטקסט שיוצג באינסרט..."
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingItem(null); setShowDialog(false); }}>
              ביטול
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              שמור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
