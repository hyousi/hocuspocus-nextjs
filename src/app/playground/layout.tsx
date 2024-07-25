export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <main className="mx-auto container">{children}</main>
    </div>
  );
}
