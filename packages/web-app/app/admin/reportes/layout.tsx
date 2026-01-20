import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reportes | AMI-SYSTEM",
};

export default function ReportesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
