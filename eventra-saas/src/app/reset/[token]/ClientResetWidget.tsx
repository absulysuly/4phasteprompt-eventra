'use client';
import React from 'react';

export default function ClientResetWidget({ token }: { token: string }) {
  // client-only interactions here (forms, useState, useEffect)
  return <div data-testid="client-reset-widget">Reset form for token {token}</div>;
}
