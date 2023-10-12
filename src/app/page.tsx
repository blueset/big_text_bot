"use client";

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    window.location.href = "https://t.me/big_text_bot";
  }, []);

  return (
    <h1>Redirecting to <a href="https://t.me/big_text_bot">https://t.me/big_text_bot</a>...</h1>
  )
}
