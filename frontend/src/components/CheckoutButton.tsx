"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";

interface CheckoutButtonProps {
  priceId: string;
}

export default function CheckoutButton({ priceId }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const { url } = await apiClient.post<{ url: string }>(
        "/api/stripe/checkout",
        { priceId }
      );
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
    >
      {isLoading ? "Loading..." : "Subscribe"}
    </button>
  );
}
