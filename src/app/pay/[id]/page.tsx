import React, { Suspense } from "react";
import { Metadata } from "next";
import { PaymentClientView } from "./payment-client-view";

export const dynamic = "force-dynamic";

interface PayPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PayPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Thanh Toán Đơn ${id} | Shop TFT Tuấn Thái Bình`,
    description: `Cổng thanh toán tự động 5 phút cho đơn thuê tài khoản ${id}.`,
  };
}

export default async function CustomerPaymentPage({ params, searchParams }: PayPageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const token = typeof sParams?.d === "string" ? sParams.d : undefined;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="p-8 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-300">Đang tải thông tin thanh toán...</p>
          </div>
        </div>
      }
    >
      <PaymentClientView paymentId={id} initialToken={token} />
    </Suspense>
  );
}
