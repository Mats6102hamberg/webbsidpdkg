type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}
