interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: Readonly<ErrorMessageProps>) {
  return (
    <>
      {error && (
        <div className="p-4 bg-[#3d2522] border border-red-500 rounded-lg text-red-500 mb-6 text-sm">
          {error}
        </div>
      )}
    </>
  );
}
