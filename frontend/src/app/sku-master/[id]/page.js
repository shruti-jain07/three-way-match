"use client";
import { useParams } from "next/navigation";
import { useSkuMaster } from "@/hooks/useSkuMasters";
import SkuMasterForm from "@/components/sku-master/SkuMasterForm";
 
export default function EditSkuMasterPage() {
  const params = useParams();

  const { data: sku, isLoading, isError, error } = useSkuMaster(params.id);
 
  if (isLoading) {
    return <p className="px-8 py-10 text-sm text-[var(--color-ink-muted)]">Loading SKU Master...</p>;
  }
 
  if (isError || !sku) {
    return (
      <p className="px-8 py-10 text-sm text-[var(--color-status-mismatch)]">
        {error?.message || "SKU Master not found."}
      </p>
    );
  }
 
  return <SkuMasterForm sku={sku} />;
}