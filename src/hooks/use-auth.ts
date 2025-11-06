"use client";

import { AuthCredentials } from "@/lib/types";
import { useState } from "react";

export interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  
  authRegister: (data: AuthCredentials) => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authRegister = async (data: AuthCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:7777/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao criar a conta.");
      }

      return true;

    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, authRegister };
}