"use client";

import { useActionState, useEffect, useState } from "react";
import QRCode from "qrcode";

import { createEarnQrOperation } from "@/app/(dashboard)/scan/actions";
import type { ScanOperationState } from "@/app/(dashboard)/scan/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EarnQrMvpProps {
  businessId: string;
  businessName: string;
  initialOperation: ScanOperationState["operation"];
}

function formatCountdown(seconds: number) {
  const safe = Math.max(seconds, 0);
  const mins = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const secs = (safe % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export function EarnQrMvp({ businessId, businessName, initialOperation }: EarnQrMvpProps) {
  const [state, action, pending] = useActionState<ScanOperationState, FormData>(
    createEarnQrOperation,
    { error: null, success: null, operation: initialOperation },
  );

  const operation = state.operation;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!operation) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [operation]);

  const secondsLeft = operation
    ? Math.max(Math.floor((new Date(operation.expiresAt).getTime() - now) / 1000), 0)
    : 0;

  const qrPayload = operation?.token
    ? JSON.stringify({
        token: operation.token,
        type: "earn",
        points: operation.points,
        businessId,
      })
    : "";

  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function generateQr() {
      if (!qrPayload) {
        setQrDataUrl("");
        return;
      }

      try {
        const url = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 320,
          color: {
            dark: "#111827",
            light: "#FFFFFF",
          },
        });

        if (!cancelled) {
          setQrDataUrl(url);
        }
      } catch {
        if (!cancelled) {
          setQrDataUrl("");
        }
      }
    }

    void generateQr();

    return () => {
      cancelled = true;
    };
  }, [qrPayload]);

  const isExpiredOnClient = Boolean(operation) && secondsLeft <= 0;
  const effectiveStatus = !operation
    ? null
    : isExpiredOnClient
      ? "expired"
      : operation.status;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <Card
        title="Caja: generar QR"
        description="Captura los puntos y enseña este QR al cliente para acumular."
        className="h-fit"
      >
        <form action={action} className="grid gap-3">
          <input type="hidden" name="business_id" value={businessId} />

          <label className="grid gap-1 text-sm font-medium">
            Negocio activo
            <input
              value={businessName}
              readOnly
              className="rounded-xl border border-black/10 bg-zinc-100 px-3 py-2 text-zinc-700 dark:border-white/20 dark:bg-zinc-950 dark:text-zinc-300"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium">
            Puntos a otorgar
            <input
              required
              name="points"
              type="number"
              min={1}
              max={10000}
              step={1}
              inputMode="numeric"
              placeholder="Ej. 10"
              className="rounded-xl border border-black/10 bg-white px-3 py-3 text-lg font-semibold dark:border-white/20 dark:bg-zinc-950"
            />
          </label>

          <Button type="submit" disabled={pending} className="w-full py-3 text-base">
            {pending ? "Generando QR temporal..." : "Generar QR de acumulación"}
          </Button>

          {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}
        </form>
      </Card>

      <Card
        title="QR temporal"
        description="Válido por poco tiempo para evitar reuso."
        className="bg-zinc-950 text-zinc-50 dark:border-white/20"
      >
        <div className="grid gap-4">
          <div className="rounded-2xl bg-white p-4 text-zinc-900">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Código QR temporal para dar puntos" className="mx-auto aspect-square w-full max-w-[280px]" />
            ) : (
              <div className="mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm text-zinc-500">
                Genera un QR para mostrarlo aquí
              </div>
            )}
          </div>

          <div className="grid gap-1 rounded-xl border border-white/20 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-300">Estado</p>
            <p className="text-lg font-semibold">
              {effectiveStatus === "pending" ? "Listo para escanear" : null}
              {effectiveStatus === "expired" ? "Expirado (rechazar)" : null}
              {effectiveStatus === "used" ? "Ya usado (rechazar)" : null}
              {effectiveStatus === "cancelled" ? "Cancelado" : null}
              {effectiveStatus === null ? "Sin QR activo" : null}
            </p>
          </div>

          <div className="grid gap-1 rounded-xl border border-white/20 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-300">Countdown visible</p>
            <p className="text-4xl font-semibold tabular-nums">{formatCountdown(secondsLeft)}</p>
            <p className="text-xs text-zinc-300">
              Cuando llegue a 00:00, el QR debe considerarse inválido hasta generar uno nuevo.
            </p>
          </div>

          {operation?.token ? (
            <p className="rounded-lg bg-black/20 p-2 font-mono text-xs break-all text-zinc-200">
              token: {operation.token}
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
