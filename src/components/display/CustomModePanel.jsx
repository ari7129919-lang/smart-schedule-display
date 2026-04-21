import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CustomModePanel({ 
  config = {},
  onSave,
  onClose,
  screenScale = 1 
}) {
  const [localConfig, setLocalConfig] = useState({
    showNotices: config.showNotices ?? true,
    showGroups: config.showGroups ?? true,
    showCongrats: config.showCongrats ?? true,
    showCircle: config.showCircle ?? true,
    showRules: config.showRules ?? true,
    showTicker: config.showTicker ?? true,
    showHeader: config.showHeader ?? true,
    showDutyPerson: config.showDutyPerson ?? true,
    showProgress: config.showProgress ?? true,
    exclusiveNotices: config.exclusiveNotices ?? false,
    customMessage: config.customMessage || '',
    fullScreenMessage: config.fullScreenMessage ?? false,
  });

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">הגדרות תצוגה מותאמת</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>מודעות</Label>
              <Switch
                checked={localConfig.showNotices}
                onCheckedChange={v => setLocalConfig({...localConfig, showNotices: v})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>קבוצות קטנות</Label>
              <Switch
                checked={localConfig.showGroups}
                onCheckedChange={v => setLocalConfig({...localConfig, showGroups: v})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>מזל טוב</Label>
              <Switch
                checked={localConfig.showCongrats}
                onCheckedChange={v => setLocalConfig({...localConfig, showCongrats: v})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>מעגל פנימי</Label>
              <Switch
                checked={localConfig.showCircle}
                onCheckedChange={v => setLocalConfig({...localConfig, showCircle: v})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>כללים</Label>
              <Switch
                checked={localConfig.showRules}
                onCheckedChange={v => setLocalConfig({...localConfig, showRules: v})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>טיקר תחתון</Label>
              <Switch
                checked={localConfig.showTicker}
                onCheckedChange={v => setLocalConfig({...localConfig, showTicker: v})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>כותרת עליונה</Label>
              <Switch
                checked={localConfig.showHeader}
                onCheckedChange={v => setLocalConfig({...localConfig, showHeader: v})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>אחראי תורן</Label>
              <Switch
                checked={localConfig.showDutyPerson}
                onCheckedChange={v => setLocalConfig({...localConfig, showDutyPerson: v})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>פס התקדמות</Label>
              <Switch
                checked={localConfig.showProgress}
                onCheckedChange={v => setLocalConfig({...localConfig, showProgress: v})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg col-span-2">
              <Label>מודעות בלעדיות (ללא תוכן נוסף)</Label>
              <Switch
                checked={localConfig.exclusiveNotices}
                onCheckedChange={v => setLocalConfig({...localConfig, exclusiveNotices: v})}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Label className="block mb-2">הודעה מיוחדת (אופציונלי)</Label>
            <Textarea
              value={localConfig.customMessage}
              onChange={e => setLocalConfig({...localConfig, customMessage: e.target.value})}
              placeholder="הודעה שתופיע במסך..."
              rows={3}
            />
            <div className="flex items-center gap-2 mt-2">
              <Switch
                checked={localConfig.fullScreenMessage}
                onCheckedChange={v => setLocalConfig({...localConfig, fullScreenMessage: v})}
              />
              <Label>הצג הודעה על כל המסך</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            שמור והפעל
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}