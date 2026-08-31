import MismatchBanner from "./MismatchBanner";
import FormSection, { Field } from "./FormSection";
import FilePreview from "./FilePreview";
import ItemGrid from "./ItemGrid";
 
const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
 
const HEADER_FIELDS_BY_TYPE = {
  po: (doc) => [
    { label: "PO Number", value: doc.poNumber, mono: true },
    { label: "PO Date", value: formatDate(doc.poDate) },
    { label: "Vendor Name", value: doc.vendorName },
    { label: "Item Count", value: doc.items?.length ?? 0 },
  ],
  grn: (doc) => [
    { label: "GRN Number", value: doc.grnNumber, mono: true },
    { label: "PO Number", value: doc.poNumber, mono: true },
    { label: "GRN Date", value: formatDate(doc.grnDate) },
    { label: "Item Count", value: doc.items?.length ?? 0 },
  ],
  invoice: (doc) => [
    { label: "Invoice Number", value: doc.invoiceNumber, mono: true },
    { label: "PO Number", value: doc.poNumber, mono: true },
    { label: "Invoice Date", value: formatDate(doc.invoiceDate) },
    { label: "Item Count", value: doc.items?.length ?? 0 },
  ],
};
 
const TITLE_BY_TYPE = {
  po: "Purchase Order Details",
  grn: "GRN Details",
  invoice: "Invoice Details",
};
 

export default function DocumentDetailPanel({ documentType, document, matchedItems, reasons }) {
  if (!document) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-strong)] text-center">
        <p className="text-sm font-medium text-[var(--color-ink)]">No document uploaded yet</p>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Upload a {documentType === "po" ? "Purchase Order" : documentType === "grn" ? "GRN" : "Invoice"} to see it
          here.
        </p>
      </div>
    );
  }
 
  const fields = HEADER_FIELDS_BY_TYPE[documentType](document);
 
  return (
    <div className="flex flex-col gap-6">
      <MismatchBanner reasons={reasons} />
 
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <FormSection title={TITLE_BY_TYPE[documentType]} accent={reasons?.length > 0 ? "danger" : "default"}>
            {fields.map((field) => (
              <Field key={field.label} {...field} />
            ))}
          </FormSection>
        </div>
 
        <div className="lg:col-span-3">
          <FilePreview documentId={document._id} documentType={documentType} />
        </div>
      </div>
 
      <ItemGrid matchedItems={matchedItems} />
    </div>
  );
}