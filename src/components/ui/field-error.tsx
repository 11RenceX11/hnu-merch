/** Shows the first error message for a form field. */
export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;

  return (
    <p role="alert" className="mt-1 text-sm text-danger">
      {messages[0]}
    </p>
  );
}
