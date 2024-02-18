export function multilineHtmlSupport(text: string) {
  return (
    <>
      {text.split('\n').map((line, index) => (
        <span key={index}>
          {line}
          {index !== text.split('\n').length - 1 && <br />}
        </span>
      ))}
    </>
  );
}
