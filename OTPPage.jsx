import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OTPPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/signup'); }, []);
  return null;
}
