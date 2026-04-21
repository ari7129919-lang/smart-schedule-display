import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Star } from 'lucide-react';

export default function SpecialActivitiesTab({ settings, onChange }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            3D Animation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={settings.enable3D || false}
              onCheckedChange={(checked) => onChange({ ...settings, enable3D: checked })}
            />
            <Label>Enable 3D Animations</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}