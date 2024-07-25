export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen">
      <div className="mx-auto container">{children}</div>
    </div>
  );
}
