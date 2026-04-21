import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

export default function RichTextEditor({ value, onChange, placeholder }) {
  return (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[120px]"
    />
  );
}