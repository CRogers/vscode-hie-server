interface TypedHole {
  name: string;
  type: string;
}

export function filterOutDiagnosticsToJustTypeHoles(messages: string[]): TypedHole[] {
  return messages
    .map(isTypedHole)
    .filter(possibleTypedHole => possibleTypedHole !== null);
}

export function isTypedHole(message: string): TypedHole | null {
  const match = /Found hole: (.*) :: (.*)\n/.exec(message);

  if (match == null) {
    return null;
  }

  return {
    name: match[1],
    type: match[2]
  }
}